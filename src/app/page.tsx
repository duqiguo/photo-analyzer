'use client';

import ImageUpload from '@/components/features/ImageUpload';
import GoogleVisionAnalyzer from '@/components/features/GoogleVisionAnalyzer';
import Modal from '@/components/features/Modal';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useState } from 'react';
import { parseExifData } from '@/lib/exif-parser';
import { ExifData } from '@/components/features/AnalysisResult';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [exifData, setExifData] = useState<ExifData>({});

  // 处理图片选择
  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    
    // 创建图片URL以供显示
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    
    // 解析EXIF数据
    try {
      const extractedExifData = await parseExifData(file);
      console.log('解析到的EXIF数据:', extractedExifData);
      setExifData(extractedExifData);
    } catch (error) {
      console.error('解析EXIF数据失败:', error);
      setExifData({});
    }
    
    // 立即显示分析弹窗
    setShowAnalysisResult(true);
    
    // 清理函数
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleCloseAnalysis = () => {
    setShowAnalysisResult(false);
    setSelectedImage(null);
    setImageUrl(null);
    setExifData({});
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              照片分析器
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              上传一张照片，了解它可能包含的隐私信息以及人工智能可以从中提取的数据。
            </p>
          </div>
          
          <ImageUpload 
            onImageSelect={handleImageSelect}
            isAnalyzing={false}
          />
        </div>
      </div>

      <Footer />
      
      {/* 分析结果模态框 */}
      {showAnalysisResult && imageUrl && selectedImage && (
        <Modal
          isOpen={showAnalysisResult}
          onClose={handleCloseAnalysis}
          preventCloseOnContentClick={true}
          fullWidth={false}
          noPadding={true}
          sizeClass="w-full max-w-4xl"
        >
          <GoogleVisionAnalyzer 
            imageFile={selectedImage} 
            imageUrl={imageUrl}
            gpsData={exifData.gps}
          />
        </Modal>
      )}
    </main>
  );
} 