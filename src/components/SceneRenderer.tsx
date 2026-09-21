import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'
import { sceneBackgrounds, characterImages, getSceneBackground, getCharacterByRole, type SceneType, type CharacterRole } from '@/data/images'

export function SceneRenderer() {
  const currentEvent = useGameStore((state) => state.getCurrentEvent())
  const makeChoice = useGameStore((state) => state.makeChoice)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentBackground, setCurrentBackground] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [characterTransition, setCharacterTransition] = useState(false)

  useEffect(() => {
    if (!currentEvent) return

    setDisplayedText('')
    setIsTyping(true)
    setIsTransitioning(true)
    setCharacterTransition(true)

    setTimeout(() => {
      const sceneType = currentEvent.sceneType || determineSceneType(currentEvent.scene)
      setCurrentBackground(getSceneBackground(sceneType))
      setIsTransitioning(false)
    }, 150)

    setTimeout(() => {
      setCharacterTransition(false)
    }, 200)

    let index = 0
    const text = currentEvent.text
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 30)

    return () => clearInterval(timer)
  }, [currentEvent])

  const determineSceneType = (sceneName: string): SceneType => {
    if (sceneName.includes('食堂')) return 'canteen'
    if (sceneName.includes('宿舍')) return 'dormitory'
    if (sceneName.includes('图书馆')) return 'library'
    if (sceneName.includes('操场')) return 'playground'
    if (sceneName.includes('教室') || sceneName.includes('课')) return 'classroom'
    if (sceneName.includes('考场') || sceneName.includes('考试')) return 'exam'
    if (sceneName.includes('家')) return 'home'
    return 'campus'
  }

  const handleChoice = (choiceId: string) => {
    const choice = currentEvent?.choices.find((c) => c.id === choiceId)
    if (choice) {
      makeChoice(choice)
    }
  }

  const getCurrentCharacterImage = () => {
    if (!currentEvent) return characterImages.player_normal

    if (currentEvent.characterRole) {
      const npc = getCharacterByRole(currentEvent.characterRole as CharacterRole)
      if (npc) return npc
    }

    if (currentEvent.characterExpression) {
      const key = `player_${currentEvent.characterExpression}`
      return characterImages[key] || characterImages.player_normal
    }

    return characterImages.player_normal
  }

  if (!currentEvent) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">📖</div>
          <p className="text-lg">暂无剧情，请开始游戏</p>
        </div>
      </div>
    )
  }

  const characterImg = getCurrentCharacterImage()
  const isCloseUp = currentEvent.isCloseUp
  const isNPC = currentEvent.characterRole && currentEvent.characterRole !== 'player'

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{
          backgroundImage: `url(${currentBackground || sceneBackgrounds.campus})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

      <div className="relative z-10 flex flex-col h-full p-6">
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 max-w-6xl mx-auto w-full">
          <div
            className={`flex-shrink-0 transition-all duration-500 ${characterTransition ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} ${
              isCloseUp ? 'w-56 h-72 lg:w-64 lg:h-80' : 'w-48 h-64 lg:w-56 lg:h-72'
            }`}
          >
            <div className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 ${isNPC ? 'border-yellow-400' : 'border-white/50'} bg-gray-200`}>
                <img
                  src={characterImg.imageUrl}
                  alt={characterImg.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20long%20black%20hair%20gentle%20expression%20soft%20lighting&image_size=portrait_4_3'
                  }}
                />
              </div>
            {isNPC && (
              <div className="mt-2 text-center">
                <span className="bg-yellow-400/80 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  {characterImg.name}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full max-w-2xl">
            <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-xl p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📍</span>
                <span className="text-lg font-medium text-gray-700">{currentEvent.scene}</span>
              </div>

              <div className="text-gray-800 text-lg lg:text-xl leading-relaxed whitespace-pre-line min-h-[180px]">
                {displayedText}
                {isTyping && (
                  <span className="inline-block w-2 h-6 bg-pink-400 ml-1 animate-pulse" />
                )}
              </div>
            </div>

            {!isTyping && (
              <div className="space-y-3 mt-4">
                {currentEvent.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleChoice(choice.id)
                    }}
                    className={`w-full font-medium py-3 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] backdrop-blur-sm ${
                      choice.recommended
                        ? 'bg-gradient-to-r from-yellow-400/90 to-orange-400/90 hover:from-yellow-500 hover:to-orange-500 border-2 border-yellow-300'
                        : 'bg-gradient-to-r from-pink-400/90 to-purple-400/90 hover:from-pink-500 hover:to-purple-500'
                    } text-white`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{choice.recommended ? '🌟' : '✨'}</span>
                      <span>{choice.text}</span>
                      {choice.recommended && (
                        <span className="bg-white/20 px-2 py-0.5 rounded text-sm">推荐</span>
                      )}
                    </span>
                    {choice.effects && (
                      <span className="text-sm opacity-80 ml-4">
                        {Object.entries(choice.effects).map(([key, val]) => (
                          <span key={key} className={`ml-2 ${val && val > 0 ? 'text-green-200' : 'text-red-200'}`}>
                            {key === 'knowledge' && '学识'}
                            {key === 'mood' && '心情'}
                            {key === 'stamina' && '体力'}
                            {key === 'literarySkill' && '文学'}
                            {key === 'aiSkill' && 'AI'}
                            {key === 'social' && '社交'}
                            {key === 'love' && '恋爱'}
                            {key === 'money' && '存款'}
                            {val && val > 0 ? '+' : ''}{val}
                          </span>
                        ))}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isTyping && (
          <div className="text-center text-white/80 text-sm mt-4">
            点击跳过
          </div>
        )}
      </div>
    </div>
  )
}
