import { SECTION_RANGES } from './camera-path.js'

export function createUI(controller) {
  const panels = [...document.querySelectorAll('.panel')]
  const progressBar = document.getElementById('progress-bar')
  const autoplayBtn = document.getElementById('autoplay-btn')
  const navButtons = [...document.querySelectorAll('.nav [data-goto]')]

  function opacityFor(t, [a, b]) {
    const fade = 0.045
    if (t < a - fade || t > b + fade) return 0
    if (t < a) return (t - (a - fade)) / fade
    if (t > b) return 1 - (t - b) / fade
    return 1
  }

  function syncPanels(t) {
    let best = null
    let bestOp = 0
    for (const panel of panels) {
      const key = panel.dataset.section
      const range = SECTION_RANGES[key]
      if (!range) continue
      const op = opacityFor(t, range)
      if (op > bestOp) {
        bestOp = op
        best = panel
      }
    }
    for (const panel of panels) {
      panel.classList.toggle('is-active', panel === best && bestOp > 0.15)
    }
  }

  function syncProgress(t) {
    if (progressBar) progressBar.style.width = `${(t * 100).toFixed(2)}%`
  }

  function syncAutoplay(active) {
    if (!autoplayBtn) return
    autoplayBtn.setAttribute('aria-pressed', active ? 'true' : 'false')
    const icon = autoplayBtn.querySelector('.autoplay-icon')
    const label = autoplayBtn.querySelector('.autoplay-label')
    if (icon) icon.textContent = active ? '❚❚' : '▶'
    if (label) label.textContent = active ? '暂停' : '自动播放'
  }

  autoplayBtn?.addEventListener('click', () => {
    const on = controller.toggleAutoplay()
    syncAutoplay(on)
  })

  for (const btn of navButtons) {
    btn.addEventListener('click', () => {
      const t = Number(btn.dataset.goto)
      if (Number.isFinite(t)) {
        controller.setAutoplay(false)
        syncAutoplay(false)
        controller.seek(t)
      }
    })
  }

  controller.subscribe(({ t, autoplay }) => {
    syncPanels(t)
    syncProgress(t)
    syncAutoplay(autoplay)
  })

  // Initial paint
  syncPanels(controller.t)
  syncProgress(controller.t)
  syncAutoplay(controller.isAutoplay())

  return {
    dispose() {},
  }
}
