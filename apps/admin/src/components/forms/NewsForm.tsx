import { useContext, useState } from 'react'
import Input from '../elements/Input'
import Checkbox from '../elements/Checkbox'
import IconImage from '../icons/IconImage'
import { CreateLeagueDto } from '@fitlink/api/src/modules/leagues/dto/create-league.dto'
import { AuthContext } from '../../context/Auth.context'
import { useForm } from 'react-hook-form'
import useFormMutations from '../../hooks/api/useFormMutations'
import noop from 'lodash/noop'
import Feedback from '../elements/Feedback'
import NewsItem from '../elements/NewsItem'

export type NewsFormProps = {
  current?: any
  onSave?: () => void
  onError?: (err: any) => void
  onDelete?: (fields: any) => void
}

const getFields = (item: any) => {
  return {
    id: item?.id,
    videoUrl: item?.videoUrl,
    title: item?.title,
    shortDescription: item?.shortDescription,
    longDescription: item?.longDescription,
    commentsEnabled: item?.commentsEnabled,
    author: item?.author,
    image_upload: undefined,
    created: item?.created
  }
}

export default function NewsForm({
  current,
  onSave = noop,
  onDelete = noop,
  onError = noop
}: NewsFormProps) {
  const { api, modeRole, primary } = useContext(AuthContext)
  const [image, setImage] = useState(current?.image?.url || '')
  const isUpdate = !!current?.id

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: getFields(current)
  })

  const { errors } = useFormMutations<any, any>({
    type: 'News',
    isUpdate,
    create: (payload) =>
      api.post<any>(
        // @ts-expect-error
        '/news',
        {
          payload
        },
        {
          primary,
          useRole: modeRole
        }
      ),
    update: (payload) =>
      api.put<any>(
        // @ts-expect-error
        `/news/:newsId`,
        {
          payload,
          newsId: current.id
        },
        {
          primary,
          useRole: modeRole
        }
      )
  })

  const title = watch('title')
  const shortDescription = watch('shortDescription')
  const commentsEnabled = watch('commentsEnabled')
  const author = watch('author')
  const created = watch('created')

  async function onSubmit() {}

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">{current?.id ? 'Edit story' : 'New story'}</h4>

      <NewsItem
        title={title}
        date={created || new Date()}
        excerpt={shortDescription}
        image={image}
        author={author}
      />

      <div className="basic-file-select">
        <input
          type="file"
          id="image"
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setImage(URL.createObjectURL(event.target.files[0]))
            setValue('image_upload', event.target.files[0])
          }}
          accept="image/*"
        />
        <IconImage />
        <label htmlFor="image">Select an image</label>
      </div>

      <div>
        {errors.imageId && (
          <Feedback type="error" message="An image must be provided" />
        )}
      </div>

      <Input
        name="videoUrl"
        placeholder="YouTube or Vimeo URL"
        label="Video URL"
        register={register('videoUrl')}
        error={errors.videoUrl}
      />

      <Input
        name="title"
        placeholder="Title"
        label="Title"
        register={register('title')}
        error={errors.title}
      />

      <Input
        name="shortDescription"
        placeholder="Short description"
        label="Short description"
        type="textarea"
        register={register('shortDescription')}
        error={errors.shortDescription}
      />

      <Input
        name="longDescription"
        placeholder="Long description"
        label="Long description"
        type="textarea"
        register={register('longDescription')}
        error={errors.longDescription}
      />

      <Checkbox
        label="Comments"
        name="commentsEnabled"
        checked={commentsEnabled}
        showSwitch={true}
        register={register('commentsEnabled')}
      />

      <Input
        name="author"
        label="Author"
        register={register('author')}
        error={errors.author}
      />

      <div className="text-right mt-2">
        {current?.id && (
          <button
            className="button alt mr-2"
            type="button"
            onClick={() => {
              onDelete(current)
            }}>
            Delete
          </button>
        )}

        <button className="button" type="submit">
          {current ? 'Update' : 'Publish'}
        </button>
      </div>
    </form>
  )
}
