import { format } from 'date-fns'
import Card from './Card'

export type RewardProps = {
  className?: string
  image?: string
  brand: string
  shortTitle: string
  points: number
  expires: string | Date
  redeemed?: number
  onClick?: (e: any) => void
  showExtra?: boolean
  title?: string
  description?: string
  code?: string
  instructions?: string
  cost?: string
}

export default function Reward({
  className = '',
  image = '',
  brand,
  shortTitle,
  points,
  expires,
  redeemed = 0,
  onClick,
  showExtra = false,
  title,
  description,
  code,
  instructions,
  cost
}: RewardProps) {
  return (
    <>
      <Card className={`reward ${className}`} onClick={onClick}>
        <div
          className="card__background"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="card__bottom">
          <h3 className="h5">
            <small>{brand}</small>
            {shortTitle}
          </h3>
        </div>
        <div className="card__top">
          { points > 0 &&
            <div className="card__chip">{points.toLocaleString()} points</div>
          }
          { cost &&
            <div className="card__chip">{cost}</div>
          }
          {redeemed > 0 && (
            <h4 className="p">{redeemed.toLocaleString()} redeemed</h4>
          )}
          { expires !== '' &&
            <div className="reward__expires">
              <small>Expires</small>
              {format(new Date(expires), 'do MMM, yyyy')}
            </div>
          }
        </div>
      </Card>
      { showExtra &&
        <div className="reward-extra">
          <h4>{title}</h4>
          <p>{description}</p>
          <h5>{code}</h5>
          <p><small>{instructions}</small></p>
        </div>
      }
    </>
  )
}
