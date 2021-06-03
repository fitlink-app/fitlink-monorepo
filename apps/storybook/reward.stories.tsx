import Reward, { RewardProps } from '../admin/src/components/elements/Reward'
import { Story } from '@storybook/react'

const Template: Story<RewardProps> = (args) => <Reward {...args} />

export const Default = Template.bind({})
Default.args = {
  image: 'https://picsum.photos/id/1080/760',
  brand: 'Kauai',
  shortDescription: 'Small Health Drink',
  points: 200,
  expires: '2021-05-30T07:22:48.220Z',
  claimed: 1200
} as RewardProps

export default {
  title: 'Cards/Reward',
  component: Reward
}
