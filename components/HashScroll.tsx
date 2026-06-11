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

    const run = () => {
      if (hash) {
        scrollToHash()
        return
      }
      if (pathChanged) {
        if (pathname === '/') {
          scrollToHome()
        } else {
          scrollToPageTop()
        }
      }
    }

    run()
    const timers = [
      window.requestAnimationFrame(run),
      window.setTimeout(run, 0),
      window.setTimeout(run, 50),
    ]

    window.addEventListener('hashchange', scrollToHash)
    return () => {
      timers.forEach((id) => {
        window.clearTimeout(id)
        window.cancelAnimationFrame(id)
      })
      window.removeEventListener('hashchange', scrollToHash)
    }
  }, [pathname])

  return null
}
