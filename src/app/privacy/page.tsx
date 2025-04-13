'use client';

import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow px-4 py-8 sm:px-6 md:py-12 md:px-8 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {t('privacyPolicy')}
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2>Data Collection</h2>
            <p>
              <strong>We do not collect any personal data.</strong> All photo analysis is performed locally in your browser. 
              Your photos are never uploaded to any server.
            </p>
            
            <h2>How It Works</h2>
            <p>
              When you upload a photo to our app:
            </p>
            <ul>
              <li>The photo is processed entirely within your browser</li>
              <li>EXIF data is extracted using client-side JavaScript</li>
              <li>AI analysis is performed through local in-browser models</li>
              <li>No data, including the photo itself, is ever sent to a server</li>
            </ul>
            
            <h2>Cookies and Storage</h2>
            <p>
              We use minimal local browser storage to:
            </p>
            <ul>
              <li>Save your language preference</li>
              <li>Improve the user experience</li>
            </ul>
            
            <h2>Third-Party Services</h2>
            <p>
              The only external service used is Google Maps to display location data. When a photo contains GPS coordinates,
              we use these coordinates to display a map. Please refer to Google's privacy policy for more information on how
              they handle this data.
            </p>
            
            <h2>Changes to This Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us.
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