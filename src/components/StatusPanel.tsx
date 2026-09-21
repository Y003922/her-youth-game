import { useGameStore } from '@/store/gameStore'

const attributeLabels: Record<string, { label: string; icon: string; color: string }> = {
  knowledge: { label: '学识', icon: '📚', color: 'bg-blue-500' },
  mood: { label: '心情', icon: '😊', color: 'bg-pink-500' },
  stamina: { label: '体力', icon: '⚡', color: 'bg-green-500' },
  literarySkill: { label: '文学素养', icon: '✍️', color: 'bg-purple-500' },
  aiSkill: { label: 'AI技能', icon: '🤖', color: 'bg-cyan-500' },
  social: { label: '社交', icon: '👥', color: 'bg-orange-500' },
  love: { label: '恋爱值', icon: '💕', color: 'bg-red-500' },
  money: { label: '存款', icon: '💰', color: 'bg-yellow-500' },
}

export function StatusPanel() {
  const character = useGameStore((state) => state.character)

  const attributes = Object.entries(character)

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
        <span>👤</span> 角色状态
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {attributes.map(([key, value]) => {
          const info = attributeLabels[key]
          const isMoney = key === 'money'
          const displayValue = isMoney ? `¥${value}` : value
          const width = isMoney ? Math.min(100, (value / 3000) * 100) : value

          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-lg">{info?.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{info?.label}</span>
                  <span className="font-medium text-gray-800">{displayValue}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${info?.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
