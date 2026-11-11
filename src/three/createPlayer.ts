import * as THREE from 'three'

/**
 * 主角 3D 模型
 * 配色严格沿用游戏内 CharacterSprite 的 player 形象：
 * 黑发 #1a1a1a、皮肤 #FFD4C4、粉色上衣 #FF69B4、浅蓝下装 #87CEEB
 */
export interface Player3D {
  group: THREE.Group
  /** 每帧驱动行走/待机动画，并平滑转向移动方向 */
  update: (elapsed: number, moving: boolean, moveDir: THREE.Vector3) => void
  dispose: () => void
}

const COLORS = {
  skin: 0xffd4c4,
  hair: 0x1a1a1a,
  top: 0xff69b4,
  bottom: 0x87ceeb,
  shoe: 0x333333,
}

export function createPlayer(): Player3D {
  const group = new THREE.Group()
  const disposables: { dispose: () => void }[] = []
  const track = <T extends { dispose: () => void }>(obj: T): T => {
    disposables.push(obj)
    return obj
  }

  const skinMat = track(new THREE.MeshStandardMaterial({ color: COLORS.skin, roughness: 0.7 }))
  const hairMat = track(new THREE.MeshStandardMaterial({ color: COLORS.hair, roughness: 0.85 }))
  const topMat = track(new THREE.MeshStandardMaterial({ color: COLORS.top, roughness: 0.75 }))
  const bottomMat = track(new THREE.MeshStandardMaterial({ color: COLORS.bottom, roughness: 0.75 }))
  const shoeMat = track(new THREE.MeshStandardMaterial({ color: COLORS.shoe, roughness: 0.6 }))

  // 躯干（粉色上衣）
  const torso = new THREE.Mesh(track(new THREE.BoxGeometry(0.62, 0.78, 0.36)), topMat)
  torso.position.y = 1.18
  torso.castShadow = true
  group.add(torso)

  // 头部
  const head = new THREE.Mesh(track(new THREE.SphereGeometry(0.27, 24, 20)), skinMat)
  head.position.y = 1.82
  head.castShadow = true
  group.add(head)

  // 头发：头顶发盖 + 两侧长发（呼应像素形象的双缕长发）
  const hairCap = new THREE.Mesh(
    track(new THREE.SphereGeometry(0.29, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.55)),
    hairMat
  )
  hairCap.position.y = 1.86
  hairCap.castShadow = true
  group.add(hairCap)

  const backHair = new THREE.Mesh(track(new THREE.BoxGeometry(0.5, 0.55, 0.16)), hairMat)
  backHair.position.set(0, 1.6, -0.2)
  backHair.castShadow = true
  group.add(backHair)

  const sideHairGeo = track(new THREE.BoxGeometry(0.09, 0.42, 0.12))
  const hairL = new THREE.Mesh(sideHairGeo, hairMat)
  hairL.position.set(-0.24, 1.62, -0.02)
  const hairR = hairL.clone()
  hairR.position.x = 0.24
  group.add(hairL, hairR)

  // 眼睛
  const eyeGeo = track(new THREE.SphereGeometry(0.035, 10, 8))
  const eyeMat = track(new THREE.MeshStandardMaterial({ color: COLORS.hair }))
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat)
  eyeL.position.set(-0.1, 1.83, 0.24)
  const eyeR = eyeL.clone()
  eyeR.position.x = 0.1
  group.add(eyeL, eyeR)

  // 腮红
  const blushMat = track(new THREE.MeshStandardMaterial({ color: 0xffb6c1 }))
  const blushGeo = track(new THREE.SphereGeometry(0.045, 10, 8))
  const blushL = new THREE.Mesh(blushGeo, blushMat)
  blushL.position.set(-0.16, 1.75, 0.22)
  blushL.scale.set(1, 0.6, 0.4)
  const blushR = blushL.clone()
  blushR.position.x = 0.16
  group.add(blushL, blushR)

  // 四肢（以肩/髋为枢轴，方便摆动）
  const armPivotL = new THREE.Group()
  armPivotL.position.set(-0.38, 1.5, 0)
  const armL = new THREE.Mesh(track(new THREE.BoxGeometry(0.14, 0.62, 0.14)), topMat)
  armL.position.y = -0.3
  armL.castShadow = true
  armPivotL.add(armL)
  const armPivotR = new THREE.Group()
  armPivotR.position.set(0.38, 1.5, 0)
  const armR = new THREE.Mesh(track(new THREE.BoxGeometry(0.14, 0.62, 0.14)), topMat)
  armR.position.y = -0.3
  armR.castShadow = true
  armPivotR.add(armR)
  group.add(armPivotL, armPivotR)

  const legPivotL = new THREE.Group()
  legPivotL.position.set(-0.16, 0.82, 0)
  const legL = new THREE.Mesh(track(new THREE.BoxGeometry(0.2, 0.72, 0.2)), bottomMat)
  legL.position.y = -0.36
  legL.castShadow = true
  legPivotL.add(legL)
  const shoeL = new THREE.Mesh(track(new THREE.BoxGeometry(0.22, 0.1, 0.3)), shoeMat)
  shoeL.position.set(0, -0.75, 0.05)
  legPivotL.add(shoeL)

  const legPivotR = new THREE.Group()
  legPivotR.position.set(0.16, 0.82, 0)
  const legR = new THREE.Mesh(track(new THREE.BoxGeometry(0.2, 0.72, 0.2)), bottomMat)
  legR.position.y = -0.36
  legR.castShadow = true
  legPivotR.add(legR)
  const shoeR = new THREE.Mesh(track(new THREE.BoxGeometry(0.22, 0.1, 0.3)), shoeMat)
  shoeR.position.set(0, -0.75, 0.05)
  legPivotR.add(shoeR)
  group.add(legPivotL, legPivotR)

  // 脚下柔和阴影
  const shadowMat = track(
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18, depthWrite: false })
  )
  const shadow = new THREE.Mesh(track(new THREE.CircleGeometry(0.45, 24)), shadowMat)
  shadow.rotation.x = -Math.PI / 2
  shadow.position.y = 0.02
  group.add(shadow)

  let walkPhase = 0
  const tmpTarget = new THREE.Object3D()

  const update = (elapsed: number, moving: boolean, moveDir: THREE.Vector3) => {
    if (moving) {
      walkPhase += elapsed * 9
      const swing = Math.sin(walkPhase) * 0.55
      legPivotL.rotation.x = swing
      legPivotR.rotation.x = -swing
      armPivotL.rotation.x = -swing * 0.8
      armPivotR.rotation.x = swing * 0.8
      group.position.y = Math.abs(Math.sin(walkPhase)) * 0.05

      // 平滑转向移动方向
      tmpTarget.position.set(moveDir.x, 0, moveDir.z)
      tmpTarget.position.add(group.position)
      group.lookAt(tmpTarget.position)
    } else {
      // 待机：手臂自然下垂 + 呼吸感
      legPivotL.rotation.x *= 0.8
      legPivotR.rotation.x *= 0.8
      armPivotL.rotation.x *= 0.8
      armPivotR.rotation.x *= 0.8
      group.position.y = Math.sin(elapsed * 2) * 0.02
      torso.scale.set(1 + Math.sin(elapsed * 2) * 0.015, 1, 1 + Math.sin(elapsed * 2) * 0.015)
    }
  }

  return {
    group,
    update,
    dispose: () => disposables.forEach((d) => d.dispose()),
  }
}
