const SNAP_TARGETS = [document.documentElement, document.body]

function disableScrollSnap() {
  const previous = SNAP_TARGETS.map((node) => node.style.scrollSnapType)
  SNAP_TARGETS.forEach((node) => {
    node.style.scrollSnapType = 'none'
  })
  return previous
}

function restoreScrollSnap(previous: string[]) {
  SNAP_TARGETS.forEach((node, index) => {
    node.style.scrollSnapType = previous[index] || ''
  })
}

function pinHeroTop() {
  const hero = document.getElementById('hero')
  if (hero) {
    hero.scrollIntoView({ behavior: 'auto', block: 'start' })
  }
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

/** Scroll to the hero without scroll-snap overshooting into section 01. */
export function scrollToHome() {
  const previousSnap = disableScrollSnap()
  window.history.replaceState(null, '', `${window.location.pathname}#hero`)

  pinHeroTop()

  requestAnimationFrame(() => {
    pinHeroTop()
    requestAnimationFrame(() => {
      pinHeroTop()
      window.setTimeout(() => {
        restoreScrollSnap(previousSnap)
        pinHeroTop()
      }, 100)
    })
  })
}

/** Scroll to the top of the current page (detail routes, post-navigation). */
export function scrollToPageTop() {
  const previousSnap = disableScrollSnap()
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    requestAnimationFrame(() => {
      restoreScrollSnap(previousSnap)
    })
  })
}
