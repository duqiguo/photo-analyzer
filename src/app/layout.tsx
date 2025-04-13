import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Photo Privacy Analyzer | Analyze privacy information in your photos',
  description: 'Analyze metadata (EXIF, IPTC, XMP) in your photos to understand potentially leaked privacy data such as GPS location and device information. All analysis is done locally without uploading your photos.',
  keywords: 'photo analysis,EXIF,metadata,privacy,GPS,geolocation,photo privacy,local analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  )
} 