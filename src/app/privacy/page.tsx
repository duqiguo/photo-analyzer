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
            隐私政策
          </h1>
          
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <p>
              最后更新：{new Date().toLocaleDateString('zh-CN')}
            </p>
            
            <h2>我们如何处理您的照片</h2>
            <p>
              <strong>照片隐私分析器</strong>是一个纯客户端应用程序，这意味着所有分析都在您的浏览器中进行。您上传的照片不会发送到我们的服务器或任何第三方服务。您的数据完全保留在您的设备上。
            </p>
            
            <h2>数据收集</h2>
            <p>
              我们不收集、存储或处理以下任何数据：
            </p>
            <ul>
              <li>您上传的照片</li>
              <li>从照片中提取的元数据</li>
              <li>个人身份信息</li>
              <li>使用统计数据</li>
              <li>Cookie或本地存储数据</li>
            </ul>
            
            <h2>第三方服务</h2>
            <p>
              照片隐私分析器不使用任何第三方分析、广告或追踪服务。
            </p>
            
            <h2>开源透明</h2>
            <p>
              我们的应用程序是完全开源的。您可以在GitHub上查看源代码，以验证我们不会收集或传输任何数据。
            </p>
            
            <h2>变更通知</h2>
            <p>
              如果我们对隐私政策进行任何变更，我们将在此页面上发布更新。我们鼓励用户定期查看此页面，了解我们的隐私实践的任何变化。
            </p>
            
            <h2>联系我们</h2>
            <p>
              如果您对我们的隐私政策有任何疑问，请通过GitHub仓库联系我们。
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