import React, { useContext, useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import Logo from '../components/elements/Logo'
import Login from '../components/layouts/Login'
import Feedback from '../components/elements/Feedback'
import { AuthContext } from '../context/Auth.context'
import { useMutation } from 'react-query'
import {
  OrganisationsInvitationsRespond,
  TeamsInvitationsRespond,
  TeamsInvitationsVerify
} from '@fitlink/api-sdk/types'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import useApiErrors from '@fitlink/admin/src/hooks/useApiErrors'
import { useRouter } from 'next/router'
import { decode } from 'jsonwebtoken'
import { TeamInvitationJWT } from '@fitlink/api/src/models/team-invitation.jwt.model'
import { OrganisationInvitationJWT } from '@fitlink/api/src/models/organisation-invitation.jwt.model'
import { LeagueInvitationJWT } from '@fitlink/api/src/models/league-invitation.jwt.model'
import { TeamsInvitation } from '@fitlink/api/src/modules/teams-invitations/entities/teams-invitation.entity'
import { OrganisationsInvitation } from '../../../api/src/modules/organisations-invitations/entities/organisations-invitation.entity'
import Link from 'next/link'

const RedeemPage = () => {
  const token = useRef<
    TeamInvitationJWT | OrganisationInvitationJWT | LeagueInvitationJWT
  >()
  const router = useRouter()
  const [tokenError, setTokenError] = useState<string>()

  const { user, api } = useContext(AuthContext)

  useEffect(() => {
    if (router.isReady && router.query.token) {
      try {
        const decoded = decode(router.query.token as string) as
          | TeamInvitationJWT
          | OrganisationInvitationJWT
          | LeagueInvitationJWT
        token.current = decoded
        if (decoded.type === 'team-invitation') {
          teamInvitation.mutate({})
        }
        if (decoded.type === 'organisation-invitation') {
          orgInvitation.mutate({})
        }
      } catch (e) {
        setTokenError(
          'Invalid link. Please contact support at support@fitlinkapp.com if this issue persists.'
        )
      }
    }
  }, [router.isReady])

  const teamInvitation: ApiMutationResult<TeamsInvitation> = useMutation(
    'team_invitation',
    () => {
      return api.post<TeamsInvitationsVerify>('/teams-invitations/verify', {
        payload: {
          token: router.query.token as string
        }
      })
    }
  )

  const teamInvitationRespond: ApiMutationResult<TeamsInvitation> = useMutation(
    'team_invitation_response',
    (payload) => {
      return api.post<TeamsInvitationsRespond>('/teams-invitations/respond', {
        payload
      })
    }
  )

  const orgInvitation: ApiMutationResult<OrganisationsInvitation> = useMutation(
    'organisation_invitation',
    () => {
      return api.post<TeamsInvitationsVerify>(
        '/organisations-invitations/verify',
        {
          payload: {
            token: router.query.token as string
          }
        }
      )
    }
  )

  const orgInvitationRespond: ApiMutationResult<OrganisationsInvitation> = useMutation(
    'organisation_invitation_response',
    (payload) => {
      return api.post<OrganisationsInvitationsRespond>(
        '/organisations-invitations/respond',
        {
          payload
        }
      )
    }
  )

  const { errorMessage, isError } = useApiErrors(
    teamInvitationRespond.isError ||
      teamInvitation.isError ||
      orgInvitation.isError ||
      orgInvitationRespond.isError,
    teamInvitationRespond.error ||
      teamInvitation.error ||
      orgInvitation.error ||
      orgInvitationRespond.error
  )

  async function respond(accept = true) {
    let mutation
    if (teamInvitation.isSuccess) {
      mutation = teamInvitationRespond.mutateAsync({
        token: router.query.token,
        accept
      })
    }

    if (orgInvitation.isSuccess) {
      mutation = orgInvitationRespond.mutateAsync({
        token: router.query.token,
        accept
      })
    }

    if (mutation) {
      console.log('HERE')
      await toast.promise(mutation, {
        loading: <b>Saving...</b>,
        success: <b>Done</b>,
        error: <b>Error</b>
      })
    }
  }

  const showButtons = teamInvitation.isSuccess || orgInvitation.isSuccess
  const showRespond =
    orgInvitationRespond.isSuccess || teamInvitationRespond.isSuccess
  const isLoading =
    orgInvitationRespond.isLoading || teamInvitationRespond.isLoading
  const invitation = orgInvitationRespond.data || teamInvitationRespond.data

  if (!user) {
    return null
  }

  return (
    <Login title="Login">
      <div className="text-center">
        <Logo height={32} />
        {teamInvitation.isSuccess && (
          <h1 className="h6 mt-2 color-grey">
            {teamInvitation.data.owner.name} invited you to{' '}
            {teamInvitation.data.admin ? 'administer' : 'join'} the team{' '}
            {teamInvitation.data.team.name}
          </h1>
        )}
        {orgInvitation.isSuccess && (
          <h1 className="h6 mt-2 color-grey">
            {orgInvitation.data.owner.name} invited you to administer the
            organisation {orgInvitation.data.organisation.name}
          </h1>
        )}
      </div>
      {(isError || tokenError) && (
        <Feedback
          message={errorMessage || tokenError}
          type="error"
          className="mt-2 mb-2"
        />
      )}
      {showButtons && !showRespond && (
        <div className="row mt-2">
          <div className="col text-right">
            <button
              className="button alt"
              onClick={() => respond(false)}
              disabled={isLoading}>
              Decline
            </button>
          </div>
          <div className="col text-left">
            <button
              className="button"
              onClick={() => respond()}
              disabled={isLoading}>
              Accept
            </button>
          </div>
        </div>
      )}
      {showRespond && (
        <>
          <Feedback
            message={invitation.accepted ? 'Accepted' : 'Declined'}
            type="success"
            className="mt-2 mb-2"
          />
          <Link href="/start">
            <a className="button alt">Continue</a>
          </Link>
        </>
      )}
    </Login>
  )
}

export default RedeemPage
