import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div id="toast-container">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const bg = {
    success: 'bg-primary-container text-on-primary',
    error: 'bg-error text-on-error',
    info: 'bg-inverse-surface text-inverse-on-surface'
  }[toast.type] || 'bg-primary-container text-on-primary';

  const icon = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  }[toast.type] || 'check_circle';

  return (
    <div
      className={`${bg} flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg animate-toast-in min-w-[280px] max-w-[400px]`}
      role="alert"
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span className="text-sm font-medium flex-1 font-['Manrope']">{toast.message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
}
