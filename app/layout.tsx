import type { Metadata } from 'next'
import { Unbounded, Cormorant_Garamond, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const unbounded = Unbounded({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-logo',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PHOS · Light Matters',
  description:
    'PHOS measures your Photonic Age across three nights of TipTraQ data, quantifying Lost Light Years and the cost of circadian misalignment for individuals and teams.',
  openGraph: {
    title: 'PHOS · Light Matters',
    description:
      'Photonic Age quantifies the cost of lost light. PHOS measures it and closes the gap.',
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
        className={`${unbounded.variable} ${cormorant.variable} ${dmSans.variable} ${dmMono.variable}`}
      >
        {children}
      </body>
    </html>
  )
}
