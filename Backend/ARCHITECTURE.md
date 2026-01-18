# Kiến trúc Backend - Route → Controller → Service

## Cấu trúc thư mục

```
Backend/
├── middleware/          # Middleware xác thực, phân quyền, xử lý lỗi
│   ├── auth.middleware.js
│   └── error.middleware.js
├── routes/              # Định nghĩa đường dẫn API + middlewares
│   ├── products.js
│   ├── categories.js
│   ├── orders.js
│   ├── customers.js
│   ├── posts.js
│   ├── postCategories.js
│   ├── reviews.js
│   └── users.js
├── controller/          # Xử lý request/response, gọi service
│   ├── product.controller.js
│   ├── category.controller.js
│   ├── order.controller.js
│   ├── customer.controller.js
│   ├── post.controller.js
│   ├── postCategory.controller.js
│   ├── review.controller.js
│   └── user.controller.js
├── service/             # Business logic, tương tác với database
│   ├── product.service.js
│   ├── category.service.js
│   ├── order.service.js
│   ├── customer.service.js
│   ├── post.service.js
│   ├── postCategory.service.js
│   ├── review.service.js
│   └── user.service.js
├── model/               # Mongoose models
│   ├── product.js
│   ├── category.js
│   └── ...
└── app.js               # Entry point, cấu hình Express
```

## Luồng xử lý Request

```
Client Request
    ↓
Routes (routes/*.js)
    ├── Định nghĩa đường dẫn
    ├── Áp dụng middlewares (auth, upload, etc.)
    └── Gọi controller
        ↓
Controller (controller/*.controller.js)
    ├── Nhận request (req, res, next)
    ├── Validate input (nếu cần)
    ├── Gọi service để xử lý business logic
    └── Trả về response
        ↓
Service (service/*.service.js)
    ├── Xử lý business logic
    ├── Tương tác với database (Model)
    ├── Xử lý file uploads
    └── Trả về data
        ↓
Model (model/*.js)
    └── Mongoose schema & methods
```

## Ví dụ cụ thể: Products Module

### 1. Route (`routes/products.js`)
```javascript
const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');
const { protectRoute } = require('../middleware/auth.middleware');

// Protect all routes with admin role
router.use(protectRoute(['admin']));

// GET /api/products - List with filters/pagination
router.get('/', productController.getProducts);

// GET /api/products/:id - Detail
router.get('/:id', productController.getProductDetail);

// POST /api/products - Create new product
router.post('/', productController.uploadMiddleware, productController.createProduct);
```

**Chức năng:**
- Chỉ định nghĩa đường dẫn API
- Áp dụng middlewares (auth, upload)
- Gọi controller tương ứng

### 2. Controller (`controller/product.controller.js`)
```javascript
const productService = require('../service/product.service');

const getProducts = async (req, res, next) => {
    try {
        const result = await productService.getProducts(req.query);
        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        next(error); // Pass error to error middleware
    }
};
```

**Chức năng:**
- Nhận request từ route
- Gọi service để xử lý
- Format và trả về response
- Xử lý lỗi bằng cách pass cho error middleware

### 3. Service (`service/product.service.js`)
```javascript
const Product = require('../model/product');
const Category = require('../model/category');

const getProducts = async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Business logic: tạo filter, pagination
    let filter = {};
    if (query.search) {
        filter.$or = [
            { name: { $regex: query.search, $options: 'i' } },
            { productId: { $regex: query.search, $options: 'i' } }
        ];
    }
    
    // Tương tác với database
    const products = await Product.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    const total = await Product.countDocuments(filter);
    
    return {
        data: products,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalProducts: total,
            limit: limit
        }
    };
};
```

**Chức năng:**
- Xử lý business logic
- Tương tác trực tiếp với database (Model)
- Xử lý file uploads
- Trả về data (không format response)

## Middleware

### Auth Middleware (`middleware/auth.middleware.js`)

**`protectRoute(['admin'])`** - Bảo vệ route, chỉ admin mới truy cập được
```javascript
router.use(protectRoute(['admin'])); // Áp dụng cho tất cả routes trong file
```

**`optionalAuthenticate`** - Xác thực tùy chọn (cho public routes)
```javascript
router.get('/', optionalAuthenticate, controller.getPublicData);
```

### Error Middleware (`middleware/error.middleware.js`)

Tự động xử lý các loại lỗi:
- Validation errors
- Duplicate key errors
- Cast errors (invalid ObjectId)
- Multer errors (file upload)
- Custom errors

## Quy tắc

### Routes
- ✅ Chỉ định nghĩa đường dẫn
- ✅ Áp dụng middlewares
- ✅ Gọi controller
- ❌ Không có business logic
- ❌ Không tương tác trực tiếp với database

### Controllers
- ✅ Nhận request/response
- ✅ Validate input cơ bản
- ✅ Gọi service
- ✅ Format response
- ✅ Xử lý lỗi (pass cho error middleware)
- ❌ Không có business logic phức tạp
- ❌ Không tương tác trực tiếp với database

### Services
- ✅ Xử lý business logic
- ✅ Tương tác với database
- ✅ Xử lý file uploads
- ✅ Trả về data (không format response)
- ❌ Không xử lý HTTP request/response

## Lợi ích

1. **Separation of Concerns**: Mỗi layer có trách nhiệm rõ ràng
2. **Reusability**: Service có thể được dùng lại ở nhiều nơi
3. **Testability**: Dễ test từng layer riêng biệt
4. **Maintainability**: Dễ bảo trì và mở rộng
5. **Scalability**: Dễ scale và thêm features mới

## Cách thêm module mới

1. **Tạo Model** (`model/newModule.js`)
2. **Tạo Service** (`service/newModule.service.js`) - Business logic
3. **Tạo Controller** (`controller/newModule.controller.js`) - Request/Response handling
4. **Tạo Route** (`routes/newModule.js`) - Định nghĩa API endpoints
5. **Đăng ký Route** trong `app.js`

## Testing với Postman

Tất cả routes đều được bảo vệ bởi `protectRoute(['admin'])`, cần:
1. Tạo JWT token với role 'admin'
2. Gửi token trong header: `Authorization: Bearer <token>`
3. Test các endpoints theo API_DOCUMENTATION.md

