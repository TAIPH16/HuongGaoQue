// File: src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Load giỏ hàng từ localStorage khi mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Lưu giỏ hàng vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ===============================
  // HÀM CŨ: Thêm sản phẩm vào giỏ
  const addToCart = (product, quantity = 1) => {
    if (!product || (!product._id && !product.id)) {
      console.error('Product must have _id or id');
      return;
    }

    const productId = product._id || product.id;

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => String(item.product._id || item.product.id) === String(productId)
      );

      if (existingItem) {
        return prevItems.map((item) =>
          String(item.product._id || item.product.id) === String(productId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, { product, quantity }];
    });

    setShowCart(true);
  };

  /// HÀM MỚI: addCart helper
const addCartHelper = (cartItems, product, quantity) => {
  const exist = cartItems.find(item => item.product._id === product._id);
  if (exist) {
    return cartItems.map(item =>
      item.product._id === product._id
        ? { ...item, quantity: item.quantity + quantity }
        : item
    );
  } else {
    return [...cartItems, { product, quantity }];
  }
};

// HÀM MỚI: addCart
const addCart = ({ product, quantity }) => {
  setCartItems(prevCart => addCartHelper(prevCart, product, quantity));
};

  // Xóa sản phẩm khỏi giỏ
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => String(item.product._id || item.product.id) !== String(productId))
    );
  };

  // Cập nhật số lượng
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        String(item.product._id || item.product.id) === String(productId)
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Xóa toàn bộ giỏ
  const clearCart = () => setCartItems([]);

  // Tổng tiền
  const getCartTotal = () =>
    cartItems.reduce((total, item) => total + (item.product.price || item.product.listedPrice || 0) * item.quantity, 0);

  // Tổng số lượng
  const getCartCount = () =>
    cartItems.reduce((count, item) => count + (item.quantity || 1), 0);

  // ===============================
  // Giá trị context
  const value = {
    cartItems,
    addToCart,    // giữ nguyên
    addCart,      // thêm mới
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    showCart,
    setShowCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Hook dùng trong components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};