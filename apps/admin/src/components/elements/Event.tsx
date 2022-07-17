import { format } from 'date-fns'
import Button from './Button'
import Card from './Card'

export type EventProps = {
  className?: string
  image?: string
  title: string
  shortDescription?: string
  members: number
  startDate: string | Date
  type: string
  onClick?: (e: any) => void
}

export default function Event({
  className = '',
  image = '',
  title,
  shortDescription = '',
  members,
  startDate,
  type = '',
  onClick
}: EventProps) {
  return (
    <Card className={`league event ${className}`} onClick={onClick}>
      <div
        className="card__background"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="card__bottom">
        <h3 className="h5">{title}</h3>
        {shortDescription && <p>{shortDescription}</p>}
        <Button className="mt-2 small" label="View attendees" />
      </div>
      <div className="card__top">
        {type && (
          <div className="card__chip">
            {type.length > 0 ? type[0].toUpperCase() + type.slice(1) : type}
          </div>
        )}
        <h4 className="p">{members.toLocaleString()} attendees</h4>
        {startDate && (
          <div className="league__resets">
            <small>starts on</small>
            {format(
              typeof startDate === 'string' ? new Date(startDate) : startDate,
              'd MMM y'
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
