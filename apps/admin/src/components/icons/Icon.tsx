export type IconProps = {
  width?: string
  height?: string
  children?: React.ReactNode
}

export default function Icon({
  width = '16px',
  height = '16px',
  children = <></>
}:IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 32 32"
    >
      {children}
    </svg>
  )
}