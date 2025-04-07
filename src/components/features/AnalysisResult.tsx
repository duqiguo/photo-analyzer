import { useState } from 'react';
import Image from 'next/image';
import { cleanExifData } from '@/lib/exif-cleaner';

export interface ExifData {
  make?: string;
  model?: string;
  software?: string;
  dateTime?: string;
  gps?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  exposureTime?: string;
  fNumber?: number;
  iso?: number;
  focalLength?: number;
  flash?: boolean;
  orientation?: number;
  colorSpace?: string;
  xResolution?: number;
  yResolution?: number;
  resolutionUnit?: string;
  other?: Record<string, any>;
}

interface AnalysisResultProps {
  imageUrl: string;
  exifData: ExifData | null;
  isLoading: boolean;
}

export default function AnalysisResult({ imageUrl, exifData, isLoading }: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'map'>('summary');
  const [isCleaningMetadata, setIsCleaningMetadata] = useState(false);
  const [cleanStatus, setCleanStatus] = useState<'idle' | 'cleaning' | 'success' | 'error'>('idle');
  
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!exifData) {
    return null;
  }
  
  const hasLocation = exifData.gps && exifData.gps.latitude && exifData.gps.longitude;
  const hasDeviceInfo = exifData.make || exifData.model;
  const hasMetadata = Object.keys(exifData).length > 0;

  const handleCleanMetadata = async () => {
    if (!imageUrl) return;
    
    try {
      setCleanStatus('cleaning');
      setIsCleaningMetadata(true);
      
      // 清除元数据
      const cleanedBlob = await cleanExifData(imageUrl);
      
      // 创建下载链接
      const url = URL.createObjectURL(cleanedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '已清除元数据_' + (new Date().getTime()) + '.jpg';
      document.body.appendChild(a);
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setCleanStatus('success');
      setTimeout(() => setCleanStatus('idle'), 3000);
    } catch (error) {
      console.error('清除元数据失败:', error);
      setCleanStatus('error');
    } finally {
      setIsCleaningMetadata(false);
    }
  };
  
  function formatDate(dateStr?: string) {
    if (!dateStr) return '未知';
    try {
      // 格式化日期
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN');
    } catch (e) {
      return dateStr;
    }
  }
  
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧图片区域 */}
        <div className="relative w-full aspect-square md:aspect-auto md:h-full overflow-hidden rounded-xl shadow-md">
          {imageUrl && (
            <div className="relative w-full h-full min-h-[300px]">
              <Image 
                src={imageUrl} 
                alt="Uploaded image"
                fill
                style={{ objectFit: 'contain' }}
                sizes="(max-width: 768px) 100vw, 500px"
                priority
                className="rounded-xl"
              />
            </div>
          )}
        </div>
        
        {/* 右侧分析结果区域 */}
        <div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex">
              <button
                className={`pb-2 px-4 text-sm font-medium ${
                  activeTab === 'summary'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('summary')}
              >
                概要
              </button>
              <button
                className={`pb-2 px-4 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'text-primary-500 border-b-2 border-primary-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('details')}
              >
                详细信息
              </button>
              {hasLocation && (
                <button
                  className={`pb-2 px-4 text-sm font-medium ${
                    activeTab === 'map'
                      ? 'text-primary-500 border-b-2 border-primary-500'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('map')}
                >
                  地图
                </button>
              )}
            </div>
            
            {hasMetadata && (
              <div>
                <button
                  onClick={handleCleanMetadata}
                  disabled={isCleaningMetadata}
                  className={`text-sm rounded-lg px-3 py-1.5 flex items-center space-x-1
                    ${cleanStatus === 'cleaning' ? 'bg-gray-200 text-gray-600 dark:bg-gray-800' : 
                      cleanStatus === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      cleanStatus === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400'
                    }
                  `}
                >
                  {cleanStatus === 'cleaning' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>处理中...</span>
                    </>
                  ) : cleanStatus === 'success' ? (
                    <>
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>清除成功!</span>
                    </>
                  ) : cleanStatus === 'error' ? (
                    <>
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>清除失败</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>清除元数据</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          
          <div className="overflow-y-auto max-h-[50vh] pr-2">
            {activeTab === 'summary' && (
              <div className="space-y-4">
                {hasLocation && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      隐私风险：地理位置信息
                    </h3>
                    <p className="mt-2 text-red-600 dark:text-red-400">
                      此照片包含精确的GPS坐标，可以显示您拍摄照片的确切位置。
                    </p>
                    <div className="mt-4 text-sm">
                      <p>纬度: {exifData.gps?.latitude.toFixed(6)}</p>
                      <p>经度: {exifData.gps?.longitude.toFixed(6)}</p>
                      {exifData.gps?.altitude && <p>海拔: {exifData.gps.altitude.toFixed(1)} 米</p>}
                    </div>
                  </div>
                )}
                
                {hasDeviceInfo && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-600 dark:text-yellow-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      设备信息泄露
                    </h3>
                    <p className="mt-2 text-yellow-600 dark:text-yellow-400">
                      照片包含您使用的相机/手机设备信息。
                    </p>
                    <div className="mt-4 text-sm">
                      {exifData.make && <p>设备品牌: {exifData.make}</p>}
                      {exifData.model && <p>设备型号: {exifData.model}</p>}
                      {exifData.software && <p>软件: {exifData.software}</p>}
                    </div>
                  </div>
                )}
                
                {exifData.dateTime && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      时间信息
                    </h3>
                    <p className="mt-2 text-blue-600 dark:text-blue-400">
                      照片包含拍摄时间戳，可能会泄露您的日常活动模式。
                    </p>
                    <div className="mt-4 text-sm">
                      <p>拍摄时间: {formatDate(exifData.dateTime)}</p>
                    </div>
                  </div>
                )}
                
                {!hasLocation && !hasDeviceInfo && !exifData.dateTime && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      很好！未发现主要隐私风险
                    </h3>
                    <p className="mt-2 text-green-600 dark:text-green-400">
                      此照片不包含主要的隐私风险信息，如地理位置、设备信息或时间戳。
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'details' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">照片详细元数据</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {exifData.make && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">设备品牌</h4>
                      <p className="text-gray-800 dark:text-white">{exifData.make}</p>
                    </div>
                  )}
                  {exifData.model && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">设备型号</h4>
                      <p className="text-gray-800 dark:text-white">{exifData.model}</p>
                    </div>
                  )}
                  {exifData.software && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">软件</h4>
                      <p className="text-gray-800 dark:text-white">{exifData.software}</p>
                    </div>
                  )}
                  {exifData.dateTime && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">拍摄时间</h4>
                      <p className="text-gray-800 dark:text-white">{formatDate(exifData.dateTime)}</p>
                    </div>
                  )}
                  {exifData.gps && (
                    <div className="sm:col-span-2">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">GPS位置</h4>
                      <p className="text-gray-800 dark:text-white">
                        纬度: {exifData.gps.latitude.toFixed(6)}, 经度: {exifData.gps.longitude.toFixed(6)}
                        {exifData.gps.altitude && `, 海拔: ${exifData.gps.altitude.toFixed(1)}米`}
                      </p>
                    </div>
                  )}
                  {exifData.exposureTime && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">曝光时间</h4>
                      <p className="text-gray-800 dark:text-white">{exifData.exposureTime}秒</p>
                    </div>
                  )}
                  {exifData.fNumber && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">光圈</h4>
                      <p className="text-gray-800 dark:text-white">f/{exifData.fNumber}</p>
                    </div>
                  )}
                  {exifData.iso && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">ISO</h4>
                      <p className="text-gray-800 dark:text-white">{exifData.iso}</p>
                    </div>
                  )}
                  {exifData.focalLength && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">焦距</h4>
                      <p className="text-gray-800 dark:text-white">{exifData.focalLength}mm</p>
                    </div>
                  )}
                  {exifData.colorSpace && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">色彩空间</h4>
                      <p className="text-gray-800 dark:text-white">{exifData.colorSpace}</p>
                    </div>
                  )}
                  {exifData.orientation && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">方向</h4>
                      <p className="text-gray-800 dark:text-white">{exifData.orientation}</p>
                    </div>
                  )}
                </div>
                
                {exifData.other && Object.keys(exifData.other).length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-2">其他元数据</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-xs text-gray-700 dark:text-gray-300">
                        {JSON.stringify(exifData.other, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'map' && hasLocation && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">照片拍摄位置</h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 text-center">
                  <p className="text-gray-700 dark:text-gray-300 mb-3">GPS坐标: {exifData.gps?.latitude.toFixed(6)}, {exifData.gps?.longitude.toFixed(6)}</p>
                  <a 
                    href={`https://maps.google.com/?q=${exifData.gps?.latitude},${exifData.gps?.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-block"
                  >
                    在Google地图中查看
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 