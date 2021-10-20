import { useState } from 'react'
import { useIntercom } from 'react-use-intercom'
import AppStoreThumb, {
  AppStoreItem
} from '../../components/elements/AppStoreThumb'
import Loader from '../../components/elements/Loader'
import Dashboard from '../../components/layouts/Dashboard'
import appStore from '../../data/app-store/index.json'

export default function page() {
  const [posts, setPosts] = useState<AppStoreItem[]>(appStore)
  const { startTour } = useIntercom()

  return (
    <Dashboard title="App Store">
      <div className="flex ai-c mb-2">
        <h1 className="light mb-0 mr-2">App Store</h1>
      </div>

      <h4 className="light mb-0 mr-2 mt-5">Mobile Apps</h4>
      <div className="row">
        {posts
          .filter((p) => p.group === 'app')
          .map((p) => (
            <div className="col-12 col-md-6 col-xl-3 col-hd-3" key={p.link}>
              <AppStoreThumb {...p} />
            </div>
          ))}
      </div>
      <h4 className="light mb-0 mr-2 mt-5">Wearable Apps</h4>
      <div className="row">
        {posts
          .filter((p) => p.group === 'wearable')
          .map((p) => (
            <div className="col-12 col-md-6 col-xl-3 col-hd-3" key={p.link}>
              <AppStoreThumb {...p} />
            </div>
          ))}
      </div>
      <h4 className="light mb-0 mr-2 mt-5">Desktop Apps</h4>
      <div className="row">
        {posts
          .filter((p) => p.group === 'desktop')
          .map((p) => (
            <div className="col-12 col-md-6 col-xl-3 col-hd-3" key={p.link}>
              <AppStoreThumb {...p} />
            </div>
          ))}
      </div>
    </Dashboard>
  )
}
