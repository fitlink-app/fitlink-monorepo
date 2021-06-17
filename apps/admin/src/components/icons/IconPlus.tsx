import Icon, { IconProps } from './Icon'

export default function IconPlus(props:IconProps) {
  return (
    <Icon {...props}>
      <path fill="currentColor" d="M27.5 14.5h-10v-10c0-0.276-0.224-0.5-0.5-0.5h-2c-0.276 0-0.5 0.224-0.5 0.5v10h-10c-0.276 0-0.5 0.224-0.5 0.5v2c0 0.276 0.224 0.5 0.5 0.5h10v10c0 0.276 0.224 0.5 0.5 0.5h2c0.276 0 0.5-0.224 0.5-0.5v-10h10c0.276 0 0.5-0.224 0.5-0.5v-2c0-0.276-0.224-0.5-0.5-0.5z" />
    </Icon>
  )
}