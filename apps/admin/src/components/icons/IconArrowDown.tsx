import Icon, { IconProps } from './Icon'

export default function IconArrowDown(props: IconProps) {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        strokeWidth={1}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
      />
    </Icon>
  )
}
