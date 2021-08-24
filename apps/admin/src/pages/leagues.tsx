import { useState, useEffect, useContext } from 'react'
import League, { LeagueProps } from '../components/elements/League'
import Select from '../components/elements/Select'
import SortOrder from '../components/elements/SortOrder'
import IconPlus from '../components/icons/IconPlus'
import Dashboard from '../components/layouts/Dashboard'
import Drawer from '../components/elements/Drawer'
import LeagueForm from '../components/forms/LeagueForm'
import { AnimatePresence } from 'framer-motion'
import { League as LeagueEntity } from '@fitlink/api/src/modules/leagues/entities/league.entity'
import { ApiResult } from '../../../common/react-query/types'
import { AuthContext } from '../context/Auth.context'
import { useQuery } from 'react-query'
import { timeout } from '../helpers/timeout'
import ConfirmDeleteForm from '../components/forms/ConfirmDeleteForm'
// eslint-disable-next-line @typescript-eslint/no-var-requires

export default function page() {
  const { api, primary, focusRole, fetchKey } = useContext(AuthContext)
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [sorted, setSorted] = useState<LeagueEntity[]>([])
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')
  const [sortOn, setSortOn] = useState('members')
  const [leagues, setLeagues] = useState<LeagueEntity[]>([])
  const [refresh, setRefresh] = useState(0)

  const options = [
    {
      label: 'Members',
      value: 'participants_total'
    },
    {
      label: 'Title',
      value: 'name'
    },
    {
      label: 'Reset date',
      value: 'ends_at'
    }
  ]

  useEffect(() => {
    switch (sortOn) {
      case 'participants_total':
        setSorted(
          leagues.sort((a, b) =>
            sort === 'asc' ? a[sortOn] - b[sortOn] : b[sortOn] - a[sortOn]
          )
        )
        break
      default:
        setSorted(
          leagues.sort((a, b) => {
            if (!a[sortOn] || !b[sortOn]) {
              return 1
            }

            if (sortOn === 'asc') {
              return a[sortOn].toLowerCase() > b[sortOn].toLowerCase() ? 1 : -1
            } else {
              return a[sortOn].toLowerCase() < b[sortOn].toLowerCase() ? 1 : -1
            }
          })
        )
    }
  }, [leagues, sortOn, sort])

  const leaguesQuery: ApiResult<{
    results: LeagueEntity[]
    total: number
    page_total: number
  }> = useQuery(`${fetchKey}_rewards`, async () => {
    if (focusRole) {
      return api.list<LeagueEntity>(
        '/leagues',
        {
          query: { limit: 100 }
        },
        {
          primary,
          useRole: focusRole
        }
      )
    }

    return Promise.resolve({
      results: [],
      total: 0,
      page_total: 0
    })
  })

  useEffect(() => {
    if (leaguesQuery.data) {
      setLeagues(leaguesQuery.data.results)
    }
  }, [leaguesQuery.data])

  useEffect(() => {
    leaguesQuery.refetch()
  }, [refresh])

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setRefresh(Date.now())
    setDrawContent(null)
  }

  const loadLeague = (league: any) => {
    setWarning(true)
    setDrawContent(
      <LeagueForm
        key={league.id || Date.now()}
        onSave={() => {
          setRefresh(Date.now())
          closeDrawer(1000)()
        }}
        onDelete={DeleteForm}
        current={league}
      />
    )
  }

  const DeleteForm = (fields) => {
    setWarning(true)
    setDrawContent(
      <ConfirmDeleteForm
        onDelete={closeDrawer(1000)}
        onCancel={closeDrawer()}
        current={fields}
        mutation={(leagueId) =>
          api.delete(
            `/leagues/:leagueId`,
            {
              leagueId
            },
            {
              primary,
              useRole: focusRole
            }
          )
        }
        title="Delete league"
        message={`
          Are you sure you want to delete this league?
          This will also delete all related data like leaderboards and positions.
        `}
      />
    )
  }

  const NewLeagueForm = () => {
    setWarning(true)
    setDrawContent(
      <LeagueForm
        onSave={() => {
          setRefresh(Date.now())
          closeDrawer(1000)()
        }}
        current={{}}
      />
    )
  }

  return (
    <Dashboard title="Leagues">
      <div className="row ai-c mb-2">
        <div className="col-12 col-lg-8">
          <div className="flex ai-c">
            <h1 className="light mb-0 mr-2">Your leagues</h1>
            <button className="button alt small mt-1" onClick={NewLeagueForm}>
              Add new
            </button>
          </div>
        </div>
        <div className="col-12 col-lg-4 text-lg-right">
          <Select
            id="sort"
            defaultValue={options[0]}
            isSearchable={false}
            options={options}
            label="Sort by"
            inline={true}
            onChange={(v) => setSortOn(v.value)}
          />
          <SortOrder value={sort} onChange={(e) => setSort(e)} />
        </div>
      </div>
      <div className="rewards flex mb-4">
        <div className="p-1">
          <div className="rewards__add" onClick={NewLeagueForm}>
            <IconPlus />
          </div>
        </div>
        {sorted.map((l, i) => (
          <div className="rewards__wrap" key={`fl-r-${i}`}>
            <League
              {...formatLeague(l)}
              onClick={() => loadLeague(l)}
              key={l.id}
            />
          </div>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer
            remove={() => setDrawContent(null)}
            key="drawer"
            warnBeforeClose={warning}>
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}

const formatLeague = (l: LeagueEntity) => {
  return {
    name: l.name,
    image: l.image ? l.image.url : undefined,
    members: l.participants_total,
    resetDate: l.ends_at,
    sport: l.sport ? l.sport.name : undefined,
    description: l.description,
    repeats: l.repeat
  } as LeagueProps
}
