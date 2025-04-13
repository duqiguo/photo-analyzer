'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 支持的语言类型
export type LanguageType = 'en' | 'zh';

// 语言上下文接口
interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string) => string;
}

// 翻译字典
const translations: Record<string, Record<string, string>> = {
  en: {
    photoAnalyzer: 'Photo Analyzer',
    uploadDescription: 'Upload a photo to understand what privacy information it might contain and what data AI can extract from it.',
    about: 'About',
    privacyPolicy: 'Privacy Policy',
    allRights: 'All Rights Reserved',
    selectPhoto: 'Select a photo to analyze',
    dragDrop: 'Drag & drop a photo here, or click to select',
    supportedFormats: 'Supported formats: JPG, PNG, WebP',
    secureAnalysis: 'Your photo will be analyzed securely and not stored permanently',
    analyzing: 'Analyzing...',
    uploadFirst: 'Please upload an image first',
    errorAnalyzing: 'Error analyzing image',
    description: 'Description',
    data: 'Data',
    people: 'People',
    race: 'Race',
    emotion: 'Emotion',
    clothing: 'Clothing',
    interests: 'Interests',
    politicalAffiliation: 'Political Affiliation',
    incomeRange: 'Income Range',
    targetAds: 'Target Ads',
    loading: 'Loading map...',
    analyzingPhoto: 'Analyzing your photo...',
    unknown: 'Unknown',
    selectLanguage: 'Select Language',
    english: 'English',
    chinese: 'Chinese',
    home: 'Home',
    privacy: 'Privacy',
    game: 'Game',
    language: 'Language',
    links: 'Links'
  },
  zh: {
    photoAnalyzer: '照片分析器',
    uploadDescription: '上传照片，了解它可能包含的隐私信息以及AI可以从中提取的数据。',
    about: '关于',
    privacyPolicy: '隐私政策',
    allRights: '版权所有',
    selectPhoto: '选择一张照片进行分析',
    dragDrop: '拖放照片到这里，或点击选择',
    supportedFormats: '支持的格式：JPG、PNG、WebP',
    secureAnalysis: '您的照片将被安全分析，不会被永久存储',
    analyzing: '分析中...',
    uploadFirst: '请先上传图片',
    errorAnalyzing: '分析图片时出错',
    description: '描述',
    data: '数据',
    people: '人物',
    race: '种族',
    emotion: '情绪',
    clothing: '服装',
    interests: '兴趣',
    politicalAffiliation: '政治倾向',
    incomeRange: '收入范围',
    targetAds: '目标广告',
    loading: '加载地图中...',
    analyzingPhoto: '正在分析您的照片...',
    unknown: '未知',
    selectLanguage: '选择语言',
    english: '英文',
    chinese: '中文',
    home: '首页',
    privacy: '隐私',
    game: '游戏',
    language: '语言',
    links: '链接'
  }
};

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 创建Provider组件
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // 获取默认语言，优先从localStorage读取，否则使用浏览器语言设置，默认为英文
  const [language, setLanguageState] = useState<LanguageType>('en');

  // 在客户端初始化时尝试读取localStorage中的语言设置
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as LanguageType;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      setLanguageState(savedLanguage);
    } else {
      // 如果没有保存的语言设置，尝试使用浏览器语言
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'zh') {
        setLanguageState('zh');
        localStorage.setItem('language', 'zh');
      } else {
        // 默认为英文
        setLanguageState('en');
        localStorage.setItem('language', 'en');
      }
    }
  }, []);

  // 设置语言并保存到localStorage
  const setLanguage = (lang: LanguageType) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // 翻译函数
  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 创建hook以便于组件使用
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 