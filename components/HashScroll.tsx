'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

import { scrollToHome, scrollToPageTop } from '@/lib/scroll-home'

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
  const previousPath = useRef<string | null>(null)

  useEffect(() => {
    const hash = window.location.hash
    const pathChanged = previousPath.current !== null && previousPath.current !== pathname
    previousPath.current = pathname

    if (hash) {
      scrollToHash()
    } else if (pathChanged) {
      if (pathname === '/') {
        scrollToHome()
      } else {
        scrollToPageTop()
      }
    }

    window.addEventListener('hashchange', scrollToHash)
    return () => window.removeEventListener('hashchange', scrollToHash)
  }, [pathname])

  return null
}
