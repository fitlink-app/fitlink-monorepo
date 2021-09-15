import Loader from './Loader'

export default function LoaderFullscreen({ className = '' }) {
  return (
    <div className="flex ai-c ji-c full-height">
      <Loader />
    </div>
  )
}
