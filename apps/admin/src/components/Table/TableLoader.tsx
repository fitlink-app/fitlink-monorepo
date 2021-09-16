import React from 'react'
import ContentLoader from 'react-content-loader'

export const TableLoader = ({ rows = 4 }) => {
  return (
    <ContentLoader
      speed={2}
      width="100%"
      height={50}
      viewBox="0 0 100% 50"
      backgroundColor="#f3f3f3"
      foregroundColor="#00E9D7">
      {Array.from({ length: rows }).map((c, i) => {
        return <rect x={0} y={i * 15} rx="0" ry="0" width="100%" height="1" />
      })}
    </ContentLoader>
  )
}
