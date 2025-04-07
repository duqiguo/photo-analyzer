import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  preventCloseOnContentClick?: boolean;
  fullWidth?: boolean;
  noPadding?: boolean;
  sizeClass?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  preventCloseOnContentClick = false,
  fullWidth = false,
  noPadding = false,
  sizeClass = ''
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // 只有当不阻止点击内容关闭时，才添加点击外部关闭事件
      if (!preventCloseOnContentClick) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
      // 恢复背景滚动
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, preventCloseOnContentClick]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 半透明背景 */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={preventCloseOnContentClick ? undefined : onClose}
      />
      
      {/* 模态框内容 */}
      <div 
        ref={modalRef}
        className={`relative z-10 
          ${!fullWidth ? 'rounded-2xl' : ''} 
          ${sizeClass || (fullWidth ? 'w-full h-screen' : 'max-w-5xl w-full')}
          max-h-[90vh] overflow-auto shadow-2xl transform transition-all
        `}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-200/80 dark:bg-gray-800/80 rounded-full p-2 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors z-20"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-600 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        
        <div className={`${noPadding ? '' : 'p-6'}`}>
          {children}
        </div>
      </div>
    </div>
  );
} 