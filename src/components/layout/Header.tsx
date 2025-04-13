"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="w-full py-5 px-4 sm:px-6 lg:px-8 border-b border-gray-100 dark:border-gray-800/30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-secondary-600 transition-all">
            {language === 'en' ? 'Photo Privacy Analyzer' : '照片隐私分析器'}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-1">
          <Link 
            href="/" 
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
          >
            {t('home')}
          </Link>
          <Link 
            href="/about" 
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
          >
            {t('about')}
          </Link>
          <Link 
            href="/privacy" 
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
          >
            {t('privacy')}
          </Link>
          <Link 
            href="/index.html" 
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
          >
            {t('game')}
          </Link>
          
          {/* Language Switcher (Desktop) */}
          <div className="relative">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 flex items-center"
            >
              {t('language')}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            
            {isLangMenuOpen && (
              <div className="absolute right-0 mt-2 py-2 w-32 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800/30 z-20">
                <button
                  className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                  onClick={() => {
                    setLanguage('en');
                    setIsLangMenuOpen(false);
                  }}
                >
                  English
                </button>
                <button
                  className={`w-full text-left px-4 py-2 text-sm ${language === 'zh' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-700 dark:text-gray-300'} hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                  onClick={() => {
                    setLanguage('zh');
                    setIsLangMenuOpen(false);
                  }}
                >
                  中文
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 px-4 py-5 space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800/30 absolute left-4 right-4">
          <Link 
            href="/" 
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('home')}
          </Link>
          <Link
            href="/about"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('about')}
          </Link>
          <Link
            href="/privacy"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('privacy')}
          </Link>
          <Link
            href="/index.html"
            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            {t('game')}
          </Link>
          
          {/* Language Switcher (Mobile) */}
          <div className="px-4 py-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('language')}</p>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded ${language === 'en' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setLanguage('en')}
              >
                English
              </button>
              <button
                className={`px-3 py-1 text-sm rounded ${language === 'zh' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                onClick={() => setLanguage('zh')}
              >
                中文
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 