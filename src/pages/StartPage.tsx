import { useState } from 'react'
import { useGameStore } from '@/store/gameStore'

export function StartPage() {
  const startGame = useGameStore((state) => state.startGame)
  const startChapter = useGameStore((state) => state.startChapter)
  const isGameStarted = useGameStore((state) => state.isGameStarted)
  const chapters = useGameStore((state) => state.chapters)
  const unlockedChapters = useGameStore((state) => state.unlockedChapters)
  const setPlayerName = useGameStore((state) => state.setPlayerName)
  const [playerNameInput, setPlayerNameInput] = useState('')
  const [nameError, setNameError] = useState('')

  if (isGameStarted) {
    return null
  }

  const getChapterNumber = (chapterId: string): number => {
    const match = chapterId.match(/chapter(\d+)/)
    return match ? parseInt(match[1]) : 0
  }

  const getChapterStatus = (chapterId: string): 'locked' | 'unlocked' => {
    if (chapterId === 'prologue') return 'unlocked'
    return unlockedChapters.includes(chapterId) ? 'unlocked' : 'locked'
  }

  const handleChapterClick = (chapterId: string) => {
    if (getChapterStatus(chapterId) === 'unlocked') {
      if (!playerNameInput.trim()) {
        setNameError('请输入你的名字')
        return
      }
      const error = setPlayerName(playerNameInput)
      if (error) {
        setNameError(error)
        return
      }
      startChapter(chapterId)
    }
  }

  const sortedChapters = [...chapters].sort((a, b) => getChapterNumber(a.id) - getChapterNumber(b.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute top-20 right-20 w-3 h-3 bg-yellow-200 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDuration: '2.5s' }} />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-yellow-300 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 right-10 w-4 h-4 bg-yellow-200 rounded-full animate-ping" style={{ animationDuration: '3.5s' }} />
        <div className="absolute top-1/2 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ animationDuration: '2.8s' }} />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <img
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20three%20happy%20young%20Chinese%20women%20students%20standing%20together%20on%20college%20campus%20sunny%20day%20one%20holding%20book%20laughing%20joyfully%20sparkling%20effects%20around%20them%20soft%20pastel%20pink%20purple%20blue%20background%20cherry%20blossoms%20falling&image_size=landscape_16_9"
              alt="校园少女"
              className="w-full max-w-2xl mx-auto rounded-3xl shadow-2xl border-4 border-white/50 transform hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce">✨</div>
            <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌸</div>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-pulse">
            她的青春
          </h1>
          <p className="text-gray-600 text-lg">
            普通二本女生的成长日记
          </p>
          <p className="text-gray-500 mt-2">
            从文学殿堂到AI+人文的跨界之旅
          </p>

          <div className="mt-6 flex justify-center">
            <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg p-4 border border-white/50 w-full max-w-md">
              <label className="block text-gray-700 text-sm font-medium mb-2 text-center">请输入你的名字</label>
              <input
                type="text"
                value={playerNameInput}
                onChange={(e) => {
                  setPlayerNameInput(e.target.value)
                  setNameError('')
                }}
                placeholder="输入2-10个字符"
                className="w-full px-4 py-3 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:outline-none transition-colors text-center text-lg"
                maxLength={10}
              />
              {nameError && (
                <p className="text-red-500 text-sm mt-2 text-center">{nameError}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-6 border border-white/50">
          <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">关于这个故事</h2>
          <div className="space-y-3 text-gray-600">
            <p className="flex items-start gap-2">
              <span className="text-lg">📚</span>
              <span>讲述一个普通二本院校文学专业女生的大学四年成长故事</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>从迷茫到坚定，从文学到AI+人文的跨界探索</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-lg">💕</span>
              <span>传递"大胆爱自己，你值得美好的未来"的温暖信念</span>
            </p>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-6 border border-white/50">
          <h2 className="text-xl font-bold text-gray-700 mb-6 text-center">📖 章节选择</h2>
          
          {sortedChapters.length === 0 ? (
            <p className="text-center text-gray-500 py-8">章节数据加载中...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedChapters.map((chapter, index) => {
                const status = getChapterStatus(chapter.id)
                const isUnlocked = status === 'unlocked'
                const chapterNumber = getChapterNumber(chapter.id)
                
                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleChapterClick(chapter.id)}
                    disabled={!isUnlocked}
                    className={`relative p-6 rounded-xl transition-all duration-300 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-30">🔒</span>
                      </div>
                    )}
                    
                    <div className={`relative z-10 ${!isUnlocked ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold">{chapterNumber}</span>
                        {isUnlocked && <span className="text-sm bg-white/20 px-2 py-0.5 rounded">已解锁</span>}
                      </div>
                      <h3 className="text-lg font-bold mb-1">{chapter.title}</h3>
                      <p className="text-sm opacity-90">{chapter.subtitle}</p>
                      <p className="text-xs mt-2 opacity-70">{chapter.year}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <p className="text-center text-gray-500 text-sm mt-6">
            完成章节后将自动解锁下一章 | 可随时回顾已完成的章节
          </p>
        </div>

        <button
          onClick={() => {
            if (!playerNameInput.trim()) {
              setNameError('请输入你的名字')
              return
            }
            const error = setPlayerName(playerNameInput)
            if (error) {
              setNameError(error)
              return
            }
            startGame()
          }}
          className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl text-xl"
        >
          <span className="flex items-center justify-center gap-2">
            <span>🎮</span>
            继续游戏
          </span>
        </button>

        <p className="text-center text-gray-400 text-sm mt-6">
          每一个选择，都会影响她的人生轨迹
        </p>
      </div>
    </div>
  )
}
