import { AnimatePresence } from 'framer-motion'
import { useState, useContext, useRef, useEffect } from 'react'
import Drawer from '../components/elements/Drawer'
import Dashboard from '../components/layouts/Dashboard'
import TableContainer from '../components/Table/TableContainer'
import {
  toChipCell,
  toDateCell,
  toLocaleCell,
  arrayToDisplayValue
} from '../components/Table/helpers'
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { AuthContext } from '../context/Auth.context'
import { timeout } from '../helpers/timeout'
import { UserStat } from '@fitlink/api/src/modules/users/entities/user.entity'
import { providers as providersMapping } from '@fitlink/common/mapping/providers'
import UserStats from '../components/forms/UserStats'
import IconSearch from '../components/icons/IconSearch'
import Link from 'next/link'

export default function TeamsPage() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [wide, setWide] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const { switchRole, primary } = useContext(AuthContext)
  const teamId = useRef<string>()

  useEffect(() => {
    if (primary.team) {
      teamId.current = primary.team
    }
  }, [primary.team])

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setRefresh(Date.now())
    setDrawContent(null)
  }

  const CreateTeamForm = () => {
    setWarning(true)
    setWide(false)
    // setDrawContent(<CreateTeam
    //   teamId={teamId.current}
    //   onSave={closeDrawer(1000)}
    // />)
  }

  const EditTeamForm = (fields) => {
    setWarning(true)
    setWide(false)
    // setDrawContent(
    //   <CreateTeam
    //     onSave={closeDrawer(1000)}
    //     teamId={teamId.current}
    //     current={fields}
    //   />
    // )
  }

  const DeleteForm = (fields) => {
    setWarning(true)
    setWide(false)
    // setDrawContent(
    //   <ConfirmDeleteForm
    //     onDelete={closeDrawer(1000)}
    //     onCancel={closeDrawer()}
    //     current={fields}
    //     mutation={(id) =>
    //       api.delete('/:teamId/teams/:teamId', {
    //         teamId: teamId.current,
    //         teamId: id
    //       })
    //     }
    //     title="Delete team"
    //     requireConfirmText="DELETE"
    //     message={`
    //       Are you sure you want to delete this team?
    //       This will permanently remove all associated rewards, leagues, activities & more.
    //     `}
    //   />
    // )
  }

  const showAvatar = ({
    cell: {
      row: {
        original: { initials, url_128x128 }
      }
    }
  }) => {
    return (
      <div className="bua">
        {url_128x128 && <img src={url_128x128} alt={initials} />}
        <span>{initials}</span>
      </div>
    )
  }

  const toHealthActivity = ({ cell: { value } }) => {
    const healthActivity = value ? value[0] : null
    let distance = ''
    if (!healthActivity) {
      return ''
    }

    if (healthActivity.distance) {
      distance = ' (' + Math.floor(healthActivity.distance / 1000) + ' km)'
    }

    return healthActivity.sport_name + distance
  }

  const cellActions = ({
    cell: {
      row: { original }
    }
  }) => (
    <div className="text-right">
      <button className="button alt small" onClick={() => DeleteForm(original)}>
        Delete
      </button>
      <button
        className="button small ml-1"
        onClick={() => EditTeamForm(original)}>
        Edit
      </button>
    </div>
  )

  const viewDetails = ({
    cell: {
      row: {
        original: {
          created_at,
          mobile_os,
          provider_types,
          points_total,
          rank,
          last_health_activity,
          league_count,
          reward_count,
          last_app_opened_at
        }
      }
    }
  }) => {
    return (
      <button
        className="icon-button"
        onClick={() => {
          setDrawContent(
            <UserStats
              date_joined={created_at}
              mobile_os={mobile_os}
              tracker={provider_types}
              points={points_total}
              rank={rank}
              last_activity={
                last_health_activity ? last_health_activity[0] : null
              }
              total_leagues={league_count}
              rewards={reward_count}
              last_session={last_app_opened_at}
            />
          )
        }}>
        <IconSearch />
      </button>
    )
  }

  const { api } = useContext(AuthContext)

  return (
    <Dashboard title="Settings Users">
      <div className="row ai-c">
        <div className="col">
          <h1 className="light mb-0">User performance</h1>
        </div>
        <div className="col text-right">
          <Link href="/users">
            <a className="button alt">Manage users</a>
          </Link>
        </div>
      </div>
      <p className="mt-1">
        To comply with GDPR regulations, user information is anonymous.
      </p>

      <div className="mt-4 overflow-x-auto">
        <TableContainer
          columns={[
            { Header: 'User', Cell: showAvatar },
            {
              Header: 'Date Joined',
              accessor: 'created_at',
              Cell: toDateCell
            },
            // { Header: 'Mobile OS', accessor: 'mobile_os' },
            {
              Header: 'Tracker',
              accessor: 'provider_types',
              Cell: arrayToDisplayValue(providersMapping)
            },
            {
              Header: 'Total Points',
              accessor: 'points_total',
              Cell: toLocaleCell
            },
            { Header: 'Rank', accessor: 'rank', Cell: toChipCell },
            {
              Header: 'Last activity',
              accessor: 'latest_health_activity',
              Cell: toHealthActivity
            },
            { Header: 'Total leagues', accessor: 'league_count' },
            {
              Header: 'Reward redeemed',
              accessor: 'reward_count',
              Cell: toLocaleCell
            }
            // { Header: ' ', Cell: viewDetails }
          ]}
          fetch={(limit, page) => {
            if (primary.team) {
              return api.list<UserStat>('/teams/:teamId/stats', {
                teamId: primary.team,
                limit,
                page
              })
            }

            return Promise.resolve({
              results: [],
              page_total: 0,
              total: 0
            })
          }}
          fetchName={`team_users_${primary.team}`}
          refresh={refresh}
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
