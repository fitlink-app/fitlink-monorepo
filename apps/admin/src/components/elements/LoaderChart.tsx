import React from 'react'
import ContentLoader from 'react-content-loader'

export const LoaderChart = () => {
  return (
    <ContentLoader
      speed={1}
      width={60}
      height="100%"
      viewBox="0 0 100% 50"
      backgroundColor="#f3f3f3"
      foregroundColor="#00E9D7">
      <rect x={0} y={30} rx="0" ry="0" width="10" height="100%" />
      <rect x={15} y={20} rx="0" ry="0" width="10" height="100%" />
      <rect x={30} y={10} rx="0" ry="0" width="10" height="100%" />
      <rect x={45} y={0} rx="0" ry="0" width="10" height="100%" />
    </ContentLoader>
  )
}
