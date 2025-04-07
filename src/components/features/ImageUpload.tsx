import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  isAnalyzing: boolean;
}

export default function ImageUpload({ 
  onImageSelect,
  isAnalyzing
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    // 验证文件
    if (acceptedFiles.length === 0) {
      return;
    }
    
    // 检查所有文件的格式和大小
    let validFile: File | null = null;
    let invalidReason: string | null = null;
    
    const file = acceptedFiles[0]; // 只处理第一个文件
    
    // 检查文件类型
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      invalidReason = '不支持的文件格式';
    }
    // 检查文件大小 (最大 10MB)
    else if (file.size > 10 * 1024 * 1024) {
      invalidReason = '文件过大（超过10MB）';
    }
    else {
      validFile = file;
    }
    
    if (invalidReason) {
      setError(`无法处理文件：${file.name}（${invalidReason}）`);
      return;
    }
    
    if (validFile) {
      onImageSelect(validFile);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    disabled: isAnalyzing
  });
  
  // 更新拖放状态
  useEffect(() => {
    setDragActive(isDragActive);
  }, [isDragActive]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        {...getRootProps()} 
        className={`upload-area relative overflow-hidden ${dragActive ? 'active' : ''} ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        
        {/* 背景装饰 */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-50/40 to-secondary-50/40 dark:from-primary-900/10 dark:to-secondary-900/10 rounded-xl"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary-400/10 dark:bg-primary-600/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary-400/10 dark:bg-secondary-600/10 rounded-full blur-2xl"></div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 mx-auto bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-8 w-8 text-primary-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
          
          <h3 className="mt-6 text-xl font-semibold text-gray-800 dark:text-gray-200">
            {isAnalyzing ? '正在分析...' : '选择一张图片'}
          </h3>
          
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            支持 JPG、PNG 或 WebP 格式，最大 10MB
          </p>
          
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            所有照片分析将在您的浏览器中完成，不会上传到服务器
          </p>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 