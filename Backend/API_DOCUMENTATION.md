# API Documentation - Rice Backend

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Products (`/api/products`)

#### GET `/api/products`
Lấy danh sách sản phẩm
- Query params:
  - `page` (number): Trang hiện tại (default: 1)
  - `limit` (number): Số lượng mỗi trang (default: 10)
  - `search` (string): Tìm kiếm theo tên hoặc mã sản phẩm
  - `categoryId` (string): Lọc theo danh mục
  - `status` (string): Lọc theo trạng thái (Còn hàng, Hết hàng, Đang tính)

#### GET `/api/products/:id`
Lấy chi tiết sản phẩm

#### POST `/api/products`
Tạo sản phẩm mới
- Body (form-data):
  - `name` (string, required): Tên sản phẩm
  - `category` (string, required): ID danh mục
  - `listedPrice` (number, required): Giá niêm yết
  - `discountPercent` (number): Phần trăm giảm giá (0-100)
  - `description` (string): Mô tả sản phẩm
  - `initialQuantity` (number, required): Số lượng ban đầu
  - `unit` (string): Đơn vị (kg, tấn, tạ, yến) - default: kg
  - `status` (string): Trạng thái
  - `details` (JSON string): Chi tiết sản phẩm
  - `allowComments` (boolean): Cho phép bình luận
  - `images` (file[]): Ảnh sản phẩm (tối đa 5)

#### PUT `/api/products/:id`
Cập nhật sản phẩm
- Body (form-data): Tương tự POST

#### DELETE `/api/products/:id`
Xóa sản phẩm

#### GET `/api/products/stats/revenue`
Thống kê doanh thu
- Query params:
  - `startDate` (date): Ngày bắt đầu
  - `endDate` (date): Ngày kết thúc

---

### 2. Categories (`/api/categories`)

#### GET `/api/categories`
Lấy danh sách danh mục
- Query params:
  - `page` (number): Trang hiện tại
  - `limit` (number): Số lượng mỗi trang
  - `search` (string): Tìm kiếm

#### GET `/api/categories/:id`
Lấy chi tiết danh mục

#### POST `/api/categories`
Tạo danh mục mới
- Body (JSON):
  ```json
  {
    "name": "Tên danh mục",
    "description": "Mô tả",
    "parentCategory": "ID danh mục cha (optional)"
  }
  ```

#### PUT `/api/categories/:id`
Cập nhật danh mục

#### DELETE `/api/categories/:id`
Xóa danh mục

---

### 3. Orders (`/api/orders`)

#### GET `/api/orders`
Lấy danh sách đơn hàng
- Query params:
  - `page` (number)
  - `limit` (number)
  - `status` (string): Trạng thái đơn hàng
  - `customerId` (string): Lọc theo khách hàng
  - `search` (string): Tìm kiếm theo mã đơn hàng

#### GET `/api/orders/stats`
Thống kê đơn hàng

#### GET `/api/orders/:id`
Lấy chi tiết đơn hàng

#### POST `/api/orders`
Tạo đơn hàng mới
- Body (JSON):
  ```json
  {
    "customer": "ID khách hàng",
    "items": [
      {
        "product": "ID sản phẩm",
        "quantity": 10
      }
    ],
    "shippingAddress": {
      "name": "Tên người nhận",
      "email": "email@example.com",
      "phone": "0123456789",
      "address": "Địa chỉ chi tiết",
      "ward": "Phường/Xã",
      "district": 1,
      "province": 1,
      "country": "Việt Nam"
    },
    "paymentMethod": "cash",
    "discountAmount": 0,
    "shippingFee": 30000,
    "notes": "Ghi chú"
  }
  ```

#### PUT `/api/orders/:id`
Cập nhật đơn hàng
- Body (JSON):
  ```json
  {
    "status": "paid",
    "paymentStatus": "paid",
    "notes": "Ghi chú"
  }
  ```

#### DELETE `/api/orders/:id`
Xóa đơn hàng

---

### 4. Customers (`/api/customers`)

#### GET `/api/customers`
Lấy danh sách khách hàng
- Query params:
  - `page` (number)
  - `limit` (number)
  - `search` (string)
  - `status` (string): Hoạt động, Đã cấm

#### GET `/api/customers/stats/summary`
Thống kê tổng quan khách hàng

#### GET `/api/customers/:id`
Lấy chi tiết khách hàng

#### POST `/api/customers`
Tạo khách hàng mới
- Body (form-data):
  - `fullName` (string, required)
  - `email` (string, required)
  - `phoneNumber` (string)
  - `address` (JSON string)
  - `region` (string)
  - `status` (string)
  - `avatar` (file)

#### PUT `/api/customers/:id`
Cập nhật khách hàng

#### DELETE `/api/customers/:id`
Xóa khách hàng

#### POST `/api/customers/:id/ban`
Chặn khách hàng
- Body (JSON):
  ```json
  {
    "reason": "Lý do chặn"
  }
  ```

#### POST `/api/customers/:id/unban`
Hoàn tác chặn khách hàng

---

### 5. Posts (`/api/posts`)

#### GET `/api/posts`
Lấy danh sách bài viết
- Query params:
  - `page` (number)
  - `limit` (number)
  - `search` (string)
  - `categoryId` (string)
  - `status` (string): Đã tải lên, Đã lưu, Đã xóa

#### GET `/api/posts/:id`
Lấy chi tiết bài viết

#### POST `/api/posts`
Tạo bài viết mới
- Body (form-data):
  - `title` (string, required)
  - `category` (string, required): ID danh mục
  - `description` (string)
  - `publishType` (string): now, scheduled
  - `scheduledDate` (date): Nếu publishType = scheduled
  - `audience` (string): Mọi người, Mọi người trên 18 tuổi
  - `status` (string): Đã tải lên, Đã lưu
  - `coverImage` (file)

#### PUT `/api/posts/:id`
Cập nhật bài viết

#### DELETE `/api/posts/:id`
Xóa bài viết (soft delete)

---

### 6. Post Categories (`/api/post-categories`)

#### GET `/api/post-categories`
Lấy danh sách danh mục bài viết

#### GET `/api/post-categories/:id`
Lấy chi tiết danh mục

#### POST `/api/post-categories`
Tạo danh mục mới
- Body (JSON):
  ```json
  {
    "name": "Tên danh mục",
    "description": "Mô tả"
  }
  ```

#### PUT `/api/post-categories/:id`
Cập nhật danh mục

#### DELETE `/api/post-categories/:id`
Xóa danh mục

---

### 7. Reviews (`/api/reviews`)

#### GET `/api/reviews`
Lấy danh sách đánh giá
- Query params:
  - `page` (number)
  - `limit` (number)
  - `productId` (string)
  - `customerId` (string)
  - `rating` (number): 1-5

#### GET `/api/reviews/stats/:productId`
Thống kê đánh giá sản phẩm

#### GET `/api/reviews/:id`
Lấy chi tiết đánh giá

#### POST `/api/reviews`
Tạo đánh giá mới
- Body (form-data):
  - `product` (string, required): ID sản phẩm
  - `customer` (string, required): ID khách hàng
  - `rating` (number, required): 1-5
  - `comment` (string)
  - `images` (file[])

#### PUT `/api/reviews/:id`
Cập nhật đánh giá

#### DELETE `/api/reviews/:id`
Xóa đánh giá

---

### 8. Users (`/api/users`)

#### GET `/api/users`
Lấy danh sách người dùng

#### GET `/api/users/:id`
Lấy chi tiết người dùng

#### PUT `/api/users/:id`
Cập nhật thông tin người dùng
- Body (form-data):
  - `fullName` (string)
  - `email` (string)
  - `phoneNumber` (string)
  - `address` (JSON string)
  - `accountSettings` (JSON string)
  - `securitySettings` (JSON string)
  - `avatar` (file)

#### DELETE `/api/users/:id`
Xóa người dùng (soft delete)

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": { ... },
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "limit": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Thông báo lỗi",
  "error": "Chi tiết lỗi (chỉ trong development)"
}
```

---

## Environment Variables

Tạo file `.env` trong thư mục root:
```
MONGODB_URI=mongodb://localhost:27017/rice_backend
PORT=3000
FRONTEND_URL=http://localhost:3001
```

---

## Testing với Postman

1. **Import Collection**: Tạo collection mới trong Postman
2. **Set Base URL**: Tạo environment variable `base_url` = `http://localhost:3000`
3. **Test các endpoints**: Bắt đầu với GET requests để kiểm tra kết nối
4. **Upload files**: Sử dụng form-data cho các endpoint có upload file

### Ví dụ Test Product:

**GET Products:**
```
GET {{base_url}}/api/products?page=1&limit=10
```

**POST Product:**
```
POST {{base_url}}/api/products
Content-Type: multipart/form-data

name: Gạo ST25
category: [ID của category]
listedPrice: 45000
initialQuantity: 1000
unit: kg
```

---

## Notes

- Tất cả các endpoint đều trả về JSON
- File upload sử dụng `multipart/form-data`
- Pagination mặc định: page=1, limit=10
- Timestamps tự động được tạo và cập nhật
- Soft delete được áp dụng cho một số models (Post, User)

