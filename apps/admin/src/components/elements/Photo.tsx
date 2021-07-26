import IconTrash from '../icons/IconTrash'

const imgWithClick = { cursor: 'pointer' }

export default function Photo({
  index,
  onClick,
  photo,
  margin,
  direction,
  top,
  left,
  remove
}) {
  const imgStyle:any = {
    margin: `1px`,
    display: 'block'
  }
  if (direction === 'column') {
    imgStyle.position = 'absolute'
    imgStyle.left = left
    imgStyle.top = top
  }

  const handleClick = event => {
    onClick(event, { photo, index })
  }
  
  const handleDelete = () => {
    remove(photo)
  }

  return (
    <div className="relative">
      <button onClick={ handleDelete } className="button small remove">Delete</button>
      <img
        style={onClick ? { ...imgStyle, ...imgWithClick } : imgStyle}
        {...photo}
        onClick={onClick ? handleClick : null}
        alt='img'
      />
    </div>
  )
}