import { ExifData } from '@/components/features/AnalysisResult';

interface PrivacyRisk {
  type: 'location' | 'device' | 'time' | 'other';
  level: 'high' | 'medium' | 'low';
  description: string;
  details?: string;
}

export interface AnalysisReport {
  fileName: string;
  hasMetadata: boolean;
  risks: PrivacyRisk[];
  summary: {
    riskScore: number; // 0-100
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    recommendation: string;
  };
  detectedMetadata: {
    category: string;
    items: { name: string; value: string }[];
  }[];
}

/**
 * 根据EXIF数据生成隐私分析报告
 */
export function generatePrivacyReport(fileName: string, exifData: ExifData): AnalysisReport {
  const risks: PrivacyRisk[] = [];
  const hasMetadata = Object.keys(exifData).length > 0;
  const detectedMetadata: AnalysisReport['detectedMetadata'] = [];
  
  // 检查位置风险
  if (exifData.gps && exifData.gps.latitude && exifData.gps.longitude) {
    risks.push({
      type: 'location',
      level: 'high',
      description: '照片包含精确的GPS位置信息',
      details: `纬度: ${exifData.gps.latitude.toFixed(6)}, 经度: ${exifData.gps.longitude.toFixed(6)}${
        exifData.gps.altitude ? `, 海拔: ${exifData.gps.altitude.toFixed(1)}米` : ''
      }`
    });
    
    detectedMetadata.push({
      category: '位置信息',
      items: [
        { name: '纬度', value: exifData.gps.latitude.toFixed(6) },
        { name: '经度', value: exifData.gps.longitude.toFixed(6) },
        ...(exifData.gps.altitude ? [{ name: '海拔', value: `${exifData.gps.altitude.toFixed(1)}米` }] : [])
      ]
    });
  }
  
  // 检查设备信息风险
  if (exifData.make || exifData.model) {
    risks.push({
      type: 'device',
      level: 'medium',
      description: '照片包含设备信息',
      details: `${exifData.make || ''} ${exifData.model || ''}`.trim()
    });
    
    const deviceItems = [];
    if (exifData.make) deviceItems.push({ name: '设备品牌', value: exifData.make });
    if (exifData.model) deviceItems.push({ name: '设备型号', value: exifData.model });
    if (exifData.software) deviceItems.push({ name: '软件', value: exifData.software });
    
    if (deviceItems.length > 0) {
      detectedMetadata.push({
        category: '设备信息',
        items: deviceItems
      });
    }
  }
  
  // 检查时间信息风险
  if (exifData.dateTime) {
    risks.push({
      type: 'time',
      level: 'low',
      description: '照片包含时间信息',
      details: new Date(exifData.dateTime).toLocaleString('zh-CN')
    });
    
    detectedMetadata.push({
      category: '时间信息',
      items: [
        { name: '拍摄时间', value: new Date(exifData.dateTime).toLocaleString('zh-CN') }
      ]
    });
  }
  
  // 添加其他相机参数
  const cameraParams = [];
  if (exifData.exposureTime) cameraParams.push({ name: '曝光时间', value: `${exifData.exposureTime}秒` });
  if (exifData.fNumber) cameraParams.push({ name: '光圈', value: `f/${exifData.fNumber}` });
  if (exifData.iso) cameraParams.push({ name: 'ISO', value: `${exifData.iso}` });
  if (exifData.focalLength) cameraParams.push({ name: '焦距', value: `${exifData.focalLength}mm` });
  
  if (cameraParams.length > 0) {
    detectedMetadata.push({
      category: '相机参数',
      items: cameraParams
    });
  }
  
  // 计算风险分数和总结
  const highRisks = risks.filter(r => r.level === 'high').length;
  const mediumRisks = risks.filter(r => r.level === 'medium').length;
  const lowRisks = risks.filter(r => r.level === 'low').length;
  
  // 风险分数计算: 高风险 * 30 + 中风险 * 15 + 低风险 * 5，最高100分
  const riskScore = Math.min(100, highRisks * 30 + mediumRisks * 15 + lowRisks * 5);
  
  let recommendation = '';
  if (riskScore >= 70) {
    recommendation = '强烈建议在分享前清除照片元数据，特别是位置信息';
  } else if (riskScore >= 30) {
    recommendation = '建议在分享敏感照片前清除元数据';
  } else if (riskScore > 0) {
    recommendation = '照片包含少量元数据，分享敏感内容时应考虑清除';
  } else {
    recommendation = '未检测到隐私风险';
  }
  
  return {
    fileName,
    hasMetadata,
    risks,
    summary: {
      riskScore,
      highRisks,
      mediumRisks,
      lowRisks,
      recommendation
    },
    detectedMetadata
  };
} 