import type { Metadata } from 'next'
import { Playfair_Display, DM_Mono } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-dm-mono',
})

export const metadata: Metadata = {
  title: 'PHOS Health — Light Matters',
  description:
    'PHOS Health measures Photonic Age across three nights of TipTraQ data — quantifying Lost Light Years and the cost of circadian misalignment for individuals and teams.',
  openGraph: {
    title: 'PHOS Health — Light Matters',
    description:
      'Photonic Age quantifies the cost of lost light. PHOS measures it and closes the gap.',
    url: 'https://phos.health',
    siteName: 'PHOS Health',
    locale: 'en_GB',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
