import League, {
  LeagueProps
} from '@fitlink/admin/src/components/elements/League'
import { Story } from '@storybook/react'

const Template: Story<LeagueProps> = (args) => <League {...args} />

export const Default = Template.bind({})
Default.args = {
  image: 'https://source.unsplash.com/ljoCgjs63SM/760',
  name: 'Weekly Steps Challenge',
  description:
    'Join this weekly steps league to see if you can get all the steps!',
  members: 1256,
  resetDate: '2021-05-30T07:22:48.220Z',
  type: 'Steps'
} as LeagueProps

export default {
  title: 'Cards/League',
  component: League
}
