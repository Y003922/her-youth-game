import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'

interface Dessert {
  id: string
  name: string
  price: number
  moodBoost: number
  weightGain: number
  emoji: string
}

const desserts: Dessert[] = [
  { id: 'cake', name: '草莓蛋糕', price: 18, moodBoost: 8, weightGain: 0.5, emoji: '🍰' },
  { id: 'tiramisu', name: '提拉米苏', price: 22, moodBoost: 10, weightGain: 0.6, emoji: '☕' },
  { id: 'icecream', name: '冰淇淋', price: 12, moodBoost: 6, weightGain: 0.4, emoji: '🍦' },
  { id: 'pudding', name: '焦糖布丁', price: 15, moodBoost: 7, weightGain: 0.45, emoji: '🍮' },
  { id: 'macaron', name: '马卡龙', price: 20, moodBoost: 9, weightGain: 0.55, emoji: '🧁' },
]

export function CanteenScene() {
  const { character, updateCharacter, goToEvent } = useGameStore()
  const [selectedDessert, setSelectedDessert] = useState<Dessert | null>(null)
  const [purchaseMessage, setPurchaseMessage] = useState('')
  const [showPurchaseResult, setShowPurchaseResult] = useState(false)

  const handlePurchase = (dessert: Dessert) => {
    if (character.money >= dessert.price) {
      updateCharacter({
        money: character.money - dessert.price,
        mood: Math.min(100, character.mood + dessert.moodBoost),
      })
      setPurchaseMessage(`成功购买 ${dessert.name}！心情 +${dessert.moodBoost}`)
      setShowPurchaseResult(true)
      setTimeout(() => {
        setShowPurchaseResult(false)
        setSelectedDessert(null)
      }, 2000)
    } else {
      setPurchaseMessage('余额不足！')
      setShowPurchaseResult(true)
      setTimeout(() => {
        setShowPurchaseResult(false)
      }, 2000)
    }
  }

  const handleExit = () => {
    goToEvent('chapter1_6')
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-100 to-yellow-100" />

      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-red-600 to-red-500 rounded-b-[50%] opacity-80" />
        
        <div className="absolute top-24 left-1/4 w-32 h-40 bg-yellow-400 rounded-t-xl shadow-lg">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">🍞</div>
          <div className="text-center mt-8 text-white font-bold text-sm">主食窗口</div>
        </div>
        
        <div className="absolute top-24 right-1/4 w-32 h-40 bg-orange-400 rounded-t-xl shadow-lg">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">🍜</div>
          <div className="text-center mt-8 text-white font-bold text-sm">面食窗口</div>
        </div>

        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-48 h-56 bg-pink-300 rounded-t-xl shadow-xl border-4 border-pink-400">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl">🎂</div>
          <div className="text-center mt-6 text-pink-800 font-bold text-lg">蛋糕店</div>
          <div className="text-center text-pink-700 text-xs mb-4">Sweet Dessert Shop</div>
          
          <div className="grid grid-cols-5 gap-2 px-2">
            {desserts.map((dessert) => (
              <button
                key={dessert.id}
                onClick={() => setSelectedDessert(dessert)}
                className="flex flex-col items-center justify-center p-2 bg-white/50 rounded-lg hover:bg-white/80 transition-colors"
              >
                <span className="text-2xl">{dessert.emoji}</span>
                <span className="text-xs text-pink-700 font-medium">{dessert.name}</span>
                <span className="text-xs text-gray-500">¥{dessert.price}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="absolute bottom-20 left-1/4 w-24 h-20 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
          <span className="text-3xl">🪑</span>
        </div>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-24 h-20 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
          <span className="text-3xl">🪑</span>
        </div>
        <div className="absolute bottom-20 right-1/4 w-24 h-20 bg-gray-200 rounded-lg shadow-md flex items-center justify-center">
          <span className="text-3xl">🪑</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm text-gray-600">余额: <span className="font-bold text-green-600">¥{character.money}</span></div>
        <div className="text-sm text-gray-600">心情: <span className="font-bold text-pink-500">{character.mood}</span></div>
      </div>

      <button
        onClick={handleExit}
        className="absolute bottom-4 left-4 bg-white/90 hover:bg-white text-gray-700 px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        ← 返回校园
      </button>

      {selectedDessert && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl p-6 max-w-xs z-50">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{selectedDessert.emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{selectedDessert.name}</h3>
              <p className="text-sm text-gray-500">¥{selectedDessert.price}</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">心情提升</span>
              <span className="text-green-600 font-medium">+{selectedDessert.moodBoost}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handlePurchase(selectedDessert)}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 rounded-lg"
            >
              购买
            </button>
            <button
              onClick={() => setSelectedDessert(null)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showPurchaseResult && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl z-50 animate-bounce">
          {purchaseMessage}
        </div>
      )}
    </div>
  )
}
