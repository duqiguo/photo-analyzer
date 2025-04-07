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
            关于照片隐私分析器
          </h1>
          
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p>
              照片隐私分析器是一个免费的、开源的工具，旨在帮助用户了解他们照片中可能泄露的私人信息。
              在这个数字化时代，照片包含的不仅仅是图像，还有各种元数据（EXIF、IPTC、XMP等），
              这些数据可能会泄露您的位置、设备信息和其他敏感细节。
            </p>
            
            <h2>项目目标</h2>
            <p>
              我们的主要目标是提高人们对数字隐私的意识，并提供一种简单的方法来检测和了解照片中的元数据。
              所有的分析都在您的浏览器中本地进行，不会将您的照片上传到任何服务器，确保您的隐私安全。
            </p>
            
            <h2>技术实现</h2>
            <p>
              照片隐私分析器使用现代Web技术构建：
            </p>
            <ul>
              <li>Next.js - React框架</li>
              <li>TailwindCSS - 样式和UI设计</li>
              <li>Exifr - 客户端EXIF数据解析</li>
              <li>React Dropzone - 文件上传功能</li>
            </ul>
            
            <h2>隐私承诺</h2>
            <p>
              我们非常重视您的隐私。这就是为什么照片隐私分析器是一个完全在客户端运行的应用程序：
            </p>
            <ul>
              <li>您的照片永远不会离开您的设备</li>
              <li>所有分析都在您的浏览器中进行</li>
              <li>不使用追踪器或分析工具</li>
              <li>不存储任何用户数据</li>
            </ul>
            
            <h2>开源项目</h2>
            <p>
              照片隐私分析器是一个开源项目，您可以在GitHub上查看源代码、报告问题或贡献代码。
              我们欢迎社区贡献和反馈，共同改进这个工具。
            </p>
            
            <div className="mt-8 text-center">
              <Link href="/" className="btn-primary">
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
} 