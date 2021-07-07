import IconImage from '../icons/IconImage'

export type ImageStackProps = {
  files: {
    url: string
  }[],
  label?: string
  onClick?: () => void
}

export default function ImageStack({
  files,
  label,
  onClick
}:ImageStackProps) {
  return (
    <>
      { label && <label className="block">{label}</label> }
      <div className={`image-stack image-count-${files.length > 4 ? 4 : files.length}`}>
        { files.slice(0, 4).map((f, i) => (
          <div
            key={`img_${i}`}
            style={{backgroundImage: `url(${f.url})`}}
          />
        ))}
        { files.length > 4 &&
          <div className="more">
            +{files.length-4} more
          </div>
        }
        <IconImage className={files.length === 0 ? 'always-visible' : ''} />
      </div>
    </>
  )
}