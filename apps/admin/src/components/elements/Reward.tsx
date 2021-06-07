import { format } from 'date-fns'
import Card from './Card'

export type RewardProps = {
  className?: string
  image?: string
  brand: string
  shortDescription: string
  points: number
  expires: string
  redeemed?: number
  onClick?: (e:any) => void
}

export default function Reward({
  className = '',
  image = '',
  brand,
  shortDescription,
  points,
  expires,
  redeemed = 0,
  onClick
}:RewardProps) {
  return (
    <Card className={`reward ${className}`} onClick={onClick}>
      <div className="card__background" style={{backgroundImage: `url(${image})`}} />
      <div className="card__bottom">
        <h3 className="h5">
          <small>{brand}</small>
          {shortDescription}
        </h3>
      </div>
      <div className="card__top">
        <div className="card__chip">{points.toLocaleString()} points</div>
        { redeemed > 0 && <h4 className="p">{redeemed.toLocaleString()} redeemed</h4> }
        <div className="reward__expires">
          <small>Expires</small>
          { format(new Date(expires), 'do MMM, yyyy') }
        </div>
      </div>
    </Card>
  )
}