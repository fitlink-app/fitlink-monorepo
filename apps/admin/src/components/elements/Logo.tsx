export type LogoProps = {
  white?: boolean
  whiteDot?: boolean
  height?: number
}

export default function Logo({
  white = false,
  whiteDot = false,
  height = 30
}: LogoProps) {

  const width = 5.2 * height // 156

  return (
    <svg
      className="fitlink-logo"
      width={width}
      height={height}
      viewBox="0 0 156 30"
      xmlns="http://www.w3.org/2000/svg">
      <circle
        fill={whiteDot ? '#fff' : '#00E9D7'}
        fillRule="nonzero"
        cx="15"
        cy="15"
        r="15"
      />
      <path
        d="M53.08 10.452c-.473 0-.897.018-1.272.055a2.567 2.567 0 00-.955.262c-.26.137-.47.353-.6.617a2.5 2.5 0 00-.208 1.114v.557h11.31v3.2h-11.31v5.993h-4.05V12.166a5.876 5.876 0 01.344-2.074c.23-.613.63-1.149 1.151-1.545a5.717 5.717 0 012.14-.961 13.952 13.952 0 013.319-.333h8.941v3.2l-8.81-.001zm11.929 11.8v-15h4.05v15h-4.05zm16.8-11.736v11.737h-4.05V10.517h-6.368V7.253h16.79v3.264l-6.372-.001zm12.744 5.318a5.575 5.575 0 00.175 1.534c.096.362.293.69.568.944a2.17 2.17 0 001.021.48c.51.095 1.027.14 1.545.131h7.686v3.33h-8.516a13.43 13.43 0 01-3.008-.289 5.223 5.223 0 01-2.025-.9 3.462 3.462 0 01-1.141-1.534 6.173 6.173 0 01-.355-2.205V7.253h4.05v8.581zm13.883 6.419v-15h4.05v15h-4.05zm21.385 0L119.7 11.947v10.306h-4.05v-15h4.4L130.182 17.6V7.253h4.028v15h-4.389zm11.626-9.28l8.3-5.721h5.426l-10.1 7.194 10.775 7.806h-5.908l-8.493-6.233v6.234h-4.072v-15h4.072v5.72z"
        fill={white ? '#fff' : '#232323'}
      />
    </svg>
  )
}
