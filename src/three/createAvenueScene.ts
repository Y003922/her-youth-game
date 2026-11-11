import * as THREE from 'three'
import type { Scene3DContext } from './createLibraryScene'

/**
 * 3D 绿荫大道场景（迭代第 4 个，户外）
 * 纵向铺展的校园主干道：两排香樟树、长椅、路灯、草坪与漂移的云
 */
const PATH = { width: 8, length: 44 }
const GROUND_SIZE = 60

function makeTree(): { group: THREE.Group } {
  const group = new THREE.Group()
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.9 })
  const leafMats = [
    new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.9 }),
    new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.9 }),
  ]

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 2.6, 10), trunkMat)
  trunk.position.y = 1.3
  trunk.castShadow = true
  group.add(trunk)

  // 三层球状树冠
  const crown1 = new THREE.Mesh(new THREE.SphereGeometry(1.35, 14, 12), leafMats[0])
  crown1.position.y = 3.1
  crown1.castShadow = true
  const crown2 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 10), leafMats[1])
  crown2.position.set(-0.7, 3.6, 0.2)
  crown2.castShadow = true
  const crown3 = new THREE.Mesh(new THREE.SphereGeometry(0.95, 12, 10), leafMats[2])
  crown3.position.set(0.75, 3.5, -0.25)
  crown3.castShadow = true
  group.add(crown1, crown2, crown3)

  return { group }
}

function makeBench(): { group: THREE.Group } {
  const group = new THREE.Group()
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.8 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.4, metalness: 0.6 })

  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.6), woodMat)
  seat.position.y = 0.55
  group.add(seat)
  const back = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 0.1), woodMat)
  back.position.set(0, 0.95, -0.32)
  back.rotation.x = -0.12
  group.add(back)
  const legGeo = new THREE.BoxGeometry(0.1, 0.55, 0.1)
  ;[
    [-0.9, 0.27, 0.2],
    [0.9, 0.27, 0.2],
    [-0.9, 0.27, -0.2],
    [0.9, 0.27, -0.2],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, metalMat)
    leg.position.set(x, y, z)
    group.add(leg)
  })
  return { group }
}

function makeLamp(): { group: THREE.Group } {
  const group = new THREE.Group()
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.4, metalness: 0.6 })
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 10), metalMat)
  pole.position.y = 2.1
  pole.castShadow = true
  group.add(pole)
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.08), metalMat)
  arm.position.set(0.35, 4.15, 0)
  group.add(arm)
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0xfff9c4,
      emissive: 0xfff59d,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    })
  )
  bulb.position.set(0.72, 4.05, 0)
  group.add(bulb)
  return { group }
}

export function createAvenueScene(): Scene3DContext {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xaed6f7)
  scene.fog = new THREE.Fog(0xc8e3f7, 30, 58)

  const colliders: THREE.Box3[] = []
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(obj: T): T => {
    disposables.push(obj)
    return obj
  }

  // 户外阳光
  const hemi = new THREE.HemisphereLight(0xb3e5fc, 0x81c784, 0.95)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xfff8e1, 1.35)
  sun.position.set(10, 18, 8)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.camera.left = -22
  sun.shadow.camera.right = 22
  sun.shadow.camera.top = 26
  sun.shadow.camera.bottom = -26
  sun.shadow.camera.far = 60
  scene.add(sun)

  // 草坪地面
  const grassMat = track(new THREE.MeshStandardMaterial({ color: 0x7cb342, roughness: 1 }))
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE), grassMat)
  grass.rotation.x = -Math.PI / 2
  grass.receiveShadow = true
  scene.add(grass)

  // 中央步道（浅灰石板）
  const pathMat = track(new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.9 }))
  const path = new THREE.Mesh(new THREE.PlaneGeometry(PATH.width, PATH.length), pathMat)
  path.rotation.x = -Math.PI / 2
  path.position.y = 0.02
  path.receiveShadow = true
  scene.add(path)
  // 石板接缝
  const seamMat = new THREE.MeshStandardMaterial({ color: 0xbcaaa4, roughness: 0.9 })
  for (let z = -PATH.length / 2 + 2; z < PATH.length / 2; z += 2) {
    const seam = new THREE.Mesh(new THREE.BoxGeometry(PATH.width, 0.01, 0.06), seamMat)
    seam.position.set(0, 0.035, z)
    scene.add(seam)
  }

  const place = (group: THREE.Group, x: number, z: number, rotY = 0, withCollider = true) => {
    group.position.set(x, 0, z)
    group.rotation.y = rotY
    group.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        o.receiveShadow = true
        track(o.geometry)
        const mat = o.material
        if (Array.isArray(mat)) mat.forEach(track)
        else track(mat)
      }
    })
    scene.add(group)
    if (withCollider) {
      group.updateWorldMatrix(true, false)
      colliders.push(new THREE.Box3().setFromObject(group))
    }
  }

  // 两排树（各 6 棵），树身做碰撞
  const treeZ = [-18, -11, -4, 3, 10, 17]
  treeZ.forEach((z, i) => {
    const jitter = (i % 2 === 0 ? 0.4 : -0.4)
    place(makeTree().group, -6.2 + jitter, z, 0, true)
    place(makeTree().group, 6.2 - jitter, z + 1.2, 0, true)
  })

  // 长椅（两侧各 2 张，朝向步道）
  place(makeBench().group, -4.6, -8, Math.PI / 2)
  place(makeBench().group, 4.6, -8, -Math.PI / 2)
  place(makeBench().group, -4.6, 8, Math.PI / 2)
  place(makeBench().group, 4.6, 8, -Math.PI / 2)

  // 路灯（两侧各 3 盏，不做碰撞避免过于拥挤）
  ;[-15, 0, 15].forEach((z) => {
    place(makeLamp().group, -3.6, z, 0, false)
    place(makeLamp().group, 3.6, z, 0, false)
  })

  // 灌木点缀
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x558b2f, roughness: 0.95 })
  for (let i = 0; i < 14; i++) {
    const bush = new THREE.Mesh(new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 10, 8), bushMat)
    const side = i % 2 === 0 ? -1 : 1
    bush.position.set(side * (8 + Math.random() * 3), 0.35, -20 + Math.random() * 40)
    bush.scale.y = 0.7
    bush.castShadow = true
    scene.add(bush)
  }

  // 漂移的云
  const clouds: THREE.Mesh[] = []
  const cloudMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: 0.92 })
  for (let i = 0; i < 5; i++) {
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(1.6 + Math.random() * 0.8, 12, 10), cloudMat)
    cloud.position.set(-20 + Math.random() * 40, 11 + Math.random() * 3, -22 + Math.random() * 44)
    cloud.scale.set(1.8, 0.7, 1.2)
    clouds.push(cloud)
    scene.add(cloud)
  }

  const bounds = {
    minX: -5.6,
    maxX: 5.6,
    minZ: -PATH.length / 2 + 1.5,
    maxZ: PATH.length / 2 - 1.5,
  }

  return {
    scene,
    colliders,
    bounds,
    camera: {
      maxDistance: 26,
      initialPosition: [0, 6.5, 13] as [number, number, number],
      initialTarget: [0, 1.2, 0] as [number, number, number],
    },
    update: (_elapsed: number) => {
      clouds.forEach((c, i) => {
        c.position.x += 0.012 * (1 + i * 0.15)
        if (c.position.x > 24) c.position.x = -24
      })
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose())
      scene.clear()
    },
  }
}
