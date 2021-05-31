export type CircleProgessProps = {
  progress: number
  icon?: React.ReactNode
  radius?: number
  strokeWidth?: number
  color?: string
  gradient?: string[]
}

export default function CircleProgess({
  progress,
  icon = <></>,
  radius = 46,
  strokeWidth = 8,
  color = '#00E9D7',
  gradient
}:CircleProgessProps) {
  const normalizedRadius = radius - strokeWidth * 0.5
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDashoffset = circumference - (progress / 100) * circumference
  return (
    <div className="circle-progress" style={{color: color}}>
      <svg height={radius * 2} width={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`} className="block">
        <defs>
          { gradient && (
            <linearGradient id="linear" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={gradient[0]} />
              <stop offset="100%" stopColor={gradient[1]} />
            </linearGradient>
          )}
        </defs>
        <circle
          stroke={gradient ? 'url(#linear)' : color}
          fill="transparent"
          strokeWidth={strokeWidth * 0.75}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          opacity="0.2"
        />
        <circle
          stroke={gradient ? 'url(#linear)' : color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeLinecap="round"
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </svg>
      <div className="circle-progress__icon">
        {icon}
      </div>
    </div>
  )
}