'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { scrollToHome } from '@/lib/scroll-home'

type HomeLinkProps = {
  href?: string
  className?: string
  'aria-label'?: string
  onNavigate?: () => void
  children: React.ReactNode
}

export function HomeLink({
  href = '/#hero',
  className,
  'aria-label': ariaLabel,
  onNavigate,
  children,
}: HomeLinkProps) {
  const pathname = usePathname()
  const router = useRouter()
  const goesHome = href === '/#hero' || href === '/' || href.endsWith('#hero')

  return (
    <Link
      href={goesHome ? '/#hero' : href}
      aria-label={ariaLabel}
      className={className}
      onClick={(event) => {
        onNavigate?.()
        if (!goesHome) return

        if (pathname === '/') {
          event.preventDefault()
          scrollToHome()
          return
        }

        event.preventDefault()
        router.push('/#hero')
      }}
    >
      {children}
    </Link>
  )
}
