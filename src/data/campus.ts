export interface Position {
  x: number
  y: number
}

export interface Building {
  id: string
  name: string
  position: Position
  width: number
  height: number
  icon: string
  color: string
  description: string
}

export interface NPCData {
  id: string
  name: string
  position: Position
  icon: string
  color: string
  dialogEventId?: string
}

export interface MapArea {
  id: string
  name: string
  position: Position
  width: number
  height: number
  type: 'road' | 'grass' | 'building' | 'playground' | 'lake'
}

export const campusBuildings: Building[] = [
  {
    id: 'library',
    name: '图书馆',
    position: { x: 350, y: 150 },
    width: 120,
    height: 80,
    icon: '📚',
    color: '#8B9DC3',
    description: '学校最大的图书馆，藏书丰富',
  },
  {
    id: 'teaching',
    name: '教学楼',
    position: { x: 150, y: 200 },
    width: 180,
    height: 100,
    icon: '🏫',
    color: '#4ECDC4',
    description: '主要的教学场所',
  },
  {
    id: 'dormitory',
    name: '女生宿舍',
    position: { x: 550, y: 300 },
    width: 100,
    height: 120,
    icon: '🏠',
    color: '#FF6B6B',
    description: '402宿舍就在这里',
  },
  {
    id: 'canteen',
    name: '食堂',
    position: { x: 350, y: 350 },
    width: 80,
    height: 60,
    icon: '🍜',
    color: '#FFE66D',
    description: '提供各种美食',
  },
  {
    id: 'playground',
    name: '操场',
    position: { x: 50, y: 350 },
    width: 150,
    height: 100,
    icon: '🏃',
    color: '#95E1D3',
    description: '跑步、打球的好地方',
  },
  {
    id: 'gate',
    name: '校门',
    position: { x: 650, y: 100 },
    width: 60,
    height: 40,
    icon: '🚪',
    color: '#A66CFF',
    description: '学校的正门',
  },
]

export const campusNPCs: NPCData[] = [
  {
    id: 'xiaoyu',
    name: '林小雨',
    position: { x: 580, y: 350 },
    icon: '👧',
    color: '#FFB6C1',
    dialogEventId: 'explore_xiaoyu_love',
  },
  {
    id: 'zhangjing',
    name: '张静',
    position: { x: 380, y: 180 },
    icon: '👩‍🎓',
    color: '#ADD8E6',
    dialogEventId: 'explore_zhangjing_love',
  },
  {
    id: 'sisi',
    name: '陈思思',
    position: { x: 360, y: 180 },
    icon: '👓',
    color: '#DDA0DD',
    dialogEventId: 'explore_sisi_love',
  },
  {
    id: 'canteen_auntie',
    name: '食堂阿姨',
    position: { x: 370, y: 380 },
    icon: '👵',
    color: '#DEB887',
    dialogEventId: 'explore_canteen_auntie',
  },
  {
    id: 'dorm_auntie',
    name: '宿管阿姨',
    position: { x: 570, y: 320 },
    icon: '👩‍🔧',
    color: '#F4A460',
    dialogEventId: 'explore_dorm_auntie',
  },
]

export const mapAreas: MapArea[] = [
  { id: 'road1', name: '主干道', position: { x: 200, y: 250 }, width: 400, height: 40, type: 'road' },
  { id: 'road2', name: '支路', position: { x: 350, y: 100 }, width: 40, height: 300, type: 'road' },
  { id: 'grass1', name: '草坪', position: { x: 200, y: 80 }, width: 150, height: 100, type: 'grass' },
  { id: 'grass2', name: '花园', position: { x: 450, y: 200 }, width: 80, height: 80, type: 'grass' },
  { id: 'lake', name: '人工湖', position: { x: 100, y: 100 }, width: 80, height: 60, type: 'lake' },
]

export const mapWidth = 750
export const mapHeight = 500
