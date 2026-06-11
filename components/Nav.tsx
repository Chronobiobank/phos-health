'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { CondensedNavMenu, type CondensedNavItem } from '@/components/CondensedNavMenu'
import { HomeLink } from '@/components/HomeLink'
import Wordmark from '@/components/Wordmark'
import { SITE_LINKS } from '@/lib/site-links'

function getProbeY(bar: HTMLDivElement | null) {
  if (bar) return bar.offsetHeight
  const height = getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
  const parsed = parseFloat(height)
  return Number.isFinite(parsed) ? parsed : 72
}

export function Nav() {
  const pathname = usePathname()
  const barRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [onDark, setOnDark] = useState(pathname === '/')

  const items = useMemo<CondensedNavItem[]>(
    () =>
      SITE_LINKS.map((link) =>
        link.href === '/#hero'
          ? { kind: 'home' as const, href: link.href, label: link.label }
          : { kind: 'link' as const, href: link.href, label: link.label },
      ),
    [],
  )

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-theme]'))
    if (!sections.length) {
      setOnDark(pathname === '/')
      return
    }

    let raf = 0
    const updateTheme = () => {
      raf = 0
      const probeY = getProbeY(barRef.current)

      let active = sections.find((section) => {
        const rect = section.getBoundingClientRect()
        return rect.top <= probeY && rect.bottom > probeY
      })

      if (!active) {
        active =
          [...sections].reverse().find((section) => {
            return section.getBoundingClientRect().top <= probeY
          }) ?? sections[0]
      }

      setOnDark(active.dataset.navTheme === 'dark')
    }

    const onScroll = () => {
      if (raf === 0) raf = window.requestAnimationFrame(updateTheme)
    }

    updateTheme()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [pathname])

  const siteNav = (
    <nav className={`site-nav ${onDark ? 'nav--on-dark' : 'nav--on-light'}`}>
      <div ref={barRef} className="nav__bar">
        <div className="container">
          <div className="nav__inner">
            <HomeLink aria-label="PHOS home" className="nav__logo">
              <Wordmark />
            </HomeLink>

            <CondensedNavMenu items={items} measureRef={barRef} />
          </div>
        </div>
      </div>
    </nav>
  )

  return mounted ? createPortal(siteNav, document.body) : siteNav
}
