import { useState, useContext } from 'react'
import Input from '../elements/Input'
import Select from '../elements/Select'
import { countries } from 'countries-list'
import { Subscription } from '@fitlink/api/src/modules/subscriptions/entities/subscription.entity'
import { useForm } from 'react-hook-form'
import { UpdateSubscriptionDto } from '@fitlink/api/src/modules/subscriptions/dto/update-subscription.dto'
import toast from 'react-hot-toast'
import { noop } from 'lodash'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { UpdateResult } from '@fitlink/api-sdk/types'
import { useMutation } from 'react-query'
import { AuthContext } from '../../context/Auth.context'
import useApiErrors from '../../hooks/useApiErrors'
import Feedback from '../elements/Feedback'

export type BillingFormProps = {
  current: Partial<Subscription>
  onSave?: () => void
  onError?: () => void
}

export default function BillingForm({
  current,
  onSave = noop,
  onError = noop
}: BillingFormProps) {
  const { api, primary, focusRole } = useContext(AuthContext)

  const { register, setValue, handleSubmit } = useForm({
    defaultValues: {
      billing_first_name: current.billing_first_name,
      billing_last_name: current.billing_last_name,
      billing_email: current.billing_email,
      billing_address_1: current.billing_address_1,
      billing_address_2: current.billing_address_2,
      billing_city: current.billing_city,
      billing_state: current.billing_state,
      billing_postcode: current.billing_postcode,
      billing_country: current.billing_country || 'United Kingdom',
      billing_country_code: current.billing_country_code || 'GB'
    }
  })

  const update: ApiMutationResult<UpdateResult> = useMutation(
    (payload: UpdateSubscriptionDto) =>
      api.put<Subscription>(
        '/subscriptions/:subscriptionId',
        {
          payload,
          subscriptionId: current.id
        },
        {
          primary,
          useRole: focusRole
        }
      )
  )

  const { errors, errorMessage } = useApiErrors(update.isError, update.error)

  async function onSubmit(payload: UpdateSubscriptionDto) {
    try {
      await toast.promise(update.mutateAsync(payload), {
        loading: <b>Saving...</b>,
        success: <b>Subscription updated</b>,
        error: <b>Error</b>
      })
      onSave()
    } catch (e) {
      onError()
    }
  }

  if (!current.id) {
    return null
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">Update billing information</h4>
      {errorMessage && <Feedback type="error" message={errorMessage} />}
      <Input
        name="billing_first_name"
        placeholder="First name"
        label="First name"
        required
        register={register('billing_first_name')}
        error={errors.billing_first_name}
      />
      <Input
        name="billing_last_name"
        placeholder="Last name"
        label="Last name"
        required
        register={register('billing_last_name')}
        error={errors.billing_last_name}
      />
      <Input
        name="billing_email"
        placeholder="Email"
        label="Email"
        required
        register={register('billing_email')}
        error={errors.billing_email}
      />
      <Input
        name="billing_address_1"
        placeholder="Address line 1"
        label="Address line 1"
        required
        register={register('billing_address_1')}
        error={errors.billing_address_1}
      />
      <Input
        name="billing_address_2"
        placeholder="Address line 2"
        label="Address line 2"
        register={register('billing_address_2')}
        error={errors.billing_address_2}
      />
      <Input
        name="billing_city"
        placeholder="City"
        label="City"
        required
        register={register('billing_city')}
        error={errors.billing_city}
      />
      <Input
        name="billing_state"
        placeholder="State"
        label="State"
        required
        register={register('billing_state')}
        error={errors.billing_state}
      />
      <Input
        name="billing_postcode"
        placeholder="Postcode"
        label="Postcode"
        required
        register={register('billing_postcode')}
        error={errors.billing_postcode}
      />
      <Select
        id="country"
        isSearchable={true}
        label="Country"
        required
        defaultValue={{
          label: countries[current.billing_country_code || 'GB'].name,
          value: current.billing_country_code || 'GB'
        }}
        options={Object.entries(countries)
          .sort(([, a], [, b]) => {
            if (a.name < b.name) return -1
            if (a.name > b.name) return 1
            return 0
          })
          .map(([code, country]) => ({ value: code, label: country.name }))}
        onChange={(v) => {
          setValue('billing_country_code', v.value)
          setValue('billing_country', v.label)
        }}
        error={errors.billing_country}
      />
      <div className="text-right mt-2">
        <button className="button" disabled={update.isLoading}>
          Update
        </button>
      </div>
    </form>
  )
}
