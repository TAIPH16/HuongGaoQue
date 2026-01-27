const Category = require('../model/category');
const Product = require('../model/product');

/**
 * Lấy danh sách categories với phân trang
 */
const getCategories = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 25;
    const skip = (page - 1) * limit;
    const search = query.search || '';

    let filter = {};
    if (search) {
        filter.name = { $regex: search, $options: 'i' };
    }

    const categories = await Category.find(filter)
        .populate('parentCategory', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Tính số lượng sản phẩm thực tế cho mỗi category
    const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
            const productCount = await Product.countDocuments({ category: category._id });
            const categoryObj = category.toObject();
            categoryObj.productCount = productCount;
            categoryObj.variantCount = 0; // Tạm thời để 0
            return categoryObj;
        })
    );

    const total = await Category.countDocuments(filter);

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
const getCategoryDetail = async (categoryId) => {
    const category = await Category.findById(categoryId).populate('parentCategory');
    
    if (!category) {
        throw new Error('Không tìm thấy danh mục');
    }

    return category;
};

/**
 * Tạo category mới
 */
const createCategory = async (categoryData) => {
    const { name, description, parentCategory } = categoryData;

    if (!name || !name.trim()) {
        throw new Error('Tên danh mục không được để trống');
    }

    // Kiểm tra xem danh mục đã tồn tại chưa
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
        throw new Error('Danh mục này đã tồn tại');
    }

    const category = new Category({
        name: name.trim(),
        description: description || '',
        parentCategory: parentCategory || null,
        updatedAt: new Date()
    });

    await category.save();
    return category;
};

/**
 * Cập nhật category
 */
const updateCategory = async (categoryId, categoryData) => {
    const category = await Category.findById(categoryId);
    
    if (!category) {
        throw new Error('Không tìm thấy danh mục');
    }

    const { name, description, parentCategory } = categoryData;

    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (parentCategory !== undefined) category.parentCategory = parentCategory;
    category.updatedAt = new Date();

    await category.save();
    return category;
};

/**
 * Xóa category
 */
const deleteCategory = async (categoryId) => {
    const category = await Category.findById(categoryId);
    
    if (!category) {
        throw new Error('Không tìm thấy danh mục');
    }

    // Kiểm tra xem có sản phẩm nào đang dùng category này không
    const productCount = await Product.countDocuments({ category: categoryId });
    if (productCount > 0) {
        throw new Error(`Không thể xóa danh mục vì còn ${productCount} sản phẩm đang sử dụng`);
    }

    await Category.findByIdAndDelete(categoryId);
};

module.exports = {
    getCategories,
    getCategoryDetail,
    createCategory,
    updateCategory,
    deleteCategory
};

