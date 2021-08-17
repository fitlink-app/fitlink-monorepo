import parse from 'html-react-parser'
import { format } from 'date-fns'
import Link from 'next/link'

export type BlogThumbProps = {
  id: string
  title: string
  excerpt: string
  date: string
  image: string
  prefix?: string
}

export default function BlogThumb({
  id,
  title,
  excerpt,
  date,
  image,
  prefix = ''
}: BlogThumbProps) {
  return (
    <Link href={`${prefix}/knowledge-base/${id}`}>
      <a className="blog-thumb">
        <div
          className="blog-thumb__image"
          style={{ backgroundImage: `url(${image})` }}></div>
        <h3 className="h5 mt-2">{parse(title)}</h3>
        <p>{parse(excerpt)}</p>
        <p>
          <strong>
            <small>{format(new Date(date), 'do MMMM yyyy')}</small>
          </strong>
        </p>
      </a>
    </Link>
  )
}
