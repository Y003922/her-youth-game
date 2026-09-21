interface CharacterSpriteProps {
  type: 'player' | 'xiaoyu' | 'zhangjing' | 'sisi' | 'canteen_auntie' | 'dorm_auntie'
  direction: 'up' | 'down' | 'left' | 'right'
  isMoving?: boolean
  size?: number
}

export function CharacterSprite({ type, direction, isMoving = false, size = 50 }: CharacterSpriteProps) {
  const halfSize = size / 2
  const bodyHeight = size * 0.6
  const headSize = size * 0.35

  const getColor = () => {
    switch (type) {
      case 'player': return { skin: '#FFD4C4', hair: '#1a1a1a', top: '#FF69B4', bottom: '#87CEEB', eyes: '#1a1a1a' }
      case 'xiaoyu': return { skin: '#FFE4C9', hair: '#FFB6C1', top: '#FF6347', bottom: '#FFD700', eyes: '#1a1a1a' }
      case 'zhangjing': return { skin: '#FFE4D4', hair: '#2F4F4F', top: '#4169E1', bottom: '#F0E68C', eyes: '#1a1a1a' }
      case 'sisi': return { skin: '#FFF0F5', hair: '#4682B4', top: '#9370DB', bottom: '#B0C4DE', eyes: '#1a1a1a' }
      case 'canteen_auntie': return { skin: '#DEB887', hair: '#DAA520', top: '#F5F5F5', bottom: '#696969', eyes: '#1a1a1a' }
      case 'dorm_auntie': return { skin: '#F4A460', hair: '#CD853F', top: '#20B2AA', bottom: '#F0E68C', eyes: '#1a1a1a' }
      default: return { skin: '#FFD4C4', hair: '#1a1a1a', top: '#FF69B4', bottom: '#87CEEB', eyes: '#1a1a1a' }
    }
  }

  const colors = getColor()

  const getTransform = () => {
    switch (direction) {
      case 'up': return `translate(${halfSize}, ${halfSize}) rotate(0) translate(-${halfSize}, -${halfSize})`
      case 'down': return `translate(${halfSize}, ${halfSize}) rotate(180) translate(-${halfSize}, -${halfSize})`
      case 'left': return `translate(${halfSize}, ${halfSize}) rotate(-90) translate(-${halfSize}, -${halfSize})`
      case 'right': return `translate(${halfSize}, ${halfSize}) rotate(90) translate(-${halfSize}, -${halfSize})`
    }
  }

  const walkOffset = isMoving ? Math.sin(Date.now() / 150) * 2 : 0

  return (
    <svg
      width={size}
      height={size + 10}
      viewBox={`0 0 ${size} ${size + 10}`}
      style={{ transform: getTransform(), transition: 'transform 0.1s' }}
      className={isMoving ? 'animate-pulse' : ''}
    >
      <g transform={`translate(0, ${walkOffset})`}>
        <ellipse
          cx={halfSize}
          cy={size * 0.17}
          rx={headSize * 0.8}
          ry={headSize * 0.9}
          fill={colors.skin}
        />

        {(type === 'zhangjing' || type === 'sisi') && (
          <rect
            x={halfSize - headSize * 0.5}
            y={size * 0.1}
            width={headSize}
            height={headSize * 0.5}
            rx={2}
            fill="#888"
            opacity={0.5}
          />
        )}

        <circle cx={halfSize - headSize * 0.3} cy={size * 0.15} r={2} fill={colors.eyes} />
        <circle cx={halfSize + headSize * 0.3} cy={size * 0.15} r={2} fill={colors.eyes} />

        <ellipse cx={halfSize} cy={size * 0.22} rx={3} ry={2} fill="#FFB6C1" />

        {type === 'player' && (
          <>
            <path
              d={`M${halfSize - headSize * 0.7} ${size * 0.05} Q${halfSize - headSize * 0.9} ${size * 0.15} ${halfSize - headSize * 0.8} ${size * 0.35}`}
              stroke={colors.hair}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={`M${halfSize + headSize * 0.7} ${size * 0.05} Q${halfSize + headSize * 0.9} ${size * 0.15} ${halfSize + headSize * 0.8} ${size * 0.35}`}
              stroke={colors.hair}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
          </>
        )}

        {type === 'xiaoyu' && (
          <path
            d={`M${halfSize} ${size * 0.02} Q${halfSize + headSize * 0.3} ${size * 0.1} ${halfSize + headSize * 0.2} ${size * 0.25}`}
            stroke={colors.hair}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {type === 'canteen_auntie' && (
          <ellipse
            cx={halfSize}
            cy={size * 0.08}
            rx={headSize * 0.7}
            ry={headSize * 0.3}
            fill={colors.hair}
          />
        )}

        {type === 'dorm_auntie' && (
          <>
            <circle cx={halfSize - headSize * 0.3} cy={size * 0.1} r={headSize * 0.3} fill={colors.hair} />
            <circle cx={halfSize + headSize * 0.3} cy={size * 0.1} r={headSize * 0.3} fill={colors.hair} />
          </>
        )}

        <rect
          x={halfSize - headSize * 0.5}
          y={size * 0.32}
          width={headSize}
          height={bodyHeight * 0.5}
          rx={3}
          fill={colors.top}
        />

        {type === 'canteen_auntie' && (
          <rect
            x={halfSize - headSize * 0.6}
            y={size * 0.35}
            width={headSize * 1.2}
            height={bodyHeight * 0.4}
            rx={2}
            fill="#FFF"
            stroke="#DDD"
          />
        )}

        <rect
          x={halfSize - headSize * 0.4}
          y={size * 0.58}
          width={headSize * 0.8}
          height={bodyHeight * 0.4}
          rx={3}
          fill={colors.bottom}
        />

        <rect
          x={halfSize - headSize * 0.65}
          y={size * 0.35}
          width={headSize * 0.2}
          height={bodyHeight * 0.3}
          rx={2}
          fill={colors.top}
        />
        <rect
          x={halfSize + headSize * 0.45}
          y={size * 0.35}
          width={headSize * 0.2}
          height={bodyHeight * 0.3}
          rx={2}
          fill={colors.top}
        />

        <ellipse
          cx={halfSize - headSize * 0.3}
          cy={size + 5}
          rx={headSize * 0.15}
          ry={headSize * 0.1}
          fill="#333"
        />
        <ellipse
          cx={halfSize + headSize * 0.3}
          cy={size + 5}
          rx={headSize * 0.15}
          ry={headSize * 0.1}
          fill="#333"
        />
      </g>
    </svg>
  )
}
