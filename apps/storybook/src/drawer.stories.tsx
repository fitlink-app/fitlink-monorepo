import Drawer, { DrawerProps } from '@fitlink/admin/src/components/elements/Drawer'
import { Story } from '@storybook/react'

const Template: Story<DrawerProps> = (args) => <Drawer {...args} />

export const Default = Template.bind({})
Default.args = {
  children: <p>hello world!</p>
} as DrawerProps

export default {
  title: 'Layout/Drawer',
  component: Drawer
}
