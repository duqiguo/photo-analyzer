import React, { useState, useEffect } from 'react';
import { VisionAPIResponse, fileToBase64, analyzeImage } from '@/lib/google-vision';

function GoogleVisionAnalyzer({ file }: { file: File }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VisionAPIResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'data' | 'raw'>('description');
  const [loadProgress, setLoadProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const analyzeImageDirectly = async () => {
      if (!file) return;
      
      setLoading(true);
      setError(null);
      setLoadProgress(0);
      
      try {
        // 逐步增加进度以提供更好的用户体验
        const progressInterval = setInterval(() => {
          setLoadProgress(prev => {
            const increment = Math.random() * 15;
            return Math.min(prev + increment, 85); // 最高到85%，留给实际结果返回
          });
        }, 500);
        
        // 直接调用API分析图片
        try {
          // 直接调用Google Vision API
          const analysisResult = await analyzeImage(file);
          
          // 验证API响应是否包含必要的数据
          if (!analysisResult || Object.keys(analysisResult).length === 0) {
            throw new Error('Empty response from API');
          }
          
          console.log('分析结果:', analysisResult);
          setResult(analysisResult);
          // 完成进度条
          setLoadProgress(100);
        } catch (err) {
          console.error('分析失败:', err);
          throw err;
        }
        
        return () => {
          clearInterval(progressInterval);
        };
      } catch (err) {
        setError(`分析失败: ${err instanceof Error ? err.message : '未知错误'}`);
        setLoadProgress(0);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeImageDirectly();
  }, [file]);

  const renderTabContent = () => {
    if (!result) return null;

    switch (activeTab) {
      case 'description':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">图像描述</h3>
              <p className="text-gray-700">
                {result.labelAnnotations && result.labelAnnotations.length > 0
                  ? result.labelAnnotations
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 5)
                      .map(label => label.description)
                      .join(', ')
                  : '无法提取描述'}
              </p>
            </div>
            
            {result.textAnnotations && result.textAnnotations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">检测到的文本</h3>
                <p className="text-gray-700">
                  {result.textAnnotations[0].description}
                </p>
              </div>
            )}
            
            {result.faceAnnotations && result.faceAnnotations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">人物</h3>
                <p className="text-gray-700">
                  检测到 {result.faceAnnotations.length} 个人物
                </p>
                <ul className="list-disc pl-5 text-gray-700">
                  {result.faceAnnotations.map((face, i) => {
                    const emotions = [];
                    if (face.joyLikelihood === 'VERY_LIKELY' || face.joyLikelihood === 'LIKELY' || face.joyLikelihood === 'POSSIBLE') 
                      emotions.push('喜悦');
                    if (face.sorrowLikelihood === 'VERY_LIKELY' || face.sorrowLikelihood === 'LIKELY' || face.sorrowLikelihood === 'POSSIBLE') 
                      emotions.push('悲伤');
                    if (face.angerLikelihood === 'VERY_LIKELY' || face.angerLikelihood === 'LIKELY' || face.angerLikelihood === 'POSSIBLE') 
                      emotions.push('愤怒');
                    if (face.surpriseLikelihood === 'VERY_LIKELY' || face.surpriseLikelihood === 'LIKELY' || face.surpriseLikelihood === 'POSSIBLE') 
                      emotions.push('惊讶');
                    
                    return (
                      <li key={i}>
                        人物 {i + 1}: {emotions.length > 0 ? emotions.join(', ') : '中性表情'}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            
            {result.landmarkAnnotations && result.landmarkAnnotations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">地标</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {result.landmarkAnnotations.map((landmark, i) => (
                    <li key={i}>{landmark.description}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.logoAnnotations && result.logoAnnotations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">徽标</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {result.logoAnnotations.map((logo, i) => (
                    <li key={i}>{logo.description}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.objectAnnotations && result.objectAnnotations.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">检测到的物体</h3>
                <ul className="list-disc pl-5 text-gray-700">
                  {result.objectAnnotations.map((obj: {name: string, score: number}, i: number) => (
                    <li key={i}>
                      {obj.name} - 置信度: {Math.round(obj.score * 100)}%
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'data':
        return (
          <div className="space-y-6">
            {/* 始终显示分析结果，即使是默认值 */}
            <div>
              <h3 className="text-lg font-medium mb-2">人物分析</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {result.extendedAnalysis?.people ? (
                  <>
                    <p><strong>人数:</strong> {result.extendedAnalysis.people.count} 人</p>
                    
                    {result.extendedAnalysis.people.race && (
                      <p><strong>种族:</strong> {result.extendedAnalysis.people.race.map(race => 
                        race === 'Asian' ? '亚洲人' :
                        race === 'Caucasian' ? '白人' :
                        race === 'Black' ? '黑人' :
                        race === 'Latino' ? '拉丁裔' :
                        race === 'Middle Eastern' ? '中东人' :
                        race === 'Unknown' ? '未知' : race
                      ).join(', ')}</p>
                    )}
                    
                    {result.extendedAnalysis.people.gender && (
                      <p><strong>性别:</strong> {result.extendedAnalysis.people.gender.join(', ')}</p>
                    )}
                    
                    {result.extendedAnalysis.people.age && (
                      <p><strong>年龄段:</strong> {result.extendedAnalysis.people.age.join(', ')}</p>
                    )}
                    
                    {result.extendedAnalysis.people.emotions && (
                      <div>
                        <p><strong>情绪:</strong></p>
                        <ul className="list-disc pl-5">
                          {Object.entries(result.extendedAnalysis.people.emotions).map(([person, emotion], i) => (
                            <li key={i}>{person}: {
                              emotion === 'Joy' ? '喜悦' :
                              emotion === 'Sorrow' ? '悲伤' :
                              emotion === 'Anger' ? '愤怒' :
                              emotion === 'Surprise' ? '惊讶' :
                              emotion === 'Neutral' ? '中性' :
                              emotion
                            }</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.extendedAnalysis.people.clothing && (
                      <p><strong>服装:</strong> {result.extendedAnalysis.people.clothing.join(', ')}</p>
                    )}
                  </>
                ) : (
                  <p>未检测到人物</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">可能的收入范围</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{result.extendedAnalysis?.possibleIncomeRange ? 
                  (result.extendedAnalysis.possibleIncomeRange === 'High Income' ? '高收入' :
                   result.extendedAnalysis.possibleIncomeRange === 'Middle Income' ? '中等收入' :
                   result.extendedAnalysis.possibleIncomeRange === 'Low Income' ? '低收入' :
                   result.extendedAnalysis.possibleIncomeRange) : '未知'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">情绪</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {result.extendedAnalysis?.people?.emotions ? (
                  <ul className="list-disc pl-5">
                    {Object.entries(result.extendedAnalysis.people.emotions).map(([person, emotion], i) => (
                      <li key={i}>{person}: {
                        emotion === 'Joy' ? '喜悦' :
                        emotion === 'Sorrow' ? '悲伤' :
                        emotion === 'Anger' ? '愤怒' :
                        emotion === 'Surprise' ? '惊讶' :
                        emotion === 'Neutral' ? '中性' :
                        emotion === 'Unknown' ? '未知' :
                        emotion
                      }</li>
                    ))}
                  </ul>
                ) : (
                  <p>未检测到情绪</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">服装</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {result.extendedAnalysis?.people?.clothing && result.extendedAnalysis.people.clothing.length > 0 ? (
                  <p>{result.extendedAnalysis.people.clothing.join(', ')}</p>
                ) : (
                  <p>未检测到服装</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">可能的兴趣</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {result.extendedAnalysis?.possibleInterests && result.extendedAnalysis.possibleInterests.length > 0 ? (
                  <p>{result.extendedAnalysis.possibleInterests.map(interest => 
                    interest === 'Sports' ? '体育' :
                    interest === 'Fashion' ? '时尚' :
                    interest === 'Technology' ? '科技' :
                    interest === 'Art' ? '艺术' :
                    interest === 'Travel' ? '旅行' :
                    interest === 'Food' ? '美食' :
                    interest === 'Nature' ? '自然' :
                    interest === 'Music' ? '音乐' :
                    interest === 'Reading' ? '阅读' :
                    interest === 'Fitness' ? '健身' :
                    interest === 'General interests' ? '一般兴趣' :
                    interest
                  ).join(', ')}</p>
                ) : (
                  <p>未检测到兴趣</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">可能的政治倾向</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{result.extendedAnalysis?.possiblePoliticalAffiliation ? 
                  (result.extendedAnalysis.possiblePoliticalAffiliation === 'Conservative Leaning' ? '保守倾向' :
                   result.extendedAnalysis.possiblePoliticalAffiliation === 'Liberal Leaning' ? '自由倾向' :
                   result.extendedAnalysis.possiblePoliticalAffiliation === 'Neutral/Unknown' ? '中立/未知' :
                   result.extendedAnalysis.possiblePoliticalAffiliation) : '未知'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">可能的广告类别</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {result.extendedAnalysis?.possibleTargetedAds && result.extendedAnalysis.possibleTargetedAds.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {result.extendedAnalysis.possibleTargetedAds.map((ad, i) => (
                      <li key={i}>{ad}</li>
                    ))}
                  </ul>
                ) : (
                  <p>未检测到目标广告</p>
                )}
              </div>
            </div>
            
            {result.extendedAnalysis?.objects && result.extendedAnalysis.objects.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">物体分析</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>检测到的物体:</strong></p>
                  <ul className="list-disc pl-5">
                    {result.extendedAnalysis.objects.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        );
      case 'raw':
        return (
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-xs text-gray-800 whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* 进度条 */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${loadProgress}%` }}></div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="text-red-500">
          {error}
        </div>
      )}

      {/* 标签切换 */}
      {result && (
        <div className="flex border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('description')}
          >
            基本描述
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'data' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('data')}
          >
            详细分析
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'raw' ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500'}`}
            onClick={() => setActiveTab('raw')}
          >
            原始数据
          </button>
        </div>
      )}

      {/* 结果渲染 */}
      {renderTabContent()}
    </div>
  );
}

export default GoogleVisionAnalyzer; 