'use client';

import { useState, useEffect } from 'react';
import { analyzeImage, VisionAPIResponse } from '@/lib/google-vision';

interface GoogleVisionAnalyzerProps {
  imageFile: File | null;
  imageUrl: string | null;
  gpsData?: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function GoogleVisionAnalyzer({ imageFile, imageUrl, gpsData }: GoogleVisionAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true); // 初始状态设为分析中
  const [results, setResults] = useState<VisionAPIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'data'>('description');
  const [mapLocation, setMapLocation] = useState<{lat: number, lng: number} | null>(null);

  // 当imageFile变化时自动调用分析
  useEffect(() => {
    if (imageFile) {
      handleAnalyze();
    }
  }, [imageFile]);
  
  // 设置地图位置
  useEffect(() => {
    console.log('设置地图位置 - GPS数据:', gpsData);
    console.log('设置地图位置 - 分析结果:', results?.landmarkAnnotations);
    
    // 优先使用传入的GPS数据（EXIF中提取的）
    if (gpsData && typeof gpsData.latitude === 'number' && typeof gpsData.longitude === 'number') {
      console.log('使用EXIF GPS数据:', gpsData.latitude, gpsData.longitude);
      setMapLocation({
        lat: gpsData.latitude,
        lng: gpsData.longitude
      });
    } 
    // 其次尝试从分析结果中获取位置
    else if (results?.landmarkAnnotations && results.landmarkAnnotations.length > 0 && 
             results.landmarkAnnotations[0].locations && results.landmarkAnnotations[0].locations.length > 0) {
      const { latitude, longitude } = results.landmarkAnnotations[0].locations[0].latLng;
      console.log('使用地标分析位置:', latitude, longitude);
      setMapLocation({
        lat: latitude,
        lng: longitude
      });
    }
    // 如果没有位置信息，默认显示北京
    else {
      console.log('使用默认位置');
      setMapLocation({
        lat: 39.9042,
        lng: 116.4074
      });
    }
  }, [gpsData, results]);

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('请先上传图片');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      // 立即调用Google Vision API分析图片
      const analysisResults = await analyzeImage(imageFile);
      console.log('Google Vision API分析结果:', analysisResults);
      setResults(analysisResults);
      
    } catch (err) {
      setError('分析图片时出错');
      console.error('分析图片时出错:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 基于分析结果生成描述
  const generateDescription = () => {
    if (!results) return '';
    
    let description = '';
    let location = '';
    
    // 从分析结果中提取位置信息
    if (results.landmarkAnnotations && results.landmarkAnnotations.length > 0) {
      location = results.landmarkAnnotations[0].description;
    }
    
    // 分析人物
    const people = results.extendedAnalysis?.people;
    if (people) {
      const count = people.count || 1;
      const gender = people.gender || [];
      const race = people.race || [];
      
      // 第一段：描述场景、人物和位置
      description += `In the scene of the photo, there is ${count === 1 ? 'one person' : count} person${count === 1 ? '' : 's'}.`;
      
      // 添加环境描述
      if (results.labelAnnotations && results.labelAnnotations.length > 0) {
        const environmentLabels = results.labelAnnotations
          .filter(label => ['tree', 'plant', 'water', 'sky', 'mountain', 'grass', 'foliage', 'nature', 
                          '树', '植物', '水', '天空', '山', '草', '叶子', '自然'].includes(label.description.toLowerCase()))
          .map(label => label.description.toLowerCase());
        
        if (environmentLabels.length > 0) {
          description += ' The background is';
          if (environmentLabels.includes('tree') || environmentLabels.includes('plant') || 
              environmentLabels.includes('树') || environmentLabels.includes('植物')) {
            description += ' lush vegetation';
          } else if (environmentLabels.includes('water') || environmentLabels.includes('水')) {
            description += ' calm water';
          } else if (environmentLabels.includes('mountain') || environmentLabels.includes('山')) {
            description += ' majestic mountains';
          } else {
            description += ' natural landscape';
          }
          description += '.';
        } else {
          description += '.';
        }
      } else {
        description += '.';
      }
      
      // 第二段：描述人物种族和服装
      if (race.length > 0) {
        description += ` They are likely from the ${race.join(' or ')} race.`;
      }
      
      // 添加服装描述
      if (people.clothing && people.clothing.length > 0) {
        description += ` They are wearing ${people.clothing.join(', ')}.`;
      }
      
      // 添加表情或情绪
      if (people.emotions && Object.values(people.emotions).length > 0) {
        const emotions = Object.values(people.emotions)[0].split('、')[0];
        description += ` Their expression shows ${emotions === 'Joy' ? 'joy' : 
                            emotions === 'Sorrow' ? 'sadness' : 
                            emotions === 'Anger' ? 'anger' : 
                            emotions === 'Surprise' ? 'surprise' : 
                            emotions === 'Neutral' ? 'neutral' : emotions}.`;
      }

      // 第三段：收入范围和政治倾向
      if (results.extendedAnalysis?.possibleIncomeRange) {
        const incomeRange = results.extendedAnalysis.possibleIncomeRange;
        description += ` According to visual indicators, they belong to the <span class="font-semibold">${
          incomeRange === 'High Income' ? 'high income' : 
          incomeRange === 'Middle Income' ? 'middle income' : 
          incomeRange === 'Low Income' ? 'low income' : incomeRange
        }</span> group.`;
      }
      
      // 添加政治倾向
      if (results.extendedAnalysis?.possiblePoliticalAffiliation) {
        const political = results.extendedAnalysis.possiblePoliticalAffiliation;
        description += ` They are likely to lean towards <span class="font-semibold">${
          political === 'Conservative Leaning' ? 'conservative' : 
          political === 'Liberal Leaning' ? 'liberal' : 
          political === 'Neutral/Unknown' ? 'neutral/unknown' : political
        }</span>.`;
      }

      // 第四段：兴趣爱好和广告目标
      if (results.extendedAnalysis?.possibleInterests && results.extendedAnalysis.possibleInterests.length > 0) {
        const interestsMap: Record<string, string> = {
          'Sports': 'sports', 
          'Fashion': 'fashion', 
          'Technology': 'technology',
          'Art': 'art', 
          'Travel': 'travel', 
          'Food': 'food',
          'Nature': 'nature', 
          'Music': 'music', 
          'Reading': 'reading',
          'Fitness': 'fitness'
        };
        
        const translatedInterests = results.extendedAnalysis.possibleInterests.map(
          interest => interestsMap[interest] || interest
        );
        
        description += ` Their possible interests include <span class="font-semibold">${translatedInterests.join(', ')}</span>.`;
      }
      
      if (results.extendedAnalysis?.possibleTargetedAds && results.extendedAnalysis.possibleTargetedAds.length > 0) {
        description += ` Based on visual clues, they may react to ads related to ${results.extendedAnalysis.possibleTargetedAds.slice(0, 3).join(', ')}.`;
      }
    } else {
      // 如果没有检测到人，则描述环境
      description = 'This photo shows a scene';
      if (location) {
        description += `, located near <span class="font-semibold">${location}</span>.`;
      } else {
        description += '.';
      }
      
      // 添加物体描述
      if (results.labelAnnotations && results.labelAnnotations.length > 0) {
        const topLabels = results.labelAnnotations.slice(0, 5).map(label => label.description);
        description += ` The main content includes ${topLabels.join(', ')}.`;
      }
      
      // 添加颜色信息
      if (results.imagePropertiesAnnotation?.dominantColors?.colors) {
        const colors = results.imagePropertiesAnnotation.dominantColors.colors;
        if (colors.length > 0) {
          const mainColor = colors[0].color;
          const r = mainColor.red || 0;
          const g = mainColor.green || 0;
          const b = mainColor.blue || 0;
          
          let colorName = '';
          if (r > 200 && g < 100 && b < 100) colorName = 'red';
          else if (r < 100 && g > 200 && b < 100) colorName = 'green';
          else if (r < 100 && g < 100 && b > 200) colorName = 'blue';
          else if (r > 200 && g > 200 && b < 100) colorName = 'yellow';
          else if (r > 200 && g < 100 && b > 200) colorName = 'purple';
          else if (r < 100 && g > 200 && b > 200) colorName = 'cyan';
          else if (r > 200 && g > 100 && b < 100) colorName = 'orange';
          else if (r > 200 && g > 200 && b > 200) colorName = 'white';
          else if (r < 100 && g < 100 && b < 100) colorName = 'black';
          else colorName = 'mixed';
          
          description += ` The main color of the image is ${colorName}, accounting for about ${Math.round(colors[0].pixelFraction * 100)}% of the image.`;
        }
      }
      
      // 如果有web检测结果，添加相关性最高的网页内容
      if (results.webDetection?.bestGuessLabels && results.webDetection.bestGuessLabels.length > 0) {
        description += ` The most similar network search result for the image content is "${results.webDetection.bestGuessLabels[0].label}".`;
      }
    }
    
    return description;
  };

  if (!imageFile || !imageUrl) {
    return null;
  }

  // 创建谷歌地图URL
  const getGoogleMapUrl = () => {
    if (!mapLocation) return '';
    // 使用无需API密钥的Google Maps URL格式
    return `https://maps.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&z=15&output=embed`;
  };

  return (
    <div className="w-full overflow-hidden bg-black text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* 左侧：图片和地图 */}
        <div className="flex flex-col">
          {/* 上部分：图片 */}
          <div className="flex items-center justify-center bg-black" style={{height: '50vh'}}>
            <img 
              src={imageUrl} 
              alt="Analyzed" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* 下部分：谷歌地图 */}
          <div className="relative" style={{height: '30vh'}}>
            {mapLocation ? (
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src={getGoogleMapUrl()}
                style={{border:0}}
                loading="lazy"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gray-900/70 flex items-center justify-center">
                <p className="text-white text-sm">Loading map...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* 右侧：分析结果 */}
        <div className="flex flex-col h-full">
          {/* 标签切换 */}
          <div className="flex bg-gray-800">
            <button
              className={`py-3 px-6 text-lg w-1/2 text-center transition-colors ${
                activeTab === 'description' 
                  ? 'bg-gray-700 text-white font-medium' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`py-3 px-6 text-lg w-1/2 text-center transition-colors ${
                activeTab === 'data' 
                  ? 'bg-gray-700 text-white font-medium' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('data')}
            >
              Data
            </button>
          </div>
          
          {/* 分析加载状态 */}
          {isAnalyzing && (
            <div className="flex justify-center items-center p-10 flex-grow">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
                <p className="text-gray-300">正在分析您的照片...</p>
              </div>
            </div>
          )}
          
          {/* 内容区域 */}
          {!isAnalyzing && (
            <div className="p-6 overflow-y-auto flex-grow">
              {activeTab === 'description' && results && (
                <div className="space-y-4">
                  {/* 主要描述内容 - 使用API分析结果 */}
                  <div className="text-xl leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: generateDescription() }}></div>
                </div>
              )}
              
              {activeTab === 'data' && results && (
                <div className="space-y-3">
                  {/* 1. 人物信息 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">People</h3>
                    <p>{(results.extendedAnalysis?.people?.count || 1)} {(results.extendedAnalysis?.people?.count || 1) === 1 ? 'person' : 'people'}, 
                      {results.extendedAnalysis?.people?.gender ? ` ${results.extendedAnalysis.people.gender.join(', ')}` : ' Unknown'} 
                      {results.extendedAnalysis?.people?.age ? ` ${results.extendedAnalysis.people.age.join(', ')}` : ' Adult'}
                    </p>
                  </div>
                  
                  {/* 2. 种族信息 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Race</h3>
                    <p>{results.extendedAnalysis?.people?.race?.length ? results.extendedAnalysis.people.race.join(', ') : 'Unknown'}</p>
                  </div>
                  
                  {/* 4. 情绪 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Emotion</h3>
                    <p>{results.extendedAnalysis?.people?.emotions && Object.keys(results.extendedAnalysis.people.emotions).length > 0 ? 
                      Object.entries(results.extendedAnalysis.people.emotions).map(([person, emotion]) => {
                        const personCN = person.replace('Person', '人物');
                        const emotionCN = emotion
                          .replace('Joy', '喜悦')
                          .replace('Sorrow', '悲伤')
                          .replace('Anger', '愤怒')
                          .replace('Surprise', '惊讶')
                          .replace('Neutral', '平静')
                          .replace(', ', '、');
                        return `${personCN}: ${emotionCN}`;
                      }).join('、') : '人物1: 平静'}</p>
                  </div>
                  
                  {/* 5. 服装 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Clothing</h3>
                    <p>{results.extendedAnalysis?.people?.clothing && results.extendedAnalysis.people.clothing.length > 0 ? 
                      results.extendedAnalysis.people.clothing.join(', ') : 'Casual clothing'}</p>
                  </div>
                  
                  {/* 6. 兴趣爱好 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Interests</h3>
                    <p>{results.extendedAnalysis?.possibleInterests && results.extendedAnalysis.possibleInterests.length > 0 ? 
                      results.extendedAnalysis.possibleInterests.map(interest => 
                        interest === 'Sports' ? 'sports' : 
                        interest === 'Fashion' ? 'fashion' : 
                        interest === 'Technology' ? 'technology' :
                        interest === 'Art' ? 'art' : 
                        interest === 'Travel' ? 'travel' : 
                        interest === 'Food' ? 'food' :
                        interest === 'Nature' ? 'nature' : 
                        interest === 'Music' ? 'music' : 
                        interest === 'Reading' ? 'reading' :
                        interest === 'Fitness' ? 'fitness' :
                        interest === 'General interests' ? 'general interests' : interest).join(', ') : 'general interests'}</p>
                  </div>
                  
                  {/* 7. 政治倾向 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Political Affiliation</h3>
                    <p>{results.extendedAnalysis?.possiblePoliticalAffiliation ? 
                      (results.extendedAnalysis.possiblePoliticalAffiliation === 'Conservative Leaning' ? 'conservative' : 
                      results.extendedAnalysis.possiblePoliticalAffiliation === 'Liberal Leaning' ? 'liberal' : 
                      results.extendedAnalysis.possiblePoliticalAffiliation === 'Neutral/Unknown' ? 'neutral/unknown' : 
                      results.extendedAnalysis.possiblePoliticalAffiliation) : 'neutral/unknown'}</p>
                  </div>
                  
                  {/* 3. 收入范围 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Income Range</h3>
                    <p>{results.extendedAnalysis?.possibleIncomeRange ? 
                      (results.extendedAnalysis.possibleIncomeRange === 'High Income' ? 'high income' : 
                      results.extendedAnalysis.possibleIncomeRange === 'Middle Income' ? 'middle income' : 
                      results.extendedAnalysis.possibleIncomeRange === 'Low Income' ? 'low income' : 
                      results.extendedAnalysis.possibleIncomeRange) : 'middle income'}</p>
                  </div>
                  
                  {/* 8. 可能的广告目标 */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">Target Ads</h3>
                    <p>{results.extendedAnalysis?.possibleTargetedAds && results.extendedAnalysis.possibleTargetedAds.length > 0 ? 
                      results.extendedAnalysis.possibleTargetedAds.join(', ') : 'General consumer products'}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-900/20 text-red-400 rounded">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 