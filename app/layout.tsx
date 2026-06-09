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
  title: 'CloQ Health — Make Time Count',
  description:
    'BodyCloQ measures your circadian rhythm across three nights and turns it into a score, daily cue, and action plan for peak cognitive performance.',
  openGraph: {
    title: 'CloQ Health — Make Time Count',
    description:
      'BodyCloQ measures your circadian rhythm and turns it into a score, daily cue, and action plan.',
    url: 'https://cloq.health',
    siteName: 'CloQ Health',
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
