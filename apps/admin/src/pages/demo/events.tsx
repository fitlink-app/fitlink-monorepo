import { useState, useEffect } from 'react'
import Event from '../../components/elements/Event'
import Select from '../../components/elements/Select'
import SortOrder from '../../components/elements/SortOrder'
import IconPlus from '../../components/icons/IconPlus'
import Dashboard from '../../components/layouts/Dashboard'
import Drawer from '../../components/elements/Drawer'
import EventForm from '../../components/forms/EventForm'
import { AnimatePresence } from 'framer-motion'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const events = require('../../services/dummy/events.json')

export default function page() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [sorted, setSorted] = useState([])
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')
  const [sortOn, setSortOn] = useState('members')

  const options = [
    {
      label: 'Members',
      value: 'members'
    },
    {
      label: 'Title',
      value: 'title'
    },
    {
      label: 'Date',
      value: 'startDate'
    }
  ]

  useEffect(() => {
    const orig = JSON.parse(JSON.stringify(events))
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
          sort === 'asc'
            ? orig.results.sort((a, b) => a[sortOn].localeCompare(b[sortOn]))
            : orig.results
                .sort((a, b) => a[sortOn].localeCompare(b[sortOn]))
                .reverse()
        )
    }
  }, [events, sortOn, sort])

  const loadEvent = (event: any) => {
    setWarning(true)
    setDrawContent(<EventForm current={event} />)
  }

  const NewEventForm = () => {
    setWarning(true)
    setDrawContent(<EventForm />)
  }

  return (
    <Dashboard title="Events" linkPrefix="/demo" forceDisplay>
      <div className="row ai-c mb-2">
        <div className="col-12 col-lg-8">
          <div className="flex ai-c">
            <h1 className="light mb-0 mr-2">Your events</h1>
            <button className="button alt small mt-1" onClick={NewEventForm}>
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
          <div
            className="rewards__add"
            onClick={NewEventForm}
            style={{ height: 200 }}>
            <IconPlus />
          </div>
        </div>
        {sorted.map((r: any, i) => (
          <div className="rewards__wrap" key={`fl-r-${i}`}>
            <Event {...r} image={r.image?.url} onClick={() => loadEvent(r)} />
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
