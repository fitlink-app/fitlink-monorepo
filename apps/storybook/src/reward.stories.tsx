import Reward, {
  RewardProps
} from '@fitlink/admin/src/components/elements/Reward'
import { Story } from '@storybook/react'

const Template: Story<RewardProps> = (args) => <Reward {...args} />

export const Default = Template.bind({})
Default.args = {
  image: 'https://picsum.photos/id/1080/760',
  brand: "Monmouth Coffee",
  shortTitle: "Free hot drink",
  title: "Enjoy a free coffee on us",
  points: 60,
  expires: "2021-12-31T02:00:00.220Z",
  redeemed: 514,
  created: "2021-05-21T11:05:00.220Z",
  instructions: "Show the reward code at the till",
  url: "",
  code: "MON1945",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
} as RewardProps

export const Expanded = Template.bind({})
Expanded.args = {
  image: 'https://picsum.photos/id/1080/760',
  brand: "Monmouth Coffee",
  shortTitle: "Free hot drink",
  title: "Enjoy a free coffee on us",
  points: 60,
  expires: "2021-12-31T02:00:00.220Z",
  redeemed: 514,
  created: "2021-05-21T11:05:00.220Z",
  instructions: "Show the reward code at the till",
  url: "",
  code: "MON1945",
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  showExtra: true
} as RewardProps

export default {
  title: 'Cards/Reward',
  component: Reward
}
