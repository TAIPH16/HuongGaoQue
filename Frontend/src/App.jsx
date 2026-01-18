import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { SellerAuthProvider } from './context/SellerAuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import SellerProtectedRoute from './components/SellerProtectedRoute';
import Login from './pages/Login';
import ProductCategories from './pages/Products/ProductCategories';
import ProductList from './pages/Products/ProductList';
import ProductForm from './pages/Products/ProductForm';
import OrderList from './pages/Orders/OrderList';
import OrderDetail from './pages/Orders/OrderDetail';
import CustomerList from './pages/Customers/CustomerList';
import PostList from './pages/Posts/PostList';
import PostForm from './pages/Posts/PostForm';
import Profile from './pages/Profile/Profile';
import Dashboard from './pages/Dashboard/Dashboard';
import HomePage from './pages/Customer/HomePage';
import ProductsPage from './pages/Customer/ProductsPage';
import ProductDetailPage from './pages/Customer/ProductDetailPage';
import PromotionsPage from './pages/Customer/PromotionsPage';
import NewsPage from './pages/Customer/NewsPage';
import NewsDetailPage from './pages/Customer/NewsDetailPage';
import ContactPage from './pages/Customer/ContactPage';
import CartPage from './pages/Customer/CartPage';
import CheckoutPage from './pages/Customer/CheckoutPage';
import ProfilePage from './pages/Customer/ProfilePage';
import OrderInfoPage from './pages/Customer/OrderInfoPage';
import FavoritesPage from './pages/Customer/FavoritesPage';
import DeliveryAddressPage from './pages/Customer/DeliveryAddressPage';
import OrderReviewPage from './pages/Customer/OrderReviewPage';
import PaymentMethodPage from './pages/Customer/PaymentMethodPage';
import OrderSuccessPage from './pages/Customer/OrderSuccessPage';
import VNPayProcessingPage from './pages/Customer/VNPayProcessingPage';
import VNPaySuccessPage from './pages/Customer/VNPaySuccessPage';
import VNPayFailPage from './pages/Customer/VNPayFailPage';
import NotificationList from './pages/Notifications/NotificationList';
import NotificationDetail from './pages/Notifications/NotificationDetail';
import NotificationForm from './pages/Notifications/NotificationForm';
import CustomerDetail from './pages/Customers/CustomerDetail';
import CustomerEditForm from './pages/Customers/CustomerEditForm';
import SellerManagement from './pages/Sellers/SellerManagement';
import SellerDetail from './pages/Sellers/SellerDetail';
import SellerEditForm from './pages/Sellers/SellerEditForm';
import SellerLogin from './pages/Seller/SellerLogin';
import SellerDashboard from './pages/Seller/SellerDashboard';
import SellerProfile from './pages/Seller/SellerProfile';
import SellerProducts from './pages/Seller/SellerProducts';
import SellerProductForm from './pages/Seller/SellerProductForm';
import SellerOrders from './pages/Seller/SellerOrders';
import SellerStockManagement from './pages/Seller/SellerStockManagement';
import UniversalLogin from './pages/Auth/UniversalLogin';

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Customer Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/san-pham" element={<ProductsPage />} />
      <Route path="/san-pham/:id" element={<ProductDetailPage />} />
      <Route path="/khuyen-mai" element={<PromotionsPage />} />
      <Route path="/tin-tuc" element={<NewsPage />} />
      <Route path="/tin-tuc/:id" element={<NewsDetailPage />} />
      <Route path="/lien-he" element={<ContactPage />} />
      <Route path="/gio-hang" element={<CartPage />} />
      <Route path="/thanh-toan" element={<CheckoutPage />} />
      <Route path="/dia-chi-giao-hang" element={<DeliveryAddressPage />} />
      <Route path="/duyet-lai-don-hang" element={<OrderReviewPage />} />
      <Route path="/phuong-thuc-thanh-toan" element={<PaymentMethodPage />} />
      <Route path="/don-hang-thanh-cong" element={<OrderSuccessPage />} />
      <Route path="/thanh-toan-vnpay/processing" element={<VNPayProcessingPage />} />
      <Route path="/thanh-toan-vnpay/success" element={<VNPaySuccessPage />} />
      <Route path="/thanh-toan-vnpay/fail" element={<VNPayFailPage />} />
      <Route path="/ho-so" element={<ProfilePage />} />
      <Route path="/don-hang" element={<OrderInfoPage />} />
      <Route path="/da-thich" element={<FavoritesPage />} />
      <Route path="/notifications" element={<NotificationList />} />
      <Route path="/notifications/:id" element={<NotificationDetail />} />

      {/* UNIVERSAL LOGIN - Chung cho tất cả */}
      <Route path="/login" element={<UniversalLogin />} />

      {/* Seller Routes */}
      <Route path="/seller/login" element={<SellerLogin />} />
      <Route
        path="/seller/dashboard"
        element={
          <SellerProtectedRoute>
            <SellerDashboard />
          </SellerProtectedRoute>
        }
      />
      <Route
        path="/seller/profile"
        element={
          <SellerProtectedRoute>
            <SellerProfile />
          </SellerProtectedRoute>
        }
      />
      <Route
        path="/seller/products"
        element={
          <SellerProtectedRoute>
            <SellerProducts />
          </SellerProtectedRoute>
        }
      />
      <Route
        path="/seller/products/edit/:id"
        element={
          <SellerProtectedRoute>
            <SellerProductForm />
          </SellerProtectedRoute>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <SellerProtectedRoute>
            <SellerOrders />
          </SellerProtectedRoute>
        }
      />
      <Route
        path="/seller/stock"
        element={
          <SellerProtectedRoute>
            <SellerStockManagement />
          </SellerProtectedRoute>
        }
      />
      {/* Admin Routes */}
      <Route
        path="/admin/login"
        element={isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Login />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <ProtectedRoute>
            <ProductList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/categories"
        element={
          <ProtectedRoute>
            <ProductCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/add"
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/products/edit/:id"
        element={
          <ProtectedRoute>
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <ProtectedRoute>
            <OrderList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers"
        element={
          <ProtectedRoute>
            <CustomerList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers/:id/edit"
        element={
          <ProtectedRoute>
            <CustomerEditForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/customers/:id"
        element={
          <ProtectedRoute>
            <CustomerDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sellers"
        element={
          <ProtectedRoute>
            <SellerManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sellers/:id/edit"
        element={
          <ProtectedRoute>
            <SellerEditForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sellers/:id"
        element={
          <ProtectedRoute>
            <SellerDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/posts"
        element={
          <ProtectedRoute>
            <PostList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/posts/add"
        element={
          <ProtectedRoute>
            <PostForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/posts/edit/:id"
        element={
          <ProtectedRoute>
            <PostForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute>
            <NotificationList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications/add"
        element={
          <ProtectedRoute>
            <NotificationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications/:id/edit"
        element={
          <ProtectedRoute>
            <NotificationForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications/:id"
        element={
          <ProtectedRoute>
            <NotificationDetail />
          </ProtectedRoute>
        }
      />
      {/* Catch all - only redirect if route doesn't match any above */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <SellerAuthProvider>
          <CartProvider>
            <Router>
              <AppRoutes />
            </Router>
          </CartProvider>
        </SellerAuthProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}

export default App;
