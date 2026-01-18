# Frontend Dashboard - Hương Gạo Quê

Frontend dashboard quản trị cho hệ thống quản lý sản phẩm gạo.

## Công nghệ sử dụng

- React 18
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- Recharts (cho biểu đồ)
- React Quill (cho rich text editor)
- React Icons

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Tạo file `.env` (nếu cần):
```env
VITE_API_URL=http://localhost:3000/api
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3001`

## Build cho production

```bash
npm run build
```

## Cấu trúc thư mục

```
src/
├── components/          # Các components tái sử dụng
│   ├── Layout/         # Layout components (Sidebar, Header, MainLayout)
│   └── Modal/          # Modal components
├── context/            # React Context (AuthContext)
├── pages/              # Các pages của ứng dụng
│   ├── Dashboard/      # Trang dashboard chính
│   ├── Products/       # Quản lý sản phẩm
│   ├── Orders/         # Quản lý đơn hàng
│   ├── Customers/      # Quản lý khách hàng
│   ├── Posts/          # Quản lý bài viết
│   └── Profile/        # Thông tin cá nhân
├── utils/              # Utilities (API service)
└── App.jsx             # Component chính với routing
```

## Tính năng

- ✅ Đăng nhập/Đăng xuất
- ✅ Quản lý sản phẩm (CRUD)
- ✅ Quản lý danh mục sản phẩm
- ✅ Quản lý đơn hàng
- ✅ Quản lý khách hàng
- ✅ Quản lý bài viết
- ✅ Thông tin quản trị viên
- ✅ Biểu đồ thống kê
- ✅ Upload ảnh
- ✅ Rich text editor
- ✅ Pagination
- ✅ Search & Filter

## Kết nối với Backend

Backend API được cấu hình trong `src/utils/api.js`. Mặc định kết nối với `http://localhost:3000/api`.

## Lưu ý

- Đảm bảo backend đang chạy trước khi chạy frontend
- Token được lưu trong localStorage
- Cần có JWT token hợp lệ để truy cập các trang được bảo vệ
