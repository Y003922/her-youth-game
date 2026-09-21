import { useState } from 'react'
import { useGameStore, type SaveSlot } from '@/store/gameStore'
import { SceneRenderer } from '@/components/SceneRenderer'
import { StatusPanel } from '@/components/StatusPanel'
import { CampusScene } from '@/components/CampusScene'

export function GamePage() {
  const isGameStarted = useGameStore((state) => state.isGameStarted)
  const currentChapter = useGameStore((state) => state.getCurrentChapter())
  const saveGame = useGameStore((state) => state.saveGame)
  const loadGame = useGameStore((state) => state.loadGame)
  const deleteSave = useGameStore((state) => state.deleteSave)
  const getSaveSlots = useGameStore((state) => state.getSaveSlots)
  const goBack = useGameStore((state) => state.goBack)
  const gameHistory = useGameStore((state) => state.gameHistory)
  const returnToHome = useGameStore((state) => state.returnToHome)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([])
  const [saveMessage, setSaveMessage] = useState('')
  const [showCampusScene, setShowCampusScene] = useState(false)

  const handleSave = (slotId: string) => {
    const result = saveGame(slotId)
    if (result) {
      setSaveMessage(`存档成功！第${slotId.replace('slot', '')}个存档位`)
      setTimeout(() => setSaveMessage(''), 2000)
      setShowSaveModal(false)
    }
  }

  const handleLoad = (slotId: string) => {
    const success = loadGame(slotId)
    if (success) {
      setShowLoadModal(false)
    }
  }

  const handleDelete = (slotId: string) => {
    deleteSave(slotId)
    setSaveSlots(getSaveSlots())
  }

  const handleShowLoad = () => {
    setSaveSlots(getSaveSlots())
    setShowLoadModal(true)
  }

  const handleGoBack = () => {
    const success = goBack()
    if (!success) {
      setSaveMessage('无法返回')
      setTimeout(() => setSaveMessage(''), 2000)
    }
  }

  if (!isGameStarted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">她的青春</h1>
            <p className="text-sm opacity-90">
              {currentChapter?.title} · {currentChapter?.subtitle} · {currentChapter?.year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoBack}
              disabled={gameHistory.length === 0}
              className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg text-sm transition-colors"
            >
              ← 返回
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              💾 存档
            </button>
            <button
              onClick={handleShowLoad}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              📂 读档
            </button>
            <button
              onClick={() => setShowCampusScene(!showCampusScene)}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              🏞️ 探索校园
            </button>
            <button
              onClick={returnToHome}
              className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className="bg-green-100 text-green-700 p-3 text-center">
          {saveMessage}
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden min-h-[600px]">
              {showCampusScene ? <CampusScene /> : <SceneRenderer />}
            </div>
          </div>
          <div className="lg:col-span-1">
            <StatusPanel />
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">选择存档位</h3>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => handleSave(`slot${i}`)}
                  className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-4 px-2 rounded-lg transition-all hover:scale-105"
                >
                  {i}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSaveModal(false)}
              className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">选择读档</h3>
            {saveSlots.length === 0 ? (
              <p className="text-gray-500 text-center py-8">暂无存档</p>
            ) : (
              <div className="space-y-3">
                {saveSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-800">存档 {slot.id.replace('slot', '')}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(slot.timestamp).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {slot.year} · {slot.chapterId}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoad(slot.id)}
                        className="bg-pink-500 hover:bg-pink-600 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        读取
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowLoadModal(false)}
              className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg"
            >
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
