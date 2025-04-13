import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function Privacy() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-gray-800 dark:text-white">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p>
              Last updated: {new Date().toLocaleDateString('en-US')}
            </p>
            
            <h2>How We Handle Your Photos</h2>
            <p>
              <strong>Photo Privacy Analyzer</strong> is a pure client-side application, meaning all analysis is performed in your browser. Photos you upload are not sent to our servers or any third-party services. Your data remains entirely on your device.
            </p>
            
            <h2>Data Collection</h2>
            <p>
              We do not collect, store, or process any of the following data:
            </p>
            <ul>
              <li>Photos you upload</li>
              <li>Metadata extracted from photos</li>
              <li>Personal identifying information</li>
              <li>Usage statistics</li>
              <li>Cookies or local storage data</li>
            </ul>
            
            <h2>Third-Party Services</h2>
            <p>
              Photo Privacy Analyzer does not use any third-party analytics, advertising, or tracking services.
            </p>
            
            <h2>Open Source Transparency</h2>
            <p>
              Our application is completely open source. You can review the source code on GitHub to verify that we don't collect or transmit any data.
            </p>
            
            <h2>Changes to This Policy</h2>
            <p>
              If we make any changes to our privacy policy, we will post updates on this page. We encourage users to periodically review this page to stay informed about any changes to our privacy practices.
            </p>
            
            <h2>Contact Us</h2>
            <p>
              If you have any questions about our privacy policy, please contact us through the GitHub repository.
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