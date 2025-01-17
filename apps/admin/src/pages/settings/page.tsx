import { useRef, useEffect, useContext, useState } from 'react'
import Card from '../../components/elements/Card'
import Input from '../../components/elements/Input'
import Select from '../../components/elements/Select'
import Checkbox from '../../components/elements/Checkbox'
import Dashboard from '../../components/layouts/Dashboard'
import ImageSelect from '../../components/elements/ImageSelect'
import Feedback from '../../components/elements/Feedback'
import toast, { CheckmarkIcon, ErrorIcon } from 'react-hot-toast'
import Button from '../../components/elements/Button'
import { useFieldArray, useForm } from 'react-hook-form'
import IconClose from '../../components/icons/IconClose'
import { AuthContext } from '../../context/Auth.context'
import { Image } from '@fitlink/api/src/modules/images/entities/image.entity'
import { useMutation, useQuery } from 'react-query'
import { Page } from '@fitlink/api/src/modules/pages/entities/page.entity'
import { CreatePageDto } from '@fitlink/api/src/modules/pages/dto/create-page.dto'
import { CheckDomainDto } from '@fitlink/api/src/modules/pages/dto/check-domain.dto'
import { CreatePage } from '@fitlink/api-sdk/types'
import useApiErrors from '../../hooks/useApiErrors'
import { ApiMutationResult, ApiResult } from '@fitlink/common/react-query/types'
import useDebounce from '../../hooks/useDebounce'
import { useIntercom } from 'react-use-intercom'

const pagesDomain =
  process.env.NEXT_PUBLIC_BUSINESS_PAGEDOMAIN || 'develop-pages.fitlinkapp.com'

const MANAGE_PAGE_TOUR_ID = 281356

export default function ManagePage() {
  const { api, primary } = useContext(AuthContext)
  const { startTour } = useIntercom()

  const loadPage = useQuery(
    'page',
    () => {
      return api.get<CreatePageDto>('/teams/:teamId/page', {
        teamId: primary.team
      })
    },
    {
      enabled: false,
      retry: false,
      initialData: {
        id: undefined,
        domain: '',
        logo: '',
        logo_id: '',

        banner_image: '',
        banner_image_id: '',
        banner_title: '',
        banner_description: '',
        banner_join_link: true,

        content: [
          {
            image: '',
            image_id: '',
            title: '',
            description: ''
          }
        ],

        contact_website: '',
        contact_group_name: '',
        contact_group_lead: '',
        contact_email: '',
        contact_number: '',
        contact_facebook: '',
        contact_instagram: '',
        contact_twitter: '',
        contact_linkedin: '',
        contact_subtitle: 'Corporate Wellness Program',
        contact_text:
          'For any questions or help with the group, use the below details.',

        signup_image: '',
        signup_image_id: '',
        signup_title: '',
        signup_description: '',
        signup_join_link: true,
        enabled: false,
        join_link: ''
      }
    }
  )

  const { control, register, handleSubmit, trigger, watch, setValue, reset } =
    useForm({
      defaultValues: loadPage.data
    })

  const { fields, append, remove } = useFieldArray({
    name: 'content',
    control // control props comes from useForm (optional: if you are using FormContext)
    // keyName: "id", default to "id", you can change the key name
  })

  const domain = watch('domain')
  const dbDomain = useDebounce(domain, 500)

  const savePage: ApiMutationResult<Page> = useMutation(
    'save_page',
    (payload: CreatePageDto) => {
      return api.post<CreatePage>('/teams/:teamId/page', {
        payload,
        teamId: primary.team
      })
    }
  )

  const checkDomain: ApiResult<{ success: true }> = useQuery(
    'check_domain',
    (payload) => {
      return api.get<{ success: true }>('/teams/:teamId/page', {
        payload,
        teamId: primary.team,
        query: {
          checkDomain: domain
        }
      })
    },
    {
      enabled: false,
      retry: false
    }
  )

  const { errorMessage, errors, setErrors, clearErrors } = useApiErrors(
    savePage.isError,
    savePage.error
  )

  useEffect(() => {
    if (primary.team) {
      loadPage.refetch()
    }
  }, [primary])

  useEffect(() => {
    if (loadPage.isFetched) {
      reset(loadPage.data)
    }
  }, [loadPage.isFetched])

  async function onSubmit(payload: CreatePageDto) {
    clearErrors()

    // Set the ID if exists
    if (loadPage.data.id) {
      payload.id = loadPage.data.id
    }

    const images: { name: string; file: File }[] = []
    if (payload.logo instanceof File) {
      images.push({
        name: 'logo',
        file: payload.logo
      })
    }

    if (payload.banner_image instanceof File) {
      images.push({
        name: 'banner_image',
        file: payload.banner_image
      })
    }

    if (payload.signup_image instanceof File) {
      images.push({
        name: 'signup_image',
        file: payload.signup_image
      })
    }

    payload.content.map((e, index) => {
      if (e.image instanceof File) {
        images.push({
          name: `content_image.${index}`,
          file: e.image
        })
      }
    })

    let imagesUploaded: { image: Image; name: string }[] = []
    try {
      if (images.length) {
        imagesUploaded = await toast.promise(
          Promise.all(
            images.map(async (e) => {
              const payload = new FormData()
              payload.append('file', e.file)
              const image = await api.uploadFile<Image>('/images', {
                payload
              })
              return {
                image,
                name: e.name
              }
            })
          ),
          {
            loading: <b>Images uploading...</b>,
            error: <b>Error uploading images</b>,
            success: <b>Images uploaded.</b>
          }
        )
      }
    } catch (e) {
      console.error(e)
    }

    imagesUploaded.forEach((each) => {
      const split = each.name.split('.').map((e) => parseInt(e))
      if (split.length > 1) {
        payload[`content`][split[1]].image = each.image.url
      } else {
        payload[each.name] = each.image.url
        payload[each.name + '_id'] = each.image.id
      }
    })

    try {
      await toast.promise(savePage.mutateAsync(payload), {
        error: <b>Error</b>,
        success: <b>Page saved...</b>,
        loading: <b>Saving...</b>
      })
      // Refresh the state
      const { data } = await loadPage.refetch()
      reset(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (dbDomain && dbDomain.length >= 2) {
      const correct = dbDomain.match(/^[a-z0-9-]+[a-z0-9]$/)
      if (dbDomain && correct) {
        checkDomain.refetch()
      }
      if (!correct) {
        setErrors({
          domain: 'Domain must consist only of letters, dashes and numbers'
        })
      } else {
        setErrors({
          domain: undefined
        })
      }
    }
  }, [dbDomain])

  return (
    <Dashboard title="Settings">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="pages">
          <div className="flex ai-c mb-2">
            <h1 className="light mb-0 mr-2">Manage Team Page</h1>
            <button
              className="button alt small mt-1"
              type="button"
              onClick={() => {
                startTour(MANAGE_PAGE_TOUR_ID)
              }}>
              Show me how
            </button>
          </div>
          <Feedback message="The team page is used to advertise the team to your co-workers so they can download the app and join in." />

          {errorMessage && (
            <Feedback
              className="mt-2"
              message={`Unable to save page. Please see below for validation errors.`}
              type="error"
            />
          )}

          <div className="row mt-2 ai-s">
            <div className="col-12 col-md-12 col-xl-12 col-hd-4 mt-2">
              <Card className="p-3 card--stretch pb-4">
                <h2 className="h5 color-light-grey m-0">Logo &amp; Domain</h2>
                <div className="row">
                  <div className="col-sm-4">
                    <ImageSelect
                      label="Choose your logo"
                      filename={loadPage.data.logo as string}
                      onChange={(event) => {
                        setValue('logo', event.target.files[0])
                      }}
                    />
                    {errors.logo && (
                      <Feedback message={errors.logo} type="error" />
                    )}
                  </div>
                  <div className="col-sm-8">
                    <Input
                      name="domain"
                      error={errors.domain}
                      autoComplete="off"
                      label="Domain"
                      placeholder="Yourdomainhere"
                      register={register('domain')}
                    />
                    <div className="flex ai-c">
                      <small>
                        https://{domain || 'yourdomainhere'}.on.fitlinkteams.com
                      </small>
                      {domain && !checkDomain.error && !errors.domain && (
                        <CheckmarkIcon className="ml-1" title="Available" />
                      )}
                      {domain && checkDomain.error && (
                        <>
                          <ErrorIcon className="ml-1" title="Not available" />
                        </>
                      )}
                      {!loadPage.data.enabled && domain && (
                        <small className="color-grey ml-1">
                          {checkDomain.error
                            ? 'Domain is not available'
                            : 'Page is not published yet.'}
                        </small>
                      )}
                      {loadPage.data.enabled && (
                        <small className="ml-1">
                          <a
                            className="color-primary"
                            href={`https://${domain}.${pagesDomain}`}
                            target="_blank"
                            rel="noopener nofollow">
                            Page is published
                          </a>
                          .
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="row mt-2 ai-s">
            <div className="col-12 col-md-12 col-xl-12 col-hd-4 mt-2">
              <Card className="p-3 card--stretch pb-4">
                <h2 className="h5 color-light-grey m-0">Main Banner</h2>
                <div className="row">
                  <div className="col-sm-5">
                    <ImageSelect
                      filename={loadPage.data.banner_image as string}
                      onChange={(event) => {
                        setValue('banner_image', event.target.files[0])
                      }}
                    />
                    {errors.banner_image && (
                      <Feedback message={errors.banner_image} type="error" />
                    )}
                  </div>
                  <div className="col-sm-7">
                    <Input
                      error={errors.banner_title}
                      name="banner_title"
                      label="Title"
                      placeholder="Title"
                      register={register('banner_title')}
                    />
                    <Input
                      error={errors.banner_description}
                      name="banner_description"
                      label="Description"
                      placeholder="Title"
                      type="textarea"
                      register={register('banner_description')}
                    />
                    <Checkbox
                      error={errors.banner_join_link}
                      name="banner_join_link"
                      showSwitch={true}
                      label="Show Join Link"
                      register={register('banner_join_link')}
                    />
                    <small>
                      Users with access to this page will be able to join this
                      team automatically via the app. <br />
                      {loadPage.data.join_link && (
                        <a
                          className="color-primary"
                          href={loadPage.data.join_link}>
                          {loadPage.data.join_link}
                        </a>
                      )}
                    </small>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {fields.map((field, index) => {
            return (
              <div className="row mt-2 ai-s" key={field.id}>
                <div className="col-12 col-md-12 col-xl-12 col-hd-4 mt-2">
                  <Card className="p-3 card--stretch pb-4">
                    <h2 className="h5 color-light-grey m-0 flex jc-sb">
                      Content
                      <IconClose
                        onClick={() => remove(index)}
                        className="pointer"
                      />
                    </h2>
                    <div className="row">
                      <div className="col-sm-5">
                        <ImageSelect
                          filename={
                            loadPage.data.content[index]
                              ? (loadPage.data.content[index].image as string)
                              : ''
                          }
                          onChange={(event) => {
                            setValue(
                              `content.${index}.image`,
                              event.target.files[0]
                            )
                          }}
                        />
                      </div>
                      <div className="col-sm-7">
                        <Input
                          name={`content.${index}.title`}
                          label="Title"
                          placeholder="Title"
                          register={register(`content.${index}.title`)}
                        />
                        <Input
                          name={`content.${index}.description`}
                          label="Description"
                          placeholder="Title"
                          type="textarea"
                          register={register(`content.${index}.description`)}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )
          })}

          <div className="flex jc-e">
            <Button
              label="Add more content"
              className="mt-2"
              onClick={() =>
                append({
                  description: '',
                  image: '',
                  image_id: '',
                  title: ''
                })
              }
            />
          </div>

          <div className="row mt-2 ai-s">
            <div className="col-12 col-md-6 col-xl-6 col-hd-4 mt-2">
              <Card className="p-3 card--stretch pb-4">
                <h2 className="h5 color-light-grey m-0">Contact</h2>
                <Input
                  name="contact_website"
                  label="Website"
                  placeholder="https://example.com"
                  register={register('contact_website')}
                  error={errors.contact_website}
                />
                <Input
                  name="contact_group_name"
                  label="Team / Group Name"
                  placeholder="E.g.: The Flying Squad"
                  type="textarea"
                  register={register('contact_group_name')}
                  error={errors.contact_group_name}
                />
                <Input
                  name="contact_group_lead"
                  label="Team / Group Lead"
                  placeholder="Team / Group Lead"
                  register={register('contact_group_lead')}
                  error={errors.contact_group_lead}
                />
                <Input
                  type="email"
                  name="contact_email"
                  label="Email"
                  placeholder="teamlead@example.com"
                  register={register('contact_email')}
                  error={errors.contact_email}
                />
                <Input
                  type="tel"
                  name="contact_number"
                  label="Contact Number"
                  placeholder="+44"
                  register={register('contact_number')}
                  error={errors.contact_number}
                />
                <Input
                  name="contact_facebook"
                  label="Facebook"
                  placeholder="Facebook Official Page"
                  register={register('contact_facebook')}
                  error={errors.contact_facebook}
                />
                <Input
                  name="contact_instagram"
                  label="Instagram"
                  placeholder="Instagram Official Page"
                  register={register('contact_instagram')}
                  error={errors.contact_instagram}
                />
                <Input
                  name="contact_twitter"
                  label="Twitter"
                  placeholder="Twitter Official Page"
                  register={register('contact_twitter')}
                  error={errors.contact_twitter}
                />
                <Input
                  name="contact_linkedin"
                  label="LinkedIn"
                  placeholder="LinkedIn Official Page"
                  register={register('contact_linkedin')}
                  error={errors.contact_linkedin}
                />
                <Input
                  name="contact_subtitle"
                  label="Subtitle"
                  placeholder="e.g. Corporate Wellness Program"
                  register={register('contact_subtitle')}
                  error={errors.contact_subtitle}
                />
                <Input
                  name="contact_text"
                  label="Text"
                  placeholder="e.g. For any questions or help..."
                  register={register('contact_text')}
                  error={errors.contact_text}
                />
              </Card>
            </div>
            <div className="col-12 col-md-6 col-xl-6 col-hd-4 mt-2">
              <Card className="p-3 card--stretch pb-4">
                <h2 className="h5 color-light-grey m-0">Signup</h2>
                <ImageSelect
                  filename={loadPage.data.signup_image as string}
                  onChange={(event) => {
                    setValue('signup_image', event.target.files[0])
                  }}
                />
                <Input
                  name="signup_title"
                  label="Title"
                  placeholder="e.g. Join this group"
                  register={register('signup_title')}
                  error={errors.signup_title}
                />
                <Input
                  name="signup_description"
                  label="Description"
                  placeholder="Title"
                  type="textarea"
                  register={register('signup_description')}
                  error={errors.signup_description}
                />
                <Checkbox
                  name="signup_join_link"
                  register={register('signup_join_link')}
                  showSwitch={true}
                  label="Show Join Link"
                  error={errors.signup_join_link}
                />
                <small>
                  Users with access to this page will be able to join this team
                  automatically via the app. <br />
                  {loadPage.data.join_link && (
                    <a className="color-primary" href={loadPage.data.join_link}>
                      {loadPage.data.join_link}
                    </a>
                  )}
                </small>
              </Card>
            </div>
          </div>

          <div className="button-bar">
            {!loadPage.data.enabled && (
              <button
                className="button button-save"
                type="button"
                disabled={savePage.isLoading}
                onClick={(event) => {
                  setValue('enabled', true)
                  handleSubmit(onSubmit)()
                }}>
                Save &amp; Publish Page
              </button>
            )}
            {loadPage.data.enabled && (
              <button
                className="button alt button-save"
                disabled={savePage.isLoading}
                type="button"
                onClick={(event) => {
                  setValue('enabled', false)
                  handleSubmit(onSubmit)()
                }}>
                Unpublish Page
              </button>
            )}
            <button
              type="submit"
              disabled={savePage.isLoading}
              className={`button button-save ml-2 ${
                !loadPage.data.enabled ? 'alt ' : ''
              }`}>
              Save Page
            </button>
            <input
              style={{ display: 'none' }}
              type="checkbox"
              {...register('enabled')}
            />
          </div>
        </div>
      </form>
    </Dashboard>
  )
}
