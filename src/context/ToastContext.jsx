import React, { createContext, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ success: (msg) => addToast(msg, 'success'), error: (msg) => addToast(msg, 'error') }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border ${
                toast.type === 'success' 
                  ? 'bg-stone-900/90 text-white border-stone-800' 
                  : 'bg-red-600/90 text-white border-red-500'
              } flex items-center gap-3 min-w-[200px]`}
            >
              <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-green-400' : 'bg-white'}`} />
              <span className="text-sm font-medium">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
