const categoryService = require('../service/category.service');

/**
 * GET /api/categories - Lấy danh sách categories
 */
const getCategories = async (req, res, next) => {
    try {
        const result = await categoryService.getCategories(req.query);
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/categories/:id - Lấy chi tiết category
 */
const getCategoryDetail = async (req, res, next) => {
    try {
        const category = await categoryService.getCategoryDetail(req.params.id);
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy danh mục') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * POST /api/categories - Tạo category mới
 */
const createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json({
            success: true,
            message: 'Tạo danh mục thành công',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        const statusCode = error.message.includes('đã tồn tại') || error.message.includes('không được để trống') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'Lỗi tạo danh mục',
            error: error.message
        });
    }
};

/**
 * PUT /api/categories/:id - Cập nhật category
 */
const updateCategory = async (req, res, next) => {
    try {
        const category = await categoryService.updateCategory(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: category
        });
    } catch (error) {
        if (error.message === 'Không tìm thấy danh mục') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        next(error);
    }
};

/**
 * DELETE /api/categories/:id - Xóa category
 */
const deleteCategory = async (req, res, next) => {
    try {
        await categoryService.deleteCategory(req.params.id);
        res.json({
            success: true,
            message: 'Xóa danh mục thành công'
        });
    } catch (error) {
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
        next(error);
    }
};

module.exports = {
    getCategories,
    getCategoryDetail,
    createCategory,
    updateCategory,
    deleteCategory
};

