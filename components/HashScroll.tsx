'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { scrollToHome } from '@/lib/scroll-home'

function scrollToHash() {
  const hash = window.location.hash
  if (!hash) return
  const id = hash.slice(1)
  if (id === 'hero') {
    scrollToHome()
    return
  }
  const target = document.getElementById(id)
  if (target) {
    target.scrollIntoView({ behavior: 'auto', block: 'start' })
  }
}

export function HashScroll() {
  const pathname = usePathname()

  useEffect(() => {
    scrollToHash()
    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [pathname])

  return null
}
