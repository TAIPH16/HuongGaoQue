const PostCategory = require('../model/postCategory');
const Post = require('../model/post');

/**
 * Lấy danh sách categories với phân trang
 */
const getPostCategories = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 25;
    const skip = (page - 1) * limit;
    const search = query.search || '';

    let filter = {};
    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }

    const categories = await PostCategory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Tính số lượng bài viết thực tế cho mỗi category
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            const postCount = await Post.countDocuments({ 
                category: category._id,
                status: { $ne: 'Đã xóa' }
            });
            const categoryObj = category.toObject();
            categoryObj.postCount = postCount;
            return categoryObj;
        })
    );

    const total = await PostCategory.countDocuments(filter);

    return {
        data: categoriesWithCounts,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalCategories: total,
            limit: limit
        }
    };
};

/**
 * Lấy chi tiết category
 */
const getPostCategoryDetail = async (categoryId) => {
    const category = await PostCategory.findById(categoryId);
    
    if (!category) {
        throw new Error('Không tìm thấy danh mục');
    }

    return category;
};

/**
 * Tạo category mới
 */
const createPostCategory = async (categoryData) => {
    try {
        const { name, description } = categoryData;

        if (!name || !name.trim()) {
            throw new Error('Tên danh mục không được để trống');
        }

        // Kiểm tra xem danh mục đã tồn tại chưa
        const existingCategory = await PostCategory.findOne({ name: name.trim() });
        if (existingCategory) {
            throw new Error('Danh mục này đã tồn tại');
        }

        const category = new PostCategory({
            name: name.trim(),
            description: description || ''
        });

        await category.save();
        return category;
    } catch (error) {
        // Xử lý lỗi unique constraint từ MongoDB
        if (error.code === 11000 || error.name === 'MongoServerError' || error.message?.includes('duplicate key')) {
            throw new Error('Danh mục này đã tồn tại');
        }
        // Nếu đã là Error object với message, throw lại
        if (error instanceof Error) {
            throw error;
        }
        // Nếu không phải Error object, tạo Error mới
        throw new Error(error.message || 'Lỗi tạo danh mục');
    }
};

/**
 * Cập nhật category
 */
const updatePostCategory = async (categoryId, categoryData) => {
    const category = await PostCategory.findById(categoryId);
    
    if (!category) {
        throw new Error('Không tìm thấy danh mục');
    }

    const { name, description } = categoryData;

    // Kiểm tra tên trùng nếu có thay đổi
    if (name && name.trim() !== category.name) {
        const existingCategory = await PostCategory.findOne({ name: name.trim() });
        if (existingCategory) {
            throw new Error('Danh mục này đã tồn tại');
        }
        category.name = name.trim();
    }
    if (description !== undefined) category.description = description;

    try {
        await category.save();
        return category;
    } catch (error) {
        // Xử lý lỗi unique constraint từ MongoDB
        if (error.code === 11000 || error.name === 'MongoServerError') {
            throw new Error('Danh mục này đã tồn tại');
        }
        throw error;
    }
};

/**
 * Xóa category
 */
const deletePostCategory = async (categoryId) => {
    const category = await PostCategory.findById(categoryId);
    
    if (!category) {
        throw new Error('Không tìm thấy danh mục');
    }

    // Kiểm tra xem có bài viết nào đang dùng category này không
    const postCount = await Post.countDocuments({ category: categoryId });
    if (postCount > 0) {
        throw new Error(`Không thể xóa danh mục vì còn ${postCount} bài viết đang sử dụng`);
    }

    await PostCategory.findByIdAndDelete(categoryId);
};

module.exports = {
    getPostCategories,
    getPostCategoryDetail,
    createPostCategory,
    updatePostCategory,
    deletePostCategory
};

