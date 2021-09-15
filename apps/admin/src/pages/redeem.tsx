import React, { useContext } from 'react'
import Logo from '../components/elements/Logo'
import Login from '../components/layouts/Login'
import Feedback from '../components/elements/Feedback'
import { AuthContext } from '../context/Auth.context'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useRedeemInvitation from '../hooks/api/useRedeemInvitation'
import LoaderFullscreen from '../components/elements/LoaderFullscreen'

const RedeemPage = () => {
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const {
    tokenError,
    errorMessage,
    isError,
    invitationText,
    showButtons,
    showRespond,
    invitation,
    isLoading,
    respond
  } = useRedeemInvitation(router.query.token as string)

  if (!user) {
    return <LoaderFullscreen />
  }

  return (
    <Login title="Login">
      <div className="text-center">
        <Logo height={32} />
        {invitationText && (
          <h1 className="h6 mt-2 color-grey">{invitationText}</h1>
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
