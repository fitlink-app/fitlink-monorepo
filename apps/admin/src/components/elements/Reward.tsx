import { RewardRedeemType } from '@fitlink/api/src/modules/rewards/rewards.constants'
import { format } from 'date-fns'
import Card from './Card'

export type RewardProps = {
    className?: string
    image?: string
    brand: string
    shortTitle: string
    points: number
    redeemType?: RewardRedeemType
    expires: string | Date
    redeemed?: number
    onClick?: (e: any) => void
    showExtra?: boolean
    title?: string
    description?: string
    code?: string
    instructions?: string
    url?: string
    admin?: {
        cost?: number
        currency?: {
            symbol?: string
            value?: string
        }
        options?: { value: string; label: string }[]
        purchased?: boolean
        available?: number
        image?: string
        brand?: string
        title?: string
        description?: string
    }
}

export default function Reward({
    className = '',
    image = '',
    brand,
    shortTitle,
    points,
    redeemType,
    expires,
    redeemed = 0,
    onClick,
    showExtra = false,
    title,
    description,
    code,
    instructions,
    admin
}: RewardProps) {
    return (
        <>
            <Card className={`reward ${className}`} onClick={onClick}>
                {admin?.purchased || !admin ? ( // none charity, or purchased
                    <>
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
                            {points > 0 && (
                                <div className="card__chip">
                                    {points.toLocaleString()}{' '}
                                    {redeemType === RewardRedeemType.BFIT ? '$BFIT' : 'points'}
                                </div>
                            )}
                            {redeemed > 0 && (
                                <h4 className="p">{redeemed.toLocaleString()} redeemed</h4>
                            )}
                            {admin?.purchased !== undefined ? (
                                <div className="reward__expires">
                                    <small>Remaining</small>
                                    {admin?.available || ''}
                                </div>
                            ) : (
                                <div className="reward__expires">
                                    <small>Expires</small>
                                    {format(new Date(expires), 'do MMM, yyyy')}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    // charity, unpurchased
                    <>
                        <div
                            className="card__background"
                            style={{ backgroundImage: `url(${admin?.image || ''})` }}
                        />
                        <div className="card__bottom">
                            <h3 className="h5">
                                <small>{admin?.brand}</small>
                                {admin?.title}
                            </h3>
                        </div>
                        <div className="card__top">
                            <div className="card__chip">
                                {admin?.currency.symbol}
                                {admin?.cost.toLocaleString()} each
                            </div>
                            <div className="reward__expires">
                                <div className={`button small`}>Purchase</div>
                            </div>
                        </div>
                    </>
                )}
            </Card>
            {showExtra && (
                <div className="reward-extra">
                    <h4>{title}</h4>
                    <p>{description}</p>
                    {code && <h5>{code}</h5>}
                    {instructions && (
                        <p>
                            <small>{instructions}</small>
                        </p>
                    )}
                </div>
            )}
        </>
    )
}
