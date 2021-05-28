export type CardProps = {
  className?: string
  children: React.ReactNode
}

export default function Card({
  className = '',
  children
}:CardProps) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  )
}