'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { HomeLink } from '@/components/HomeLink'
import Wordmark from '@/components/Wordmark'
import { SITE_LINKS } from '@/lib/site-links'
import { scrollToPageTop } from '@/lib/scroll-home'

function getProbeY(bar: HTMLDivElement | null) {
  if (bar) return bar.offsetHeight
  const height = getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
  const parsed = parseFloat(height)
  return Number.isFinite(parsed) ? parsed : 72
}

export function Nav() {
  const pathname = usePathname()
  const barRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [onDark, setOnDark] = useState(pathname === '/')

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useLayoutEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const syncNavHeight = () => {
      document.documentElement.style.setProperty('--nav-height', `${bar.offsetHeight}px`)
    }

    syncNavHeight()
    const observer = new ResizeObserver(syncNavHeight)
    observer.observe(bar)
    window.addEventListener('resize', syncNavHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncNavHeight)
    }
  }, [mounted])

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

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const siteNav = (
    <nav className={`site-nav ${onDark ? 'nav--on-dark' : 'nav--on-light'}`}>
      <div ref={barRef} className="nav__bar">
        <div className="container">
          <div className="nav__inner">
            <HomeLink aria-label="PHOS home" className="nav__logo">
              <Wordmark />
            </HomeLink>

            <span className="nav-sub nav__tag">Circadian Health</span>

            <button
              type="button"
              className="nav-menu-btn nav__menu"
              aria-expanded={open}
              aria-controls="nav-menu-panel"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="nav-menu-btn__icon" aria-hidden>
                +
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )

  const menuPanel =
    open && mounted ? (
      createPortal(
        <div
          id="nav-menu-panel"
          className="nav-menu-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          onClick={() => setOpen(false)}
        >
          <div
            className="container nav-menu-panel__inner"
            onClick={(event) => event.stopPropagation()}
          >
            {SITE_LINKS.map((link) =>
              link.href === '/#hero' ? (
                <HomeLink
                  key={link.href}
                  href={link.href}
                  className="nav-menu-link"
                  onNavigate={() => setOpen(false)}
                >
                  {link.label}
                </HomeLink>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-menu-link"
                  onClick={() => {
                    setOpen(false)
                    if (pathname === link.href) scrollToPageTop()
                  }}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>
        </div>,
        document.body,
      )
    ) : null

  return (
    <>
      {mounted ? createPortal(siteNav, document.body) : siteNav}
      {menuPanel}
    </>
  )
}
