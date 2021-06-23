import { useState, useEffect } from 'react'
import Dashboard from '../../components/layouts/Dashboard'
import Drawer from '../../components/elements/Drawer'
import Reward, { RewardProps } from '../../components/elements/Reward'
//import 'flickity/dist/flickity.min.css'
import Select from '../../components/elements/Select'
import SortOrder from '../../components/elements/SortOrder'
import RewardDetails from '../../components/forms/RewardDetails'
import RewardForm from '../../components/forms/RewardForm'
import { AnimatePresence } from 'framer-motion'
import IconPlus from '../../components/icons/IconPlus'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rewards = require('../../services/dummy/rewards.json')
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

  const [showFL, setShowFL] = useState(false)

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
    setShowFL(window.localStorage.getItem('showFLrewards') === 'true')
  }, [])

  useEffect(() => {
    window.localStorage.setItem('showFLrewards', showFL.toString())
  }, [showFL])

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

  const loadReward = (reward: any) => {
    setWarning(true)
    setDrawContent(
      <RewardForm current={reward} />
    )
  }

  const NewRewardForm = () => {
    setWarning(true)
    setDrawContent(
      <RewardForm />
    )
  }

  return (
    <Dashboard title="Rewards">
      <div className="row ai-c mb-2">
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
        <div className="p-1">
          <div className="rewards__add" onClick={NewRewardForm}>
            <IconPlus />
          </div>
        </div>
        { sorted.map((r:RewardProps, i) => (
          <div className="rewards__wrap" key={`fl-r-${i}`}>
            <Reward {...r} onClick={ () => loadReward(r)} />
          </div>
        ))}
      </div>

      { showFL ?
        <>
          <div className="row mb-2">
            <div className="col-12 col-lg-8 flex ai-c">
              <h2 className="h1 light mb-0">
                Fitlink sponsored rewards
              </h2>
              <small
                className="ml-1 mt-3"
                onClick={ () => setShowFL(false) }
                >
                Hide Fitlink sponsored rewards
                </small>
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
              <div className="rewards__wrap" key={`fl-r-${i}`}>
                <Reward {...r} onClick={ () => loadReadonlyReward(r)} />
              </div>
            ))}
          </div>
        </>
        :
        <small onClick={ () => setShowFL(true) }>Show Fitlink sponsored rewards</small>
      }

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
