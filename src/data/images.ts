export type SceneType = 'campus' | 'dormitory' | 'canteen' | 'library' | 'playground' | 'classroom' | 'exam' | 'home' | 'office'

export type CharacterRole = 'player' | 'canteen_auntie' | 'dorm_auntie' | 'roommate_xiaoyu' | 'roommate_zhangjing' | 'roommate_sisi'

export interface SceneBackground {
  type: SceneType
  name: string
  imageUrl: string
}

export interface CharacterImage {
  id: string
  name: string
  role: CharacterRole
  imageUrl: string
  expression?: 'normal' | 'happy' | 'sad' | 'thinking' | 'surprised' | 'tired' | 'kind' | 'strict' | 'shy'
}

export const sceneBackgrounds: Record<SceneType, string> = {
  campus: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20college%20campus%20scenery%20with%20willow%20trees%20and%20lake%20at%20sunset%20warm%20golden%20light%20anime%20style%20soft%20pastel%20colors&image_size=landscape_16_9',
  dormitory: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20girls%20dormitory%20room%20with%20bunk%20beds%20pink%20decorations%20warm%20lighting%20anime%20style%20soft%20colors&image_size=landscape_16_9',
  canteen: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=college%20canteen%20interior%20with%20food%20stalls%20students%20eating%20warm%20atmosphere%20anime%20style%20soft%20colors&image_size=landscape_16_9',
  library: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=college%20library%20interior%20with%20bookshelves%20students%20studying%20quiet%20atmosphere%20warm%20lighting%20anime%20style&image_size=landscape_16_9',
  playground: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=college%20playground%20track%20and%20field%20students%20exercising%20sunset%20warm%20light%20anime%20style%20soft%20pastel%20colors&image_size=landscape_16_9',
  classroom: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=college%20classroom%20interior%20with%20desks%20and%20chairs%20students%20listening%20to%20lecture%20bright%20lighting%20anime%20style&image_size=landscape_16_9',
  exam: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=exam%20hall%20interior%20students%20writing%20exams%20quiet%20serious%20atmosphere%20anime%20style&image_size=landscape_16_9',
  home: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20home%20living%20room%20warm%20family%20atmosphere%20anime%20style%20soft%20colors&image_size=landscape_16_9',
  office: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=college%20counselor%20office%20interior%20desk%20with%20files%20warm%20lighting%20professional%20atmosphere%20anime%20style&image_size=landscape_16_9',
}

export const characterImages: Record<string, CharacterImage> = {
  player_normal: {
    id: 'player_normal',
    name: '平静',
    role: 'player',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20long%20black%20hair%20gentle%20expression%20wearing%20white%20shirt%20soft%20lighting%20clean%20background&image_size=portrait_4_3',
    expression: 'normal',
  },
  player_happy: {
    id: 'player_happy',
    name: '开心',
    role: 'player',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20long%20black%20hair%20smiling%20happily%20bright%20eyes%20wearing%20casual%20clothes%20warm%20lighting&image_size=portrait_4_3',
    expression: 'happy',
  },
  player_sad: {
    id: 'player_sad',
    name: '难过',
    role: 'player',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20long%20black%20hair%20sad%20expression%20teary%20eyes%20soft%20lighting%20melancholy%20atmosphere&image_size=portrait_4_3',
    expression: 'sad',
  },
  player_thinking: {
    id: 'player_thinking',
    name: '思考',
    role: 'player',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20long%20black%20hair%20thinking%20expression%20hand%20on%20cheek%20focused%20eyes%20soft%20lighting&image_size=portrait_4_3',
    expression: 'thinking',
  },
  player_surprised: {
    id: 'player_surprised',
    name: '惊讶',
    role: 'player',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20long%20black%20hair%20surprised%20expression%20wide%20eyes%20open%20mouth%20soft%20lighting&image_size=portrait_4_3',
    expression: 'surprised',
  },
  player_tired: {
    id: 'player_tired',
    name: '疲惫',
    role: 'player',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20long%20black%20hair%20tired%20expression%20sleepy%20eyes%20slightly%20droopy%20soft%20lighting&image_size=portrait_4_3',
    expression: 'tired',
  },
  canteen_auntie: {
    id: 'canteen_auntie',
    name: '食堂阿姨',
    role: 'canteen_auntie',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20middle%20aged%20Chinese%20woman%20with%20short%20hair%20wearing%20white%20apron%20kind%20smile%20holding%20ladle%20warm%20expression%20soft%20lighting&image_size=portrait_4_3',
    expression: 'kind',
  },
  dorm_auntie: {
    id: 'dorm_auntie',
    name: '宿管阿姨',
    role: 'dorm_auntie',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20middle%20aged%20Chinese%20woman%20with%20curly%20hair%20wearing%20uniform%20friendly%20smile%20holding%20keys%20warm%20lighting&image_size=portrait_4_3',
    expression: 'kind',
  },
  roommate_xiaoyu: {
    id: 'roommate_xiaoyu',
    name: '林小雨',
    role: 'roommate_xiaoyu',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20ponytail%20cheerful%20expression%20bright%20eyes%20casual%20clothes%20energetic%20soft%20lighting&image_size=portrait_4_3',
    expression: 'happy',
  },
  roommate_zhangjing: {
    id: 'roommate_zhangjing',
    name: '张静',
    role: 'roommate_zhangjing',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20long%20hair%20gentle%20smile%20wearing%20glasses%20studious%20expression%20soft%20lighting&image_size=portrait_4_3',
    expression: 'normal',
  },
  roommate_sisi: {
    id: 'roommate_sisi',
    name: '陈思思',
    role: 'roommate_sisi',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=anime%20style%20portrait%20of%20a%20young%20Chinese%20woman%20with%20short%20hair%20wearing%20glasses%20quiet%20expression%20reading%20book%20soft%20lighting&image_size=portrait_4_3',
    expression: 'thinking',
  },
}

export const getSceneBackground = (type: SceneType): string => {
  return sceneBackgrounds[type] || sceneBackgrounds.campus
}

export const getCharacterImage = (expression: string = 'normal'): CharacterImage => {
  const key = `player_${expression}`
  return characterImages[key] || characterImages.player_normal
}

export const getCharacterByRole = (role: CharacterRole): CharacterImage | undefined => {
  return Object.values(characterImages).find((img) => img.role === role)
}

export const getCharacterById = (id: string): CharacterImage | undefined => {
  return characterImages[id]
}
