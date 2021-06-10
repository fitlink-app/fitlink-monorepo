import { formatDistance } from 'date-fns'
import Card from './Card'

export type LeagueProps = {
  className?: string
  image?: string
  name: string
  description?: string
  members: number
  resetDate: string | Date
  type: string
  onClick?: (e:any) => void
}

export default function League({
  className = '',
  image = '',
  name,
  description = '',
  members,
  resetDate,
  type,
  onClick
}:LeagueProps) {
  return (
    <Card className={`league ${className}`} onClick={onClick}>
      <div className="card__background" style={{backgroundImage: `url(${image})`}} />
      <div className="card__bottom">
        <h3 className="h5">{name}</h3>
        { description && <p>{description}</p> }
      </div>
      <div className="card__top">
        <div className="card__chip">{type}</div>
        <h4 className="p">{members.toLocaleString()} members</h4>
        <div className="league__resets">
          <small>resets in</small>
          { formatDistance(new Date(), new Date(resetDate)) }
        </div>
      </div>
    </Card>
  )
}