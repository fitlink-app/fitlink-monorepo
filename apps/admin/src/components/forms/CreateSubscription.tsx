import { useContext, useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import Input from '../elements/Input'
import Select from '../elements/Select'
import { Controller, useForm } from 'react-hook-form'
import { CreateSubscriptionDto } from '@fitlink/api/src/modules/subscriptions/dto/create-subscription.dto'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { AuthContext } from '../../context/Auth.context'
import { useMutation, useQuery } from 'react-query'
import { ApiMutationResult, ApiResult } from '@fitlink/common/react-query/types'
import { UpdateResult } from '@fitlink/api-sdk/types'
import Feedback from '../elements/Feedback'
import useApiErrors from '../../hooks/useApiErrors'
import { Subscription } from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import { SubscriptionType } from '@fitlink/api/src/modules/subscriptions/subscriptions.constants'
import { useRouter } from 'next/router'
import Link from 'next/link'

export type CreateSubscriptionProps = {
  current?: Partial<Subscription>
  onSave?: () => void
  onError?: () => void
}

const subscriptionTypes = Object.keys(SubscriptionType).map((key) => {
  return {
    label: key,
    value: SubscriptionType[key]
  }
})

const noop = () => {}

const getFields = (current: Partial<Subscription> = {}) => ({
  type: current.type,
  billing_entity: current.billing_entity,
  organisationId: current.organisation ? current.organisation.id : undefined,
  organisationName: current.organisation
    ? current.organisation.name
    : undefined,
  id: current.id
})

export default function CreateSubscription({
  current = {},
  onSave = noop,
  onError = noop
}: CreateSubscriptionProps) {
  const isUpdate = current && current.id
  const { api, focusRole, primary } = useContext(AuthContext)
  const router = useRouter()
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: getFields(current)
  })

  const create: ApiMutationResult<Subscription> = useMutation(
    (payload: CreateSubscriptionDto) =>
      api.post<Subscription>(
        '/subscriptions',
        { payload },
        {
          primary,
          useRole: focusRole
        }
      )
  )

  const update: ApiMutationResult<UpdateResult> = useMutation(
    (payload: CreateSubscriptionDto) =>
      api.put<Subscription>('/subscriptions/:subscriptionId', {
        payload,
        subscriptionId: current.id
      })
  )

  const organisations: ApiResult<{
    results: Organisation[]
  }> = useQuery('organisations_search', () =>
    api.list<Organisation>('/organisations', {
      query: { q: 'fitlink' }
    })
  )

  async function onSubmit(payload: CreateSubscriptionDto) {
    clearErrors()

    if (focusRole === 'organisation') {
      payload.organisationId = primary.organisation
    }

    try {
      if (isUpdate) {
        await toast.promise(update.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>Subscription updated</b>,
          error: <b>Error</b>
        })
      } else {
        const result = await toast.promise(create.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>Subscription created</b>,
          error: <b>Error</b>
        })
        onSave()
        await router.push(`/subscriptions/${result.id}`)
        return
      }

      onSave()
    } catch (e) {
      onError()
    }
  }

  const { errors, isError, errorMessage, clearErrors } = useApiErrors(
    create.isError || update.isError,
    {
      ...create.error,
      ...update.error
    }
  )

  const type = watch('type')

  const chargeBee = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const chargebee = (window as any).Chargebee
      if (chargebee) {
        chargebee.init({
          site: 'fitlinkapp-test',
          publishableKey: 'test_tr8k30RHmt46JzSZUElKcu17FgA67OOl7'
        })
        chargeBee.current = chargebee.getInstance()
      }
    }
  }, [])

  const openChargebeeCheckout = ({ id }: Partial<Subscription>) => {
    if (chargeBee && chargeBee.current) {
      chargeBee.current.openCheckout({
        hostedPage: async () => {
          try {
            const data = await api.get(
              '/subscriptions/:subscriptionId/chargebee/hosted-page',
              {
                subscriptionId: id
              }
            )

            return data
          } catch (error) {
            console.error(error)
          }
        }
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">
        {isUpdate ? 'Edit Subscription' : 'Create a Subscription'}
      </h4>

      <Feedback
        message="Create alternative subscriptions to manage billing across your organisation. Unique payment details can be provided for each different subscription, and different users can be allocated."
        className="mb-2"
      />

      {focusRole === 'app' && (
        <>
          <Controller
            name="organisationId"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  classNamePrefix="addl-class"
                  options={
                    organisations.data
                      ? organisations.data.results.map((item) => ({
                          label: item.name,
                          value: item.id
                        }))
                      : []
                  }
                  label="Organisation"
                  inline={false}
                  id="organisation_id"
                  defaultValue={
                    current.organisation
                      ? {
                          label: current.organisation.name,
                          value: current.organisation.id
                        }
                      : undefined
                  }
                  onChange={(option) => {
                    if (option) {
                      field.onChange(option.value)
                    }
                  }}
                  onBlur={field.onBlur}
                />
              )
            }}
          />

          <Controller
            name="type"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  classNamePrefix="addl-class"
                  options={subscriptionTypes}
                  label="Subscription Type"
                  inline={false}
                  id="subscription_type"
                  defaultValue={
                    subscriptionTypes.filter((e) => e.value === current.type)[0]
                  }
                  onChange={(option) => {
                    if (option) {
                      field.onChange(option.value)
                    }
                  }}
                  onBlur={field.onBlur}
                />
              )
            }}
          />
        </>
      )}

      <Input
        register={register('billing_entity')}
        name="billing_entity"
        placeholder="Billing Entity / Company"
        label="Billing Entity / Company"
        required
        error={errors.billing_entity}
      />

      {isError && (
        <Feedback message={errorMessage} type="error" className="mt-2" />
      )}

      <div className="text-right mt-2">
        {focusRole === 'app' && (
          <Link href={`/subscriptions/${current.id}`}>
            <button type="button" className="button alt mr-2">
              Edit billing details
            </button>
          </Link>
        )}
        <button
          type="submit"
          className="button"
          disabled={create.isLoading || update.isLoading}>
          {isUpdate ? 'Save Subscription' : 'Continue'}
        </button>
      </div>
    </form>
  )
}
