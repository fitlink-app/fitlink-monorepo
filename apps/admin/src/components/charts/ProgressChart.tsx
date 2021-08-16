import CircleProgess from './CircleProgress'

export type ProgressChartProps = {
  progress: number
  icon: React.ReactNode
  value: string
  goal?: string
  label: string
  color?: string
}

export default function ProgressChart({
  progress,
  icon,
  value,
  goal,
  label,
  color = '#00E9D7'
}: ProgressChartProps) {
  console.log(progress)
  return (
    <>
      <CircleProgess
        progress={progress}
        icon={icon}
        radius={50}
        color={color}
      />
      <h3 className="h5 color-primary mb-0 mt-1">
        <span style={{ color: color }}>{value}</span>
        {goal && <small className="color-light-grey"> / {goal}</small>}
      </h3>
      <h4 className="p">{label}</h4>
    </>
  )
}
