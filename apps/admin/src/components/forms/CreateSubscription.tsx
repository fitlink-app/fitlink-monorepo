import { useContext, useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import Input from '../elements/Input'
import Select from '../elements/Select'
import { Controller, useForm } from 'react-hook-form'
import { CreateDefaultSubscriptionDto } from '@fitlink/api/src/modules/subscriptions/dto/create-default-subscription.dto'
import { Organisation } from '@fitlink/api/src/modules/organisations/entities/organisation.entity'
import { AuthContext } from '../../context/Auth.context'
import { useMutation, useQuery } from 'react-query'
import { ApiMutationResult, ApiResult } from '@fitlink/common/react-query/types'
import { UpdateResult } from '@fitlink/api-sdk/types'
import Feedback from '../elements/Feedback'
import useApiErrors from '../../hooks/useApiErrors'
import { Subscription } from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import {
  BillingPlanStatus,
  SubscriptionType
} from '@fitlink/api/src/modules/subscriptions/subscriptions.constants'
import { PaymentSource } from 'chargebee-typescript/lib/resources'

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

const planStatus = Object.keys(BillingPlanStatus).map((key) => {
  return {
    label: key,
    value: BillingPlanStatus[key]
  }
})

const noop = () => {}

const getFields = (current: Partial<Subscription> = {}) => ({
  type: current.type,
  billing_entity: current.billing_entity,
  billing_first_name: current.billing_first_name,
  billing_last_name: current.billing_last_name,
  billing_address_1: current.billing_address_1,
  billing_address_2: current.billing_address_2,
  billing_city: current.billing_city,
  billing_country: current.billing_country,
  billing_country_code: current.billing_country_code,
  billing_currency_code: current.billing_currency_code,
  billing_state: current.billing_state,
  billing_postcode: current.billing_postcode,
  billing_plan_trial_end_date: current.billing_plan_trial_end_date,
  billing_plan_status: current.billing_plan_status,
  billing_plan_customer_id: current.billing_plan_customer_id,
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
  const { api } = useContext(AuthContext)
  const { register, handleSubmit, control, watch } = useForm({
    defaultValues: getFields(current)
  })

  const create: ApiMutationResult<Subscription> = useMutation(
    (payload: CreateDefaultSubscriptionDto) =>
      api.post<Subscription>('/subscriptions', { payload })
  )

  const update: ApiMutationResult<UpdateResult> = useMutation(
    (payload: CreateDefaultSubscriptionDto) =>
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

  async function onSubmit(payload: CreateDefaultSubscriptionDto) {
    clearErrors()

    try {
      if (isUpdate) {
        await toast.promise(update.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>Subscription updated</b>,
          error: <b>Error</b>
        })
      } else {
        await toast.promise(create.mutateAsync(payload), {
          loading: <b>Saving...</b>,
          success: <b>Subscription created</b>,
          error: <b>Error</b>
        })
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

      {type === SubscriptionType.Dynamic && (
        <>
          <Controller
            name="billing_plan_status"
            control={control}
            render={({ field }) => {
              return (
                <Select
                  classNamePrefix="addl-class"
                  options={planStatus}
                  label="Billing Plan Status"
                  inline={false}
                  id="plan_status"
                  defaultValue={
                    planStatus.filter(
                      (e) => e.value === current.billing_plan_status
                    )[0]
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
          <Input
            register={register('billing_plan_customer_id')}
            name="billing_plan_customer_id"
            placeholder="Chargebee Customer ID"
            label="Chargebee Customer ID"
            readOnly={true}
            disabled={true}
            error={errors.billing_plan_customer_id}
          />
          {current.billing_plan_customer_id && (
            <>
              <span className="small">
                <PaymentSources subscriptionId={current.id} />
              </span>
              <button
                className="button small ml-1"
                onClick={(event) => {
                  event.preventDefault()
                  openChargebeeCheckout(current)
                }}>
                Manage Payment Methods
              </button>
            </>
          )}
        </>
      )}

      <Input
        register={register('billing_entity')}
        name="billing_entity"
        placeholder="Billing Entity / Company"
        label="Billing Entity / Company"
        error={errors.billing_entity}
      />

      <Input
        register={register('billing_first_name')}
        name="billing_first_name"
        placeholder="Billing First Name"
        label="Billing First Name"
        error={errors.billing_first_name}
      />

      <Input
        register={register('billing_last_name')}
        name="billing_last_name"
        placeholder="Billing Last Name"
        label="Billing Last Name"
        error={errors.billing_last_name}
      />

      <Input
        register={register('billing_address_1')}
        name="billing_address_1"
        placeholder="Billing Address Line 1"
        label="Billing Address Line 1"
        error={errors.billing_address_1}
      />

      <Input
        register={register('billing_address_2')}
        name="billing_address_2"
        placeholder="Billing Address Line 2"
        label="Billing Address Line 2"
        error={errors.billing_address_2}
      />

      <Input
        register={register('billing_state')}
        name="billing_state"
        placeholder="Billing State / Province"
        label="Billing State / Province"
        error={errors.billing_state}
      />

      <Input
        register={register('billing_city')}
        name="billing_city"
        placeholder="Billing Town / City"
        label="Billing Town / City"
        error={errors.billing_city}
      />

      <Input
        register={register('billing_postcode')}
        name="billing_postcode"
        placeholder="Billing Postcode"
        label="Billing Postcode"
        error={errors.billing_postcode}
      />

      <Input
        register={register('billing_country')}
        name="billing_country"
        placeholder="Billing Country"
        label="Billing Country"
        error={errors.billing_country}
      />

      <Input
        register={register('billing_currency_code')}
        name="billing_currency_code"
        placeholder="Billing Currency"
        label="Billing Currency"
        error={errors.billing_currency_code}
      />

      {isError && (
        <Feedback message={errorMessage} type="error" className="mt-2" />
      )}

      <div className="text-right mt-2">
        <button
          className="button"
          disabled={create.isLoading || update.isLoading}>
          {isUpdate ? 'Save Subscription' : 'Create Subscription'}
        </button>
      </div>
    </form>
  )
}

const PaymentSources = ({ subscriptionId }) => {
  const { api } = useContext(AuthContext)

  const {
    data
  }: ApiResult<{
    results: any
  }> = useQuery('payment_sources', () =>
    api.list<PaymentSource>(
      '/subscriptions/:subscriptionId/chargebee/payment-sources',
      {
        subscriptionId
      }
    )
  )

  if (data) {
    return <>{data.results.length} valid payment sources available.</>
  } else {
    return <>No payment sources available yet.</>
  }

  return null
}
