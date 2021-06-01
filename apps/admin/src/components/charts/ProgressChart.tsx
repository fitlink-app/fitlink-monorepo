import CircleProgess from "./CircleProgress"

export type ProgressChartProps = {
  progress: number
  icon: React.ReactNode
  value: string
  goal?: string
  label: string
}

export default function ProgressChart({
  progress,
  icon,
  value,
  goal,
  label
}: ProgressChartProps) {
  return (
    <>
      <CircleProgess
        progress={ progress }
        icon={ icon }
        radius={ 50 }
      />
      <h3 className="h5 color-primary mb-0 mt-1">
        {value}
        { goal && <small className="color-light-grey"> / {goal}</small>}
      </h3>
      <h4 className="p">{label}</h4>
    </>
  )
}