import * as THREE from 'three'
import type { Scene3DContext } from './createLibraryScene'

/**
 * 3D 办公室场景（迭代第 3 个）
 * 开放工位区：2×2 格子间（电脑+隔板+办公椅）、文件柜、打印机、饮水机、白板
 */
const ROOM = { width: 16, depth: 14, height: 5.2 }

const screenMaterials: THREE.MeshStandardMaterial[] = []

function makeCubicle(): { group: THREE.Group } {
  const group = new THREE.Group()
  const deskMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, roughness: 0.6 })
  const partitionMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.85 })
  const metalMat = new THREE.MeshStandardMaterial({ color: 0x546e7a, roughness: 0.4, metalness: 0.5 })
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x263238, roughness: 0.4 })

  // 桌面
  const top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.6), deskMat)
  top.position.y = 1.05
  group.add(top)
  const legGeo = new THREE.BoxGeometry(0.1, 1.05, 0.1)
  ;[
    [-1.2, 0.52, -0.7],
    [1.2, 0.52, -0.7],
    [-1.2, 0.52, 0.7],
    [1.2, 0.52, 0.7],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeo, metalMat)
    leg.position.set(x, y, z)
    group.add(leg)
  })

  // L 型隔板（后 + 左）
  const backPartition = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.3, 0.08), partitionMat)
  backPartition.position.set(0, 1.7, -0.78)
  group.add(backPartition)
  const sidePartition = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.3, 1.6), partitionMat)
  sidePartition.position.set(-1.32, 1.7, 0)
  group.add(sidePartition)

  // 显示器（屏幕带自发光，动画层统一调亮度）
  const monitorBase = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.3), darkMat)
  monitorBase.position.set(0.2, 1.13, -0.35)
  group.add(monitorBase)
  const monitorPole = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.3, 0.08), darkMat)
  monitorPole.position.set(0.2, 1.28, -0.35)
  group.add(monitorPole)
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x1a237e,
    emissive: 0x42a5f5,
    emissiveIntensity: 0.55,
    roughness: 0.3,
  })
  screenMaterials.push(screenMat)
  const screen = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.65, 0.05), screenMat)
  screen.position.set(0.2, 1.65, -0.35)
  group.add(screen)
  // 键盘
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, 0.3), darkMat)
  keyboard.position.set(0.2, 1.12, 0.25)
  group.add(keyboard)

  // 办公椅（五星脚简化为圆柱+座垫+靠背）
  const chairPole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 10), metalMat)
  chairPole.position.set(0.2, 0.45, 0.95)
  group.add(chairPole)
  const chairBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 12), darkMat)
  chairBase.position.set(0.2, 0.12, 0.95)
  group.add(chairBase)
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.12, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.8 })
  )
  seat.position.set(0.2, 0.78, 0.95)
  group.add(seat)
  const chairBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 0.9, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x455a64, roughness: 0.8 })
  )
  chairBack.position.set(0.2, 1.25, 1.32)
  group.add(chairBack)

  return { group }
}

export function createOfficeScene(): Scene3DContext {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xeceff1)
  scene.fog = new THREE.Fog(0xeceff1, 24, 46)

  const colliders: THREE.Box3[] = []
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(obj: T): T => {
    disposables.push(obj)
    return obj
  }

  // 冷白办公照明
  const hemi = new THREE.HemisphereLight(0xffffff, 0x90a4ae, 0.9)
  scene.add(hemi)
  const sun = new THREE.DirectionalLight(0xe3f2fd, 1.0)
  sun.position.set(7, 12, 5)
  sun.castShadow = true
  sun.shadow.mapSize.set(1024, 1024)
  sun.shadow.camera.left = -12
  sun.shadow.camera.right = 12
  sun.shadow.camera.top = 12
  sun.shadow.camera.bottom = -12
  scene.add(sun)
  // 顶灯盘
  for (const x of [-5, 0, 5]) {
    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.08, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.7 })
    )
    lamp.position.set(x, ROOM.height - 0.08, 0)
    scene.add(lamp)
    const light = new THREE.PointLight(0xffffff, 0.35, 12)
    light.position.set(x, ROOM.height - 0.4, 0)
    scene.add(light)
  }

  // 地毯方格地面
  const floorMat = track(new THREE.MeshStandardMaterial({ color: 0xb0bec5, roughness: 0.95 }))
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)
  // 地毯格纹线条（用细 Box 平铺）
  const lineMat = new THREE.MeshStandardMaterial({ color: 0x90a4ae, roughness: 0.9 })
  for (let x = -ROOM.width / 2; x <= ROOM.width / 2; x += 2) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.01, ROOM.depth), lineMat)
    line.position.set(x, 0.005, 0)
    scene.add(line)
  }
  for (let z = -ROOM.depth / 2; z <= ROOM.depth / 2; z += 2) {
    const line = new THREE.Mesh(new THREE.BoxGeometry(ROOM.width, 0.01, 0.03), lineMat)
    line.position.set(0, 0.005, z)
    scene.add(line)
  }

  // 墙体
  const wallMat = track(new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.95 }))
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

  // 2×2 工位
  place(makeCubicle().group, -3.2, -2.5)
  place(makeCubicle().group, 3.2, -2.5)
  place(makeCubicle().group, -3.2, 3.2, Math.PI)
  place(makeCubicle().group, 3.2, 3.2, Math.PI)

  // 文件柜（西墙两个）
  const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x78909c, roughness: 0.7 })
  ;[-3, 0].forEach((z) => {
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.4, 1.4), cabinetMat)
    cabinet.position.set(-ROOM.width / 2 + 0.7, 1.2, z)
    cabinet.castShadow = true
    scene.add(cabinet)
    cabinet.updateWorldMatrix(true, false)
    colliders.push(new THREE.Box3().setFromObject(cabinet))
    // 抽屉缝
    for (let i = 0; i < 4; i++) {
      const gap = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.03, 1.42),
        new THREE.MeshStandardMaterial({ color: 0x546e7a })
      )
      gap.position.set(-ROOM.width / 2 + 0.7, 0.5 + i * 0.55, z)
      scene.add(gap)
    }
  })

  // 打印机台（东墙）
  const printerTable = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1.2), cabinetMat)
  printerTable.position.set(ROOM.width / 2 - 1.1, 0.45, -3.5)
  printerTable.castShadow = true
  scene.add(printerTable)
  printerTable.updateWorldMatrix(true, false)
  colliders.push(new THREE.Box3().setFromObject(printerTable))
  const printer = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.5, 0.9),
    new THREE.MeshStandardMaterial({ color: 0xeceff1, roughness: 0.5 })
  )
  printer.position.set(ROOM.width / 2 - 1.1, 1.15, -3.5)
  printer.castShadow = true
  scene.add(printer)

  // 饮水机（东墙靠门）
  const dispenser = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.6, 0.55),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 })
  )
  dispenser.position.set(ROOM.width / 2 - 0.6, 0.8, 4.5)
  dispenser.castShadow = true
  scene.add(dispenser)
  dispenser.updateWorldMatrix(true, false)
  colliders.push(new THREE.Box3().setFromObject(dispenser))
  const waterBucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.25, 0.45, 14),
    new THREE.MeshStandardMaterial({ color: 0x81d4fa, transparent: true, opacity: 0.7, roughness: 0.2 })
  )
  waterBucket.position.set(ROOM.width / 2 - 0.6, 1.85, 4.5)
  scene.add(waterBucket)

  // 白板（北墙）
  const whiteboard = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.8, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
  )
  whiteboard.position.set(0, 2.6, -ROOM.depth / 2 + 0.16)
  scene.add(whiteboard)
  // 白板上的蓝色记号笔迹（小色块）
  const inkMat = new THREE.MeshStandardMaterial({ color: 0x1976d2 })
  for (let i = 0; i < 4; i++) {
    const ink = new THREE.Mesh(new THREE.BoxGeometry(0.8 - i * 0.1, 0.05, 0.02), inkMat)
    ink.position.set(-1.1, 3.1 - i * 0.25, -ROOM.depth / 2 + 0.2)
    scene.add(ink)
  }

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
      // 显示器屏幕微光呼吸
      const glow = 0.5 + Math.sin(elapsed * 1.4) * 0.12
      screenMaterials.forEach((m) => {
        m.emissiveIntensity = glow
      })
    },
    dispose: () => {
      disposables.forEach((d) => d.dispose())
      screenMaterials.length = 0
      scene.clear()
    },
  }
}
