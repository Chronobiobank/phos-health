/** Scroll to the hero without scroll-snap overshooting into section 01. */
export function scrollToHome() {
  const html = document.documentElement
  const previousSnap = html.style.scrollSnapType

  html.style.scrollSnapType = 'none'
  window.history.replaceState(null, '', window.location.pathname)
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    html.style.scrollSnapType = previousSnap || ''
  })
}
