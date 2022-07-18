import { format } from 'date-fns'

export type NewsItemProps = {
  title: string
  excerpt: string
  date: string | Date
  author: string
  image: string
  onClick?: React.MouseEventHandler<HTMLElement>
}

export default function NewsItem({
  title,
  excerpt,
  date,
  author,
  image,
  onClick
}: NewsItemProps) {
  return (
    <article className="blog-thumb" onClick={onClick}>
      <div
        className="blog-thumb__image"
        style={{ backgroundImage: `url(${image})` }}></div>
      <h3 className="h5 mt-2">{title}</h3>
      <p>{excerpt}</p>
      <p>
        <strong>
          {author && <small>{author} - </small>}
          <small>
            {format(
              typeof date === 'string' ? new Date(date) : date,
              'do MMMM yyyy'
            )}
          </small>
        </strong>
      </p>
    </article>
  )
}
