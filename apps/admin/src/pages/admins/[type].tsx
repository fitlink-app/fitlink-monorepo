import { useState, useContext, useEffect, useRef } from 'react'
import Dashboard from '../../components/layouts/Dashboard'
import { AuthContext } from '../../context/Auth.context'
import TableContainer from '../../components/Table/TableContainer'
import { User } from '@fitlink/api/src/modules/users/entities/user.entity'
import { AnimatePresence } from 'framer-motion'
import Drawer from '../../components/elements/Drawer'
import { timeout } from '../../helpers/timeout'
import Input from '../../components/elements/Input'
import useDebounce from '../../hooks/useDebounce'
import ConfirmForm from '../../components/forms/ConfirmForm'
import AssignUserForm from '../../components/forms/AssignUserForm'
import { useRouter } from 'next/router'
import { Roles } from '../../../../api/src/modules/user-roles/user-roles.constants'
import SelectEntityForm from '../../components/forms/SelectEntityForm'
import { Subscription } from '../../../../api/src/modules/subscriptions/entities/subscription.entity'
import { useQuery } from 'react-query'
import { ApiResult } from '../../../../common/react-query/types'
import InviteUserForm from '../../components/forms/InviteUserForm'

type PageType = 'team' | 'subscription' | 'organisation' | 'global'

type UsersPageProps = {
  type?: PageType
}

export default function UsersPage(props: UsersPageProps) {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [subKeyword, setSubKeyword] = useState('')
  const [type, setType] = useState<PageType>()
  const id = useRef<string>()
  const role = useRef<Roles>()
  const router = useRouter()

  useEffect(() => {
    if (router.isReady) {
      const getType = (router.query.type as PageType) || props.type
      setType(getType)
      setRefresh(Date.now())
      switch (getType) {
        case 'subscription':
          role.current = Roles.SubscriptionAdmin
          subscriptions.refetch()
          break
        case 'organisation':
          role.current = Roles.OrganisationAdmin
          break
        case 'team':
          role.current = Roles.TeamAdmin
          break
        case 'global':
          role.current = Roles.SuperAdmin
          break
      }

      if (router.query.id) {
        id.current = router.query.id as string
        console.log(id.current)
      }
    }
  }, [router.query])

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setRefresh(Date.now())
    setDrawContent(null)
  }

  const showAvatar = ({
    cell: {
      row: {
        original: { avatar, name }
      }
    }
  }) => {
    return (
      <div className="avatar">
        <span>{`${name ? name[0] : ''}`}</span>
        {avatar && <img src={avatar.url_128x128} alt={name} />}
      </div>
    )
  }

  const ConfirmRevokeForm = (fields) => {
    setWarning(true)
    setWide(false)
    setDrawContent(
      <ConfirmForm
        onUpdate={closeDrawer(1000)}
        onCancel={closeDrawer()}
        current={fields}
        title="Revoke access"
        message={`
          Are you sure you want to revoke access?
        `}
        mutation={(current) => {
          if (role.current === Roles.SubscriptionAdmin) {
            return api.delete(
              '/organisations/:organisationId/subscriptions/:subscriptionId/admins/:userId',
              {
                userId: current.id,
                organisationId: primary.organisation,
                subscriptionId: id.current
              }
            )
          } else if (role.current === Roles.TeamAdmin) {
            return api.delete(
              '/organisations/:organisationId/teams/:teamId/admins/:userId',
              {
                userId: current.id,
                organisationId: primary.organisation,
                teamId: id.current
              }
            )
          } else {
            return api.delete(
              '/admins/:userId',
              {
                userId: current.id
              },
              {
                primary,
                useRole: focusRole
              }
            )
          }
        }}
      />
    )
  }

  const AssignAdminForm = (fields) => {
    setWarning(true)
    setWide(false)
    const props: any = {}
    if (role.current === Roles.SubscriptionAdmin) {
      props.subscriptionId = id.current
    }

    if (role.current === Roles.TeamAdmin) {
      props.teamId = id.current
    }
    setDrawContent(
      <AssignUserForm
        role={role.current}
        {...props}
        onSave={closeDrawer(1000)}
      />
    )
  }

  const InviteAdminForm = (fields) => {
    setWarning(true)
    setWide(false)
    const props: any = {}
    if (role.current === Roles.SubscriptionAdmin) {
      props.subscriptionId = id.current
    }

    if (role.current === Roles.TeamAdmin) {
      props.teamId = id.current
    }
    setDrawContent(
      <InviteUserForm
        role={role.current}
        {...props}
        onSave={closeDrawer(1000)}
      />
    )
  }

  const cellActions = ({
    cell: {
      row: { original }
    }
  }) => (
    <div className="text-right">
      <button
        className="button small ml-1"
        onClick={() => ConfirmRevokeForm(original)}>
        Revoke
      </button>
    </div>
  )

  const handleUsernameSearch = async (search) => {
    setKeyword(search)
  }

  const dbSearchTerm = useDebounce(keyword, 500)
  const subSearchTerm = useDebounce(subKeyword, 500)
  const { api, fetchKey, focusRole, primary } = useContext(AuthContext)

  const subscriptions: ApiResult<{
    results: Subscription[]
  }> = useQuery(
    `subscriptions_${fetchKey}_${subSearchTerm}`,
    () =>
      api.list<User>(
        '/subscriptions',
        {
          query: {
            limit: 100
          }
        },
        {
          primary,
          useRole: focusRole
        }
      ),
    {
      enabled: false,
      keepPreviousData: true
    }
  )

  if (!router.isReady) {
    return null
  }

  return (
    <Dashboard title="Settings Users">
      <div className="flex ai-c jc-sb">
        <div className="flex ai-c">
          <h1 className="light mb-0 mr-2">Manage {type} administrators</h1>
          <button className="button alt small mt-1" onClick={AssignAdminForm}>
            Assign User
          </button>
          {type !== 'global' && (
            <button className="button alt small mt-1" onClick={InviteAdminForm}>
              Invite User
            </button>
          )}
          <div className="flex jc-e">
            <Input
              className="input-large"
              inline={true}
              onChange={handleUsernameSearch}
              name="userSearch"
              placeholder="Enter name or email..."
              value=""
            />
          </div>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: ' ', accessor: 'avatar', Cell: showAvatar },
            { Header: 'Name', accessor: 'name' },
            { Header: 'Email', accessor: 'email' },
            { Header: ' ', Cell: cellActions }
          ]}
          fetch={(limit, page, query) => {
            /**
             * Note that the organisation or team
             * is inferred using role prefix.
             *
             * /users
             * /organisations/:organisationId/subscriptions/:subscriptionId/admins
             * /organisations/:organisationId/users
             * /teams/:teamId/users
             */
            if (id.current && type === 'subscription') {
              return api.list<User>(
                '/subscriptions/:subscriptionId/admins',
                {
                  limit,
                  page,
                  query: {
                    ...query
                  },
                  subscriptionId: id.current
                },
                {
                  primary,
                  useRole: focusRole
                }
              )
            }

            if (id.current && type === 'team') {
              return api.list<User>(
                '/teams/:teamId/admins',
                {
                  limit,
                  page,
                  query: { ...query },
                  teamId: id.current
                },
                {
                  primary,
                  useRole: focusRole
                }
              )
            }

            return api.list<User>(
              '/admins',
              {
                limit,
                page,
                query: {
                  ...query,
                  admin_type: type
                }
              },
              {
                primary,
                useRole: focusRole
              }
            )
          }}
          fetchName={`admins_${fetchKey}_${type}_${id}`}
          refresh={refresh}
          keyword={dbSearchTerm}
        />
      </div>

      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer
            remove={() => setDrawContent(null)}
            key="drawer"
            warnBeforeClose={warning}
            wide={wide}>
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}
