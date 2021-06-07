import { Story } from '@storybook/react'
import IconActivities from '@fitlink/admin/src/components/icons/IconActivities'
import IconCreditCard from '@fitlink/admin/src/components/icons/IconCreditCard'
import IconFriends from '@fitlink/admin/src/components/icons/IconFriends'
import IconGear from '@fitlink/admin/src/components/icons/IconGear'
import IconGraph from '@fitlink/admin/src/components/icons/IconGraph'
import IconLeagues from '@fitlink/admin/src/components/icons/IconLeagues'
import IconMarker from '@fitlink/admin/src/components/icons/IconMarker'
import IconRewards from '@fitlink/admin/src/components/icons/IconRewards'
import IconSettings from '@fitlink/admin/src/components/icons/IconSettings'
import IconSignOut from '@fitlink/admin/src/components/icons/IconSignOut'
import IconYoga from '@fitlink/admin/src/components/icons/IconYoga'

const iconSet = [
  <IconActivities width="2rem" height="2rem" />,
  <IconCreditCard width="2rem" height="2rem" />,
  <IconFriends width="2rem" height="2rem" />,
  <IconGear width="2rem" height="2rem" />,
  <IconGraph width="2rem" height="2rem" />,
  <IconLeagues width="2rem" height="2rem" />,
  <IconMarker width="2rem" height="2rem" />,
  <IconRewards width="2rem" height="2rem" />,
  <IconSettings width="2rem" height="2rem" />,
  <IconSignOut width="2rem" height="2rem" />,
  <IconYoga width="2rem" height="2rem" />
]

const Icons = () => (
  <div className="row">
    {iconSet.map((e, i) => (
      <div className="col-1 text-center my-1" key={`icon_${i}`}>
        {e}
      </div>
    ))}
  </div>
)

const Template: Story = (args) => <Icons {...args} />

export const All = Template.bind({})

export default {
  title: 'Common/Icons',
  component: Icons
}
