import { useState } from 'react'
import Input from '../elements/Input'
import Checkbox from '../elements/Checkbox'
import IconImage from '../icons/IconImage'
import NewsItem from '../elements/NewsItem'

export type NewsFormProps = {
  current?: {
    image?: string
    videoUrl?: string
    title?: string
    shortDescription?: string
    longDescription?: string
    commentsEnabled?: boolean
    author?: string
    created?: string
  }
}

export default function NewsForm({ current }: NewsFormProps) {
  const [image, setImage] = useState(current?.image || '')
  const created = current?.created ? new Date(current.created) : new Date()
  const [videoUrl, setVideoUrl] = useState(current?.videoUrl || '')
  const [title, setTitle] = useState(current?.title || '')
  const [shortDescription, setShortDescription] = useState(
    current?.shortDescription || ''
  )
  const [longDescription, setLongDescription] = useState(
    current?.longDescription || ''
  )
  const [commentsEnabled, setCommentsEnabled] = useState(
    current?.commentsEnabled || false
  )
  const [author, setAuthor] = useState(current?.author || 'admin')

  const previewImage = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]))
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h4 className="light mb-3">{current ? 'Edit story' : 'New story'}</h4>

      <NewsItem
        title={title}
        date={created}
        excerpt={shortDescription}
        image={image}
        author={author}
      />

      <div className="basic-file-select">
        <input
          type="file"
          id="image"
          onChange={previewImage}
          accept="image/*"
        />
        <IconImage />
        <label htmlFor="image">Select an image</label>
      </div>

      <Input
        name="videoUrl"
        placeholder="YouTube or Vimeo URL"
        label="Video URL"
        value={videoUrl}
        onChange={(v) => setVideoUrl(v)}
      />

      <Input
        name="title"
        placeholder="Title"
        label="Title"
        value={title}
        onChange={(v) => setTitle(v)}
      />

      <Input
        name="shortDescription"
        placeholder="Short description"
        label="Short description"
        value={shortDescription}
        type="textarea"
        onChange={(v) => setShortDescription(v)}
      />

      <Input
        name="longDescription"
        placeholder="Long description"
        label="Long description"
        value={longDescription}
        type="textarea"
        onChange={(v) => setLongDescription(v)}
      />

      <Checkbox
        label="Comments"
        name="commentsEnabled"
        checked={commentsEnabled}
        showSwitch={true}
        onChange={(v) => setCommentsEnabled(v)}
      />

      <Input
        name="author"
        label="Author"
        value={author}
        onChange={(v) => setAuthor(v)}
      />

      <div className="text-right mt-2">
        <button className="button">{current ? 'Update' : 'Publish'}</button>
      </div>
    </form>
  )
}
