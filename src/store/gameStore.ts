import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, CharacterState, StoryEvent, Choice, GameChapter } from '@/types'

export interface SaveSlot {
  id: string
  timestamp: number
  chapterId: string
  eventId: string
  character: CharacterState
  year: string
}

interface GameStore extends GameState {
  chapters: GameChapter[]
  setChapters: (chapters: GameChapter[]) => void
  startGame: () => void
  startChapter: (chapterId: string) => boolean
  resetGame: () => void
  returnToHome: () => void
  goToEvent: (eventId: string) => void
  makeChoice: (choice: Choice) => void
  getCurrentEvent: () => StoryEvent | undefined
  getCurrentChapter: () => GameChapter | undefined
  unlockChapter: (chapterId: string) => void
  updateCharacter: (updates: Partial<CharacterState>) => void
  saveGame: (slotId: string) => SaveSlot | null
  loadGame: (slotId: string) => boolean
  deleteSave: (slotId: string) => void
  getSaveSlots: () => SaveSlot[]
  goBack: () => boolean
  gameHistory: { eventId: string; character: CharacterState }[]
  canUnlockLoveChapter: () => boolean
  playerName: string
  setPlayerName: (name: string) => string | null
}

const initialCharacter: CharacterState = {
  knowledge: 50,
  mood: 80,
  stamina: 60,
  literarySkill: 70,
  aiSkill: 0,
  social: 40,
  love: 0,
  money: 1500,
}

const initialState: GameState = {
  currentChapterId: 'prologue',
  currentEventId: '',
  character: initialCharacter,
  visitedEvents: [],
  unlockedChapters: ['prologue', 'chapter1'],
  isGameStarted: false,
  year: '2022年6月',
  playerName: '',
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      chapters: [],
      gameHistory: [],
      setChapters: (chapters: GameChapter[]) => {
        const allChapterIds = chapters.map((c) => c.id)
        const { isGameStarted, currentChapterId, currentEventId, unlockedChapters } = get()

        // 所有章节默认全部解锁，方便直接选择体验任意章节
        const mergedUnlocked = Array.from(new Set([...allChapterIds, ...unlockedChapters]))

        // 校验旧存档的进度是否仍然有效；章节或事件不存在时，回到首页，避免"暂无剧情"
        let isValidProgress = false
        if (isGameStarted && currentEventId) {
          const chapter = chapters.find((c) => c.id === currentChapterId)
          isValidProgress = !!chapter?.events.find((e) => e.id === currentEventId)
        }

        if (isValidProgress) {
          set({ chapters, unlockedChapters: mergedUnlocked })
        } else {
          set({
            chapters,
            unlockedChapters: mergedUnlocked,
            isGameStarted: false,
            currentEventId: '',
            currentChapterId: chapters[0]?.id || 'prologue',
            visitedEvents: [],
            gameHistory: [],
          })
        }
      },
      startGame: () => {
        const { chapters, unlockedChapters } = get()
        if (chapters.length > 0) {
          const sortedChapters = [...chapters].sort((a, b) => {
            const order = ['prologue', 'chapter1', 'chapter2', 'chapter3', 'chapter4', 'chapter_explore']
            return order.indexOf(a.id) - order.indexOf(b.id)
          })
          const firstUnlockedChapter = sortedChapters.find((c) => unlockedChapters.includes(c.id)) || sortedChapters[0]
          set({
            isGameStarted: true,
            currentChapterId: firstUnlockedChapter.id,
            currentEventId: firstUnlockedChapter.startEventId,
            visitedEvents: [],
            gameHistory: [],
            year: firstUnlockedChapter.year,
          })
        }
      },
      startChapter: (chapterId: string) => {
        const { chapters } = get()
        const chapter = chapters.find((c) => c.id === chapterId)
        if (chapter) {
          set({
            isGameStarted: true,
            currentChapterId: chapter.id,
            currentEventId: chapter.startEventId,
            visitedEvents: [],
            gameHistory: [],
            year: chapter.year,
            character: { ...initialCharacter },
          })
          return true
        }
        return false
      },
      resetGame: () => {
        set({
          ...initialState,
          chapters: get().chapters,
          gameHistory: [],
        })
      },
      returnToHome: () => {
        set({
          isGameStarted: false,
          currentEventId: '',
          visitedEvents: [],
          gameHistory: [],
        })
      },
      goToEvent: (eventId: string) => {
        const { currentEventId, character } = get()
        set((state) => ({
          currentEventId: eventId,
          visitedEvents: [...state.visitedEvents, eventId],
          gameHistory: [...state.gameHistory, { eventId: currentEventId, character: { ...character } }],
        }))
      },
      makeChoice: (choice: Choice) => {
        const { character, visitedEvents, currentEventId, chapters, currentChapterId } = get()
        const newCharacter = { ...character }
        if (choice.effects) {
          Object.keys(choice.effects).forEach((key) => {
            const k = key as keyof CharacterState
            if (k === 'money') {
              newCharacter[k] = (newCharacter[k] || 0) + (choice.effects?.[k] || 0)
            } else {
              newCharacter[k] = Math.max(0, Math.min(100, (newCharacter[k] || 0) + (choice.effects?.[k] || 0)))
            }
          })
        }

        const currentChapter = chapters.find((c) => c.id === currentChapterId)
        const nextEventExists = currentChapter?.events.find((e) => e.id === choice.nextEventId)

        if (!nextEventExists && choice.nextEventId.startsWith('chapter')) {
          const targetChapterId = choice.nextEventId.split('_')[0]
          const targetChapter = chapters.find((c) => c.id === targetChapterId)
          if (targetChapter) {
            const { unlockedChapters } = get()
            const newUnlockedChapters = unlockedChapters.includes(targetChapter.id)
              ? unlockedChapters
              : [...unlockedChapters, targetChapter.id]
            set({
              character: newCharacter,
              currentChapterId: targetChapter.id,
              currentEventId: targetChapter.startEventId,
              visitedEvents: [...visitedEvents, targetChapter.startEventId],
              unlockedChapters: newUnlockedChapters,
              year: targetChapter.year,
              gameHistory: [],
            })
            return
          }
        }

        set({
          character: newCharacter,
          currentEventId: choice.nextEventId,
          visitedEvents: [...visitedEvents, choice.nextEventId],
          gameHistory: [...get().gameHistory, { eventId: currentEventId, character: { ...character } }],
        })
      },
      getCurrentEvent: () => {
        const { currentChapterId, currentEventId, chapters } = get()
        const chapter = chapters.find((c) => c.id === currentChapterId)
        return chapter?.events.find((e) => e.id === currentEventId)
      },
      getCurrentChapter: () => {
        const { currentChapterId, chapters } = get()
        return chapters.find((c) => c.id === currentChapterId)
      },
      unlockChapter: (chapterId: string) => {
        set((state) => {
          if (!state.unlockedChapters.includes(chapterId)) {
            const chapter = get().chapters.find((c) => c.id === chapterId)
            return {
              unlockedChapters: [...state.unlockedChapters, chapterId],
              currentChapterId: chapterId,
              currentEventId: chapter?.startEventId || '',
              year: chapter?.year || state.year,
            }
          }
          return state
        })
      },
      canUnlockLoveChapter: () => {
        const { character } = get()
        return (
          character.knowledge >= 70 &&
          character.mood >= 80 &&
          character.stamina > 60 &&
          character.literarySkill > 70 &&
          character.social > 65 &&
          character.money > 2000
        )
      },
      setPlayerName: (name: string): string | null => {
        const bannedWords = [
          '支那', '倭', '汉奸', '走狗', '卖国', '贱人', '婊子', '荡妇',
          '傻逼', '蠢货', '脑残', '智障', '废物', '垃圾', '去死', '滚',
          'fuck', 'shit', 'bitch', 'damn', 'asshole', 'nigger', 'pussy',
        ]
        const cleanName = name.trim()
        if (!cleanName || cleanName.length < 2 || cleanName.length > 10) {
          return '姓名必须在2-10个字符之间'
        }
        for (const word of bannedWords) {
          if (cleanName.toLowerCase().includes(word.toLowerCase())) {
            return '姓名包含违规内容'
          }
        }
        if (!/^[\u4e00-\u9fa5a-zA-Z0-9]+$/.test(cleanName)) {
          return '姓名只能包含中文、英文和数字'
        }
        set({ playerName: cleanName })
        return null
      },
      updateCharacter: (updates: Partial<CharacterState>) => {
        set((state) => ({
          character: {
            ...state.character,
            ...updates,
          },
        }))
      },
      saveGame: (slotId: string): SaveSlot | null => {
        const { currentChapterId, currentEventId, character, year } = get()
        const save: SaveSlot = {
          id: slotId,
          timestamp: Date.now(),
          chapterId: currentChapterId,
          eventId: currentEventId,
          character: { ...character },
          year,
        }
        localStorage.setItem(`her-youth-save-${slotId}`, JSON.stringify(save))
        return save
      },
      loadGame: (slotId: string): boolean => {
        const saveStr = localStorage.getItem(`her-youth-save-${slotId}`)
        if (!saveStr) return false
        try {
          const save: SaveSlot = JSON.parse(saveStr)
          set({
            currentChapterId: save.chapterId,
            currentEventId: save.eventId,
            character: save.character,
            year: save.year,
            isGameStarted: true,
            visitedEvents: [],
            gameHistory: [],
          })
          return true
        } catch {
          return false
        }
      },
      deleteSave: (slotId: string) => {
        localStorage.removeItem(`her-youth-save-${slotId}`)
      },
      getSaveSlots: (): SaveSlot[] => {
        const slots: SaveSlot[] = []
        for (let i = 1; i <= 5; i++) {
          const saveStr = localStorage.getItem(`her-youth-save-slot${i}`)
          if (saveStr) {
            try {
              slots.push(JSON.parse(saveStr))
            } catch {
              continue
            }
          }
        }
        return slots
      },
      goBack: (): boolean => {
        const { gameHistory } = get()
        if (gameHistory.length === 0) return false
        const lastState = gameHistory[gameHistory.length - 1]
        set((state) => ({
          currentEventId: lastState.eventId,
          character: lastState.character,
          gameHistory: state.gameHistory.slice(0, -1),
        }))
        return true
      },
    }),
    {
      name: 'her-youth-game-storage',
      partialize: (state) => ({
        currentChapterId: state.currentChapterId,
        currentEventId: state.currentEventId,
        character: state.character,
        visitedEvents: state.visitedEvents,
        unlockedChapters: state.unlockedChapters,
        isGameStarted: state.isGameStarted,
        year: state.year,
      }),
    }
  )
)
