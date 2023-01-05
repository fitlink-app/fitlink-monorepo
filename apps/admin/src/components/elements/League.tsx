import { formatDistance } from 'date-fns'
import Card from './Card'

export type LeagueProps = {
  className?: string
  image?: string
  name: string
  description?: string
  members: number
  resetDate: string | Date
  sport: string
  repeats?: boolean
  compete_to_earn?: boolean
  onClick?: (e: any) => void
}

export default function League({
  className = '',
  image = '',
  name,
  description = '',
  members,
  resetDate,
  sport = '',
  repeats = true,
  compete_to_earn = false,
  onClick
}: LeagueProps) {
  return (
    <Card className={`league ${className}`} onClick={onClick}>
      <div
        className="card__background"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="card__bottom">
        <h3 className="h5">{name}</h3>
        {description && <p>{description}</p>}
      </div>

      <div className="card__top">
        {compete_to_earn && <small className="earn">$</small>}

        <div className="card__chip">
          {sport.length > 0 ? sport[0].toUpperCase() + sport.slice(1) : sport}
        </div>

        <h4 className="p">{members.toLocaleString()} members</h4>

        <div className="league__resets">
          <small>{repeats ? 'resets in' : 'ends in'}</small>
          {formatDistance(new Date(), new Date(resetDate))}
        </div>
      </div>
    </Card>
  )
}
