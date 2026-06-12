/** Marketing site nav (portaled CondensedNavMenu on public pages). */
export const SITE_LINKS = [
  { href: '/score', label: 'Free score' },
  { href: '/shop', label: 'Shop' },
  { href: '/pathway', label: 'Pathway' },
  { href: '/research/photonic-age', label: 'Research' },
  { href: '/dashboard', label: 'Dashboard' },
] as const

/** Member shell nav (dashboard, shop, onboarding, daily cue, chronobiobank). */
export const DASHBOARD_SHELL_LINKS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/daily-cue', label: 'Daily Cue' },
  { href: '/pathway', label: 'Pathway' },
  { href: '/shop', label: 'Shop' },
  { href: '/onboarding', label: 'Connect' },
  { href: '/chronobiobank', label: 'Chronobiobank' },
] as const

export const FOOTER_LINKS = [
  { href: '/pathway', label: 'Pathway' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
  { href: '/chronobiobank', label: 'Chronobiobank' },
] as const
