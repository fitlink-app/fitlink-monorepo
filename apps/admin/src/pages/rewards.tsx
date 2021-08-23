import { useState, useEffect, useContext } from 'react'
import Dashboard from '../components/layouts/Dashboard'
import Drawer from '../components/elements/Drawer'
import Reward, { RewardProps } from '../components/elements/Reward'
//import 'flickity/dist/flickity.min.css'
import Select from '../components/elements/Select'
import SortOrder from '../components/elements/SortOrder'
import RewardDetails from '../components/forms/RewardDetails'
import RewardForm from '../components/forms/RewardForm'
import { AnimatePresence } from 'framer-motion'
import IconPlus from '../components/icons/IconPlus'
import IconEye from '../components/icons/IconEye'
import IconEyeSlash from '../components/icons/IconEyeSlash'
import { AuthContext } from '../context/Auth.context'
import { ApiResult } from '@fitlink/common/react-query/types'
import { Reward as RewardEntity } from '@fitlink/api/src/modules/rewards/entities/reward.entity'
import { useQuery } from 'react-query'
import { timeout } from '../helpers/timeout'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rewards = require('../services/dummy/rewards.json')

export default function page() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)

  const [sorted, setSorted] = useState([])
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [sortOn, setSortOn] = useState('points_required')

  const [sortedFL, setSortedFL] = useState<RewardEntity[]>([])
  const [sortFL, setSortFL] = useState<'asc' | 'desc'>('asc')
  const [sortOnFL, setSortOnFL] = useState('points_required')

  const [showFL, setShowFL] = useState(true)
  const [refresh, setRefresh] = useState(0)

  const [fitlinkRewards, setFitlinkRewards] = useState<RewardEntity[]>([])

  const options = [
    {
      label: 'Points',
      value: 'points_required'
    },
    {
      label: 'Title',
      value: 'name_short'
    },
    {
      label: 'Brand',
      value: 'brand'
    },
    {
      label: 'Claims',
      value: 'redeemed_count'
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
    // if (!window.localStorage.getItem('showFLRewards')) {
    //   setShowFL(true)
    //   window.localStorage.setItem('showFLRewards', 'true')
    // } else {
    //   setShowFL(window.localStorage.getItem('showFLRewards') === 'true')
    // }
    // if (!window.localStorage.getItem('showCharityRewards')) {
    //   setShowCharity(true)
    //   window.localStorage.setItem('showCharityRewards', 'true')
    // } else {
    //   setShowCharity(
    //     window.localStorage.getItem('showCharityRewards') === 'true'
    //   )
    // }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('showFLRewards', showFL.toString())
  }, [showFL])

  useEffect(() => {
    const rewards = fitlinkRewards
    switch (sortOnFL) {
      case 'name_short':
      case 'brand':
        setSortedFL(
          rewards.sort((a, b) => {
            if (sortFL === 'asc') {
              return a[sortOnFL].toLowerCase() > b[sortOnFL].toLowerCase()
                ? 1
                : -1
            } else {
              return a[sortOnFL].toLowerCase() < b[sortOnFL].toLowerCase()
                ? 1
                : -1
            }
          })
        )
        break
      case 'points_required':
      case 'redeemed_count':
      default:
        setSortedFL(
          rewards.sort((a, b) =>
            sortFL === 'asc'
              ? a[sortOnFL] - b[sortOnFL]
              : b[sortOnFL] - a[sortOnFL]
          )
        )
        break
    }
  }, [fitlinkRewards, sortOnFL, sortFL])

  useEffect(() => {
    const orig = JSON.parse(JSON.stringify(rewards))
    switch (sortOn) {
      case 'name_short':
      case 'brand':
        setSorted(
          orig.results.sort((a, b) =>
            sort === 'asc'
              ? a[sortOn].toLowerCase() > b[sortOn].toLowerCase()
              : a[sortOn].toLowerCase() < b[sortOn].toLowerCase()
          )
        )
        break
      case 'points_required':
      case 'redeemed_count':
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
    setDrawContent(<RewardDetails {...reward} />)
  }

  const loadReward = (reward: any) => {
    setWarning(true)
    setDrawContent(
      <RewardForm
        current={reward}
        onSave={() => {
          setRefresh(Date.now())
          closeDrawer(1000)()
        }}
      />
    )
  }

  const NewRewardForm = () => {
    setWarning(true)
    setDrawContent(<RewardForm current={{}} />)
  }

  const { api, primary, focusRole, fetchKey } = useContext(AuthContext)

  const rewardQuery: ApiResult<{
    results: RewardEntity[]
    total: number
    page_total: number
  }> = useQuery(`${fetchKey}_rewards`, async () => {
    if (focusRole) {
      return api.list<RewardEntity>(
        '/rewards',
        {
          query: {
            limit: 100,
            include_expired_rewards: 0
          }
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
    rewardQuery.refetch()
  }, [refresh])

  useEffect(() => {
    if (rewardQuery.isFetched) {
      setFitlinkRewards(rewardQuery.data.results)
    }
  }, [rewardQuery.data])

  const closeDrawer = (ms = 0) => async () => {
    if (ms) {
      await timeout(ms)
    }
    setRefresh(Date.now())
    setDrawContent(null)
  }

  return (
    <Dashboard title="Rewards">
      {focusRole !== 'app' && (
        <>
          <div className="row ai-c mb-2">
            <div className="col-12 col-lg-8">
              <div className="flex ai-c">
                <h1 className="light mb-0 mr-2">Your rewards</h1>
                <button
                  className="button alt small mt-1"
                  onClick={NewRewardForm}>
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
            {sorted.map((r: RewardProps, i) => (
              <div className="rewards__wrap" key={`fl-r-${i}`}>
                <Reward {...r} onClick={() => loadReward(r)} />
              </div>
            ))}
          </div>
        </>
      )}

      {showFL ? (
        <>
          <div className="row mb-2">
            <div className="col-12 col-lg-8 flex ai-c">
              <h2 className="h1 light mb-0">Fitlink sponsored rewards</h2>

              {focusRole !== 'app' && (
                <p
                  className="ml-1 mt-3 pointer color-light-grey hover-dark-grey flex ai-c"
                  onClick={() => setShowFL(false)}>
                  <IconEyeSlash className="mr-1" />
                  Hide Fitlink sponsored rewards
                </p>
              )}

              {focusRole === 'app' && (
                <button
                  className="button alt small ml-1 mt-1"
                  onClick={NewRewardForm}>
                  Add new
                </button>
              )}
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
            {focusRole === 'app' && (
              <div className="p-1">
                <div className="rewards__add" onClick={NewRewardForm}>
                  <IconPlus />
                </div>
              </div>
            )}

            {sortedFL.map((r, i) => (
              <div className="rewards__wrap" key={`fl-r-${i}`}>
                <Reward
                  brand={r.brand}
                  expires={r.reward_expires_at}
                  points={r.points_required}
                  shortTitle={r.name_short}
                  code={r.code}
                  description={r.description}
                  instructions={r.redeem_instructions}
                  redeemed={r.redeemed_count}
                  title={r.name}
                  url={r.redeem_url}
                  image={r.image ? r.image.url : undefined}
                  onClick={() =>
                    focusRole === 'app' ? loadReward(r) : loadReadonlyReward(r)
                  }
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <p
          onClick={() => setShowFL(true)}
          className="pointer color-light-grey hover-dark-grey flex ai-c">
          <IconEye className="mr-1" />
          Show Fitlink sponsored rewards
        </p>
      )}

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
