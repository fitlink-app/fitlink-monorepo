export default function Loader({ className = '' }) {
  return (
    <div className={`loader ${className}`}>
      <div className="box1"></div>
      <div className="box2"></div>
      <div className="box3"></div>
    </div>
  )
}
