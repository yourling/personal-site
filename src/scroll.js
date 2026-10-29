/**
 * Maps scroll position and/or autoplay to a damped progress t ∈ [0, 1].
 * User scroll while autoplay is on pauses autoplay (scroll takes over).
 */

const AUTOPLAY_SPEED = 0.018 // progress units per second
const DAMP = 0.08
const LOOP_HOLD = 1.8 // seconds to hold at end before gentle restart

export function createScrollController({ onChange } = {}) {
  let target = 0
  let current = 0
  let autoplay = false
  let holdTimer = 0
  let lastScrollY = window.scrollY
  let scrollingFromCode = false
  let listeners = new Set()

  if (typeof onChange === 'function') listeners.add(onChange)

  function maxScroll() {
    const doc = document.documentElement
    return Math.max(1, doc.scrollHeight - window.innerHeight)
  }

  function progressFromScroll() {
    return Math.min(1, Math.max(0, window.scrollY / maxScroll()))
  }

  function setAutoplay(next) {
    autoplay = Boolean(next)
    holdTimer = 0
    notifyUi()
  }

  function toggleAutoplay() {
    setAutoplay(!autoplay)
    return autoplay
  }

  function seek(t, { syncScroll = true } = {}) {
    target = Math.min(1, Math.max(0, t))
    if (syncScroll) {
      scrollingFromCode = true
      window.scrollTo({ top: target * maxScroll(), behavior: 'auto' })
      requestAnimationFrame(() => {
        scrollingFromCode = false
      })
    }
  }

  function onScroll() {
    if (scrollingFromCode) {
      lastScrollY = window.scrollY
      return
    }
    const y = window.scrollY
    if (Math.abs(y - lastScrollY) > 1 && autoplay) {
      // User took over — pause autoplay
      setAutoplay(false)
    }
    lastScrollY = y
    target = progressFromScroll()
  }

  window.addEventListener('scroll', onScroll, { passive: true })

  // Initialize from current scroll
  target = progressFromScroll()
  current = target

  function notifyUi() {
    for (const fn of listeners) fn({ t: current, autoplay })
  }

  function update(dt) {
    if (autoplay) {
      if (target >= 0.999) {
        holdTimer += dt
        if (holdTimer >= LOOP_HOLD) {
          holdTimer = 0
          seek(0)
        }
      } else {
        holdTimer = 0
        target = Math.min(1, target + AUTOPLAY_SPEED * dt)
        scrollingFromCode = true
        window.scrollTo({ top: target * maxScroll(), behavior: 'auto' })
        requestAnimationFrame(() => {
          scrollingFromCode = false
        })
      }
    }

    // Exponential damp toward target
    const alpha = 1 - Math.exp(-DAMP * 60 * dt)
    current += (target - current) * alpha

    if (Math.abs(target - current) < 0.00005) current = target

    notifyUi()
    return current
  }

  function subscribe(fn) {
    listeners.add(fn)
    return () => listeners.delete(fn)
  }

  return {
    update,
    seek,
    toggleAutoplay,
    setAutoplay,
    isAutoplay: () => autoplay,
    get t() {
      return current
    },
    get target() {
      return target
    },
    subscribe,
    dispose() {
      window.removeEventListener('scroll', onScroll)
      listeners.clear()
    },
  }
}
