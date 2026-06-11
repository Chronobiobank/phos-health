'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useLayoutEffect, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'

import { HomeLink } from '@/components/HomeLink'
import { scrollToPageTop } from '@/lib/scroll-home'

export type CondensedNavItem =
  | { kind: 'home'; href: string; label: string }
  | { kind: 'link'; href: string; label: string }
  | { kind: 'form'; label: string; action: string }

type CondensedNavMenuProps = {
  items: CondensedNavItem[]
  measureRef: RefObject<HTMLElement | null>
  panelOffsetVar?: string
  panelClassName?: string
}

export function CondensedNavMenu({
  items,
  measureRef,
  panelOffsetVar = '--nav-height',
  panelClassName = '',
}: CondensedNavMenuProps) {
  const pathname = usePathname()
  const panelId = useId()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useLayoutEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useLayoutEffect(() => {
    const bar = measureRef.current
    if (!bar) return

    const syncOffset = () => {
      document.documentElement.style.setProperty(panelOffsetVar, `${bar.offsetHeight}px`)
    }

    syncOffset()
    const observer = new ResizeObserver(syncOffset)
    observer.observe(bar)
    window.addEventListener('resize', syncOffset)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncOffset)
    }
  }, [mounted, measureRef, panelOffsetVar])

  useEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const panel =
    open && mounted
      ? createPortal(
          <div
            id={panelId}
            className={`nav-menu-panel ${panelClassName}`.trim()}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            onClick={() => setOpen(false)}
          >
            <div
              className="container nav-menu-panel__inner"
              onClick={(event) => event.stopPropagation()}
            >
              {items.map((item) => {
                if (item.kind === 'home') {
                  return (
                    <HomeLink
                      key={item.href}
                      href={item.href}
                      className="nav-menu-link"
                      onNavigate={() => setOpen(false)}
                    >
                      {item.label}
                    </HomeLink>
                  )
                }

                if (item.kind === 'form') {
                  return (
                    <form key={item.action} action={item.action} method="post">
                      <button type="submit" className="nav-menu-link nav-menu-link--action">
                        {item.label}
                      </button>
                    </form>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="nav-menu-link"
                    onClick={() => {
                      setOpen(false)
                      if (pathname === item.href) scrollToPageTop()
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      <button
        type="button"
        className="nav-menu-btn nav__menu"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="nav-menu-btn__hairline" aria-hidden />
      </button>
      {panel}
    </>
  )
}
