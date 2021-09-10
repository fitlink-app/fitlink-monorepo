import { useContext, useEffect, useRef, useState } from 'react'
import { useMutation } from 'react-query'
import { TeamsInvitation } from '@fitlink/api/src/modules/teams-invitations/entities/teams-invitation.entity'
import { ApiMutationResult } from '@fitlink/common/react-query/types'
import { AuthContext } from '../../context/Auth.context'
import {
  OrganisationsInvitationsRespond,
  OrganisationsInvitationsVerify,
  TeamsInvitationsRespond,
  TeamsInvitationsVerify
} from '@fitlink/api-sdk/types'
import { RespondTeamsInvitationDto } from '@fitlink/api/src/modules/teams-invitations/dto/respond-teams-invitation.dto'
import { OrganisationsInvitation } from '@fitlink/api/src/modules/organisations-invitations/entities/organisations-invitation.entity'
import { RespondOrganisationsInvitationDto } from '@fitlink/api/src/modules/organisations-invitations/dto/respond-organisations-invitation.dto'
import { TeamInvitationJWT } from '@fitlink/api/src/models/team-invitation.jwt.model'
import { OrganisationInvitationJWT } from '@fitlink/api/src/models/organisation-invitation.jwt.model'
import { LeagueInvitationJWT } from '@fitlink/api/src/models/league-invitation.jwt.model'
import { decode } from 'jsonwebtoken'
import useApiErrors from '../useApiErrors'
import toast from 'react-hot-toast'

export default function useRedeemInvitation(token: string) {
  const [tokenError, setTokenError] = useState<string>()

  const tokenRef = useRef<
    TeamInvitationJWT | OrganisationInvitationJWT | LeagueInvitationJWT
  >()

  const [invitationText, setInvitationText] = useState<string>()
  const [invitationTarget, setInvitationTarget] = useState<string>()

  useEffect(() => {
    if (token) {
      try {
        const decoded = decode(token as string) as
          | TeamInvitationJWT
          | OrganisationInvitationJWT
          | LeagueInvitationJWT

        tokenRef.current = decoded
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
  }, [token])

  const { api } = useContext(AuthContext)

  const teamInvitation: ApiMutationResult<TeamsInvitation> = useMutation(
    'team_invitation',
    () => {
      return api.post<TeamsInvitationsVerify>('/teams-invitations/verify', {
        payload: {
          token: token as string
        }
      })
    }
  )

  const teamInvitationRespond: ApiMutationResult<TeamsInvitation> = useMutation(
    'team_invitation_response',
    (payload: RespondTeamsInvitationDto) => {
      return api.post<TeamsInvitationsRespond>('/teams-invitations/respond', {
        payload
      })
    }
  )

  const orgInvitation: ApiMutationResult<OrganisationsInvitation> = useMutation(
    'organisation_invitation',
    () => {
      return api.post<OrganisationsInvitationsVerify>(
        '/organisations-invitations/verify',
        {
          payload: { token }
        }
      )
    }
  )

  const orgInvitationRespond: ApiMutationResult<OrganisationsInvitation> = useMutation(
    'organisation_invitation_response',
    (payload: RespondOrganisationsInvitationDto) => {
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
        token,
        accept
      })
    }

    if (orgInvitation.isSuccess) {
      mutation = orgInvitationRespond.mutateAsync({
        token,
        accept
      })
    }

    if (mutation) {
      await toast.promise(mutation, {
        loading: <b>Saving...</b>,
        success: <b>Done</b>,
        error: <b>Error</b>
      })
    }
  }

  useEffect(() => {
    if (teamInvitation.isSuccess) {
      setInvitationText(`
        ${teamInvitation.data.owner.name} invited you to
        ${teamInvitation.data.admin ? ' administer ' : ' join '} the team
        ${teamInvitation.data.team.name}
      `)
      setInvitationTarget(teamInvitation.data.team.name)
    }

    if (orgInvitation.isSuccess) {
      setInvitationText(`
        ${orgInvitation.data.owner.name} invited you to administer the organisation
        ${orgInvitation.data.organisation.name}
      `)
      setInvitationTarget(orgInvitation.data.organisation.name)
    }
  }, [teamInvitation.isSuccess, orgInvitation.isSuccess])

  const showButtons = teamInvitation.isSuccess || orgInvitation.isSuccess
  const showRespond =
    orgInvitationRespond.isSuccess || teamInvitationRespond.isSuccess
  const isLoading =
    orgInvitationRespond.isLoading || teamInvitationRespond.isLoading
  const invitation = orgInvitationRespond.data || teamInvitationRespond.data

  return {
    teamInvitation,
    teamInvitationRespond,
    orgInvitation,
    orgInvitationRespond,
    errorMessage,
    isError,
    tokenError,
    invitationText,
    invitationTarget,
    showButtons,
    showRespond,
    isLoading,
    invitation,
    respond
  }
}
