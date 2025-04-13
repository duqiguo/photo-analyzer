'use client';

import { useState, useEffect } from 'react';
import { analyzeImage, VisionAPIResponse } from '@/lib/google-vision';
import { useLanguage } from '@/context/LanguageContext';

interface GoogleVisionAnalyzerProps {
  imageFile: File | null;
  imageUrl: string | null;
  gpsData?: {
    latitude: number;
    longitude: number;
  } | null;
}

export default function GoogleVisionAnalyzer({ imageFile, imageUrl, gpsData }: GoogleVisionAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true); // Initial state set to analyzing
  const [results, setResults] = useState<VisionAPIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'data'>('description');
  const [mapLocation, setMapLocation] = useState<{lat: number, lng: number} | null>(null);
  const { language, t } = useLanguage();

  // Automatically analyze when imageFile changes
  useEffect(() => {
    if (imageFile) {
      handleAnalyze();
    }
  }, [imageFile]);
  
  // Set map location
  useEffect(() => {
    console.log('Setting map location - GPS data:', gpsData);
    console.log('Setting map location - Analysis results:', results?.landmarkAnnotations);
    
    // Priority use GPS data from EXIF
    if (gpsData && typeof gpsData.latitude === 'number' && typeof gpsData.longitude === 'number') {
      console.log('Using EXIF GPS data:', gpsData.latitude, gpsData.longitude);
      setMapLocation({
        lat: gpsData.latitude,
        lng: gpsData.longitude
      });
    } 
    // Then try to get location from analysis results
    else if (results?.landmarkAnnotations && results.landmarkAnnotations.length > 0 && 
             results.landmarkAnnotations[0].locations && results.landmarkAnnotations[0].locations.length > 0) {
      const { latitude, longitude } = results.landmarkAnnotations[0].locations[0].latLng;
      console.log('Using landmark analysis location:', latitude, longitude);
      setMapLocation({
        lat: latitude,
        lng: longitude
      });
    }
    // If no location info, default to Beijing
    else {
      console.log('Using default location');
      setMapLocation({
        lat: 39.9042,
        lng: 116.4074
      });
    }
  }, [gpsData, results]);

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError(t('uploadFirst'));
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Immediately call Google Vision API to analyze the image
      const analysisResults = await analyzeImage(imageFile);
      console.log('Google Vision API analysis results:', analysisResults);
      setResults(analysisResults);
      
    } catch (err) {
      setError(t('errorAnalyzing'));
      console.error('Error analyzing image:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate description based on analysis results
  const generateDescription = () => {
    if (!results) return '';
    
    let description = '';
    let location = '';
    
    // Extract location information from analysis results
    if (results.landmarkAnnotations && results.landmarkAnnotations.length > 0) {
      location = results.landmarkAnnotations[0].description;
    }
    
    // Analyze people
    const people = results.extendedAnalysis?.people;
    if (people) {
      const count = people.count || 1;
      const gender = people.gender || [];
      const race = people.race || [];
      
      // Section 1: Describe scene, people and location
      if (language === 'en') {
        description += `In the scene of the photo, there is ${count === 1 ? 'one person' : `${count} individuals`}`;
        description += `${count === 1 ? 's' : ''} `;
      } else {
        description += `在照片的场景中，有${count}${count === 1 ? '个人' : '个人'}`;
      }
      
      // Add environment description
      if (results.labelAnnotations && results.labelAnnotations.length > 0) {
        const environmentLabels = results.labelAnnotations
          .filter(label => ['tree', 'plant', 'water', 'sky', 'mountain', 'grass', 'foliage', 'nature', 
                          '树', '植物', '水', '天空', '山', '草', '叶子', '自然'].includes(label.description.toLowerCase()))
          .map(label => label.description.toLowerCase());
        
        if (environmentLabels.length > 0) {
          if (language === 'en') {
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
          } else {
            description += '，背景是';
            if (environmentLabels.includes('tree') || environmentLabels.includes('plant') || 
                environmentLabels.includes('树') || environmentLabels.includes('植物')) {
              description += '茂密的植被';
            } else if (environmentLabels.includes('water') || environmentLabels.includes('水')) {
              description += '平静的水面';
            } else if (environmentLabels.includes('mountain') || environmentLabels.includes('山')) {
              description += '雄伟的山脉';
            } else {
              description += '自然景观';
            }
          }
          description += '.';
        } else {
          description += '.';
        }
      } else {
        description += '.';
      }
      
      // Section 2: Describe race and clothing
      if (race.length > 0) {
        if (language === 'en') {
          description += ` They are likely from the ${race.join(' or ')} race.`;
        } else {
          description += ` 他们可能是${race.join('或')}种族。`;
        }
      }
      
      // Add clothing description
      if (people.clothing && people.clothing.length > 0) {
        if (language === 'en') {
          description += ` They are wearing ${people.clothing.join(', ')}.`;
        } else {
          description += ` 他们穿着${people.clothing.join('、')}.`;
        }
      }
      
      // Add expression or emotion
      if (people.emotions && Object.values(people.emotions).length > 0) {
        const emotions = Object.values(people.emotions)[0].split('、')[0];
        if (language === 'en') {
          description += ` Their expression shows ${emotions === 'Joy' ? 'joy' : 
                            emotions === 'Sorrow' ? 'sadness' : 
                            emotions === 'Anger' ? 'anger' : 
                            emotions === 'Surprise' ? 'surprise' : 
                            emotions === 'Neutral' ? 'neutral' : emotions}.`;
        } else {
          description += ` 他们的表情显示${emotions === 'Joy' ? '喜悦' : 
                            emotions === 'Sorrow' ? '悲伤' : 
                            emotions === 'Anger' ? '愤怒' : 
                            emotions === 'Surprise' ? '惊讶' : 
                            emotions === 'Neutral' ? '平静' : emotions}.`;
        }
      }

      // Section 3: Income range and political leaning
      if (results.extendedAnalysis?.possibleIncomeRange) {
        const incomeRange = results.extendedAnalysis.possibleIncomeRange;
        if (language === 'en') {
          description += ` According to visual indicators, they belong to the <span class="font-semibold">${
            incomeRange === 'High Income' ? 'high income' : 
            incomeRange === 'Middle Income' ? 'middle income' : 
            incomeRange === 'Low Income' ? 'low income' : incomeRange
          }</span> group.`;
        } else {
          description += ` 根据视觉指标，他们属于<span class="font-semibold">${
            incomeRange === 'High Income' ? '高收入' : 
            incomeRange === 'Middle Income' ? '中等收入' : 
            incomeRange === 'Low Income' ? '低收入' : incomeRange
          }</span>群体。`;
        }
      }
      
      // Add political leaning
      if (results.extendedAnalysis?.possiblePoliticalAffiliation) {
        const political = results.extendedAnalysis.possiblePoliticalAffiliation;
        if (language === 'en') {
          description += ` They are likely to lean towards <span class="font-semibold">${
            political === 'Conservative Leaning' ? 'conservative' : 
            political === 'Liberal Leaning' ? 'liberal' : 
            political === 'Neutral/Unknown' ? 'neutral/unknown' : political
          }</span>.`;
        } else {
          description += ` 他们可能倾向于<span class="font-semibold">${
            political === 'Conservative Leaning' ? '保守派' : 
            political === 'Liberal Leaning' ? '自由派' : 
            political === 'Neutral/Unknown' ? '中立/未知' : political
          }</span>。`;
        }
      }

      // Section 4: Interests and advertising targets
      if (results.extendedAnalysis?.possibleInterests && results.extendedAnalysis.possibleInterests.length > 0) {
        const interestsMap: Record<string, string> = {
          'Sports': language === 'en' ? 'sports' : '体育', 
          'Fashion': language === 'en' ? 'fashion' : '时尚', 
          'Technology': language === 'en' ? 'technology' : '科技',
          'Art': language === 'en' ? 'art' : '艺术', 
          'Travel': language === 'en' ? 'travel' : '旅游', 
          'Food': language === 'en' ? 'food' : '美食',
          'Nature': language === 'en' ? 'nature' : '自然', 
          'Music': language === 'en' ? 'music' : '音乐', 
          'Reading': language === 'en' ? 'reading' : '阅读',
          'Fitness': language === 'en' ? 'fitness' : '健身'
        };
        
        const translatedInterests = results.extendedAnalysis.possibleInterests.map(
          interest => interestsMap[interest] || interest
        );
        
        if (language === 'en') {
          description += ` Their possible interests include <span class="font-semibold">${translatedInterests.join(', ')}</span>.`;
        } else {
          description += ` 他们可能的兴趣包括<span class="font-semibold">${translatedInterests.join('、')}</span>。`;
        }
      }
      
      if (results.extendedAnalysis?.possibleTargetedAds && results.extendedAnalysis.possibleTargetedAds.length > 0) {
        if (language === 'en') {
          description += ` Based on visual clues, they may react to ads related to ${results.extendedAnalysis.possibleTargetedAds.slice(0, 3).join(', ')}.`;
        } else {
          description += ` 根据视觉线索，他们可能会对与${results.extendedAnalysis.possibleTargetedAds.slice(0, 3).join('、')}相关的广告有反应。`;
        }
      }
    } else {
      // If no people detected, describe the environment
      if (language === 'en') {
        description = 'This photo shows a scene';
        if (location) {
          description += `, located near <span class="font-semibold">${location}</span>.`;
        } else {
          description += '.';
        }
      } else {
        description = '这张照片展示了一个场景';
        if (location) {
          description += `，位于<span class="font-semibold">${location}</span>附近。`;
        } else {
          description += '。';
        }
      }
      
      // Add object description
      if (results.labelAnnotations && results.labelAnnotations.length > 0) {
        const topLabels = results.labelAnnotations.slice(0, 5).map(label => label.description);
        if (language === 'en') {
          description += ` The main content includes ${topLabels.join(', ')}.`;
        } else {
          description += ` 主要内容包括${topLabels.join('、')}。`;
        }
      }
      
      // Add color information
      if (results.imagePropertiesAnnotation?.dominantColors?.colors) {
        const colors = results.imagePropertiesAnnotation.dominantColors.colors;
        if (colors.length > 0) {
          const mainColor = colors[0].color;
          const r = mainColor.red || 0;
          const g = mainColor.green || 0;
          const b = mainColor.blue || 0;
          
          let colorName = '';
          let colorNameCn = '';
          if (r > 200 && g < 100 && b < 100) { colorName = 'red'; colorNameCn = '红色'; }
          else if (r < 100 && g > 200 && b < 100) { colorName = 'green'; colorNameCn = '绿色'; }
          else if (r < 100 && g < 100 && b > 200) { colorName = 'blue'; colorNameCn = '蓝色'; }
          else if (r > 200 && g > 200 && b < 100) { colorName = 'yellow'; colorNameCn = '黄色'; }
          else if (r > 200 && g < 100 && b > 200) { colorName = 'purple'; colorNameCn = '紫色'; }
          else if (r < 100 && g > 200 && b > 200) { colorName = 'cyan'; colorNameCn = '青色'; }
          else if (r > 200 && g > 100 && b < 100) { colorName = 'orange'; colorNameCn = '橙色'; }
          else if (r > 200 && g > 200 && b > 200) { colorName = 'white'; colorNameCn = '白色'; }
          else if (r < 100 && g < 100 && b < 100) { colorName = 'black'; colorNameCn = '黑色'; }
          else { colorName = 'mixed'; colorNameCn = '混合色'; }
          
          if (language === 'en') {
            description += ` The main color of the image is ${colorName}, accounting for about ${Math.round(colors[0].pixelFraction * 100)}% of the image.`;
          } else {
            description += ` 图像的主要颜色是${colorNameCn}，约占图像的${Math.round(colors[0].pixelFraction * 100)}%。`;
          }
        }
      }
      
      // If web detection results exist, add most relevant web content
      if (results.webDetection?.bestGuessLabels && results.webDetection.bestGuessLabels.length > 0) {
        if (language === 'en') {
          description += ` The most similar network search result for the image content is "${results.webDetection.bestGuessLabels[0].label}".`;
        } else {
          description += ` 图像内容的最相似网络搜索结果是"${results.webDetection.bestGuessLabels[0].label}"。`;
        }
      }
    }
    
    return description;
  };

  if (!imageFile || !imageUrl) {
    return null;
  }

  // Create Google Maps URL with English language setting
  const getGoogleMapUrl = () => {
    if (!mapLocation) return '';
    // Use Google Maps URL format with language parameter set to English
    return `https://maps.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&z=15&output=embed&hl=${language}`;
  };

  return (
    <div className="w-full overflow-hidden bg-black text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Left side: Image and Map */}
        <div className="flex flex-col">
          {/* Top part: Image */}
          <div className="flex items-center justify-center bg-black" style={{height: '50vh'}}>
            <img 
              src={imageUrl} 
              alt="Analyzed" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Bottom part: Google Map */}
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
                <p className="text-white text-sm">{t('loading')}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right side: Analysis Results */}
        <div className="flex flex-col h-full">
          {/* Tab switching */}
          <div className="flex bg-gray-800">
            <button
              className={`py-3 px-6 text-lg w-1/2 text-center transition-colors ${
                activeTab === 'description' 
                  ? 'bg-gray-700 text-white font-medium' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('description')}
            >
              {t('description')}
            </button>
            <button
              className={`py-3 px-6 text-lg w-1/2 text-center transition-colors ${
                activeTab === 'data' 
                  ? 'bg-gray-700 text-white font-medium' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab('data')}
            >
              {t('data')}
            </button>
          </div>
          
          {/* Analysis loading state */}
          {isAnalyzing && (
            <div className="flex justify-center items-center p-10 flex-grow">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
                <p className="text-gray-300">{t('analyzingPhoto')}</p>
              </div>
            </div>
          )}
          
          {/* Content area */}
          {!isAnalyzing && (
            <div className="p-6 overflow-y-auto flex-grow">
              {activeTab === 'description' && results && (
                <div className="space-y-4">
                  {/* Main description content - Using API analysis results */}
                  <div className="text-xl leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: generateDescription() }}></div>
                </div>
              )}
              
              {activeTab === 'data' && results && (
                <div className="space-y-3">
                  {/* 1. People information */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">{t('people')}</h3>
                    <p>{(results.extendedAnalysis?.people?.count || 1)} {(results.extendedAnalysis?.people?.count || 1) === 1 ? 'person' : 'people'}, 
                      {results.extendedAnalysis?.people?.gender ? ` ${results.extendedAnalysis.people.gender.join(', ')}` : ` ${t('unknown')}`} 
                      {results.extendedAnalysis?.people?.age ? ` ${results.extendedAnalysis.people.age.join(', ')}` : ' Adult'}
                    </p>
                  </div>
                  
                  {/* 2. Race information */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">{t('race')}</h3>
                    <p>{results.extendedAnalysis?.people?.race?.length ? results.extendedAnalysis.people.race.join(', ') : t('unknown')}</p>
                  </div>
                  
                  {/* 4. Emotion */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">{t('emotion')}</h3>
                    <p>{results.extendedAnalysis?.people?.emotions && Object.keys(results.extendedAnalysis.people.emotions).length > 0 ? 
                      Object.entries(results.extendedAnalysis.people.emotions).map(([person, emotion]) => {
                        const personText = language === 'en' ? person.replace('Person', 'Person ') : person.replace('Person', '人物 ');
                        const emotionText = language === 'en' 
                          ? emotion
                              .replace('Joy', 'Joy')
                              .replace('Sorrow', 'Sorrow')
                              .replace('Anger', 'Anger')
                              .replace('Surprise', 'Surprise')
                              .replace('Neutral', 'Neutral')
                              .replace(', ', ', ')
                          : emotion
                              .replace('Joy', '喜悦')
                              .replace('Sorrow', '悲伤')
                              .replace('Anger', '愤怒')
                              .replace('Surprise', '惊讶')
                              .replace('Neutral', '平静')
                              .replace(', ', '、');
                        return `${personText}: ${emotionText}`;
                      }).join(language === 'en' ? ', ' : '、') : language === 'en' ? 'Person 1: Neutral' : '人物1: 平静'}</p>
                  </div>
                  
                  {/* 5. Clothing */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">{t('clothing')}</h3>
                    <p>{results.extendedAnalysis?.people?.clothing && results.extendedAnalysis.people.clothing.length > 0 ? 
                      results.extendedAnalysis.people.clothing.join(language === 'en' ? ', ' : '、') : language === 'en' ? 'Casual clothing' : '休闲服装'}</p>
                  </div>
                  
                  {/* 6. Interests */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">{t('interests')}</h3>
                    <p>{results.extendedAnalysis?.possibleInterests && results.extendedAnalysis.possibleInterests.length > 0 ? 
                      results.extendedAnalysis.possibleInterests.map(interest => 
                        language === 'en' ? (
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
                          interest === 'General interests' ? 'general interests' : interest
                        ) : (
                          interest === 'Sports' ? '体育' : 
                          interest === 'Fashion' ? '时尚' : 
                          interest === 'Technology' ? '科技' :
                          interest === 'Art' ? '艺术' : 
                          interest === 'Travel' ? '旅游' : 
                          interest === 'Food' ? '美食' :
                          interest === 'Nature' ? '自然' : 
                          interest === 'Music' ? '音乐' : 
                          interest === 'Reading' ? '阅读' :
                          interest === 'Fitness' ? '健身' :
                          interest === 'General interests' ? '一般兴趣' : interest
                        )
                      ).join(language === 'en' ? ', ' : '、') : language === 'en' ? 'general interests' : '一般兴趣'}</p>
                  </div>
                  
                  {/* 7. Political Affiliation */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">{t('politicalAffiliation')}</h3>
                    <p>{results.extendedAnalysis?.possiblePoliticalAffiliation ? 
                      (language === 'en' ? (
                        results.extendedAnalysis.possiblePoliticalAffiliation === 'Conservative Leaning' ? 'conservative' : 
                        results.extendedAnalysis.possiblePoliticalAffiliation === 'Liberal Leaning' ? 'liberal' : 
                        results.extendedAnalysis.possiblePoliticalAffiliation === 'Neutral/Unknown' ? 'neutral/unknown' : 
                        results.extendedAnalysis.possiblePoliticalAffiliation
                      ) : (
                        results.extendedAnalysis.possiblePoliticalAffiliation === 'Conservative Leaning' ? '保守派' : 
                        results.extendedAnalysis.possiblePoliticalAffiliation === 'Liberal Leaning' ? '自由派' : 
                        results.extendedAnalysis.possiblePoliticalAffiliation === 'Neutral/Unknown' ? '中立/未知' : 
                        results.extendedAnalysis.possiblePoliticalAffiliation
                      )) : language === 'en' ? 'neutral/unknown' : '中立/未知'}</p>
                  </div>
                  
                  {/* 3. Income Range */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">{t('incomeRange')}</h3>
                    <p>{results.extendedAnalysis?.possibleIncomeRange ? 
                      (language === 'en' ? (
                        results.extendedAnalysis.possibleIncomeRange === 'High Income' ? 'high income' : 
                        results.extendedAnalysis.possibleIncomeRange === 'Middle Income' ? 'middle income' : 
                        results.extendedAnalysis.possibleIncomeRange === 'Low Income' ? 'low income' : 
                        results.extendedAnalysis.possibleIncomeRange
                      ) : (
                        results.extendedAnalysis.possibleIncomeRange === 'High Income' ? '高收入' : 
                        results.extendedAnalysis.possibleIncomeRange === 'Middle Income' ? '中等收入' : 
                        results.extendedAnalysis.possibleIncomeRange === 'Low Income' ? '低收入' : 
                        results.extendedAnalysis.possibleIncomeRange
                      )) : language === 'en' ? 'middle income' : '中等收入'}</p>
                  </div>
                  
                  {/* 8. Possible Target Ads */}
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <h3 className="font-semibold mb-1">{t('targetAds')}</h3>
                    <p>{results.extendedAnalysis?.possibleTargetedAds && results.extendedAnalysis.possibleTargetedAds.length > 0 ? 
                      results.extendedAnalysis.possibleTargetedAds.join(language === 'en' ? ', ' : '、') : language === 'en' ? 'General consumer products' : '一般消费品'}</p>
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