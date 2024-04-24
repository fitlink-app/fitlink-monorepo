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
        <h1 className="light mb-0 mr-2">Our Partners</h1>
        <p>Explore our selected business partners, trusted technology and health leaders chosen to enhance your Fitlink experience. Our partnerships with these innovators ensure access to the most effective and compatible apps and wearables, helping you achieve your health and wellness goals more efficiently.</p>
      </div>
      <h4 className="light mb-0 mr-2 mt-5">Businesses</h4>
      <div className="row">
        {posts
          .filter((p) => p.group === 'desktop')
          .map((p) => (
            <div className="col-12 col-md-6 col-xl-3 col-hd-3" key={p.link}>
              <AppStoreThumb {...p} />
            </div>
          ))}
      </div>
      <h4 className="light mb-0 mr-2 mt-5">Health Apps</h4>
      <p>Discover our expertly curated selection of health and fitness apps to enhance physical and mental well-being. Each app integrates seamlessly with Fitlink, empowering you with the tools you need for a healthier lifestyle. Whether it's tracking your steps, monitoring your sleep, or managing stress, our partners provide reliable and innovative solutions to support your wellness goals.</p>
      <div className="row">
        {posts
          .filter((p) => p.group === 'app')
          .map((p) => (
            <div className="col-12 col-md-6 col-xl-3 col-hd-3" key={p.link}>
              <AppStoreThumb {...p} />
            </div>
          ))}
      </div>
      <h4 className="light mb-0 mr-2 mt-5">Wearables</h4>
      <p>Explore our range of wearable apps and devices, chosen for their precision and user-friendly interfaces. These partners help you stay connected to your health goals through real-time data on activity, heart rate, and more, all synchronized seamlessly with Fitlink. Elevate your daily health management and enjoy a more informed, active lifestyle.</p>
      <div className="row">
        {posts
          .filter((p) => p.group === 'wearable')
          .map((p) => (
            <div className="col-12 col-md-6 col-xl-3 col-hd-3" key={p.link}>
              <AppStoreThumb {...p} />
            </div>
          ))}
      </div>
      
    </Dashboard>
  )
}
