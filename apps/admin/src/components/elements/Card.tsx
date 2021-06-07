export type CardProps = {
  className?: string
  children: React.ReactNode
  onClick: (e:any) => void
}

export default function Card({
  className = '',
  children,
  onClick
}:CardProps) {
  return (
    <div className={`card ${className}`} onClick={onClick}>
      {children}
    </div>
  )
}