'use client';

import ImageUpload from '@/components/features/ImageUpload';
import GoogleVisionAnalyzer from '@/components/features/GoogleVisionAnalyzer';
import Modal from '@/components/features/Modal';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useState } from 'react';
import { parseExifData } from '@/lib/exif-parser';
import { ExifData } from '@/components/features/AnalysisResult';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [exifData, setExifData] = useState<ExifData>({});
  const { t } = useLanguage();

  // Handle image selection
  const handleImageSelect = async (file: File) => {
    setSelectedImage(file);
    
    // Create image URL for display
    const objectUrl = URL.createObjectURL(file);
    setImageUrl(objectUrl);
    
    // Parse EXIF data
    try {
      const extractedExifData = await parseExifData(file);
      console.log('Parsed EXIF data:', extractedExifData);
      setExifData(extractedExifData);
    } catch (error) {
      console.error('Failed to parse EXIF data:', error);
      setExifData({});
    }
    
    // Show analysis modal immediately
    setShowAnalysisResult(true);
    
    // Cleanup function
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
              {t('photoAnalyzer')}
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('uploadDescription')}
            </p>
          </div>
          
          <ImageUpload 
            onImageSelect={handleImageSelect}
            isAnalyzing={false}
          />
        </div>
      </div>

      <Footer />
      
      {/* Analysis Result Modal */}
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