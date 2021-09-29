import React, { useContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import Select from '../elements/Select'
import { Controller, useForm } from 'react-hook-form'
import { CreateAdminDto } from '@fitlink/api/src/modules/users/dto/create-admin.dto'
import { AuthContext } from '../../context/Auth.context'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { ApiMutationResult, ApiResult } from '@fitlink/common/react-query/types'
import Feedback from '../elements/Feedback'
import useApiErrors from '../../hooks/useApiErrors'
import { UserRole } from '@fitlink/api/src/modules/user-roles/entities/user-role.entity'
import { Roles } from '../../../../api/src/modules/user-roles/user-roles.constants'
import Input from '../elements/Input'
import { shortDescriptions } from '../../data/role-descriptions'
import CopyText from './CopyText'
import { RegenerateJoinCode } from '@fitlink/api-sdk/types'

export type InviteUserProps = {
  onSave?: () => void
  onError?: () => void
  role?: Roles
  teamId?: string
  joinCode?: string
  organisationId?: string
  subscriptionId?: string
}

const noop = () => {}

/**
 * Handles invitation of user as admin
 * or to app.
 *
 * @param param0
 * @returns
 */

export default function InviteUserForm({
  onSave = noop,
  onError = noop,
  role,
  organisationId,
  subscriptionId,
  teamId,
  joinCode
}: InviteUserProps) {
  const { api, primary, focusRole } = useContext(AuthContext)
  const { handleSubmit, register } = useForm({
    defaultValues: {
      invitee: undefined,
      email: undefined
    }
  })

  const [copied, setCopied] = useState(false)

  const add: ApiMutationResult<UserRole> = useMutation(
    (payload: CreateAdminDto) => {
      switch (role) {
        case Roles.SubscriptionAdmin:
          return api.post<UserRole>(
            '/organisations/:organisationId/subscriptions/:subscriptionId/invitations',
            {
              payload,
              organisationId: primary.organisation,
              subscriptionId
            }
          )
        case Roles.OrganisationAdmin:
          return api.post<UserRole>(
            '/organisations/:organisationId/invitations',
            {
              payload,
              organisationId: primary.organisation,
              admin: true
            }
          )
        case Roles.TeamAdmin:
          return api.post<UserRole>(
            '/organisations/:organisationId/teams/:teamId/invitations',
            {
              payload,
              organisationId: primary.organisation,
              teamId,
              admin: true
            }
          )
        case Roles.SuperAdmin:
          return api.post<UserRole>(
            '/admins',
            {
              payload
            },
            {
              primary,
              useRole: focusRole
            }
          )
        case Roles.Self:
          return api.post<UserRole>('/teams/:teamId/invitations', {
            payload,
            teamId
          })
      }
    }
  )

  const regenerate = useMutation(() => {
    return api.post<RegenerateJoinCode>('/teams/:teamId/regenerate-join-code', {
      teamId
    })
  })

  const inviteLink = useQuery(`invite_link_${teamId}`, () => {
    return api.get<{ url: string }>('/teams/:teamId/invite-link', {
      teamId
    })
  })

  const code = regenerate.data ? regenerate.data.code : joinCode

  useEffect(() => {
    inviteLink.refetch()
  }, [code])

  async function onSubmit(payload: any) {
    clearErrors()

    if (role === Roles.TeamAdmin) {
      payload.admin = true
    }

    try {
      await toast.promise(add.mutateAsync(payload), {
        loading: <b>Saving...</b>,
        success: <b>Added</b>,
        error: <b>Error</b>
      })
      onSave()
    } catch (e) {
      onError()
    }
  }

  const { isError, errorMessage, clearErrors, errors } = useApiErrors(
    add.isError,
    add.error
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h4 className="light mb-3">
        {role === Roles.Self && 'Invite a user to this team'}
        {role === Roles.OrganisationAdmin &&
          'Invite an organisation administrator'}
        {role === Roles.TeamAdmin && 'Invite a team administrator'}
        {role === Roles.SubscriptionAdmin &&
          'Invite a subscription administrator'}
        {role === Roles.SuperAdmin && 'Invite a super administrator'}
      </h4>

      <Feedback message={shortDescriptions[role]} className="mb-2" />

      <Input
        name="invitee"
        placeholder="Full name"
        label="Full name"
        register={register('invitee')}
        error={errors.invitee}
        required
      />

      <Input
        name="email"
        placeholder="Email address"
        label="Email address"
        type="email"
        register={register('email')}
        required
        error={errors.email}
      />

      <div className="flex jc-sb">
        <button className="button mt-1" disabled={add.isLoading}>
          Invite User
        </button>
        {role === Roles.Self && (
          <button
            className="button alt mt-1 ml-2"
            disabled={regenerate.isLoading}
            type="button"
            onClick={() => {
              regenerate.mutate()
            }}>
            Regenerate Join Code
          </button>
        )}
      </div>

      {role === Roles.Self && inviteLink.isFetched && (
        <div className="pointer copy-text-container">
          <Input
            name="email"
            placeholder="Email address"
            label="OR send them this link directly"
            readOnly={true}
            value={copied ? 'Copied!' : inviteLink.data.url}
            className={copied ? 'input-block--highlight' : 'pointer'}
          />
          {!copied && (
            <CopyText setCopied={setCopied} text={inviteLink.data.url} />
          )}
        </div>
      )}

      {isError && (
        <Feedback message={errorMessage} type="error" className="mt-2" />
      )}
    </form>
  )
}
