function scrollWithSnapDisabled(scroll: () => void) {
  const html = document.documentElement
  const previousSnap = html.style.scrollSnapType

  html.style.scrollSnapType = 'none'
  scroll()

  requestAnimationFrame(() => {
    scroll()
    html.style.scrollSnapType = previousSnap || ''
  })
}

/** Scroll to the hero without scroll-snap overshooting into section 01. */
export function scrollToHome() {
  scrollWithSnapDisabled(() => {
    window.history.replaceState(null, '', window.location.pathname)
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  })
}

/** Scroll to the top of the current page (detail routes, post-navigation). */
export function scrollToPageTop() {
  scrollWithSnapDisabled(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  })
}
