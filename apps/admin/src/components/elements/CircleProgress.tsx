export type CircleProps = {
  radius: number
  stroke: number
}

export default function CircleProgress({
  radius,
  stroke
}:CircleProps) {

  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
     >
       <circle
         stroke="white"
         stroke-dasharray={`${circumference} ${circumference}`}
         style={{ strokeDashoffset: circumference }}
         strokeWidth={stroke}
         fill="transparent"
         r={normalizedRadius}
         cx={radius}
         cy={radius}
      />
    </svg>
  )
}