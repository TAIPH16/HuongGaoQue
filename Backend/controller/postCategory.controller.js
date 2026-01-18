const postCategoryService = require('../service/postCategory.service');

/**
 * GET /api/post-categories - Lấy danh sách categories
 */
const getPostCategories = async (req, res) => {
    try {
        const result = await postCategoryService.getPostCategories(req.query);
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Get post categories error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi lấy danh sách danh mục',
            error: error.message
        });
    }
};

/**
 * GET /api/post-categories/:id - Lấy chi tiết category
 */
const getPostCategoryDetail = async (req, res) => {
    try {
        const category = await postCategoryService.getPostCategoryDetail(req.params.id);
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get post category detail error:', error);
        if (error.message === 'Không tìm thấy danh mục') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi lấy chi tiết danh mục',
            error: error.message
        });
    }
};

/**
 * POST /api/post-categories - Tạo category mới
 */
const createPostCategory = async (req, res) => {
    try {
        console.log('Creating post category with data:', req.body);
        const category = await postCategoryService.createPostCategory(req.body);
        console.log('Post category created successfully:', category);
        res.status(201).json({
            success: true,
            message: 'Tạo danh mục thành công',
            data: category
        });
    } catch (error) {
        console.error('Create post category error:', error);
        console.error('Error stack:', error.stack);
        
        // Xác định status code
        let statusCode = 500;
        if (error.message && (
            error.message.includes('đã tồn tại') || 
            error.message.includes('không được để trống') ||
            error.message.includes('duplicate')
        )) {
            statusCode = 400;
        }
        
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Lỗi tạo danh mục',
            error: error.message
        });
    }
};

/**
 * PUT /api/post-categories/:id - Cập nhật category
 */
const updatePostCategory = async (req, res) => {
    try {
        const category = await postCategoryService.updatePostCategory(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: category
        });
    } catch (error) {
        console.error('Update post category error:', error);
        if (error.message === 'Không tìm thấy danh mục') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        const statusCode = error.message.includes('đã tồn tại') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Lỗi cập nhật danh mục',
            error: error.message
        });
    }
};

/**
 * DELETE /api/post-categories/:id - Xóa category
 */
const deletePostCategory = async (req, res) => {
    try {
        await postCategoryService.deletePostCategory(req.params.id);
        res.json({
            success: true,
            message: 'Xóa danh mục thành công'
        });
    } catch (error) {
        console.error('Delete post category error:', error);
        if (error.message === 'Không tìm thấy danh mục') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message.includes('Không thể xóa')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi xóa danh mục',
            error: error.message
        });
    }
};

module.exports = {
    getPostCategories,
    getPostCategoryDetail,
    createPostCategory,
    updatePostCategory,
    deletePostCategory
};

