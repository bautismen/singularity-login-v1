
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onNoAction?: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  noActionText?: string;
  showCancel?: boolean;
  showNoAction?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  onNoAction,
  title,
  message,
  type = 'info',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  noActionText= 'No',
  showCancel = false,
  showNoAction = false
}: ModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      case 'confirm':
        return <AlertCircle className="w-12 h-12 text-blue-500" />;
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 animate-modalSlideIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              {getIcon()}
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>

            <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {message}
            </p>
          </div>

          <div className="flex gap-3 mt-6">
            {showCancel && (
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {cancelText}
              </button>
            )}
            {showNoAction && (
              <button 
                onClick={onNoAction}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {noActionText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`
                ${(showCancel || showNoAction ) ? 'flex-1' : 'w-full'}
                px-4 py-2.5 rounded-lg font-medium transition-colors
                ${type === 'error'
                  ? 'bg-[#038C7F] hover:bg-[#037F8C] text-white'
                  : type === 'warning'
                  ? 'bg-[#038C7F] hover:bg-[#037F8C] text-white'
                  : type === 'success'
                  ? 'bg-[#038C7F] hover:bg-[#037F8C] text-white'
                  : 'bg-[#038C7F] hover:bg-[#037F8C] text-white'
                }
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          from {
            transform: scale(0.95) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }
        .animate-modalSlideIn {
          animation: modalSlideIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
