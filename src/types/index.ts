export interface CharacterState {
  knowledge: number
  mood: number
  stamina: number
  literarySkill: number
  aiSkill: number
  social: number
  love: number
  money: number
}

export interface Choice {
  id: string
  text: string
  effects?: Partial<CharacterState>
  nextEventId: string
  condition?: Partial<CharacterState>
  conditionOperator?: 'AND' | 'OR'
  recommended?: boolean
}

export interface StoryEvent {
  id: string
  scene: string
  sceneType?: 'campus' | 'dormitory' | 'canteen' | 'library' | 'playground' | 'classroom' | 'exam' | 'home' | 'office'
  text: string
  characterExpression?: string
  characterRole?: string
  characterImage?: string
  backgroundImage?: string
  isCloseUp?: boolean
  sceneImage?: string
  choices: Choice[]
  isEnding?: boolean
  endingTitle?: string
  endingDescription?: string
}

export interface GameChapter {
  id: string
  title: string
  subtitle: string
  year: string
  description: string
  startEventId: string
  events: StoryEvent[]
}

export interface GameState {
  currentChapterId: string
  currentEventId: string
  character: CharacterState
  visitedEvents: string[]
  unlockedChapters: string[]
  isGameStarted: boolean
  year: string
  playerName: string
}

export type ChapterId = 'chapter1' | 'chapter2' | 'chapter3' | 'chapter4' | 'chapter5'
