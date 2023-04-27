import Card from './Card'

export type BenefitProps = {
  className?: string
  image?: string
  brand: string
  shortTitle: string
  onClick?: (e: any) => void
  showExtra?: boolean
  title?: string
  description?: string
  url?: string
}

export default function Benefit({
  className = '',
  image = '',
  brand,
  shortTitle,
  onClick,
  showExtra = false,
  title,
  description,
  url
}: BenefitProps) {
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
      </Card>

      {showExtra && (
        <div className="reward-extra">
          <h4>{title}</h4>
          <p>{description}</p>
          {url && <a href={url}>More info</a>}
        </div>
      )}
    </>
  )
}
