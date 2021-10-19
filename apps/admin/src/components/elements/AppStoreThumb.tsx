import parse from 'html-react-parser'
import Link from 'next/link'

export type AppStoreItem = {
  title: string
  logo: string
  body: string
  type: string
  category: string
  link: string
  group: string
}

export default function AppStoreThumb({
  title,
  logo,
  body,
  type,
  category,
  link
}: AppStoreItem) {
  return (
    <Link href={link}>
      <a className="blog-thumb" target="_blank">
        <div
          className="blog-thumb__image blog-thumb__image__logo"
          style={{ backgroundImage: `url(${logo})` }}></div>
        <h3 className="h5 mt-2">{parse(title)}</h3>
        <p>{parse(body)}</p>
        <p>
          <strong>
            <small>{category}</small>
          </strong>
        </p>
        <p>
          <span className="chip chip-primary mr-1">{type}</span>
        </p>
      </a>
    </Link>
  )
}
