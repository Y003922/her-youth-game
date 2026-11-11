import * as THREE from 'three'
import type { Scene3DContext } from './createLibraryScene'

/**
 * 3D 宿舍场景（迭代第 2 个）
 * 温馨的四人宿舍切片：两张单人床、两套书桌椅、衣柜、窗户与暖光
 */
const ROOM = { width: 10, depth: 12, height: 5 }

function makeBed(blanketColor: number): { group: THREE.Group } {
  const group = new THREE.Group()
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.75 })
  const mattressMat = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.9 })
  const blanketMat = new THREE.MeshStandardMaterial({ color: blanketColor, roughness: 0.85 })
  const pillowMat = new THREE.MeshStandardMaterial({ color: 0xfff0f5, roughness: 0.9 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.4, metalness: 0.6 })

  // 床架
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.3, 3), woodMat)
  frame.position.y = 0.45
  group.add(frame)
  const legGeo = new THREE.BoxGeometry(0.12, 0.45, 0.12)
  ;[
    [-0.65, 0.22, -1.35],
    [0.65, 0.22, -1.35],
    [-0.65, 0.22, 1.35],
    [0.65, 0.22, 1.35],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, metalMat)
    leg.position.set(x, y, z)
    group.add(leg)
  })

  // 床垫
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.22, 2.85), mattressMat)
  mattress.position.y = 0.7
  group.add(mattress)

  // 被子（靠床尾）
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.12, 1.7), blanketMat)
  blanket.position.set(0, 0.86, 0.5)
  group.add(blanket)

  // 枕头（靠床头）
  const pillow = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.5), pillowMat)
  pillow.position.set(0, 0.88, -1.1)
  group.add(pillow)

  return { group }
}

function makeDesk(): { group: THREE.Group } {
  const group = new THREE.Group()
  const woodMat = new THREE.MeshStandardMaterial({ color: 0xa1887f, roughness: 0.7 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x607d8b, roughness: 0.4, metalness: 0.5 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.5 })

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 1.1), woodMat)
  top.position.y = 1.05
  group.add(top)
  const legGeo = new THREE.BoxGeometry(0.08, 1.05, 0.08)
  ;[
    [-0.8, 0.52, -0.45],
    [0.8, 0.52, -0.45],
    [-0.8, 0.52, 0.45],
    [0.8, 0.52, 0.45],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, metalMat)
    leg.position.set(x, y, z)
    group.add(leg)
  })

  // 笔记本电脑
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.04, 0.45), darkMat)
  base.position.set(-0.2, 1.13, 0.1)
  group.add(base)
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.45, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.3, emissive: 0x1a237e, emissiveIntensity: 0.25 })
  )
  screen.position.set(-0.2, 1.38, -0.12)
  screen.rotation.x = -0.15
  group.add(screen)

  // 一摞书
  const bookColors = [0xe57373, 0x64b5f6, 0xffb74d]
  bookColors.forEach((c, i) => {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.06, 0.3),
      new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 })
    )
    book.position.set(0.55, 1.13 + i * 0.065, 0.25)
    group.add(book)
  })

  // 椅子
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 0.7), woodMat)
  seat.position.set(0, 0.6, 0.95)
  group.add(seat)
  const chairLegGeo = new THREE.BoxGeometry(0.07, 0.6, 0.07)
  ;[
    [-0.28, 0.3, 0.7],
    [0.28, 0.3, 0.7],
    [-0.28, 0.3, 1.2],
    [0.28, 0.3, 1.2],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(chairLegGeo, metalMat)
    leg.position.set(x, y, z)
    group.add(leg)
  })
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.08), woodMat)
  back.position.set(0, 1.0, 1.28)
  group.add(back)

  return { group }
}

export function createDormScene(): Scene3DContext {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xfff6ec)
  scene.fog = new THREE.Fog(0xfff6ec, 16, 30)

  const colliders: THREE.Box3[] = []
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(obj: T): T => {
    disposables.push(obj)
    return obj
  }

  // 灯光：暖色调，模拟宿舍顶灯 + 窗外日光
  const hemi = new THREE.HemisphereLight(0xfff3e0, 0xbcaaa4, 0.85)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xffe0b2, 1.0)
  sun.position.set(-4, 9, 6)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.left = -10
  sun.shadow.camera.right = 10
  sun.shadow.camera.top = 10
  sun.shadow.camera.bottom = -10
  scene.add(sun)
  const ceilingLamp = new THREE.PointLight(0xffd9a0, 0.5, 14)
  ceilingLamp.position.set(0, 4.4, 0)
  scene.add(ceilingLamp)

  // 木地板
  const floorMat = track(new THREE.MeshStandardMaterial({ color: 0xd7a97e, roughness: 0.8 }))
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // 墙体
  const wallMat = track(new THREE.MeshStandardMaterial({ color: 0xfff0e0, roughness: 0.95 }))
  const northWall = new THREE.Mesh(new THREE.BoxGeometry(ROOM.width, ROOM.height, 0.25), wallMat)
  northWall.position.set(0, ROOM.height / 2, -ROOM.depth / 2)
  const southWall = northWall.clone()
  southWall.position.z = ROOM.depth / 2
  const sideGeo = new THREE.BoxGeometry(0.25, ROOM.height, ROOM.depth)
  const westWall = new THREE.Mesh(sideGeo, wallMat)
  westWall.position.set(-ROOM.width / 2, ROOM.height / 2, 0)
  const eastWall = westWall.clone()
  eastWall.position.x = ROOM.width / 2
  scene.add(northWall, southWall, westWall, eastWall)

  // 窗户（北墙）：发光玻璃 + 十字窗框
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xb3e5fc,
    emissive: 0x81d4fa,
    emissiveIntensity: 0.5,
    roughness: 0.2,
  })
  const glass = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 0.06), glassMat)
  glass.position.set(0, 2.6, -ROOM.depth / 2 + 0.16)
  scene.add(glass)
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
  const frameV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.2, 0.1), frameMat)
  frameV.position.set(0, 2.6, -ROOM.depth / 2 + 0.2)
  const frameH = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.08, 0.1), frameMat)
  frameH.position.set(0, 2.6, -ROOM.depth / 2 + 0.2)
  scene.add(frameV, frameH)

  // 海报（西墙）
  const poster = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 1.1, 0.8),
    new THREE.MeshStandardMaterial({ color: 0xf48fb1, roughness: 0.85 })
  )
  poster.position.set(-ROOM.width / 2 + 0.16, 2.4, -2.5)
  scene.add(poster)

  // 家具摆放与碰撞注册
  const place = (group: THREE.Group, x: number, z: number, rotY = 0) => {
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
    group.updateWorldMatrix(true, false)
    colliders.push(new THREE.Box3().setFromObject(group))
  }

  // 两张床（东西两侧，床头朝北）
  place(makeBed(0xff8a80).group, -3.4, -2.6)
  place(makeBed(0x90caf9).group, 3.4, -2.6)

  // 两套书桌椅（靠南墙）
  place(makeDesk().group, -2.4, 4.2, Math.PI)
  place(makeDesk().group, 2.4, 4.2, Math.PI)

  // 衣柜（东墙）
  const wardrobeMat = new THREE.MeshStandardMaterial({ color: 0xbcaaa4, roughness: 0.75 })
  const wardrobe = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 0.8), wardrobeMat)
  wardrobe.position.set(ROOM.width / 2 - 0.55, 1.6, 2.6)
  wardrobe.traverse((o) => {
    if (o instanceof THREE.Mesh) track(o.geometry)
  })
  track(wardrobeMat)
  wardrobe.castShadow = true
  scene.add(wardrobe)
  wardrobe.updateWorldMatrix(true, false)
  colliders.push(new THREE.Box3().setFromObject(wardrobe))
  // 柜门把手
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.4, 0.05),
    new THREE.MeshStandardMaterial({ color: 0x5d4037, metalness: 0.7, roughness: 0.3 })
  )
  handle.position.set(ROOM.width / 2 - 1.38, 1.7, 2.6)
  scene.add(handle)

  // 小盆栽（窗边）
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.16, 0.35, 16),
    new THREE.MeshStandardMaterial({ color: 0xa1887f, roughness: 0.8 })
  )
  pot.position.set(2.2, 0.18, -5.2)
  pot.castShadow = true
  scene.add(pot)
  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0x66bb6a, roughness: 0.9 })
  )
  leaves.position.set(2.2, 0.75, -5.2)
  leaves.castShadow = true
  scene.add(leaves)

  // 漂浮尘埃
  const dustCount = 80
  const positions = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * (ROOM.width - 1)
    positions[i * 3 + 1] = Math.random() * (ROOM.height - 0.8) + 0.4
    positions[i * 3 + 2] = (Math.random() - 0.5) * (ROOM.depth - 1)
  }
  const dustGeo = track(new THREE.BufferGeometry())
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const dustMat = track(new THREE.PointsMaterial({ color: 0xffd9a0, size: 0.05, transparent: true, opacity: 0.65 }))
  const dust = new THREE.Points(dustGeo, dustMat)
  scene.add(dust)

  const bounds = {
    minX: -ROOM.width / 2 + 0.5,
    maxX: ROOM.width / 2 - 0.5,
    minZ: -ROOM.depth / 2 + 0.5,
    maxZ: ROOM.depth / 2 - 0.5,
  }

  return {
    scene,
    colliders,
    bounds,
    update: (elapsed: number) => {
      dust.rotation.y = elapsed * 0.025
      dust.position.y = Math.sin(elapsed * 0.35) * 0.12
      // 灯光轻微呼吸，模拟电流波动
      ceilingLamp.intensity = 0.48 + Math.sin(elapsed * 1.8) * 0.04
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose())
      scene.clear()
    },
  }
}
