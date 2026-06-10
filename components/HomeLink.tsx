'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={className}
      onClick={(event) => {
        onNavigate?.()
        if (pathname === '/') {
          event.preventDefault()
          scrollToHome()
        }
      }}
    >
      {children}
    </Link>
  )
}
