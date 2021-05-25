import { formatDistance, parse } from 'date-fns'
import Card from './Card'

export type LeagueProps = {
  className?: string
  image?: string
  name: string
  description?: string
  members: number
  resetDate: string
  type: string
}

export default function League({
  className = '',
  image = '',
  name,
  description = '',
  members,
  resetDate,
  type
}:LeagueProps) {
  return (
    <Card className={`league ${className}`}>
      <div className="league__background" style={{backgroundImage: `url(${image})`}} />
      <div className="league__bottom">
        <h3 className="h5">{name}</h3>
        { description && <p>{description}</p> }
      </div>
      <div className="league__top">
        <div className="league__type">{type}</div>
        <h4 className="p">{members.toLocaleString()} members</h4>
        <div className="league__resets">
          <small>resets in</small>
          { formatDistance(new Date(), new Date(resetDate)) }
        </div>
      </div>
    </Card>
  )
}