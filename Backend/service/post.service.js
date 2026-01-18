const Post = require('../model/post');
const PostCategory = require('../model/postCategory');
const path = require('path');
const fs = require('fs');

/**
 * Lấy danh sách bài viết với phân trang và tìm kiếm
 */
const getPosts = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = query.search || '';
    const categoryId = query.categoryId;
    const status = query.status;

    let filter = {};
    
    // Nếu không có status, mặc định loại trừ "Đã xóa"
    if (!status) {
        filter.status = { $ne: 'Đã xóa' };
    } else {
        filter.status = status;
    }
    
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    if (categoryId) {
        filter.category = categoryId;
    }

    const posts = await Post.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Post.countDocuments(filter);

    return {
        data: posts,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total,
            limit: limit
        }
    };
};

/**
 * Lấy chi tiết bài viết
 */
const getPostDetail = async (postId) => {
    const post = await Post.findById(postId).populate('category');
    
    if (!post) {
        throw new Error('Không tìm thấy bài viết');
    }

    return post;
};

/**
 * Tạo bài viết mới
 */
const createPost = async (postData, file) => {
    const {
        title,
        category,
        description,
        publishType,
        scheduledDate,
        audience,
        status
    } = postData;

    // Kiểm tra category có tồn tại không
    const categoryExists = await PostCategory.findById(category);
    if (!categoryExists) {
        throw new Error('Danh mục không tồn tại');
    }

    // Xử lý ảnh bìa
    const coverImage = file ? '/images/posts/' + file.filename : '';

    // Xử lý scheduledDate
    let parsedScheduledDate = null;
    if (publishType === 'scheduled' && scheduledDate) {
        parsedScheduledDate = new Date(scheduledDate);
    }

    const post = new Post({
        title,
        category,
        coverImage,
        description: description || '',
        publishType: publishType || 'now',
        scheduledDate: parsedScheduledDate,
        audience: audience || 'Mọi người',
        status: status || 'Đã lưu',
        lastSavedAt: Date.now()
    });

    // Nếu publishType là 'now' và status là 'Đã tải lên', set publishedAt
    if (post.publishType === 'now' && post.status === 'Đã tải lên') {
        post.publishedAt = Date.now();
    }

    await post.save();

    // Cập nhật postCount của category
    await PostCategory.findByIdAndUpdate(category, {
        $inc: { postCount: 1 }
    });

    const savedPost = await Post.findById(post._id).populate('category');
    return savedPost;
};

/**
 * Cập nhật bài viết
 */
const updatePost = async (postId, postData, file) => {
    const post = await Post.findById(postId);
    
    if (!post) {
        throw new Error('Không tìm thấy bài viết');
    }

    const {
        title,
        category,
        description,
        publishType,
        scheduledDate,
        audience,
        status,
        deleteCoverImage
    } = postData;

    // Xử lý ảnh bìa mới
    if (file) {
        // Xóa ảnh cũ nếu có
        if (post.coverImage) {
            const oldImagePath = path.join(__dirname, '..', 'public', post.coverImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        post.coverImage = '/images/posts/' + file.filename;
    }

    // Xóa ảnh bìa nếu được yêu cầu
    if (deleteCoverImage === 'true' || deleteCoverImage === true) {
        if (post.coverImage) {
            const imagePath = path.join(__dirname, '..', 'public', post.coverImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            post.coverImage = '';
        }
    }

    // Cập nhật các trường khác
    if (title) post.title = title;
    if (category) {
        const categoryExists = await PostCategory.findById(category);
        if (!categoryExists) {
            throw new Error('Danh mục không tồn tại');
        }
        // Cập nhật postCount của category cũ và mới
        if (post.category.toString() !== category) {
            await PostCategory.findByIdAndUpdate(post.category, {
                $inc: { postCount: -1 }
            });
            await PostCategory.findByIdAndUpdate(category, {
                $inc: { postCount: 1 }
            });
        }
        post.category = category;
    }
    if (description !== undefined) post.description = description;
    if (publishType) {
        post.publishType = publishType;
        if (publishType === 'scheduled' && scheduledDate) {
            post.scheduledDate = new Date(scheduledDate);
        } else if (publishType === 'now') {
            post.scheduledDate = null;
        }
    }
    if (audience) post.audience = audience;
    if (status) {
        post.status = status;
        // Nếu chuyển sang 'Đã tải lên' và chưa có publishedAt
        if (status === 'Đã tải lên' && !post.publishedAt) {
            post.publishedAt = Date.now();
        }
    }

    post.lastSavedAt = Date.now();

    await post.save();

    const updatedPost = await Post.findById(post._id).populate('category');
    return updatedPost;
};

/**
 * Xóa bài viết (soft delete)
 */
const deletePost = async (postId) => {
    const post = await Post.findById(postId);
    
    if (!post) {
        throw new Error('Không tìm thấy bài viết');
    }

    // Soft delete - chỉ đổi status
    post.status = 'Đã xóa';
    await post.save();

    // Cập nhật postCount của category
    await PostCategory.findByIdAndUpdate(post.category, {
        $inc: { postCount: -1 }
    });
};

/**
 * Tăng lượt xem
 */
const incrementView = async (postId) => {
    const post = await Post.findByIdAndUpdate(
        postId,
        { $inc: { viewCount: 1 } },
        { new: true }
    );

    if (!post) {
        throw new Error('Không tìm thấy bài viết');
    }

    return { viewCount: post.viewCount };
};

module.exports = {
    getPosts,
    getPostDetail,
    createPost,
    updatePost,
    deletePost,
    incrementView
};

