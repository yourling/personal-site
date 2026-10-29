import * as THREE from 'three'
import { SECTION_CENTERS } from './camera-path.js'

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x03040a, 1)
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x03040a, 0.018)

  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    400,
  )

  // Soft ambient + two dim point lights
  scene.add(new THREE.AmbientLight(0x6a7898, 0.35))

  const key = new THREE.PointLight(0xb8c8ef, 1.1, 80, 2)
  key.position.set(4, 8, 10)
  scene.add(key)

  const fill = new THREE.PointLight(0x7a90c8, 0.55, 100, 2)
  fill.position.set(-10, -2, -30)
  scene.add(fill)

  addStarField(scene)
  const landmarks = addLandmarks(scene)

  function onResize() {
    const w = window.innerWidth
    const h = window.innerHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(w, h)
  }

  window.addEventListener('resize', onResize)

  return {
    scene,
    camera,
    renderer,
    landmarks,
    render() {
      renderer.render(scene, camera)
    },
    dispose() {
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    },
  }
}

function addStarField(scene) {
  const count = 2200
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const color = new THREE.Color()

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 160
    positions[i3 + 1] = (Math.random() - 0.5) * 90
    positions[i3 + 2] = -Math.random() * 140 + 40

    const cool = Math.random()
    color.setHSL(0.58 + cool * 0.08, 0.25, 0.55 + Math.random() * 0.4)
    colors[i3] = color.r
    colors[i3 + 1] = color.g
    colors[i3 + 2] = color.b
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const mat = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    sizeAttenuation: true,
  })

  const stars = new THREE.Points(geo, mat)
  stars.name = 'stars'
  scene.add(stars)
  return stars
}

function addLandmarks(scene) {
  const group = new THREE.Group()
  group.name = 'landmarks'
  scene.add(group)

  const mat = new THREE.MeshBasicMaterial({
    color: 0x8ea4d8,
    wireframe: true,
    transparent: true,
    opacity: 0.22,
  })

  const zones = [
    { key: 'hero', scale: 3.2, rot: 0.2 },
    { key: 'about', scale: 2.6, rot: 0.55 },
    { key: 'projects', scale: 3.6, rot: 1.1 },
    { key: 'skills', scale: 2.4, rot: 1.7 },
    { key: 'contact', scale: 3.0, rot: 2.2 },
  ]

  const items = {}

  for (const z of zones) {
    const t = SECTION_CENTERS[z.key]
    // Place landmark near path z; approximate from known centers via path later if needed
    const mesh =
      z.key === 'projects'
        ? new THREE.Mesh(new THREE.TorusGeometry(z.scale, 0.04, 8, 48), mat.clone())
        : z.key === 'skills'
          ? new THREE.Mesh(new THREE.OctahedronGeometry(z.scale * 0.7, 0), mat.clone())
          : new THREE.Mesh(new THREE.RingGeometry(z.scale * 0.7, z.scale, 48), mat.clone())

    mesh.rotation.x = Math.PI / 2 + z.rot * 0.15
    mesh.rotation.z = z.rot
    mesh.userData.section = z.key
    mesh.userData.baseOpacity = 0.22
    group.add(mesh)
    items[z.key] = mesh
  }

  // Rough positions along the journey (match camera-path control points)
  items.hero.position.set(0, 0, 16)
  items.about.position.set(-4, -0.8, -2)
  items.projects.position.set(8, 0, -20)
  items.skills.position.set(-3, 0.2, -40)
  items.contact.position.set(0, 0.4, -62)

  // Faint floor grid plane under contact
  const grid = new THREE.GridHelper(18, 12, 0x3a4660, 0x1c2233)
  grid.position.set(0, -2.2, -62)
  grid.material.transparent = true
  grid.material.opacity = 0.25
  group.add(grid)

  return { group, items }
}
