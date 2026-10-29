import * as THREE from 'three'

/**
 * Single continuous camera journey through five narrative zones.
 * Control points are spaced so Hero → About → Projects → Skills → Contact
 * map cleanly onto progress t ∈ [0, 1].
 */
const CONTROL_POINTS = [
  new THREE.Vector3(0, 2, 28), // start / approach
  new THREE.Vector3(-2, 1.5, 18), // hero space
  new THREE.Vector3(-6, 0.5, 8), // drift left
  new THREE.Vector3(-4, -0.5, -2), // about
  new THREE.Vector3(2, 1, -12), // arc toward projects
  new THREE.Vector3(8, 0.2, -20), // projects
  new THREE.Vector3(4, -1, -30), // soft dive
  new THREE.Vector3(-3, 0.8, -40), // skills
  new THREE.Vector3(-8, 1.5, -50), // sweep
  new THREE.Vector3(-2, 0.5, -60), // contact approach
  new THREE.Vector3(0, 1.2, -72), // contact hold
]

const LOOK_OFFSET = new THREE.Vector3(0, 0.35, -6)

export function createCameraPath() {
  const curve = new THREE.CatmullRomCurve3(CONTROL_POINTS, false, 'catmullrom', 0.45)
  curve.curveType = 'catmullrom'

  const lookPoints = CONTROL_POINTS.map((p) => p.clone().add(LOOK_OFFSET))
  const lookCurve = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.45)

  const tmpPos = new THREE.Vector3()
  const tmpLook = new THREE.Vector3()
  const tmpTangent = new THREE.Vector3()

  function clampT(t) {
    return THREE.MathUtils.clamp(t, 0, 1)
  }

  return {
    curve,
    lookCurve,
    getPointAt(t, target = tmpPos) {
      return curve.getPointAt(clampT(t), target)
    },
    getLookAt(t, target = tmpLook) {
      return lookCurve.getPointAt(clampT(t), target)
    },
    getTangentAt(t, target = tmpTangent) {
      return curve.getTangentAt(clampT(t), target).normalize()
    },
  }
}

/** Approximate progress centers for each narrative zone */
export const SECTION_CENTERS = {
  hero: 0.06,
  about: 0.28,
  projects: 0.5,
  skills: 0.72,
  contact: 0.92,
}

export const SECTION_RANGES = {
  hero: [0, 0.16],
  about: [0.16, 0.38],
  projects: [0.38, 0.6],
  skills: [0.6, 0.82],
  contact: [0.82, 1.01],
}
