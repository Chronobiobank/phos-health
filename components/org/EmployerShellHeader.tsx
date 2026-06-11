'use client'

import Link from 'next/link'
import { useMemo, useRef } from 'react'

import { CondensedNavMenu, type CondensedNavItem } from '@/components/CondensedNavMenu'
import Wordmark from '@/components/Wordmark'

type EmployerShellHeaderProps = {
  signedIn: boolean
}

export function EmployerShellHeader({ signedIn }: EmployerShellHeaderProps) {
  const barRef = useRef<HTMLElement>(null)

  const items = useMemo<CondensedNavItem[]>(() => {
    const links: CondensedNavItem[] = [
      { kind: 'link', href: '/org', label: 'Cohort' },
      { kind: 'link', href: '/for-firms', label: 'Model' },
      { kind: 'link', href: '/dashboard', label: 'My profile' },
      { kind: 'link', href: '/', label: 'Home' },
    ]

    if (signedIn) {
      links.push({ kind: 'form', label: 'Sign out', action: '/auth/signout' })
    } else {
      links.push({ kind: 'link', href: '/auth/signin?next=/org', label: 'Sign in' })
    }

    return links
  }, [signedIn])

  return (
    <header ref={barRef} className="dashboard-shell__bar">
      <div className="container dashboard-shell__inner">
        <Link href="/org" className="dashboard-shell__logo" aria-label="PHOS employer dashboard">
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
