import * as THREE from 'three'

/**
 * 3D 场景统一接口：后续宿舍、办公室、绿荫大道场景均按此契约迭代开发
 */
export interface Scene3DContext {
  scene: THREE.Scene
  /** 不可穿越的碰撞体（书架、桌椅等） */
  colliders: THREE.Box3[]
  /** 可行走边界 */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
  /** 可选相机参数（户外大场景可放宽缩放距离、自定义初始机位） */
  camera?: {
    maxDistance?: number
    initialPosition?: [number, number, number]
    initialTarget?: [number, number, number]
  }
  /** 每帧环境动画（灯光微动、漂浮尘埃等） */
  update: (elapsed: number) => void
  dispose: () => void
}

const ROOM = { width: 26, depth: 18, height: 6 }

const BOOK_COLORS = [0xc0392b, 0xd35400, 0xf1c40f, 0x27ae60, 0x2980b9, 0x8e44ad, 0x16a085]

function makeBookshelf(): { group: THREE.Group; collider: THREE.Box3 } {
  const group = new THREE.Group()
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x6d4c41, roughness: 0.8 })
  const backMat = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9 })

  const width = 3.2
  const height = 3.4
  const depth = 0.9

  const back = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.08), backMat)
  back.position.set(0, height / 2, -depth / 2)
  group.add(back)

  // 侧板与顶底板
  const sideGeo = new THREE.BoxGeometry(0.12, height, depth)
  const left = new THREE.Mesh(sideGeo, frameMat)
  left.position.set(-width / 2, height / 2, 0)
  const right = left.clone()
  right.position.x = width / 2
  group.add(left, right)

  const topGeo = new THREE.BoxGeometry(width, 0.12, depth)
  const top = new THREE.Mesh(topGeo, frameMat)
  top.position.set(0, height, 0)
  const bottom = top.clone()
  bottom.position.y = 0.06
  group.add(top, bottom)

  // 四层隔板 + 每层一排彩色书脊
  const shelfGeo = new THREE.BoxGeometry(width - 0.2, 0.08, depth - 0.1)
  for (let row = 0; row < 4; row++) {
    const shelfY = 0.15 + row * 0.82
    const shelf = new THREE.Mesh(shelfGeo, frameMat)
    shelf.position.set(0, shelfY, 0)
    group.add(shelf)

    const bookRow = new THREE.Group()
    let cursor = -width / 2 + 0.22
    while (cursor < width / 2 - 0.3) {
      const bookW = 0.12 + Math.random() * 0.1
      const bookH = 0.5 + Math.random() * 0.18
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(bookW, bookH, 0.22),
        new THREE.MeshStandardMaterial({
          color: BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)],
          roughness: 0.7,
        })
      )
      book.position.set(cursor, shelfY + 0.04 + bookH / 2, depth / 2 - 0.2)
      bookRow.add(book)
      cursor += bookW + 0.03
    }
    group.add(bookRow)
  }

  const collider = new THREE.Box3(
    new THREE.Vector3(-width / 2, 0, -depth / 2 - 0.1),
    new THREE.Vector3(width / 2, height, depth / 2 + 0.1)
  )
  return { group, collider }
}

function makeTable(): { group: THREE.Group; collider: THREE.Box3 } {
  const group = new THREE.Group()
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x8d6e63, roughness: 0.7 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.4, metalness: 0.5 })

  const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.4), woodMat)
  top.position.y = 1.1
  group.add(top)

  const legGeo = new THREE.BoxGeometry(0.1, 1.1, 0.1)
  ;[
    [-1.2, 0.55, -0.6],
    [1.2, 0.55, -0.6],
    [-1.2, 0.55, 0.6],
    [1.2, 0.55, 0.6],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, metalMat)
    leg.position.set(x, y, z)
    group.add(leg)
  })

  // 桌上台灯与书本
  const lampBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 0.06, 16),
    new THREE.MeshStandardMaterial({ color: 0xffcc80, roughness: 0.5 })
  )
  lampBase.position.set(0.9, 1.19, 0.4)
  group.add(lampBase)
  const lampPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8),
    metalMat
  )
  lampPole.position.set(0.9, 1.45, 0.4)
  group.add(lampPole)
  const lampHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.2, 16),
    new THREE.MeshStandardMaterial({ color: 0xffe0b2, roughness: 0.5 })
  )
  lampHead.position.set(0.9, 1.72, 0.4)
  group.add(lampHead)

  const collider = new THREE.Box3(
    new THREE.Vector3(-1.35, 0, -0.75),
    new THREE.Vector3(1.35, 1.2, 0.75)
  )
  return { group, collider }
}

/**
 * 图书馆场景（3D 迭代第 1 个场景）
 */
export function createLibraryScene(): Scene3DContext {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf5f0e8)
  scene.fog = new THREE.Fog(0xf5f0e8, 22, 42)

  const colliders: THREE.Box3[] = []
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(obj: T): T => {
    disposables.push(obj)
    return obj
  }

  // 灯光：半球光 + 暖色平行光
  const hemi = new THREE.HemisphereLight(0xfff8e7, 0xbcaaa4, 0.95)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xfff3e0, 1.1)
  sun.position.set(6, 12, 8)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.left = -16
  sun.shadow.camera.right = 16
  sun.shadow.camera.top = 12
  sun.shadow.camera.bottom = -12
  scene.add(sun)

  // 地板
  const floorMat = track(new THREE.MeshStandardMaterial({ color: 0xd7ccc8, roughness: 0.85 }))
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  // 墙体（暖色奶油色）
  const wallMat = track(new THREE.MeshStandardMaterial({ color: 0xfff3e0, roughness: 0.95 }))
  const wallGeo = new THREE.BoxGeometry(ROOM.width, ROOM.height, 0.3)
  const northWall = new THREE.Mesh(wallGeo, wallMat)
  northWall.position.set(0, ROOM.height / 2, -ROOM.depth / 2)
  const southWall = northWall.clone()
  southWall.position.z = ROOM.depth / 2
  const sideWallGeo = new THREE.BoxGeometry(0.3, ROOM.height, ROOM.depth)
  const westWall = new THREE.Mesh(sideWallGeo, wallMat)
  westWall.position.set(-ROOM.width / 2, ROOM.height / 2, 0)
  const eastWall = westWall.clone()
  eastWall.position.x = ROOM.width / 2
  scene.add(northWall, southWall, westWall, eastWall)

  // 书架：两侧贴墙 + 中间两排
  const shelfPlacements: { x: number; z: number; rotY: number }[] = [
    { x: -11, z: -4.5, rotY: Math.PI / 2 },
    { x: -11, z: 0, rotY: Math.PI / 2 },
    { x: -11, z: 4.5, rotY: Math.PI / 2 },
    { x: 11, z: -4.5, rotY: Math.PI / 2 },
    { x: 11, z: 0, rotY: Math.PI / 2 },
    { x: 11, z: 4.5, rotY: Math.PI / 2 },
    { x: -3.2, z: -6.2, rotY: 0 },
    { x: 3.2, z: -6.2, rotY: 0 },
  ]
  shelfPlacements.forEach((p) => {
    const shelf = makeBookshelf()
    shelf.group.position.set(p.x, 0, p.z)
    shelf.group.rotation.y = p.rotY
    shelf.group.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        o.receiveShadow = true
        track(o.geometry)
        const mat = o.material
        if (Array.isArray(mat)) mat.forEach(track)
        else track(mat)
      }
    })
    scene.add(shelf.group)
    // 书架分组已设置位移与旋转，更新世界矩阵后从对象计算精确碰撞盒
    shelf.group.updateWorldMatrix(true, false)
    const box = new THREE.Box3()
    box.setFromObject(shelf.group)
    colliders.push(box)
  })

  // 阅读桌椅：两列四组
  const tablePlacements = [
    { x: -4, z: 2.5 },
    { x: 4, z: 2.5 },
    { x: -4, z: 6 },
    { x: 4, z: 6 },
  ]
  tablePlacements.forEach((p) => {
    const table = makeTable()
    table.group.position.set(p.x, 0, p.z)
    table.group.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true
        o.receiveShadow = true
        track(o.geometry)
        const mat = o.material
        if (Array.isArray(mat)) mat.forEach(track)
        else track(mat)
      }
    })
    scene.add(table.group)
    table.group.updateWorldMatrix(true, false)
    const box = new THREE.Box3().setFromObject(table.group)
    colliders.push(box)
  })

  // 空中漂浮的尘埃光点，营造图书馆静谧氛围
  const dustCount = 120
  const dustPositions = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * (ROOM.width - 2)
    dustPositions[i * 3 + 1] = Math.random() * (ROOM.height - 1) + 0.5
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * (ROOM.depth - 2)
  }
  const dustGeo = track(new THREE.BufferGeometry())
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
  const dustMat = track(new THREE.PointsMaterial({ color: 0xffe0b2, size: 0.06, transparent: true, opacity: 0.7 }))
  const dust = new THREE.Points(dustGeo, dustMat)
  scene.add(dust)

  const bounds = {
    minX: -ROOM.width / 2 + 0.6,
    maxX: ROOM.width / 2 - 0.6,
    minZ: -ROOM.depth / 2 + 0.6,
    maxZ: ROOM.depth / 2 - 0.6,
  }

  return {
    scene,
    colliders,
    bounds,
    update: (elapsed: number) => {
      dust.rotation.y = elapsed * 0.03
      dust.position.y = Math.sin(elapsed * 0.4) * 0.15
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose())
      scene.clear()
    },
  }
}
