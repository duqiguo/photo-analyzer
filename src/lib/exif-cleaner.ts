/**
 * 清除照片中的EXIF元数据并返回清理后的图片Blob
 * 通过在Canvas上重新绘制图片来去除所有元数据
 */
export async function cleanExifData(imageUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // 创建Canvas元素
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('无法创建Canvas上下文'));
        return;
      }
      
      // 设置Canvas大小与图片相同
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制图片到Canvas上 (这会去除所有元数据)
      ctx.drawImage(img, 0, 0);
      
      // 将Canvas内容转换为Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('无法创建清理后的图片'));
          }
        },
        'image/jpeg',
        0.95 // 95%质量
      );
    };
    
    // 加载图片出错时处理
    img.onerror = () => {
      reject(new Error('加载图片失败'));
    };
    
    // 设置图片源
    img.src = imageUrl;
  });
} 