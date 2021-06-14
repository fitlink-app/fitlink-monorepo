import { useState, useEffect } from 'react'
import League, { LeagueProps } from '../../components/elements/League'
import Select from '../../components/elements/Select'
import SortOrder from '../../components/elements/SortOrder'
import IconPlus from '../../components/icons/IconPlus'
import Dashboard from '../../components/layouts/Dashboard'
import Drawer from '../../components/elements/Drawer'
import LeagueForm from '../../components/forms/LeagueForm'
import { AnimatePresence } from 'framer-motion'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const leagues = require('../../services/dummy/leagues.json')

export default function components() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [sorted, setSorted] = useState([])
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [sortOn, setSortOn] = useState('points')

  const options = [
    {
      label: 'Members',
      value: 'members'
    },
    {
      label: 'Title',
      value: 'shortDescription'
    },
    {
      label: 'Reset date',
      value: 'resetDate'
    }
  ]

  useEffect(() => {
    const orig = JSON.parse(JSON.stringify(leagues))
    switch (sortOn) {
      case 'members':
        setSorted(
          orig.results.sort((a, b) =>
          sort === 'asc'
          ? parseFloat(a[sortOn]) - parseFloat(b[sortOn])
          : parseFloat(b[sortOn]) - parseFloat(a[sortOn])
          )
        )
        break
      default:
        setSorted(
          orig.results.sort((a, b) =>
            sort === 'asc'
              ? a[sortOn].toLowerCase() > b[sortOn].toLowerCase()
              : a[sortOn].toLowerCase() < b[sortOn].toLowerCase()
          )
        )
    }
  }, [leagues, sortOn, sort])

  const loadLeague = (league: any) => {
    setWarning(true)
    setDrawContent(
      <LeagueForm current={league} />
    )
  }

  const NewLeagueForm = () => {
    setWarning(true)
    setDrawContent(
      <LeagueForm />
    )
  }

  return (
    <Dashboard
      title="Leagues"
      >
      <div className="row ai-c mb-1">
        <div className="col-12 col-lg-8">
          <div className="flex ai-c">
            <h1 className="light mb-0 mr-2">Your leagues</h1>
            <button
              className="button alt small mt-1"
              onClick={NewLeagueForm}
              >
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
        { sorted.map((r:LeagueProps, i) => (
          <div className="rewards__wrap" key={`fl-r-${i}`}>
            <League {...r} onClick={ () => loadLeague(r)} />
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
