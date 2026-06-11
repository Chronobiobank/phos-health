'use client'

import Link from 'next/link'
import { useMemo, useRef } from 'react'

import { CondensedNavMenu, type CondensedNavItem } from '@/components/CondensedNavMenu'
import Wordmark from '@/components/Wordmark'

type DashboardShellHeaderProps = {
  signedIn: boolean
}

export function DashboardShellHeader({ signedIn }: DashboardShellHeaderProps) {
  const barRef = useRef<HTMLElement>(null)

  const items = useMemo<CondensedNavItem[]>(() => {
    const links: CondensedNavItem[] = [
      { kind: 'link', href: '/dashboard', label: 'Overview' },
      { kind: 'link', href: '/onboarding', label: 'Connect' },
      { kind: 'link', href: '/daily-cue', label: 'Daily Cue' },
      { kind: 'link', href: '/shop', label: 'Shop' },
      { kind: 'link', href: '/chronobiobank', label: 'Chronobiobank' },
      { kind: 'link', href: '/org/join', label: 'Firm join' },
      { kind: 'link', href: '/', label: 'Home' },
    ]

    if (signedIn) {
      links.push({ kind: 'form', label: 'Sign out', action: '/auth/signout' })
    } else {
      links.push({ kind: 'link', href: '/auth/signin', label: 'Sign in' })
    }

    return links
  }, [signedIn])

  return (
    <header ref={barRef} className="dashboard-shell__bar">
      <div className="container dashboard-shell__inner">
        <Link href="/dashboard" className="dashboard-shell__logo" aria-label="PHOS dashboard">
          <Wordmark />
        </Link>
        <CondensedNavMenu
          items={items}
          measureRef={barRef}
          panelOffsetVar="--shell-nav-height"
          panelClassName="nav-menu-panel--shell"
        />
      </div>
    </header>
  )
}
