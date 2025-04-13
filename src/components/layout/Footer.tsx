import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-12 px-4 sm:px-6 lg:px-8 mt-auto bg-gray-50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-800/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-600 to-secondary-500 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 bg-clip-text text-transparent">Photo Privacy Analyzer</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
              © {currentYear} Photo Privacy Analyzer - All analysis is performed in your browser, photos are never uploaded
            </p>
          </div>
          <div className="flex flex-col space-y-4">
            <h4 className="font-medium text-gray-800 dark:text-white text-center md:text-right">
              Links
            </h4>
            <div className="flex space-x-6 justify-center md:justify-end">
              <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                About
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors">
                Privacy Policy
              </Link>
              <Link 
                href="https://github.com/yourusername/photo-analyzer" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 