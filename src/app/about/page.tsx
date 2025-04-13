'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/context/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            {t('about')}
          </h1>
          
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p>
              Photo Analyzer is an application designed to help you understand the potential privacy implications of your photos.
            </p>
            
            <p>
              In the digital age, photos we share online can contain a surprising amount of personal information. 
              From GPS coordinates showing where the photo was taken, to metadata revealing what device was used, 
              and even AI analysis that can detect personal attributes - each photo tells a story beyond the image itself.
            </p>
            
            <h2>Privacy-First Approach</h2>
            <p>
              All analysis happens directly in your browser. Your photos are never uploaded to any server, 
              ensuring your privacy is maintained throughout the analysis process.
            </p>
            
            <h2>How It Works</h2>
            <p>
              This tool uses several technologies to analyze your photos:
            </p>
            <ul>
              <li>EXIF data extraction - reveals technical details and potentially GPS coordinates</li>
              <li>Google Vision API simulation - demonstrates what AI can detect in your photos</li>
              <li>Browser-based processing - ensures your photos never leave your device</li>
            </ul>
            
            <h2>Educational Purpose</h2>
            <p>
              This tool is created for educational purposes to raise awareness about digital privacy. 
              By understanding what information your photos might reveal, you can make more informed decisions about what you share online.
            </p>
            
            <h2>Project Goals</h2>
            <p>
              Our main goal is to raise awareness about digital privacy and provide a simple way to detect and understand metadata in photos.
              All analysis is performed locally in your browser, without uploading your photos to any server, ensuring your privacy is protected.
            </p>
            
            <h2>Technical Implementation</h2>
            <p>
              Photo Privacy Analyzer is built with modern web technologies:
            </p>
            <ul>
              <li>Next.js - React framework</li>
              <li>TailwindCSS - Styling and UI design</li>
              <li>Exifr - Client-side EXIF data parsing</li>
              <li>React Dropzone - File upload functionality</li>
            </ul>
            
            <h2>Privacy Commitment</h2>
            <p>
              We take your privacy very seriously. That's why Photo Privacy Analyzer is a completely client-side application:
            </p>
            <ul>
              <li>Your photos never leave your device</li>
              <li>All analysis is performed in your browser</li>
              <li>No trackers or analytics tools are used</li>
              <li>No user data is stored</li>
            </ul>
            
            <h2>Open Source Project</h2>
            <p>
              Photo Privacy Analyzer is an open-source project. You can view the source code, report issues, or contribute on GitHub.
              We welcome community contributions and feedback to improve this tool together.
            </p>
            
            <div className="mt-8 text-center">
              <Link href="/" className="btn-primary">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 