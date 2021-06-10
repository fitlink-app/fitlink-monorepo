import { useState, useEffect } from 'react'
import Dashboard from '../../components/layouts/Dashboard'
import Drawer from '../../components/elements/Drawer'
import Reward, { RewardProps } from '../../components/elements/Reward'
//import 'flickity/dist/flickity.min.css'
import Select from '../../components/elements/Select'
import SortOrder from '../../components/elements/SortOrder'
import RewardDetails from '../../components/forms/RewardDetails'
import NewReward from '../../components/forms/NewReward'
import { AnimatePresence } from 'framer-motion'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rewards = require('../services/dummy/rewards.json')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fitlinkRewards = require('../../services/dummy/rewards-fitlink.json')

export default function components() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
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
      value: 'shortTitle'
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

  /* useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Flickity = require('flickity')
    const flick = new Flickity('.rewards', {
      prevNextButtons: false,
      pageDots: false,
      cellAlign: 'left',
      contain: true
    })
  }, []) */

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

  useEffect(() => {
    const orig = JSON.parse(JSON.stringify(rewards))
    switch (sortOn) {
      case 'shortDescription':
      case 'brand':
        setSorted(
          orig.results.sort((a, b) =>
            sort === 'asc'
              ? a[sortOn].toLowerCase() > b[sortOn].toLowerCase()
              : a[sortOn].toLowerCase() < b[sortOn].toLowerCase()
          )
        )
        break
      case 'points':
      case 'claims':
      default:
        setSorted(
          orig.results.sort((a, b) =>
            sort === 'asc'
              ? parseFloat(a[sortOn]) - parseFloat(b[sortOn])
              : parseFloat(b[sortOn]) - parseFloat(a[sortOn])
          )
        )
        break
    }
  }, [rewards, sortOn, sort])

  const loadReadonlyReward = (reward: any) => {
    setWarning(false)
    setDrawContent(
      <RewardDetails {...reward} />
    )
  }

  const NewRewardForm = () => {
    setWarning(true)
    setDrawContent(
      <NewReward />
    )
  }

  return (
    <Dashboard title="Rewards">
      <div className="row ai-c mb-1">
        <div className="col-12 col-lg-8">
          <div className="flex ai-c">
            <h1 className="light mb-0 mr-2">Your rewards</h1>
            <button
              className="button alt small mt-1"
              onClick={NewRewardForm}
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
        { sorted.map((r:RewardProps, i) => (
          <div className="reward-wrap" key={`fl-r-${i}`}>
            <Reward {...r} onClick={ () => loadReadonlyReward(r)} />
          </div>
        ))}
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
        { sortedFL.map((r:RewardProps, i) => (
          <div className="reward-wrap" key={`fl-r-${i}`}>
            <Reward {...r} onClick={ () => loadReadonlyReward(r)} />
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
