import './style.css'
import * as THREE from 'three'
import { createScene } from './scene.js'
import { createCameraPath } from './camera-path.js'
import { createScrollController } from './scroll.js'
import { createUI } from './ui.js'

const canvas = document.getElementById('webgl')
const { scene, camera, renderer, landmarks, render, dispose: disposeScene } =
  createScene(canvas)

const path = createCameraPath()
const controller = createScrollController()
createUI(controller)

const pos = new THREE.Vector3()
const look = new THREE.Vector3()
const up = new THREE.Vector3(0, 1, 0)

let last = performance.now()

function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now

  const t = controller.update(dt)

  path.getPointAt(t, pos)
  path.getLookAt(t, look)
  camera.position.copy(pos)
  camera.up.copy(up)
  camera.lookAt(look)

  // Subtle landmark pulse near current zone
  if (landmarks?.items) {
    for (const mesh of Object.values(landmarks.items)) {
      mesh.rotation.z += dt * 0.08
      const mat = mesh.material
      if (mat && 'opacity' in mat) {
        mat.opacity = mesh.userData.baseOpacity + Math.sin(now * 0.001 + mesh.rotation.z) * 0.04
      }
    }
  }

  // Slow star drift
  const stars = scene.getObjectByName('stars')
  if (stars) stars.rotation.y += dt * 0.004

  render()
  requestAnimationFrame(tick)
}

// Place camera at start before first frame
path.getPointAt(0, pos)
path.getLookAt(0, look)
camera.position.copy(pos)
camera.lookAt(look)
render()
requestAnimationFrame(tick)

window.addEventListener('beforeunload', () => {
  controller.dispose()
  disposeScene()
})
