import { ExifData } from '@/components/features/AnalysisResult';
import exifr from 'exifr';

export const parseExifData = async (file: File): Promise<ExifData> => {
  try {
    // 使用exifr解析EXIF数据
    const parsed = await exifr.parse(file, {
      // 指定需要解析的标签
      tiff: true,
      exif: true,
      gps: true,
      interop: false,
      // 仅读取需要的EXIF部分
      mergeOutput: true,
      translateValues: true,
      translateKeys: true,
    });
    
    console.log('EXIF解析结果:', parsed);

    // 构建数据结构
    const data: ExifData = {};
    
    // 基本信息
    if (parsed?.Make) data.make = parsed.Make;
    if (parsed?.Model) data.model = parsed.Model;
    if (parsed?.Software) data.software = parsed.Software;
    
    // 日期时间
    if (parsed?.DateTime) {
      data.dateTime = parsed.DateTime;
    } else if (parsed?.DateTimeOriginal) {
      data.dateTime = parsed.DateTimeOriginal;
    } else if (parsed?.CreateDate) {
      data.dateTime = parsed.CreateDate;
    }
    
    // GPS信息
    if (parsed?.latitude && parsed?.longitude) {
      console.log("找到GPS信息:", parsed.latitude, parsed.longitude);
      
      // 构建GPS对象
      data.gps = {
        latitude: parsed.latitude,
        longitude: parsed.longitude
      };
      
      // 如果有高度信息
      if (parsed.altitude) {
        data.gps.altitude = parsed.altitude;
      }
      
      console.log("GPS数据:", data.gps);
    } else {
      console.log("未找到GPS信息");
      // 不再添加模拟数据，让组件处理无GPS数据的情况
    }
    
    // 其他曝光信息
    if (parsed?.ExposureTime) data.exposureTime = parsed.ExposureTime;
    if (parsed?.FNumber) data.fNumber = parsed.FNumber;
    if (parsed?.ISO) data.iso = parsed.ISO;
    if (parsed?.FocalLength) data.focalLength = parsed.FocalLength;
    if (parsed?.Flash) {
      if (typeof parsed.Flash === 'object') {
        data.flash = parsed.Flash.fired;
      } else {
        data.flash = !!parsed.Flash;
      }
    }
    
    // 图像配置
    if (parsed?.Orientation) data.orientation = parsed.Orientation;
    if (parsed?.ColorSpace) data.colorSpace = parsed.ColorSpace;
    if (parsed?.XResolution) data.xResolution = parsed.XResolution;
    if (parsed?.YResolution) data.yResolution = parsed.YResolution;
    if (parsed?.ResolutionUnit) data.resolutionUnit = parsed.ResolutionUnit;
    
    // 其他额外数据
    if (parsed) {
      const other: Record<string, any> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (!['Make', 'Model', 'Software', 'DateTime', 'DateTimeOriginal', 'CreateDate',
              'ExposureTime', 'FNumber', 'ISO', 'FocalLength', 'Flash', 
              'Orientation', 'ColorSpace', 'XResolution', 'YResolution', 'ResolutionUnit',
              'latitude', 'longitude', 'altitude'].includes(key)) {
          other[key] = value;
        }
      }
      
      if (Object.keys(other).length > 0) {
        data.other = other;
      }
    }
    
    return data;
  } catch (err) {
    console.error('解析EXIF数据出错:', err);
    return {}; // 返回空对象表示解析失败
  }
}; 