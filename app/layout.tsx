import type { Metadata } from 'next'
import { Unbounded, Source_Serif_4, Geist, Geist_Mono } from 'next/font/google'

import { HashScroll } from '@/components/HashScroll'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-logo',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PHOS — Know Your Photonic Age',
  description:
    'Light exposure predicts heart disease, diabetes and early death in 88,000 people. Calculate your Photonic Age. Own your data. Change medicine.',
  openGraph: {
    title: 'PHOS — Know Your Photonic Age',
    description: 'Your light is ageing you. Find out by how much.',
    url: 'https://phos.org.uk',
    siteName: 'PHOS',
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
    <html lang="en">
      <body
        className={`${unbounded.variable} ${sourceSerif.variable} ${geist.variable} ${geistMono.variable}`}
      >
        <HashScroll />
        {children}
      </body>
    </html>
  )
}
