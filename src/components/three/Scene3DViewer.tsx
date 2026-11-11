import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { createLibraryScene, type Scene3DContext } from '@/three/createLibraryScene'
import { createPlayer, type Player3D } from '@/three/createPlayer'
import { useGameStore } from '@/store/gameStore'
import { applyName } from '@/utils/name'

type ViewPreset = 'follow' | 'close' | 'top'

/**
 * 3D 场景查看器（迭代 1：图书馆）
 * - 桌面端：WASD/方向键行走，鼠标拖拽旋转视角，滚轮缩放
 * - 移动端：左下虚拟摇杆行走，单指拖拽旋转视角
 * - 视角预设：跟随 / 近景 / 俯视
 */
export function Scene3DViewer({ sceneId, onClose }: { sceneId: string; onClose: () => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const joystickRef = useRef({ x: 0, y: 0 })
  const keysRef = useRef<Set<string>>(new Set())
  const [viewPreset, setViewPreset] = useState<ViewPreset>('follow')
  const viewPresetRef = useRef<ViewPreset>('follow')
  const playerName = useGameStore((state) => state.playerName)

  useEffect(() => {
    viewPresetRef.current = viewPreset
  }, [viewPreset])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ===== 渲染器 =====
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const initialW = mount.clientWidth || window.innerWidth || 1
    const initialH = mount.clientHeight || window.innerHeight || 1
    renderer.setSize(initialW, initialH)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)

    // ===== 场景（当前迭代仅图书馆，后续按 sceneId 扩展） =====
    const sceneCtx: Scene3DContext = createLibraryScene()
    const { scene, colliders, bounds } = sceneCtx

    // ===== 相机与轨道控制 =====
    const camera = new THREE.PerspectiveCamera(55, initialW / initialH, 0.1, 100)
    camera.position.set(0, 4.5, 7)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.enablePan = false
    controls.minDistance = 2.5
    controls.maxDistance = 16
    controls.maxPolarAngle = Math.PI / 2.15
    controls.target.set(0, 1.2, 0)

    // ===== 主角 =====
    const player: Player3D = createPlayer()
    player.group.position.set(0, 0, 6)
    scene.add(player.group)

    // ===== 输入：键盘 =====
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase())
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase())
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    // ===== 碰撞检测（分轴尝试，贴墙可滑动） =====
    const playerHalf = 0.35
    const playerBox = new THREE.Box3()
    const blocked = (x: number, z: number): boolean => {
      playerBox.min.set(x - playerHalf, 0.2, z - playerHalf)
      playerBox.max.set(x + playerHalf, 1.9, z + playerHalf)
      return colliders.some((c) => c.intersectsBox(playerBox))
    }

    const clock = new THREE.Clock()
    const moveDir = new THREE.Vector3()
    const forward = new THREE.Vector3()
    const right = new THREE.Vector3()
    let rafId = 0
    let elapsed = 0

    const applyViewPreset = () => {
      const p = player.group.position
      if (viewPresetRef.current === 'close') {
        camera.position.set(p.x, p.y + 2.2, p.z + 3.2)
        controls.minDistance = 1.8
        controls.maxDistance = 8
      } else if (viewPresetRef.current === 'top') {
        camera.position.set(p.x, p.y + 11, p.z + 0.01)
        controls.minDistance = 6
        controls.maxDistance = 18
      } else {
        camera.position.set(p.x, p.y + 4.2, p.z + 6.5)
        controls.minDistance = 2.5
        controls.maxDistance = 16
      }
      controls.target.set(p.x, 1.2, p.z)
      controls.update()
    }

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      const dt = Math.min(clock.getDelta(), 0.05)
      elapsed += dt

      // 汇总键盘 + 摇杆输入
      let ix = joystickRef.current.x
      let iz = joystickRef.current.y
      const keys = keysRef.current
      if (keys.has('w') || keys.has('arrowup')) iz += 1
      if (keys.has('s') || keys.has('arrowdown')) iz -= 1
      if (keys.has('a') || keys.has('arrowleft')) ix -= 1
      if (keys.has('d') || keys.has('arrowright')) ix += 1

      const moving = ix !== 0 || iz !== 0
      if (moving) {
        // 相机相对方向移动
        camera.getWorldDirection(forward)
        forward.y = 0
        forward.normalize()
        right.crossVectors(forward, camera.up).normalize()
        moveDir.set(0, 0, 0).addScaledVector(forward, iz).addScaledVector(right, ix)
        if (moveDir.lengthSq() > 1) moveDir.normalize()

        const speed = 3.2
        const nx = player.group.position.x + moveDir.x * speed * dt
        const nz = player.group.position.z + moveDir.z * speed * dt

        // 分轴碰撞 + 边界
        if (!blocked(nx, player.group.position.z) && nx > bounds.minX && nx < bounds.maxX) {
          player.group.position.x = nx
        }
        if (!blocked(player.group.position.x, nz) && nz > bounds.minZ && nz < bounds.maxZ) {
          player.group.position.z = nz
        }
      }

      player.update(elapsed, moving, moveDir)
      sceneCtx.update(elapsed)

      // 相机目标平滑跟随主角
      const target = controls.target
      target.x += (player.group.position.x - target.x) * 0.12
      target.z += (player.group.position.z - target.z) * 0.12
      controls.update()

      renderer.render(scene, camera)
    }
    animate()

    // ===== 自适应尺寸（忽略异常零尺寸，避免相机宽高比变 NaN） =====
    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth || window.innerWidth
      const h = mount.clientHeight || window.innerHeight
      if (!w || !h) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    const resizeObserver = new ResizeObserver(onResize)
    resizeObserver.observe(mount)

    // 暴露视角切换方法给外部按钮
    ;(mount as unknown as { __applyViewPreset: () => void }).__applyViewPreset = applyViewPreset

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      controls.dispose()
      player.dispose()
      sceneCtx.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId])

  // ===== 移动端虚拟摇杆 =====
  const stickBaseRef = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const stickPointer = useRef<number | null>(null)

  const onStickStart = (e: React.PointerEvent) => {
    stickPointer.current = e.pointerId
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onStickMove = (e: React.PointerEvent) => {
    if (stickPointer.current !== e.pointerId || !stickBaseRef.current) return
    const rect = stickBaseRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const maxR = rect.width / 2
    let dx = e.clientX - cx
    let dy = e.clientY - cy
    const dist = Math.hypot(dx, dy)
    if (dist > maxR) {
      dx = (dx / dist) * maxR
      dy = (dy / dist) * maxR
    }
    setKnob({ x: dx, y: dy })
    joystickRef.current = { x: dx / maxR, y: -dy / maxR }
  }

  const onStickEnd = (e: React.PointerEvent) => {
    if (stickPointer.current !== e.pointerId) return
    stickPointer.current = null
    setKnob({ x: 0, y: 0 })
    joystickRef.current = { x: 0, y: 0 }
  }

  const switchPreset = (p: ViewPreset) => {
    setViewPreset(p)
    viewPresetRef.current = p
    const mount = mountRef.current
    if (mount) {
      // 等状态提交后由 effect 应用，这里直接调用最新值
      requestAnimationFrame(() => {
        ;(mount as unknown as { __applyViewPreset?: () => void }).__applyViewPreset?.()
      })
    }
  }

  return (
    <div className="fixed inset-0 z-30 bg-[#f5f0e8]">
      <div ref={mountRef} className="w-full h-full touch-none" />

      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/45 to-transparent pointer-events-none">
        <div className="text-white">
          <h2 className="text-lg font-bold drop-shadow">📖 3D 图书馆</h2>
          <p className="text-xs opacity-90 drop-shadow">{applyName('{name}，用 WASD/方向键或摇杆自由行走', playerName)}</p>
        </div>
        <div className="flex gap-2 pointer-events-auto">
          {([
            ['follow', '跟随'],
            ['close', '近景'],
            ['top', '俯视'],
          ] as [ViewPreset, string][]).map(([p, label]) => (
            <button
              key={p}
              onClick={() => switchPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-sm shadow transition-colors ${
                viewPreset === p ? 'bg-pink-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'
              }`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/90 text-gray-700 shadow hover:bg-white"
          >
            退出 3D
          </button>
        </div>
      </div>

      {/* 移动端虚拟摇杆（桌面端隐藏） */}
      <div
        ref={stickBaseRef}
        onPointerDown={onStickStart}
        onPointerMove={onStickMove}
        onPointerUp={onStickEnd}
        onPointerCancel={onStickEnd}
        className="md:hidden absolute bottom-8 left-6 w-28 h-28 rounded-full bg-white/25 border-2 border-white/50 backdrop-blur-sm touch-none"
      >
        <div
          className="absolute left-1/2 top-1/2 w-12 h-12 rounded-full bg-white/80 shadow-lg"
          style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
        />
      </div>

      {/* 桌面端操作提示 */}
      <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/45 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm">
        WASD / 方向键移动 · 鼠标拖拽旋转视角 · 滚轮缩放
      </div>
    </div>
  )
}
