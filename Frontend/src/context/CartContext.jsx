import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product || (!product._id && !product.id)) {
      console.error('Product must have _id or id');
      return;
    }
    
    const productId = product._id || product.id;
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => {
        const itemProductId = item.product._id || item.product.id;
        return String(itemProductId) === String(productId);
      });
      
      if (existingItem) {
        return prevItems.map((item) => {
          const itemProductId = item.product._id || item.product.id;
          if (String(itemProductId) === String(productId)) {
            return { ...item, quantity: item.quantity + quantity };
          }
          return item;
        });
      }
      
      return [...prevItems, { product, quantity }];
    });
    
    // Auto open cart after adding
    setShowCart(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => 
      prevItems.filter((item) => {
        const itemProductId = item.product._id || item.product.id;
        return String(itemProductId) !== String(productId);
      })
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const itemProductId = item.product._id || item.product.id;
        if (String(itemProductId) === String(productId)) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => {
      return count + (item.quantity || 1);
    }, 0);
  };

  const value = {
    cartItems,
    addToCart,
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

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

