'use client'

import { useMemo, useRef } from 'react'

import { CondensedNavMenu, type CondensedNavItem } from '@/components/CondensedNavMenu'
import { HomeLink } from '@/components/HomeLink'
import Wordmark from '@/components/Wordmark'
import { DASHBOARD_SHELL_LINKS } from '@/lib/site-links'

type DashboardShellHeaderProps = {
  signedIn: boolean
}

export function DashboardShellHeader({ signedIn }: DashboardShellHeaderProps) {
  const barRef = useRef<HTMLElement>(null)

  const items = useMemo<CondensedNavItem[]>(() => {
    const links: CondensedNavItem[] = DASHBOARD_SHELL_LINKS.map((link) => ({
      kind: 'link',
      href: link.href,
      label: link.label,
    }))

    links.push(
      { kind: 'home', href: '/#hero', label: 'Home' },
      { kind: 'link', href: '/org/join', label: 'Firm join' },
    )

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
        <HomeLink className="dashboard-shell__logo" aria-label="PHOS home">
          <Wordmark />
        </HomeLink>
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
