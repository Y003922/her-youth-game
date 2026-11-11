import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/store/gameStore'
import { getCharacterImage } from '@/data/images'
import { applyName } from '@/utils/name'

type PetMode = 'idle' | 'eat' | 'sleep' | 'study'

const MODE_DURATION: Record<Exclude<PetMode, 'idle'>, number> = {
  eat: 8000,
  sleep: 15000,
  study: 12000,
}

const MODE_META: Record<PetMode, { label: string; icon: string }> = {
  idle: { label: '陪伴中', icon: '💗' },
  eat: { label: '吃饭中', icon: '🍚' },
  sleep: { label: '睡觉中', icon: '😴' },
  study: { label: '学习中', icon: '📖' },
}

/**
 * 桌面小桌宠
 * - 肖像直接复用游戏内官方人物图（images.ts 的 player_* 地址），保证发色/五官/服饰完全一致
 * - 表情随当前剧情事件实时切换；吃饭/睡觉/学习动作有独立动画
 * - 支持指针拖拽（鼠标+触屏）、点击对话、最小化收纳
 */
export function DesktopPet() {
  const currentEvent = useGameStore((state) => state.getCurrentEvent())
  const playerName = useGameStore((state) => state.playerName)
  const mood = useGameStore((state) => state.character.mood)

  const [mode, setMode] = useState<PetMode>('idle')
  const [minimized, setMinimized] = useState(false)
  const [bubble, setBubble] = useState('')
  const [position, setPosition] = useState({ x: 20, y: 96 })
  const dragState = useRef({ dragging: false, moved: false, startX: 0, startY: 0, originX: 0, originY: 0 })
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const modeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // 表情：动作优先；空闲时跟随剧情事件，无事件时按心情推断
  const expression = (() => {
    if (mode === 'eat') return 'happy'
    if (mode === 'sleep') return 'tired'
    if (mode === 'study') return 'thinking'
    const eventExpr = currentEvent?.characterRole ? null : currentEvent?.characterExpression
    if (eventExpr && ['normal', 'happy', 'sad', 'thinking', 'surprised', 'tired'].includes(eventExpr)) {
      return eventExpr
    }
    if (mood < 35) return 'sad'
    if (mood > 70) return 'happy'
    return 'normal'
  })()

  const portrait = getCharacterImage(expression)

  const showBubble = useCallback(
    (text: string) => {
      setBubble(applyName(text, playerName))
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
      bubbleTimer.current = setTimeout(() => setBubble(''), 3600)
    },
    [playerName]
  )

  // 剧情事件变化时，空闲状态下自动说一句贴合场景的话
  useEffect(() => {
    if (mode !== 'idle' || !currentEvent) return
    const scene = currentEvent.scene || ''
    let line = '{name}，我陪着你呢～'
    if (scene.includes('食堂')) line = '{name}，好好吃饭，才有力气走后面的路。'
    else if (scene.includes('图书馆')) line = '{name}，安静看书的你很耀眼。'
    else if (scene.includes('宿舍')) line = '{name}，累了就歇一会儿吧。'
    else if (scene.includes('考场') || scene.includes('考试')) line = '{name}，深呼吸，你可以的。'
    const t = setTimeout(() => showBubble(line), 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEvent?.id])

  useEffect(() => {
    return () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
      if (modeTimer.current) clearTimeout(modeTimer.current)
    }
  }, [])

  const switchMode = (next: PetMode) => {
    if (modeTimer.current) clearTimeout(modeTimer.current)
    setMode(next)
    if (next === 'eat') {
      showBubble('{name}，这个好好吃，你也来点！')
    } else if (next === 'sleep') {
      showBubble('{name}，晚安，做个好梦…')
    } else if (next === 'study') {
      showBubble('{name}，一起安静学会儿书吧。')
    } else {
      showBubble('{name}，我回来啦！')
      return
    }
    modeTimer.current = setTimeout(() => setMode('idle'), MODE_DURATION[next])
  }

  const handlePetClick = () => {
    if (dragState.current.moved) return
    const lines: Record<PetMode, string> = {
      idle: '{name}，点我可以一起吃饭、睡觉、学习哦～',
      eat: '{name}，慢点吃，没人跟你抢～',
      sleep: '嘘——{name}正在补觉呢',
      study: '{name}，这本书里的世界真大。',
    }
    showBubble(lines[mode])
  }

  // 指针拖拽（同时兼容鼠标与触屏）
  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    dragState.current = {
      dragging: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      originX: position.x,
      originY: position.y,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragState.current
    if (!d.dragging) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) d.moved = true
    const maxX = window.innerWidth - 96
    const maxY = window.innerHeight - 110
    setPosition({
      x: Math.max(8, Math.min(maxX, d.originX + dx)),
      y: Math.max(8, Math.min(maxY, d.originY + dy)),
    })
  }

  const onPointerUp = () => {
    dragState.current.dragging = false
    setTimeout(() => {
      dragState.current.moved = false
    }, 0)
  }

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed z-40 w-14 h-14 rounded-full overflow-hidden border-2 border-pink-300 shadow-xl hover:scale-105 transition-transform bg-white"
        style={{ left: position.x, top: position.y }}
        aria-label="展开桌宠"
      >
        <img src={portrait.imageUrl} alt="桌宠" className="w-full h-full object-cover" />
      </button>
    )
  }

  return (
    <div
      className={`fixed z-40 select-none pet-mode-${mode}`}
      style={{ left: position.x, top: position.y, width: 'clamp(84px, 22vw, 104px)' }}
    >
      {/* 对话气泡 */}
      {bubble && (
        <div className="pet-bubble absolute -top-2 left-full ml-2 w-44 max-w-[52vw] bg-white/95 rounded-2xl shadow-lg px-3 py-2 text-sm text-gray-700 leading-snug border border-pink-200">
          {bubble}
          <span className="absolute right-full top-5 w-2 h-2 bg-white border-l border-b border-pink-200 rotate-45" />
        </div>
      )}

      {/* 状态特效：睡觉 Zzz / 学习闪光 / 吃饭餐具 */}
      {mode === 'sleep' && (
        <div className="pet-zzz absolute -top-3 right-0 text-blue-400 font-bold text-lg pointer-events-none">
          <span>z</span>
          <span>Z</span>
          <span>Z</span>
        </div>
      )}
      {mode === 'study' && (
        <div className="pet-sparkle absolute -top-2 -left-1 text-yellow-400 text-xl pointer-events-none">✨</div>
      )}
      {mode === 'eat' && (
        <div className="absolute -bottom-1 -right-1 text-2xl pointer-events-none">🍚</div>
      )}

      {/* 肖像（与游戏内官方人物图完全同源） */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={handlePetClick}
        className="pet-portrait relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white shadow-xl cursor-grab active:cursor-grabbing bg-gray-100 touch-none"
        role="button"
        aria-label="人物桌宠，可拖拽"
      >
        <img
          src={portrait.imageUrl}
          alt={`桌宠-${portrait.name}`}
          draggable={false}
          className="w-full h-full object-cover pointer-events-none"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src =
              'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20long%20black%20hair%20gentle%20expression%20soft%20lighting&image_size=portrait_4_3'
          }}
        />
        <span className="absolute bottom-1 left-1 bg-black/55 text-white text-[10px] px-1.5 py-0.5 rounded-full">
          {MODE_META[mode].icon} {MODE_META[mode].label}
        </span>
      </div>

      {/* 动作工具栏 */}
      <div className="mt-2 grid grid-cols-4 gap-1">
        {(['eat', 'sleep', 'study'] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            title={MODE_META[m].label}
            className={`text-lg py-1 rounded-lg shadow transition-all hover:scale-110 ${
              mode === m ? 'bg-pink-400 text-white' : 'bg-white/90 hover:bg-pink-100'
            }`}
          >
            {MODE_META[m].icon}
          </button>
        ))}
        <button
          onClick={() => setMinimized(true)}
          title="收起桌宠"
          className="text-lg py-1 rounded-lg bg-white/90 shadow hover:bg-gray-100 transition-all hover:scale-110"
        >
          ➖
        </button>
      </div>
      {mode !== 'idle' && (
        <button
          onClick={() => switchMode('idle')}
          className="mt-1 w-full text-xs py-1 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
        >
          结束动作，回到陪伴
        </button>
      )}
    </div>
  )
}
