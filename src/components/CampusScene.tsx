import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { campusBuildings, campusNPCs, mapAreas, mapWidth, mapHeight, type Building, type NPCData } from '@/data/campus'
import { CharacterSprite } from './CharacterSprite'
import { CanteenScene } from './CanteenScene'

interface PlayerState {
  x: number
  y: number
  direction: 'up' | 'down' | 'left' | 'right'
  isMoving: boolean
}

export function CampusScene() {
  const { goToEvent } = useGameStore()
  const [player, setPlayer] = useState<PlayerState>({
    x: 375,
    y: 250,
    direction: 'down',
    isMoving: false,
  })
  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 })
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [selectedNPC, setSelectedNPC] = useState<NPCData | null>(null)
  const [showCanteen, setShowCanteen] = useState(false)
  const keysPressed = useRef<Set<string>>(new Set())
  const animationRef = useRef<number | undefined>(undefined)

  const movePlayer = useCallback((dx: number, dy: number) => {
    setPlayer((prev) => {
      const newX = Math.max(20, Math.min(mapWidth - 20, prev.x + dx))
      const newY = Math.max(20, Math.min(mapHeight - 20, prev.y + dy))
      
      let newDirection: PlayerState['direction'] = prev.direction
      if (dx > 0) newDirection = 'right'
      if (dx < 0) newDirection = 'left'
      if (dy > 0) newDirection = 'down'
      if (dy < 0) newDirection = 'up'

      return {
        ...prev,
        x: newX,
        y: newY,
        direction: newDirection,
        isMoving: dx !== 0 || dy !== 0,
      }
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase())
      if (e.key === ' ' || e.key === 'Enter') {
        if (selectedBuilding) {
          handleEnterBuilding(selectedBuilding)
        } else if (selectedNPC) {
          handleTalkToNPC(selectedNPC)
        } else {
          const nearNPC = campusNPCs.find(npc => 
            Math.abs(npc.position.x - player.x) < 50 && Math.abs(npc.position.y - player.y) < 50
          )
          if (nearNPC) {
            handleTalkToNPC(nearNPC)
          }
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase())
      setPlayer((prev) => ({ ...prev, isMoving: false }))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedBuilding, selectedNPC, player.x, player.y])

  useEffect(() => {
    const gameLoop = () => {
      const keys = keysPressed.current
      let dx = 0
      let dy = 0
      const speed = 3

      if (keys.has('w') || keys.has('arrowup')) dy -= speed
      if (keys.has('s') || keys.has('arrowdown')) dy += speed
      if (keys.has('a') || keys.has('arrowleft')) dx -= speed
      if (keys.has('d') || keys.has('arrowright')) dx += speed

      if (dx !== 0 || dy !== 0) {
        movePlayer(dx, dy)
      }

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [movePlayer])

  useEffect(() => {
    const targetX = player.x - mapWidth / 2
    const targetY = player.y - mapHeight / 2
    setCameraOffset({
      x: Math.max(mapWidth - window.innerWidth, 0) * (targetX / mapWidth),
      y: Math.max(mapHeight - window.innerHeight, 0) * (targetY / mapHeight),
    })
  }, [player.x, player.y])

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building)
    setSelectedNPC(null)
  }

  const handleNPCClick = (npc: NPCData) => {
    setSelectedNPC(npc)
    setSelectedBuilding(null)
  }

  const handleEnterBuilding = (building: Building) => {
    setSelectedBuilding(null)
    if (building.id === 'library') {
      goToEvent('chapter2_1')
    } else if (building.id === 'dormitory') {
      goToEvent('chapter1_3')
    } else if (building.id === 'canteen') {
      setShowCanteen(true)
    } else if (building.id === 'teaching') {
      goToEvent('chapter1_5')
    } else if (building.id === 'playground') {
      goToEvent('chapter1_7')
    } else if (building.id === 'gate') {
      goToEvent('chapter1_1')
    }
  }

  const handleTalkToNPC = (npc: NPCData) => {
    if (npc.dialogEventId) {
      setSelectedNPC(null)
      goToEvent(npc.dialogEventId)
    }
  }

  const getNPCType = (id: string): 'player' | 'xiaoyu' | 'zhangjing' | 'sisi' | 'canteen_auntie' | 'dorm_auntie' => {
    switch (id) {
      case 'xiaoyu': return 'xiaoyu'
      case 'zhangjing': return 'zhangjing'
      case 'sisi': return 'sisi'
      case 'canteen_auntie': return 'canteen_auntie'
      case 'dorm_auntie': return 'dorm_auntie'
      default: return 'player'
    }
  }

  const renderPlayer = () => (
    <div
      className="absolute z-10 transition-transform duration-75"
      style={{
        left: player.x - 20,
        top: player.y - 35,
      }}
    >
      <CharacterSprite 
        type="player" 
        direction={player.direction} 
        isMoving={player.isMoving} 
        size={50} 
      />
    </div>
  )

  const renderNPC = (npc: NPCData) => {
    const isNearPlayer = Math.abs(npc.position.x - player.x) < 50 && Math.abs(npc.position.y - player.y) < 50

    return (
      <button
        key={npc.id}
        onClick={() => handleNPCClick(npc)}
        className={`absolute flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-110 ${
          isNearPlayer ? 'ring-2 ring-yellow-400 rounded-full ring-offset-2' : ''
        }`}
        style={{
          left: npc.position.x - 15,
          top: npc.position.y - 28,
          zIndex: 8,
        }}
      >
        <CharacterSprite 
          type={getNPCType(npc.id)} 
          direction="down" 
          size={40} 
        />
        <span className="text-xs bg-black/70 text-white px-2 py-0.5 rounded mt-1 whitespace-nowrap">{npc.name}</span>
        {isNearPlayer && (
          <span className="absolute -top-3 -right-3 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black animate-pulse shadow-lg">!</span>
        )}
      </button>
    )
  }

  const renderBuilding = (building: Building) => {
    const isNearPlayer = Math.abs(building.position.x + building.width/2 - player.x) < building.width + 50 && 
                         Math.abs(building.position.y + building.height/2 - player.y) < building.height + 50

    return (
      <button
        key={building.id}
        onClick={() => handleBuildingClick(building)}
        className={`absolute flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
          isNearPlayer ? 'brightness-110' : ''
        }`}
        style={{
          left: building.position.x,
          top: building.position.y,
          width: building.width,
          height: building.height,
          backgroundColor: building.color + '90',
          border: '3px solid ' + building.color,
          borderRadius: '12px',
          zIndex: 5,
          boxShadow: `0 8px 16px ${building.color}40`,
        }}
      >
        <div 
          className="absolute -top-8 text-4xl animate-bounce"
          style={{ animationDuration: '2s' }}
        >
          {building.icon}
        </div>
        <span className="text-sm font-bold text-white drop-shadow-md mt-4">{building.name}</span>
      </button>
    )
  }

  const renderMapArea = (area: typeof mapAreas[0]) => {
    const colors: Record<string, string> = {
      road: '#80808060',
      grass: '#7CBA7C80',
      building: '#FFFFFF00',
      playground: '#FFD70060',
      lake: '#4A90D960',
    }

    return (
      <div
        key={area.id}
        className="absolute rounded-xl"
        style={{
          left: area.position.x,
          top: area.position.y,
          width: area.width,
          height: area.height,
          backgroundColor: colors[area.type],
          zIndex: 1,
        }}
      />
    )
  }

  if (showCanteen) {
    return <CanteenScene />
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-sky-300 via-sky-200 to-green-200 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-sky-400 to-transparent" />
      
      <div className="absolute top-4 left-1/4 w-16 h-16 bg-white rounded-full opacity-80 shadow-lg" />
      <div className="absolute top-8 right-1/3 w-12 h-12 bg-white/60 rounded-full" />
      <div className="absolute top-2 right-1/4 w-8 h-8 bg-white/40 rounded-full" />

      <div
        className="relative"
        style={{
          width: mapWidth,
          height: mapHeight,
          transform: `translate(-${cameraOffset.x}px, -${cameraOffset.y}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-green-300/50 to-green-400/50" />
        
        {mapAreas.map(renderMapArea)}
        
        {campusBuildings.map(renderBuilding)}
        
        {campusNPCs.map(renderNPC)}
        
        {renderPlayer()}
      </div>

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/50">
        <h3 className="font-bold text-gray-700 mb-2">🎮 操作指南</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>⬆️⬇️⬅️➡️ / WASD - 移动角色</p>
          <p>🖱️ 点击建筑 - 查看并进入</p>
          <p>🖱️ 点击NPC - 与NPC对话</p>
          <p>空格键/回车 - 快速交互</p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-white/50">
        <h3 className="font-bold text-gray-700 mb-2">📍 当前位置</h3>
        <p className="text-sm text-gray-600">X: {Math.round(player.x)} | Y: {Math.round(player.y)}</p>
      </div>

      {selectedBuilding && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 max-w-sm z-50 border-2 border-pink-200">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{selectedBuilding.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{selectedBuilding.name}</h3>
              <p className="text-sm text-gray-500">{selectedBuilding.description}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleEnterBuilding(selectedBuilding)}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-2 rounded-lg shadow-md"
            >
              进入
            </button>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {selectedNPC && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 max-w-sm z-50 border-2 border-yellow-200">
          <div className="flex items-center gap-4 mb-4">
            <CharacterSprite type={getNPCType(selectedNPC.id)} direction="down" size={50} />
            <div>
              <h3 className="text-xl font-bold text-gray-800">{selectedNPC.name}</h3>
              <p className="text-sm text-gray-500">点击对话</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleTalkToNPC(selectedNPC)}
              className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium py-2 rounded-lg shadow-md"
            >
              对话
            </button>
            <button
              onClick={() => setSelectedNPC(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
