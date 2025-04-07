import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: '照片隐私分析器 | 分析照片中可能泄露的隐私信息',
  description: '分析您照片中的元数据（EXIF、IPTC、XMP），了解可能泄露的GPS位置、设备信息等隐私数据。所有分析在本地进行，不会上传您的照片。',
  keywords: '照片分析,EXIF,元数据,隐私,GPS,地理位置,照片隐私,本地分析',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
} 