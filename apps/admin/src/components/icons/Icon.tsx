export type IconProps = {
  width?: string
  height?: string
  children?: React.ReactNode
  className?: string
  viewBox?: string
  onClick?: (e?: any) => void
}

export default function Icon({
  width = '16px',
  height = '16px',
  children = <></>,
  className = '',
  viewBox = '0 0 32 32',
  onClick = () => {}
}: IconProps) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      onClick={onClick}
      viewBox={viewBox}>
      {children}
    </svg>
  )
}
