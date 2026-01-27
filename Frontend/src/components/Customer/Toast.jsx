import { useEffect } from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';

const Toast = ({ message, isVisible, onClose, type = 'success' }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-20 right-4 z-50 transition-all duration-300 ease-in-out"
      style={{
        transform: isVisible ? 'translateX(0)' : 'translateX(400px)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg ${
          type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
        } text-white min-w-[300px]`}
      >
        <FiCheckCircle className="w-6 h-6 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="hover:opacity-80">
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;

