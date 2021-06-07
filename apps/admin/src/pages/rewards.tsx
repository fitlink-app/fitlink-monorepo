import { useState, useEffect } from 'react'
import Dashboard from '../components/layouts/Dashboard'
import Drawer from '../components/elements/Drawer'
import Reward, { RewardProps } from '../components/elements/Reward'
import 'flickity/dist/flickity.min.css'
import Select from '../components/elements/Select'
import SortOrder from '../components/elements/SortOrder'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fitlinkRewards = require('../services/dummy/rewards-fitlink.json')

export default function components() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)

  const [sorted, setSorted] = useState([])
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [sortOn, setSortOn] = useState('points')

  const [sortedFL, setSortedFL] = useState([])
  const [sortFL, setSortFL] = useState<'asc' | 'desc'>('asc')
  const [sortOnFL, setSortOnFL] = useState('points')

  const options = [
    {
      label: 'Points',
      value: 'points'
    },
    {
      label: 'Title',
      value: 'shortDescription'
    },
    {
      label: 'Brand',
      value: 'brand'
    },
    {
      label: 'Claims',
      value: 'claimed'
    }
  ]

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    /* const Flickity = require('flickity')
    const flick = new Flickity('.rewards', {
      prevNextButtons: false,
      pageDots: false,
      cellAlign: 'left',
      contain: true
    }) */
  }, [])

  useEffect(() => {
    const orig = JSON.parse(JSON.stringify(fitlinkRewards))
    switch (sortOnFL) {
      case 'shortDescription':
      case 'brand':
        setSortedFL(
          orig.results.sort((a, b) =>
            sortFL === 'asc'
              ? a[sortOnFL].toLowerCase() > b[sortOnFL].toLowerCase()
              : a[sortOnFL].toLowerCase() < b[sortOnFL].toLowerCase()
          )
        )
        break
      case 'points':
      case 'claims':
      default:
        setSortedFL(
          orig.results.sort((a, b) =>
            sortFL === 'asc'
              ? parseFloat(a[sortOnFL]) - parseFloat(b[sortOnFL])
              : parseFloat(b[sortOnFL]) - parseFloat(a[sortOnFL])
          )
        )
        break
    }
  }, [fitlinkRewards, sortOnFL, sortFL])

  return (
    <Dashboard title="Rewards">
      <div className="row ai-c mb-1">
        <div className="col-12 col-lg-8">
          <h1 className="light mb-0">Your rewards</h1>
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
      <div className="row mb-3">
        <div className="col-12 col-lg-8">
          <h2 className="h1 light mb-0">Fitlink sponsored rewards</h2>
        </div>
        <div className="col-12 col-lg-4 text-lg-right">
          <Select
            id="sortFR"
            defaultValue={options[0]}
            isSearchable={false}
            options={options}
            label="Sort by"
            inline={true}
            onChange={(v) => setSortOnFL(v.value)}
          />
          <SortOrder value={sortFL} onChange={(e) => setSortFL(e)} />
        </div>
      </div>
      <div className="rewards flex">
        {sortedFL.map((r: RewardProps, i) => (
          <Reward {...r} className="mr-2 mb-2" key={`fl-r-${i}`} />
        ))}
      </div>

      <Drawer onClose={() => setDrawContent(null)}>{drawContent}</Drawer>
    </Dashboard>
  )
}
