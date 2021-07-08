import MenuItem, { MenuItemProps } from '@fitlink/admin/src/components/elements/MenuItem'
import IconFriends from '@fitlink/admin/src/components/icons/IconFriends'
import { Story } from '@storybook/react'

const Template: Story<MenuItemProps> = (args) => <MenuItem {...args} />

export const Default = Template.bind({})
Default.args = {
  icon: <IconFriends />,
  to: '',
  label: 'Friends'
} as MenuItemProps

export default {
  title: 'Common/MenuItem',
  component: MenuItem
}
