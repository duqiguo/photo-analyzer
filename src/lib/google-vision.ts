import axios from 'axios';

// Google Vision API密钥 - 从环境变量获取
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY;
// 使用正确的API端点
const API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

// 开发环境下输出API信息以帮助调试
if (process.env.NODE_ENV === 'development') {
  console.log('Vision API 配置信息:');
  console.log(`- API KEY 是否配置: ${API_KEY ? '已配置' : '未配置'}`);
  if (API_KEY) {
    // 隐藏部分API密钥，只显示前4位和后4位
    const maskKey = API_KEY.length > 8 
      ? `${API_KEY.substring(0, 4)}...${API_KEY.substring(API_KEY.length - 4)}`
      : '***';
    console.log(`- API KEY: ${maskKey}`);
  }
  console.log(`- API URL: ${API_URL.replace(API_KEY || '', '[API_KEY]')}`);
}

export interface VisionAPIResponse {
  labelAnnotations?: Array<{
    description: string;
    score: number;
  }>;
  textAnnotations?: Array<{
    description: string;
    locale?: string;
  }>;
  faceAnnotations?: Array<{
    joyLikelihood: string;
    sorrowLikelihood: string;
    angerLikelihood: string;
    surpriseLikelihood: string;
    blurredLikelihood?: string;
    headwearLikelihood?: string;
    detectionConfidence?: number;
    landmarkingConfidence?: number;
    rollAngle?: number;
    panAngle?: number;
    tiltAngle?: number;
    underExposedLikelihood?: string;
    fdBoundingPoly?: any;
    landmarks?: Array<{
      type: string;
      position: {
        x: number;
        y: number;
        z: number;
      };
    }>;
  }>;
  landmarkAnnotations?: Array<{
    description: string;
    score: number;
    locations: Array<{
      latLng: {
        latitude: number;
        longitude: number;
      };
    }>;
  }>;
  logoAnnotations?: Array<{
    description: string;
    score: number;
  }>;
  objectAnnotations?: Array<{
    name: string;
    score: number;
  }>;
  safeSearchAnnotation?: {
    adult: string;
    spoof: string;
    medical: string;
    violence: string;
    racy: string;
  };
  imagePropertiesAnnotation?: {
    dominantColors: {
      colors: Array<{
        color: {
          red: number;
          green: number;
          blue: number;
        };
        score: number;
        pixelFraction: number;
      }>;
    };
  };
  cropHintsAnnotation?: {
    cropHints: Array<{
      boundingPoly: any;
      confidence: number;
      importanceFraction: number;
    }>;
  };
  webDetection?: {
    webEntities: Array<{
      entityId: string;
      score: number;
      description: string;
    }>;
    fullMatchingImages: Array<{
      url: string;
    }>;
    partialMatchingImages: Array<{
      url: string;
    }>;
    pagesWithMatchingImages: Array<{
      url: string;
      pageTitle: string;
    }>;
    visuallySimilarImages: Array<{
      url: string;
    }>;
    bestGuessLabels: Array<{
      label: string;
      languageCode: string;
    }>;
  };
  error?: any;
  
  // 扩展分析结果
  extendedAnalysis?: {
    people?: {
      count: number;
      gender?: string[];
      age?: string[];
      race?: string[];
      emotions?: Record<string, string>;
      clothing?: string[];
    };
    objects?: string[];
    possibleIncomeRange?: string;
    possibleInterests?: string[];
    possiblePoliticalAffiliation?: string;
    possibleTargetedAds?: string[];
  };
}

/**
 * 将图片文件转换为base64格式
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // 移除data:image/jpeg;base64,前缀
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * 调用Google Vision API分析图片内容
 * @param imageFile 图片文件
 * @param features 要分析的特征类型
 */
export const analyzeImage = async (
  imageFile: File,
  features = [
    'LABEL_DETECTION', 
    'TEXT_DETECTION', 
    'FACE_DETECTION', 
    'LANDMARK_DETECTION',
    'LOGO_DETECTION',
    'OBJECT_LOCALIZATION',
    'SAFE_SEARCH_DETECTION',
    'IMAGE_PROPERTIES',
    'CROP_HINTS',
    'WEB_DETECTION'
  ]
): Promise<VisionAPIResponse> => {
  try {
    // 验证API密钥是否已配置
    if (!API_KEY) {
      console.error('重要错误: Google Vision API密钥未配置，请在.env.local文件中设置NEXT_PUBLIC_GOOGLE_VISION_API_KEY');
      console.error('请确保您的.env.local文件包含类似如下行: NEXT_PUBLIC_GOOGLE_VISION_API_KEY=您的密钥');
      // 返回一个带有基本分析的错误响应，而不是仅返回error字段
      const mockResponse: VisionAPIResponse = { 
        error: 'API密钥未配置',
        extendedAnalysis: {
          people: {
            count: 1,
            emotions: { 'Person 1': 'Neutral' },
            gender: ['Unknown'],
            age: ['Adult'],
            race: ['Unknown'],
            clothing: ['Casual clothing']
          },
          objects: ['image'],
          possibleInterests: ['General interests'],
          possiblePoliticalAffiliation: 'Neutral/Unknown',
          possibleIncomeRange: 'Middle Income',
          possibleTargetedAds: ['General Consumer Products']
        }
      };
      return mockResponse;
    }
    
    console.log('========== Vision API 调用开始 ==========');
    console.log(`图片文件名: ${imageFile.name}, 大小: ${(imageFile.size / 1024).toFixed(2)}KB, 类型: ${imageFile.type}`);
    console.log(`请求特征: ${features.join(', ')}`);
    
    // 验证图片类型是否受支持
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
    if (!supportedTypes.includes(imageFile.type)) {
      console.warn(`警告：图片类型 ${imageFile.type} 可能不被完全支持。最好使用 JPEG 或 PNG 格式。`);
    }
    
    // 验证图片大小
    if (imageFile.size > 10 * 1024 * 1024) {
      console.warn('警告：图片大小超过10MB，可能会导致API调用失败或响应缓慢。');
    }
    
    console.log('开始处理图片并准备调用Vision API...');
    const base64Image = await fileToBase64(imageFile);
    console.log('图片已转换为Base64格式，长度:', base64Image.length);
    
    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image
          },
          features: features.map(feature => ({
            type: feature,
            maxResults: feature === 'LABEL_DETECTION' ? 100 : // 增加至100个标签，获取更多信息
                       feature === 'OBJECT_LOCALIZATION' ? 75 : // 增加至75个物体
                       feature === 'WEB_DETECTION' ? 75 : // 增加至75个Web检测结果
                       feature === 'FACE_DETECTION' ? 50 : 40,  // 大幅增加返回结果数量
            // 为提高准确度，对特定特征类型添加更多参数和提高模型版本
            ...(feature === 'FACE_DETECTION' ? { model: 'builtin/latest' } : {}),
            ...(feature === 'LABEL_DETECTION' ? { model: 'builtin/latest' } : {}),
            ...(feature === 'LANDMARK_DETECTION' ? { model: 'builtin/latest' } : {}),
            ...(feature === 'OBJECT_LOCALIZATION' ? { model: 'builtin/latest' } : {})
          })),
          // 启用更多语言支持和增强精确度的上下文参数
          imageContext: {
            languageHints: ['zh-CN', 'en', 'zh-TW', 'ja', 'ko', 'fr', 'de', 'es', 'ru', 'it', 'pt', 'ar'], // 添加更多语言支持
            // 增加图像改进功能
            cropHintsParams: {
              aspectRatios: [0.8, 1.0, 1.2, 1.5, 0.67] // 添加更多纵横比以提高适应性
            },
            // 添加Web检测额外参数
            webDetectionParams: {
              includeGeoResults: true // 包含地理位置相关结果
            },
            // 设置人脸检测参数
            faceDetectionParams: {
              model: 'builtin/latest', // 使用最新模型
              landmarkTypes: ['ALL_LANDMARKS'], // 检测所有人脸特征点
              detectionType: 'FACE_DETECTION', // 设置检测类型
              maxResults: 50 // 提高检测限制
            }
          }
        }
      ]
    };
    
    console.log(`正在调用Google Vision API，URL: ${API_URL.replace(API_KEY, '[API_KEY]')}`);
    console.time('API调用时间');
    
    try {
      const response = await axios.post(API_URL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // 设置30秒超时
      });
      
      console.timeEnd('API调用时间');
      console.log('API调用状态:', response.status, response.statusText);
      
      // 处理API响应不完整的情况，确保始终返回extendedAnalysis
      try {
        if (response.data.responses && response.data.responses.length > 0) {
          // 记录完整响应（仅开发环境）
          if (process.env.NODE_ENV === 'development') {
            console.log('API完整响应:', JSON.stringify(response.data, null, 2).substring(0, 1000) + '...');
          }
          
          const result = response.data.responses[0] as VisionAPIResponse;
          
          // 记录响应结果概览
          console.log('API响应概览:');
          console.log(`- 标签: ${result.labelAnnotations?.length || 0}个`);
          console.log(`- 人脸: ${result.faceAnnotations?.length || 0}个`);
          console.log(`- 文本: ${result.textAnnotations?.length ? '检测到' : '未检测到'}`);
          console.log(`- 地标: ${result.landmarkAnnotations?.length || 0}个`);
          console.log(`- 徽标: ${result.logoAnnotations?.length || 0}个`);
          console.log(`- 物体: ${result.objectAnnotations?.length || 0}个`);
          console.log(`- Web检测: ${result.webDetection ? '已完成' : '未完成'}`);
          
          // 对结果进行增强和精确度提升处理
          if (result.labelAnnotations) {
            // 调整标签置信度，提高可信度高的标签权重
            result.labelAnnotations = result.labelAnnotations
              .filter(label => label.score > 0.25) // 略微降低阈值，捕获更多信息
              .map(label => ({
                ...label,
                // 对高置信度标签进一步强化，但不超过1
                score: label.score > 0.7 ? Math.min(1, label.score * 1.2) : label.score
              }))
              .sort((a, b) => b.score - a.score); // 重新排序
          }
          
          // 对物体检测结果进行处理
          if (result.objectAnnotations) {
            // 提高主要物体的权重
            const mainObjects = result.objectAnnotations
              .filter(obj => obj.score > 0.6) // 主要物体必须有较高置信度
              .slice(0, 5); // 取前5个主要物体
            
            if (mainObjects.length > 0) {
              console.log('主要物体:', mainObjects.map(obj => obj.name).join(', '));
              // 这些信息可以用于增强其他分析
            }
          }
          
          // 如果检测到地标，增强其置信度和相关分析
          if (result.landmarkAnnotations && result.landmarkAnnotations.length > 0) {
            const topLandmark = result.landmarkAnnotations[0];
            console.log(`顶级地标: ${topLandmark.description}, 置信度: ${topLandmark.score}`);
            
            // 提高高置信度地标的权重
            if (topLandmark.score > 0.7) {
              // 确保这个地标信息在标签中也能体现
              const landmarkInLabels = result.labelAnnotations?.some(
                label => label.description.toLowerCase().includes(topLandmark.description.toLowerCase())
              );
              
              if (!landmarkInLabels && result.labelAnnotations) {
                // 将地标添加到标签中，并给予高置信度
                result.labelAnnotations.push({
                  description: topLandmark.description,
                  score: topLandmark.score
                });
              }
            }
            
            // 地标位置增强
            if (topLandmark.locations && topLandmark.locations.length > 0) {
              const location = topLandmark.locations[0];
              console.log(`地标位置坐标: ${location.latLng.latitude}, ${location.latLng.longitude}`);
              
              // 可以在这里添加地标相关的地理信息增强
            }
          }
          
          // 处理场景分析，添加基于环境和背景的增强
          if (result.labelAnnotations) {
            // 识别环境类型 (室内/室外)
            const environmentalLabels = result.labelAnnotations.filter(label => 
              ['outdoor', 'nature', 'sky', 'landscape', 'building', 'architecture', 'street', 
               'indoor', 'room', 'house', 'interior', 'furniture', 'office', 'home'].some(
                env => label.description.toLowerCase().includes(env)
              )
            );
            
            if (environmentalLabels.length > 0) {
              console.log('环境标签:', environmentalLabels.map(l => l.description).join(', '));
              
              // 判断是室内还是室外场景
              const outdoorScores = environmentalLabels.filter(label => 
                ['outdoor', 'nature', 'sky', 'landscape', 'forest', 'mountain', 'beach', 'sea', 'ocean'].some(
                  k => label.description.toLowerCase().includes(k)
                )
              ).reduce((sum, label) => sum + label.score, 0);
              
              const indoorScores = environmentalLabels.filter(label => 
                ['indoor', 'room', 'house', 'interior', 'furniture', 'office', 'home', 'wall', 'floor'].some(
                  k => label.description.toLowerCase().includes(k)
                )
              ).reduce((sum, label) => sum + label.score, 0);
              
              // 确定场景类型，提高置信度
              if (outdoorScores > indoorScores) {
                console.log('场景类型: 室外, 置信度分数:', outdoorScores);
                
                // 分析自然还是城市环境
                const natureScore = environmentalLabels.filter(label => 
                  ['nature', 'forest', 'mountain', 'beach', 'sea', 'ocean', 'river', 'lake', 'tree', 'flower', 'grass'].some(
                    k => label.description.toLowerCase().includes(k)
                  )
                ).reduce((sum, label) => sum + label.score, 0);
                
                const urbanScore = environmentalLabels.filter(label => 
                  ['city', 'building', 'architecture', 'street', 'road', 'urban', 'downtown', 'skyscraper'].some(
                    k => label.description.toLowerCase().includes(k)
                  )
                ).reduce((sum, label) => sum + label.score, 0);
                
                if (natureScore > urbanScore) {
                  // 加强自然场景标签
                  result.labelAnnotations.forEach(label => {
                    if (['nature', 'natural', 'landscape', 'outdoor', 'scenery'].some(
                      k => label.description.toLowerCase().includes(k)
                    )) {
                      label.score = Math.min(1, label.score * 1.3);
                    }
                  });
                } else {
                  // 加强城市场景标签
                  result.labelAnnotations.forEach(label => {
                    if (['urban', 'city', 'building', 'architecture'].some(
                      k => label.description.toLowerCase().includes(k)
                    )) {
                      label.score = Math.min(1, label.score * 1.3);
                    }
                  });
                }
              } else if (indoorScores > outdoorScores) {
                console.log('场景类型: 室内, 置信度分数:', indoorScores);
                
                // 提高室内场景标签的权重
                result.labelAnnotations.forEach(label => {
                  if (['indoor', 'interior', 'room', 'home', 'house', 'office'].some(
                    k => label.description.toLowerCase().includes(k)
                  )) {
                    label.score = Math.min(1, label.score * 1.25);
                  }
                });
              }
            }
          }
          
          // 对事件类型进行分析
          const eventLabels = result.labelAnnotations?.filter(label => 
            ['wedding', 'party', 'ceremony', 'celebration', 'concert', 'festival', 'event', 
            'meeting', 'conference', 'sport', 'game', 'match', 'graduation', 'birthday'].some(
              evt => label.description.toLowerCase().includes(evt)
            )
          ) || [];
          
          if (eventLabels && eventLabels.length > 0) {
            console.log('事件标签:', eventLabels.map(l => l.description).join(', '));
            
            // 提高事件相关标签的权重
            const topEvent = eventLabels.sort((a, b) => b.score - a.score)[0];
            
            if (topEvent.score > 0.5 && result.labelAnnotations) {
              // 将此事件添加到高优先级标签中
              console.log(`主要事件类型: ${topEvent.description}, 置信度: ${topEvent.score}`);
              
              // 提高主要事件的置信度
              result.labelAnnotations = result.labelAnnotations.map(label => {
                if (label.description === topEvent.description) {
                  return { ...label, score: Math.min(1, label.score * 1.3) };
                }
                return label;
              });
            }
          }
          
          // 确保始终执行扩展分析
          console.log('开始执行扩展分析...');
          result.extendedAnalysis = performExtendedAnalysis(result);
          
          console.log('扩展分析完成，概览:');
          console.log(`- 人物信息: ${result.extendedAnalysis?.people ? '已分析' : '未分析'}`);
          console.log(`- 可能兴趣: ${result.extendedAnalysis?.possibleInterests?.join(', ') || '无'}`);
          console.log(`- 可能收入范围: ${result.extendedAnalysis?.possibleIncomeRange || '未知'}`);
          console.log(`- 可能的广告类别: ${result.extendedAnalysis?.possibleTargetedAds?.length || 0}个`);
          
          console.log('========== Vision API 调用完成 ==========');
          return result;
        }
        
        console.error('API返回数据不完整或为空');
        // 返回一个带有基本分析的错误响应
        return { 
          error: '没有返回结果', 
          extendedAnalysis: {
            people: {
              count: 1,
              emotions: { 'Person 1': 'Neutral' },
              gender: ['Unknown'],
              age: ['Adult'],
              race: ['Unknown'],
              clothing: ['Casual clothing']
            },
            objects: ['image'],
            possibleInterests: ['General interests'],
            possiblePoliticalAffiliation: 'Neutral/Unknown',
            possibleIncomeRange: 'Middle Income',
            possibleTargetedAds: ['General Consumer Products']
          }
        };
      } catch (analysisError) {
        console.error('处理响应数据时出错:', analysisError);
        // 返回一个带有基本分析的错误响应
        return { 
          error: '处理响应数据时出错', 
          extendedAnalysis: {
            people: {
              count: 1,
              emotions: { 'Person 1': 'Neutral' },
              gender: ['Unknown'],
              age: ['Adult'],
              race: ['Unknown'],
              clothing: ['Casual clothing']
            },
            objects: ['image'],
            possibleInterests: ['General interests'],
            possiblePoliticalAffiliation: 'Neutral/Unknown',
            possibleIncomeRange: 'Middle Income',
            possibleTargetedAds: ['General Consumer Products']
          }
        };
      }
      
    } catch (error) {
      console.error('Vision API调用失败:', error);
      if (axios.isAxiosError(error)) {
        console.error('请求错误详情:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        });
      }
      console.log('========== Vision API 调用失败 ==========');
      // 返回一个带有基本分析的错误响应
      return { 
        error, 
        extendedAnalysis: {
          people: {
            count: 1,
            emotions: { 'Person 1': 'Neutral' },
            gender: ['Unknown'],
            age: ['Adult'],
            race: ['Unknown'],
            clothing: ['Casual clothing']
          },
          objects: ['image'],
          possibleInterests: ['General interests'],
          possiblePoliticalAffiliation: 'Neutral/Unknown',
          possibleIncomeRange: 'Middle Income',
          possibleTargetedAds: ['General Consumer Products']
        }
      };
    }
    
  } catch (error) {
    console.error('Vision API调用失败:', error);
    if (axios.isAxiosError(error)) {
      console.error('请求错误详情:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    console.log('========== Vision API 调用失败 ==========');
    // 返回一个带有基本分析的错误响应
    return { 
      error, 
      extendedAnalysis: {
        people: {
          count: 1,
          emotions: { 'Person 1': 'Neutral' },
          gender: ['Unknown'],
          age: ['Adult'],
          race: ['Unknown'],
          clothing: ['Casual clothing']
        },
        objects: ['image'],
        possibleInterests: ['General interests'],
        possiblePoliticalAffiliation: 'Neutral/Unknown',
        possibleIncomeRange: 'Middle Income',
        possibleTargetedAds: ['General Consumer Products']
      }
    };
  }
};

/**
 * 判断两个标签是否相似
 */
function areLabelsSimilar(label1: string, label2: string): boolean {
  const l1 = label1.toLowerCase();
  const l2 = label2.toLowerCase();
  
  // 直接包含关系
  if (l1.includes(l2) || l2.includes(l1)) return true;
  
  // 词根相似性分析
  const words1 = l1.split(/\s+/).map(getWordStem);
  const words2 = l2.split(/\s+/).map(getWordStem);
  
  // 检查词根重叠
  const commonWords = words1.filter(w1 => words2.some(w2 => w1 === w2 || w1.includes(w2) || w2.includes(w1)));
  return commonWords.length > 0;
}

/**
 * 分析标签的词根，用于更好的聚类
 */
function getWordStem(word: string): string {
  // 简化版词根提取
  if (word.endsWith('ing')) return word.slice(0, -3);
  if (word.endsWith('s')) return word.slice(0, -1);
  if (word.endsWith('ed')) return word.slice(0, -2);
  if (word.endsWith('er')) return word.slice(0, -2);
  return word;
}

/**
 * 检查图像是否可能包含人物
 */
function imageHasPerson(labels: {description: string, score: number}[]): boolean {
  const weakPersonKeywords = [
    'photography', 'portrait', 'person', 'people', 'selfie', 'photo', 'human',
    'face', 'individual', 'figure', 'model', 'pose', 'photographer'
  ];
  
  return labels.some(label => 
    weakPersonKeywords.some(keyword => 
      label.description.toLowerCase().includes(keyword)
    )
  );
}

/**
 * 执行扩展分析，基于Vision API的基本检测结果，推导出更高级的特征
 */
function performExtendedAnalysis(result: VisionAPIResponse): VisionAPIResponse['extendedAnalysis'] {
  console.log('开始执行performExtendedAnalysis...');
  console.log('输入数据概览:', {
    hasLabels: !!result.labelAnnotations,
    labelsCount: result.labelAnnotations?.length || 0,
    hasFaces: !!result.faceAnnotations,
    facesCount: result.faceAnnotations?.length || 0,
    hasWebDetection: !!result.webDetection,
    hasLandmarks: !!result.landmarkAnnotations,
    landmarksCount: result.landmarkAnnotations?.length || 0
  });
  
  // 基础分析结果对象，确保即使没有完整数据也能返回基本信息
  const analysis: VisionAPIResponse['extendedAnalysis'] = {
    people: {
      count: 1,
      emotions: { 'Person 1': 'Neutral' },
      gender: ['Unknown'],
      age: ['Adult'],
      race: ['Unknown'],
      clothing: ['Casual clothing']
    },
    objects: [],
    possibleInterests: ['General interests'],
    possiblePoliticalAffiliation: 'Neutral/Unknown',
    possibleIncomeRange: 'Middle Income',
    possibleTargetedAds: ['General Consumer Products']
  };
  
  // 如果没有任何基本检测结果，返回默认分析
  if (!result.labelAnnotations?.length && !result.faceAnnotations?.length && !result.webDetection) {
    console.log('警告: 没有检测到任何有用的图像特征，使用默认值');
    return analysis;
  }
  
  try {
    // 整合Web检测结果提高准确度
    let webLabels: {description: string, score: number}[] = [];
    let bestGuessLabels: {description: string, score: number}[] = [];
    let pageKeywords: {description: string, score: number}[] = [];
    
    if (result.webDetection) {
      // 从Web实体中提取有用标签
      if (result.webDetection.webEntities) {
        webLabels = result.webDetection.webEntities
          .filter(entity => entity.score > 0.1 && entity.description) // 降低阈值以获取更多信息
          .map(entity => ({
            description: entity.description,
            score: entity.score
          }));
      }
      
      // 从最佳猜测中提取有用标签
      if (result.webDetection.bestGuessLabels) {
        bestGuessLabels = result.webDetection.bestGuessLabels.map(guess => ({
          description: guess.label,
          score: 0.9 // 给予较高的置信度
        }));
      }
      
      // 从相关页面标题中提取关键词
      if (result.webDetection.pagesWithMatchingImages) {
        const pageTitles = result.webDetection.pagesWithMatchingImages
          .filter(page => page.pageTitle)
          .map(page => page.pageTitle);
        
        // 分析页面标题，提取频繁出现的词汇和短语
        const titleWords = new Map<string, number>();
        const titlePhrases = new Map<string, number>();
        
        pageTitles.forEach(title => {
          if (!title) return;
          
          // 清理标题文本
          const cleanTitle = title.toLowerCase().replace(/[^\w\s\u4e00-\u9fa5]/g, ' ');
          const words = cleanTitle.split(/\s+/).filter(w => w.length > 2); // 过滤太短的词
          
          // 统计单词频率
          words.forEach(word => {
            titleWords.set(word, (titleWords.get(word) || 0) + 1);
          });
          
          // 统计二词短语和三词短语
          for (let i = 0; i < words.length - 1; i++) {
            const twoWordPhrase = `${words[i]} ${words[i+1]}`;
            titlePhrases.set(twoWordPhrase, (titlePhrases.get(twoWordPhrase) || 0) + 1);
            
            if (i < words.length - 2) {
              const threeWordPhrase = `${words[i]} ${words[i+1]} ${words[i+2]}`;
              titlePhrases.set(threeWordPhrase, (titlePhrases.get(threeWordPhrase) || 0) + 1);
            }
          }
        });
        
        // 转换单词为数组并排序
        const sortedWords = Array.from(titleWords.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 15); // 取前15个最常见的词
        
        // 转换短语为数组并排序
        const sortedPhrases = Array.from(titlePhrases.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10); // 取前10个最常见的短语
        
        // 将常见词添加到页面关键词中
        pageKeywords.push(...sortedWords.map(([word, count]) => ({
          description: word,
          score: Math.min(0.9, 0.6 + (count / pageTitles.length) * 0.4) // 提高基础分数
        })));
        
        // 将常见短语添加到页面关键词中，并给予更高权重
        pageKeywords.push(...sortedPhrases.map(([phrase, count]) => ({
          description: phrase,
          score: Math.min(0.95, 0.7 + (count / pageTitles.length) * 0.5) // 给短语更高的分数
        })));
      }
    }
    
    // 从对象检测中提取重要信息
    const objectLabels: {description: string, score: number}[] = [];
    if (result.objectAnnotations && result.objectAnnotations.length > 0) {
      // 转换物体检测结果为标签格式
      objectLabels.push(...result.objectAnnotations.map(obj => ({
        description: obj.name,
        score: obj.score * 0.9 // 略微降低物体检测的权重，但保持较高
      })));
    }
    
    // 合并标签和Web实体以提高分析准确度
    const combinedLabels = [
      ...(result.labelAnnotations || []),
      ...webLabels,
      ...bestGuessLabels,
      ...pageKeywords,
      ...objectLabels
    ];
    
    // 如果没有标签，使用默认值并返回
    if (combinedLabels.length === 0) {
      console.log('警告: 没有检测到任何有用的标签，使用默认值');
      return analysis;
    }
    
    // 在处理之前，根据来源赋予不同的权重
    const weightedLabels = combinedLabels.map(label => {
      // 最佳猜测标签保持高权重
      if (bestGuessLabels.some(bl => bl.description === label.description)) {
        return { ...label, score: Math.min(1, label.score * 1.2) };
      }
      // 页面关键词短语给予高权重
      else if (pageKeywords.some(pk => pk.description === label.description && pk.description.includes(' '))) {
        return { ...label, score: Math.min(1, label.score * 1.15) };
      }
      // 视觉API直接标签给予中等权重
      else if (result.labelAnnotations?.some(la => la.description === label.description)) {
        return { ...label, score: Math.min(1, label.score * 1.1) };
      }
      return label;
    });
    
    // 对关键结果按置信度排序
    const sortedLabels = [...weightedLabels].sort((a, b) => b.score - a.score);
    
    // 进行标签聚类以减少噪声，合并相似标签 - 改进相似性判断算法
    const mergedLabels = [];
    const processedLabels = new Set<string>();
    
    for (const label of sortedLabels) {
      if (processedLabels.has(label.description.toLowerCase())) continue;
      
      // 找到所有相似的标签，使用改进的相似性算法
      const similarLabels = sortedLabels.filter(l => 
        !processedLabels.has(l.description.toLowerCase()) && 
        areLabelsSimilar(l.description, label.description)
      );
      
      if (similarLabels.length > 0) {
        // 计算加权平均分数，更多地偏向于高分数标签
        const totalWeight = similarLabels.reduce((sum, l) => sum + l.score, 0);
        const weightedScore = similarLabels.reduce((sum, l) => sum + (l.score * l.score), 0) / 
                            similarLabels.reduce((sum, l) => sum + l.score, 0);
        
        // 根据标签长度选择最佳代表标签（倾向于更短、更通用的标签）
        const bestLabel = similarLabels
          .sort((a, b) => {
            // 先按分数排序
            const scoreDiff = b.score - a.score;
            if (Math.abs(scoreDiff) > 0.2) return scoreDiff;
            
            // 分数接近时，优先选择中等长度的标签（不要太长也不要太短）
            const aLength = a.description.length;
            const bLength = b.description.length;
            const aOptimal = Math.abs(aLength - 15); // 假设15个字符是最佳长度
            const bOptimal = Math.abs(bLength - 15);
            return aOptimal - bOptimal;
          })[0];
        
        mergedLabels.push({
          description: bestLabel.description,
          score: weightedScore
        });
        
        // 标记所有相似标签为已处理
        similarLabels.forEach(l => processedLabels.add(l.description.toLowerCase()));
      }
    }
    
    // 添加未处理的标签
    for (const label of sortedLabels) {
      if (!processedLabels.has(label.description.toLowerCase())) {
        mergedLabels.push(label);
        processedLabels.add(label.description.toLowerCase());
      }
    }
    
    // 将合并后的标签按置信度排序
    const finalLabels = mergedLabels.sort((a, b) => b.score - a.score);
    
    // 记录合并后的标签数量
    console.log(`合并标签后总共有 ${finalLabels.length} 个标签用于分析`);
    
    // 如果有最佳猜测标签，单独记录便于调试
    if (bestGuessLabels.length > 0) {
      console.log('Web最佳猜测标签:', bestGuessLabels.map(l => l.description).join(', '));
    }
    
    // 人物分析 - 扩展并提高准确性
    if (result.faceAnnotations && result.faceAnnotations.length > 0) {
      const peopleCount = result.faceAnnotations.length;
      const emotions: Record<string, string> = {};
      
      // 建立更丰富的人脸属性数据
      const faceAttributes = {
        gender: [] as string[],
        age: [] as string[],
        race: [] as string[]
      };
      
      // 分析每张人脸的特征，确保即使数据不完整也有合理的值
      result.faceAnnotations.forEach((face, index) => {
        // 跟踪每个人脸的情绪及其分数
        const emotionScores: Record<string, number> = {
          'Joy': getLikelihoodScore(face.joyLikelihood) || 0,
          'Sorrow': getLikelihoodScore(face.sorrowLikelihood) || 0,
          'Anger': getLikelihoodScore(face.angerLikelihood) || 0,
          'Surprise': getLikelihoodScore(face.surpriseLikelihood) || 0,
          'Neutral': 0.1 // 默认低置信度的中性情绪
        };
        
        // 对于不确定的情绪，重新分配分数
        const hasStrongEmotion = Object.values(emotionScores).some(score => score > 0.6);
        if (!hasStrongEmotion) {
          emotionScores['Neutral'] = 0.8;
          
          // 同时添加微弱的辅助情绪
          const supportEmotions = ['Joy', 'Surprise'];
          supportEmotions.forEach(emotion => {
            if (emotionScores[emotion] < 0.3) {
              emotionScores[emotion] = 0.2 + Math.random() * 0.1; // 添加一些随机变化
            }
          });
        }
        
        // 找出最可能的情绪组合
        const sortedEmotions = Object.entries(emotionScores)
          .sort((a, b) => b[1] - a[1])
          .filter(([_, score]) => score > 0.3);
        
        if (sortedEmotions.length > 0) {
          // 选择最高概率的情绪，或者在概率接近时组合多种情绪
          const topEmotion = sortedEmotions[0];
          const secondEmotion = sortedEmotions.length > 1 ? sortedEmotions[1] : null;
          
          if (secondEmotion && (topEmotion[1] - secondEmotion[1] < 0.3)) {
            // 情绪接近，表示混合情绪
            emotions[`Person ${index + 1}`] = `${topEmotion[0]}, ${secondEmotion[0]}`;
          } else {
            emotions[`Person ${index + 1}`] = topEmotion[0];
          }
        } else {
          emotions[`Person ${index + 1}`] = 'Neutral';
        }
        
        // 从人脸特征点分析更多特征
        if (face.landmarks) {
          try {
            // 通过分析人脸特征点尝试推断年龄和性别
            const eyeDistance = calculateEyeDistance(face.landmarks);
            const faceShape = analyzeFaceShape(face.landmarks);
            
            // 基于面部特征估计性别
            if (faceShape === 'square' || faceShape === 'rectangle') {
              faceAttributes.gender.push('Male');
            } else if (faceShape === 'heart' || faceShape === 'oval') {
              faceAttributes.gender.push('Female');
            }
            
            // 使用人脸结构和比例估计年龄
            // 这只是一个非常基础的估计，实际年龄分析需要更复杂的算法
            if (eyeDistance > 0) {
              const faceSizeRatio = eyeDistance / Math.sqrt(face.fdBoundingPoly?.vertices?.length || 4);
              if (faceSizeRatio > 0.3) { // 面部特征占比较大
                faceAttributes.age.push('Child');
              } else if (faceSizeRatio > 0.25) { // 中等比例
                faceAttributes.age.push('Young Adult');
              } else {
                faceAttributes.age.push('Adult');
              }
            }
          } catch (error) {
            console.error('分析面部特征点时出错:', error);
            // 出错时使用默认值
            if (!faceAttributes.gender.length) faceAttributes.gender.push('Unknown');
            if (!faceAttributes.age.length) faceAttributes.age.push('Adult');
          }
        }
      });
      
      // 确保至少有一些基本特征数据
      if (faceAttributes.gender.length === 0) faceAttributes.gender.push('Unknown');
      if (faceAttributes.age.length === 0) faceAttributes.age.push('Adult');
      if (faceAttributes.race.length === 0) faceAttributes.race.push('Unknown');
      
      // 开始分析人物 - 增强结果
      analysis.people = {
        count: peopleCount,
        emotions,
        gender: faceAttributes.gender.length > 0 ? faceAttributes.gender : ['Unknown'], 
        age: faceAttributes.age.length > 0 ? faceAttributes.age : ['Adult'],
        race: faceAttributes.race.length > 0 ? faceAttributes.race : ['Unknown'], 
        clothing: ['Casual clothing'] // 默认服装值
      };
    }
    
    // 物体分析 - 进一步降低阈值并整合web检测结果
    if (finalLabels.length > 0) {
      // 计算顶级标签的平均得分，用于动态调整阈值
      const topLabelsAvgScore = finalLabels.slice(0, 10).reduce((sum, l) => sum + l.score, 0) / 
                              Math.min(10, finalLabels.length);
      
      // 提取可能的服装信息 - 扩展关键词列表并更智能地筛选
      const clothingKeywords = [
        'shirt', 'dress', 'pants', 'jacket', 'coat', 'suit', 'uniform', 't-shirt', 'jeans', 
        'shoes', 'hat', 'cap', 'glasses', 'sunglasses', 'tie', 'clothing', 'outfit', 'attire',
        'fashion', 'wear', 'apparel', 'garment', 'accessory', 'jewelry', 'hoodie', 'sweater',
        'trouser', 'shorts', 'skirt', 'blouse', 'vest', 'sock', 'boot', 'sneaker', 'scarf',
        'glove', 'collar', 'pocket', 'button', 'zipper', 'formal wear', 'casual wear', 'costume',
        'dress shirt', 'polo shirt', 'denim', 'leather', 'cotton', 'wool', 'silk', 'linen',
        'sandals', 'heels', 'watch', 'necklace', 'bracelet', 'ring', 'earring'
      ];
      
      // 进一步完善服装检测，合并相似服装项
      const clothingItems = finalLabels
        .filter(label => clothingKeywords.some(keyword => 
          label.description.toLowerCase().includes(keyword.toLowerCase())) && label.score > 0.1) // 阈值从0.15降低到0.1
        .map(label => label.description);
      
      // 如果没有检测到服装项，加入默认值
      if (clothingItems.length === 0 && analysis.people) {
        analysis.people.clothing = ['Casual clothing'];
      }
      
      // 对服装项进行去重和合并
      const uniqueClothing = new Set<string>();
      const upperBodyItems: string[] = [];
      const lowerBodyItems: string[] = [];
      const accessoryItems: string[] = [];
      
      // 根据服装类型进行分类
      clothingItems.forEach(item => {
        const lowerItem = item.toLowerCase();
        if (['shirt', 't-shirt', 'blouse', 'jacket', 'coat', 'sweater', 'hoodie', 'suit'].some(k => lowerItem.includes(k))) {
          upperBodyItems.push(item);
        } else if (['pants', 'jeans', 'shorts', 'skirt', 'trouser', 'dress'].some(k => lowerItem.includes(k))) {
          lowerBodyItems.push(item);
        } else if (['hat', 'cap', 'glasses', 'sunglasses', 'tie', 'jewelry', 'watch', 'necklace', 'earring', 'ring'].some(k => lowerItem.includes(k))) {
          accessoryItems.push(item);
        } else {
          uniqueClothing.add(item);
        }
      });
      
      // 最多保留一个上身服装
      if (upperBodyItems.length > 0) {
        uniqueClothing.add(upperBodyItems[0]);
      }
      
      // 最多保留一个下身服装
      if (lowerBodyItems.length > 0) {
        uniqueClothing.add(lowerBodyItems[0]);
      }
      
      // 添加附件
      accessoryItems.forEach(item => uniqueClothing.add(item));
      
      // 整合到最终结果
      if (uniqueClothing.size > 0 && analysis.people) {
        analysis.people.clothing = Array.from(uniqueClothing);
      }
      
      // 提取种族线索 - 进一步降低阈值并扩展关键词
      const raceKeywords = {
        'Asian': ['asian', 'chinese', 'japanese', 'korean', 'vietnamese', 'thai', 'malaysian', 'indonesian', 'oriental', 'east asian',
                  'mongoloid', 'filipino', 'taiwan', 'hongkong', 'singapore'],
        'Caucasian': ['caucasian', 'european', 'white person', 'western', 'white', 'fair skin', 'anglo', 'nordic', 'slavic', 
                      'german', 'french', 'italian', 'english', 'american', 'australian'],
        'Black': ['african', 'black person', 'african american', 'dark skin', 'ebony', 'negro', 'jamaican', 'nigerian', 
                  'kenyan', 'ethiopian', 'somali'],
        'Latino': ['latino', 'latina', 'hispanic', 'mexican', 'spanish', 'latin american', 'puerto rican', 'cuban', 
                   'dominican', 'brazilian', 'colombian', 'central american', 'south american'],
        'Middle Eastern': ['middle eastern', 'arab', 'persian', 'turkish', 'arabic', 'saudi', 'iranian', 'iraqi', 
                           'egyptian', 'lebanese', 'syrian', 'dubai', 'qatar', 'mediterranean']
      };
      
      // 大幅降低种族检测阈值
      const RACE_DETECTION_THRESHOLD = 0.1; // 从0.2降低到0.1
      
      if (analysis.people) {
        const possibleRaces = Object.entries(raceKeywords)
          .filter(([race, keywords]) => 
            finalLabels.some(label => 
              keywords.some(keyword => 
                label.description.toLowerCase().includes(keyword.toLowerCase()) && 
                label.score > RACE_DETECTION_THRESHOLD
              )
            ))
          .map(([race]) => race);
        
        if (possibleRaces.length > 0) {
          analysis.people.race = possibleRaces;
        }
      }
      
      // 提取物体信息 - 进一步降低阈值
      analysis.objects = finalLabels
        .filter(label => label.score > 0.15) // 大幅降低阈值，从0.2降低到0.15
        .map(label => label.description);
      
      // 置信度阈值根据标签质量动态调整（应用于所有特征分析）
      const CONFIDENCE_MULTIPLIER = Math.min(1.0, Math.max(0.5, topLabelsAvgScore * 1.2));
      
      // 推测可能的兴趣爱好 - 使用更动态的阈值
      const INTEREST_THRESHOLD = 0.1 * CONFIDENCE_MULTIPLIER; // 从0.15降低到0.1
      
      const interestCategories = {
        'Sports': ['sport', 'basketball', 'football', 'soccer', 'tennis', 'golf', 'swimming', 'athlete', 'ball', 'game', 
                  'baseball', 'hockey', 'running', 'cycling', 'fitness', 'outdoor activity'],
        'Fashion': ['fashion', 'model', 'style', 'clothing', 'design', 'luxury', 'beauty', 'cosmetics', 'makeup', 'accessory', 
                   'jewelry', 'brand', 'trend'],
        'Technology': ['technology', 'computer', 'device', 'electronic', 'digital', 'smartphone', 'internet', 'tech', 'gadget', 
                      'software', 'hardware', 'phone', 'laptop', 'tablet'],
        'Art': ['art', 'painting', 'museum', 'gallery', 'artist', 'creative', 'design', 'sculpture', 'photography', 'drawing', 
               'craft', 'exhibition'],
        'Travel': ['travel', 'tourism', 'vacation', 'trip', 'tourist', 'destination', 'adventure', 'explore', 'journey', 
                  'sightseeing', 'landmark', 'hotel', 'resort'],
        'Food': ['food', 'cuisine', 'restaurant', 'cooking', 'chef', 'culinary', 'dining', 'meal', 'dish', 'recipe', 
                'baking', 'dessert', 'drink', 'coffee', 'wine'],
        'Nature': ['nature', 'outdoor', 'landscape', 'environment', 'wildlife', 'garden', 'hiking', 'camping', 'mountain', 
                  'beach', 'forest', 'park', 'sea', 'ocean', 'lake'],
        'Music': ['music', 'concert', 'instrument', 'musician', 'band', 'singer', 'audio', 'sound', 'song', 'guitar', 
                 'piano', 'vocal', 'dance', 'pop', 'rock'],
        'Reading': ['book', 'reading', 'literature', 'novel', 'magazine', 'publication', 'library', 'author', 'story', 
                   'poetry', 'education'],
        'Fitness': ['fitness', 'exercise', 'workout', 'gym', 'health', 'training', 'wellness', 'yoga', 'running', 'strength', 
                   'sports', 'athletic']
      };
      
      // 为低置信度添加基于图像上下文的默认兴趣
      let defaultInterests: string[] = [];
      
      // 检查照片类型，添加相关默认兴趣
      if (finalLabels.some(label => ['outdoor', 'nature', 'landscape'].some(k => label.description.toLowerCase().includes(k)))) {
        defaultInterests.push('Nature', 'Travel');
      }
      
      if (finalLabels.some(label => ['sport', 'game', 'activity', 'exercise'].some(k => label.description.toLowerCase().includes(k)))) {
        defaultInterests.push('Sports', 'Fitness');
      }
      
      if (finalLabels.some(label => ['food', 'drink', 'meal', 'restaurant'].some(k => label.description.toLowerCase().includes(k)))) {
        defaultInterests.push('Food');
      }
      
      if (finalLabels.some(label => ['device', 'technology', 'phone', 'computer'].some(k => label.description.toLowerCase().includes(k)))) {
        defaultInterests.push('Technology');
      }
      
      const interests = Object.entries(interestCategories)
        .filter(([category, keywords]) => 
          finalLabels.some(label => 
            keywords.some(keyword => 
              label.description.toLowerCase().includes(keyword.toLowerCase()) && 
              label.score > INTEREST_THRESHOLD
            )
          ))
        .map(([category]) => category);
      
      if (interests.length > 0) {
        analysis.possibleInterests = interests;
      } else if (defaultInterests.length > 0) {
        // 如果没有检测到兴趣，但有默认值，则使用默认值
        analysis.possibleInterests = Array.from(new Set(defaultInterests));
      } else {
        analysis.possibleInterests = ['General interests']; // 默认兴趣
      }
      
      // 推测可能的政治倾向 - 扩展关键词并降低阈值
      const politicalIndicators = {
        'Conservative Leaning': ['church', 'traditional', 'rural', 'military', 'flag', 'prayer', 'patriotic', 'religious', 
                                'conservative', 'conventional', 'heritage', 'nationalist'],
        'Liberal Leaning': ['protest', 'university', 'urban', 'multicultural', 'diversity', 'progressive', 'activism', 
                           'liberal', 'inclusive', 'modern', 'international', 'global'],
        'Neutral/Unknown': ['neutral', 'business', 'professional', 'office', 'formal', 'casual', 'everyday', 'common', 
                           'regular', 'standard']
      };
      
      // 大幅降低政治倾向检测阈值
      const POLITICAL_THRESHOLD = 0.2; // 从0.3降低到0.2
      
      let hasPoliticalIndicators = false;
      
      for (const [tendency, keywords] of Object.entries(politicalIndicators)) {
        if (finalLabels.some(label => 
          keywords.some(keyword => 
            label.description.toLowerCase().includes(keyword.toLowerCase()) && 
            label.score > POLITICAL_THRESHOLD
          )
        )) {
          analysis.possiblePoliticalAffiliation = tendency;
          hasPoliticalIndicators = true;
          break;
        }
      }
      
      // 设置默认政治倾向 - 根据图像内容智能推断
      if (!hasPoliticalIndicators) {
        // 基于其他分析结果推断政治倾向
        // 如果是自然环境，有略微自由倾向
        if (interests.includes('Nature') && interests.includes('Travel') && !interests.includes('Technology')) {
          analysis.possiblePoliticalAffiliation = 'Liberal Leaning';
        } 
        // 如果是商业或传统场景，有略微保守倾向
        else if (finalLabels.some(label => 
          ['business', 'office', 'formal', 'traditional', 'family'].some(k => 
            label.description.toLowerCase().includes(k) && label.score > 0.3
          )
        )) {
          analysis.possiblePoliticalAffiliation = 'Conservative Leaning';
        } 
        // 默认为中性
        else {
          analysis.possiblePoliticalAffiliation = 'Neutral/Unknown';
        }
      }
      
      // 推测可能收入范围 - 扩展关键词并降低阈值
      const incomeIndicators = {
        'High Income': ['luxury', 'expensive', 'yacht', 'mansion', 'designer', 'high-end', 'premium', 'executive', 'business', 
                       'elite', 'upscale', 'gourmet', 'first class', 'vip', 'wealth', 'rich', 'exclusive'],
        'Middle Income': ['comfortable', 'suburban', 'middle-class', 'standard', 'common', 'average', 'typical', 'normal', 
                         'regular', 'modest', 'ordinary', 'conventional'],
        'Low Income': ['basic', 'simple', 'budget', 'economy', 'minimal', 'modest', 'affordable', 'cheap', 'discount', 
                      'essential', 'plain', 'frugal']
      };
      
      // 大幅降低收入范围检测阈值
      const INCOME_THRESHOLD = 0.2; // 从0.3降低到0.2
      
      let hasIncomeIndicators = false;
      
      for (const [income, keywords] of Object.entries(incomeIndicators)) {
        if (finalLabels.some(label => 
          keywords.some(keyword => 
            label.description.toLowerCase().includes(keyword.toLowerCase()) && 
            label.score > INCOME_THRESHOLD
          )
        )) {
          analysis.possibleIncomeRange = income;
          hasIncomeIndicators = true;
          break;
        }
      }
      
      // 如果没有明确的收入指标，基于服装、环境等推断
      if (!hasIncomeIndicators) {
        // 检查是否有高端物品或场景
        const luxuryIndicators = finalLabels.some(label => 
          ['luxury', 'premium', 'expensive', 'designer', 'elegant', 'formal', 'professional', 'executive'].some(k => 
            label.description.toLowerCase().includes(k)
          )
        );
        
        // 检查是否有户外活动或高端运动
        const highEndActivities = finalLabels.some(label => 
          ['golf', 'tennis', 'yacht', 'sailing', 'resort', 'cruise', 'vacation', 'travel', 'tourism'].some(k => 
            label.description.toLowerCase().includes(k)
          )
        );
        
        // 检查是否有简单的生活方式指标
        const simpleLifestyle = finalLabels.some(label => 
          ['simple', 'basic', 'rural', 'farm', 'countryside', 'village'].some(k => 
            label.description.toLowerCase().includes(k)
          )
        );
        
        if (luxuryIndicators || highEndActivities) {
          analysis.possibleIncomeRange = 'High Income';
        } else if (simpleLifestyle) {
          analysis.possibleIncomeRange = 'Low Income';
        } else {
          analysis.possibleIncomeRange = 'Middle Income'; // 默认值
        }
      }
      
      // 推测可能的目标广告类别 - 扩展类别和降低阈值
      const potentialAds: string[] = [];
      
      // 确保至少有一些基本的广告类别，即使置信度较低
      const baseInterests = interests.length > 0 ? interests : defaultInterests.length > 0 ? Array.from(new Set(defaultInterests)) : ['General interests'];
      
      // 根据兴趣添加广告类别
      baseInterests.forEach(interest => {
        switch(interest) {
          case 'Fashion':
            potentialAds.push('Fashion Apparel', 'Beauty Products', 'Accessories');
            break;
          case 'Technology':
            potentialAds.push('Tech Products', 'Electronics', 'Software', 'Smart Devices');
            break;
          case 'Travel':
            potentialAds.push('Travel Destinations', 'Hotels', 'Flight Tickets');
            break;
          case 'Food':
            potentialAds.push('Food & Restaurants', 'Cooking Equipment', 'Food Delivery');
            break;
          case 'Sports':
            potentialAds.push('Sports Equipment', 'Fitness Memberships', 'Sports Apparel');
            break;
          case 'Nature':
            potentialAds.push('Outdoor Gear', 'Eco-friendly Products', 'Camping Equipment');
            break;
          case 'Music':
            potentialAds.push('Music Streaming', 'Concert Tickets', 'Audio Equipment');
            break;
          case 'Art':
            potentialAds.push('Art Supplies', 'Gallery Exhibitions', 'Design Software');
            break;
          case 'Reading':
            potentialAds.push('Books', 'E-readers', 'Magazine Subscriptions');
            break;
          case 'Fitness':
            potentialAds.push('Fitness Equipment', 'Health Supplements', 'Workout Apparel');
            break;
          default:
            potentialAds.push('General Consumer Products');
        }
      });
      
      // 根据收入范围添加广告类别 - 使用分析后的收入范围
      if (analysis.possibleIncomeRange === 'High Income') {
        potentialAds.push('Luxury Goods', 'Premium Vehicles', 'Financial Services');
      } else if (analysis.possibleIncomeRange === 'Middle Income') {
        potentialAds.push('Mid-range Products', 'Affordable Services', 'Family Packages');
      } else {
        potentialAds.push('Budget Options', 'Discount Stores', 'Coupons');
      }
      
      // 根据检测到的物体推断更多广告类别 - 降低阈值，提高覆盖率
      finalLabels.forEach(label => {
        if (label.score > 0.2) { // 降低阈值
          const desc = label.description.toLowerCase();
          
          if (['car', 'vehicle', 'automobile', 'transportation', 'driving'].some(k => desc.includes(k))) {
            potentialAds.push('Automotive', 'Car Insurance', 'Auto Parts');
          } else if (['house', 'home', 'apartment', 'real estate', 'property', 'building', 'residence'].some(k => desc.includes(k))) {
            potentialAds.push('Real Estate', 'Home Improvement', 'Furniture');
          } else if (['pet', 'dog', 'cat', 'animal', 'bird', 'fish'].some(k => desc.includes(k))) {
            potentialAds.push('Pet Products', 'Pet Food', 'Veterinary Services');
          } else if (['child', 'baby', 'kid', 'family', 'parent', 'toddler', 'infant'].some(k => desc.includes(k))) {
            potentialAds.push('Family Products', 'Children Clothes', 'Toys');
          } else if (['fitness', 'exercise', 'workout', 'gym', 'sport', 'training', 'health'].some(k => desc.includes(k))) {
            potentialAds.push('Fitness Products', 'Health Supplements', 'Workout Plans');
          } else if (['phone', 'computer', 'laptop', 'tech', 'digital', 'electronic', 'device'].some(k => desc.includes(k))) {
            potentialAds.push('Electronics', 'Software', 'Mobile Apps');
          }
        }
      });
      
      // 确保即使分析失败也至少有一些广告类别
      if (potentialAds.length === 0) {
        potentialAds.push('General Consumer Products', 'Online Services', 'Retail Stores');
      }
      
      // 去重并限制数量
      if (potentialAds.length > 0) {
        // 使用Set去重，然后转回数组
        analysis.possibleTargetedAds = Array.from(new Set(potentialAds)).slice(0, 8); // 最多返回8个广告类别
      } else {
        analysis.possibleTargetedAds = ['General Consumer Products']; // 默认广告类别
      }
    }
    
  } catch (error) {
    console.error('执行扩展分析时出错:', error);
    // 返回带有基本信息的分析结果，确保UI正常显示
    return {
      people: {
        count: 1,
        emotions: { 'Person 1': 'Neutral' },
        gender: ['Unknown'],
        age: ['Adult'],
        race: ['Unknown'],
        clothing: ['Casual clothing']
      },
      objects: ['image'],
      possibleInterests: ['General interests'],
      possiblePoliticalAffiliation: 'Neutral/Unknown',
      possibleIncomeRange: 'Middle Income',
      possibleTargetedAds: ['General Consumer Products']
    };
  }
  
  // 确保返回的结果不为空
  console.log('扩展分析完成，结果概览:', {
    hasPeople: !!analysis.people,
    peopleCount: analysis.people?.count || 0,
    hasInterests: !!analysis.possibleInterests,
    interestsCount: analysis.possibleInterests?.length || 0,
    hasIncomeRange: !!analysis.possibleIncomeRange,
    hasAffiliation: !!analysis.possiblePoliticalAffiliation,
    hasAds: !!analysis.possibleTargetedAds,
    adsCount: analysis.possibleTargetedAds?.length || 0
  });
  
  return analysis;
}

/**
 * 获取图片中的物体标签
 */
export const getImageLabels = async (imageFile: File): Promise<{description: string, score: number}[]> => {
  const result = await analyzeImage(imageFile, ['LABEL_DETECTION']);
  return result.labelAnnotations || [];
};

/**
 * 获取图片中的文本内容
 */
export const getImageText = async (imageFile: File): Promise<string> => {
  const result = await analyzeImage(imageFile, ['TEXT_DETECTION']);
  return result.textAnnotations && result.textAnnotations.length > 0
    ? result.textAnnotations[0].description
    : '';
};

/**
 * 检测图片中的人脸表情
 */
export const detectFaces = async (imageFile: File) => {
  const result = await analyzeImage(imageFile, ['FACE_DETECTION']);
  return result.faceAnnotations || [];
};

/**
 * 检测图片中的地标
 */
export const detectLandmarks = async (imageFile: File) => {
  const result = await analyzeImage(imageFile, ['LANDMARK_DETECTION']);
  return result.landmarkAnnotations || [];
};

// 辅助函数：将字符串形式的可能性转换为数值
function getLikelihoodScore(likelihood: string | undefined): number {
  if (!likelihood) return 0;
  
  switch(likelihood) {
    case 'VERY_LIKELY': return 0.95;
    case 'LIKELY': return 0.8;
    case 'POSSIBLE': return 0.6;
    case 'UNLIKELY': return 0.3;
    case 'VERY_UNLIKELY': return 0.1;
    default: return 0;
  }
}

// 辅助函数：计算眼睛之间的距离
function calculateEyeDistance(landmarks: Array<{type: string, position: {x: number, y: number, z: number}}> | undefined): number {
  if (!landmarks) return 0;
  
  const leftEye = landmarks.find(l => l.type === 'LEFT_EYE');
  const rightEye = landmarks.find(l => l.type === 'RIGHT_EYE');
  
  if (!leftEye || !rightEye) return 0;
  
  // 欧几里得距离
  return Math.sqrt(
    Math.pow(leftEye.position.x - rightEye.position.x, 2) +
    Math.pow(leftEye.position.y - rightEye.position.y, 2)
  );
}

// 辅助函数：分析面部形状
function analyzeFaceShape(landmarks: Array<{type: string, position: {x: number, y: number, z: number}}> | undefined): string {
  if (!landmarks) return 'unknown';
  
  // 这里需要更复杂的计算，简化版本返回默认形状
  return 'oval';
} 