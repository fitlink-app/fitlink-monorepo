import { format } from 'date-fns'
import Card from './Card'

export type RewardProps = {
  className?: string
  image?: string
  company: string
  shortDescription: string
  points: number
  expires: string
  claimed?: number
}

export default function Reward({
  className = '',
  image = '',
  company,
  shortDescription,
  points,
  expires,
  claimed = 0
}:RewardProps) {
  return (
    <Card className={`reward ${className}`}>
      <div className="card__background" style={{backgroundImage: `url(${image})`}} />
      <div className="card__bottom">
        <h3 className="h5">
          <small>{company}</small>
          {shortDescription}
        </h3>
      </div>
      <div className="card__top">
        <div className="card__chip">{points.toLocaleString()} points</div>
        { claimed > 0 && <h4 className="p">{claimed.toLocaleString()} claimed</h4> }
        <div className="reward__expires">
          <small>Expires</small>
          { format(new Date(expires), 'do MMM, yyyy') }
        </div>
      </div>
    </Card>
  )
}