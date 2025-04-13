import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function About() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            About Photo Privacy Analyzer
          </h1>
          
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p>
              Photo Privacy Analyzer is a free, open-source tool designed to help users understand what private information might be leaked through their photos.
              In this digital age, photos contain more than just images — they also include various metadata (EXIF, IPTC, XMP, etc.),
              which may reveal your location, device information, and other sensitive details.
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