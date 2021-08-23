import { useEffect, useState } from 'react'
import clsx from 'clsx'
import Gallery from 'react-photo-gallery'
import arrayMove from 'array-move'
import { SortableContainer, SortableElement } from 'react-sortable-hoc'
import Photo from './Photo'
import IconImage from '../icons/IconImage'
import Modal from './Modal'
import ImageUploadDropper from './ImageUploadDropper'

export type ImageFile = {
  url: string
  width: number
  height: number
  id?: string
  file?: File
}

export type ImageStackProps = {
  files: ImageFile[]
  label?: string
  readOnly?: boolean
  onChange?: (files: ImageFile[]) => void
}

const noop = () => {}

export default function ImageStack({
  files,
  label,
  readOnly = false,
  onChange = noop
}: ImageStackProps) {
  const [items, setItems] = useState(
    files.map((e) => {
      return {
        url: e.url,
        width: e.width,
        height: e.height,
        file: e.file,
        id: e.id
      }
    })
  )
  const [showModal, setShowModal] = useState(false)
  const iconClasses = clsx({
    icon: true,
    'always-visible': files.length === 0
  })

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setItems(arrayMove(items, oldIndex, newIndex))
  }

  const handleClick = () => {
    if (!readOnly) setShowModal(true)
  }

  const remove = (photo) => {
    const index = items.findIndex(
      (e) => JSON.stringify(photo) === JSON.stringify(e)
    )
    const arr = [...items]
    arr.splice(index, 1)
    setItems(arr)
  }

  const appendFiles = (files) => {
    setItems((items) => [...items, ...files])
  }

  useEffect(() => {
    if (onChange) {
      onChange(items)
    }
  }, [items])

  const SortablePhoto = SortableElement((item) => (
    <Photo {...item} remove={(i) => remove(i)} />
  ))
  const SortableGallery = SortableContainer(({ items }) => (
    <Gallery
      photos={items}
      renderImage={(props) => <SortablePhoto {...props} />}
    />
  ))

  return (
    <>
      {label && <label className="block">{label}</label>}
      <div
        className={`image-stack image-count-${
          items.length > 4 ? 4 : items.length
        }`}
        onClick={handleClick}>
        {items.slice(0, 4).map((f, i) => (
          <div key={`img_${i}`} style={{ backgroundImage: `url(${f.url})` }} />
        ))}
        {items.length > 4 && (
          <div className="more">+{items.length - 4} more</div>
        )}
        <span className={iconClasses}>
          <IconImage />
        </span>
      </div>

      {showModal && (
        <Modal close={() => setShowModal(false)} size="large">
          <h4 className="h5 light">Select Images</h4>
          <ImageUploadDropper onChange={appendFiles} />
          <div className="sortable">
            <SortableGallery
              items={items.map((e) => ({
                src: e.url,
                width: e.width || 1920,
                height: e.height || 1080
              }))}
              onSortEnd={onSortEnd}
              axis={'xy'}
              helperClass="sortableHelper"
            />
          </div>
        </Modal>
      )}
    </>
  )
}
