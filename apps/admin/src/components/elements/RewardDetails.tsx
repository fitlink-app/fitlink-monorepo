import { format } from 'date-fns'

export type RewardDetailsProps = {
  image?: string
  brand: string
  shortDescription: string
  points: number
  expires: string
  redeemed?: number
  created?: string
  instructions?: string
  url?: string
  description?: string
}

export default function RewardDetails({
  image,
  brand,
  shortDescription,
  points,
  expires,
  redeemed,
  created,
  instructions,
  url,
  description
}: RewardDetailsProps) {
  
  return (
    <>
      <h4 className="light mb-3">Reward details</h4>
      { image &&
        <img src={image} alt={shortDescription} className="block-img box-shadow br-1 mb-2" />
      }
      <h6>Date created</h6>
      <p>{ format(new Date(created), 'yyyy-MM-dd H:m:s OOOO') }</p>
      <hr className="tight" />
      <h6>Brand</h6>
      <p>{ brand }</p>
      <hr className="tight" />
      <h6>Short description</h6>
      <p>{ shortDescription }</p>
      <hr className="tight" />
      <h6>Description</h6>
      <p>{ description }</p>
      <hr className="tight" />
      <h6>Point required</h6>
      <p>{ points.toLocaleString() }</p>
      <hr className="tight" />
      <h6>Times redeemed</h6>
      <p>{ redeemed.toLocaleString() }</p>
      <hr className="tight" />
      <h6>Expires</h6>
      <p>{ format(new Date(expires), 'yyyy-MM-dd H:m:s OOOO') }</p>
      <hr className="tight" />
      <h6>Instructions to claim</h6>
      <p>{ instructions }</p>
      <hr className="tight" />
      <h6>Claim URL</h6>
      <p>{ url }</p>
    </>
  )
}