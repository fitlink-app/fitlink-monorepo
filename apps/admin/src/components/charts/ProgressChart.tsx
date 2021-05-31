import CircleProgess from "./CircleProgress"

export type ProgressChartProps = {
  progress: number
  icon: React.ReactNode
  value: string
  label: string
}

export default function ProgressChart({
  progress,
  icon,
  value,
  label
}: ProgressChartProps) {
  return (
    <>
      <CircleProgess
        progress={ progress }
        icon={ icon }
        radius={ 50 }
      />
      <h3 className="h5 color-primary mb-0 mt-1">{value}</h3>
      <h4 className="p">{label}</h4>
    </>
  )
}