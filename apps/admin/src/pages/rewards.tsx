import { useState } from 'react'
import Dashboard from '../components/layouts/Dashboard'
import Drawer from '../components/elements/Drawer'
import Reward, { RewardProps } from '../components/elements/Reward'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fitlinkRewards = require('../services/dummy/rewards-fitlink.json')

export default function components() {
  const [drawContent, setDrawContent] = useState<React.ReactNode | undefined | false>(false)

  return (
    <Dashboard
      title="Rewards"
      >
      <div className="row ai-c mb-1">
        <div className="col">
          <h1 className="light mb-0">Your rewards</h1>
        </div>
        <div className="col text-right">
          <button className="button alt">Add reward</button>
        </div>
      </div>
      <h2 className="h1 light">Fitlink sponsored rewards</h2>
      <div className="">
        { fitlinkRewards.results.map((r:RewardProps, i) => (
          <Reward {...r} className="mr-1 mb-1" />
        ))}
      </div>
      
      <Drawer onClose={ () => setDrawContent(null) }>
        { drawContent }
      </Drawer>
    </Dashboard>
  )
}