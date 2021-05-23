import Sidebar from '../admin/src/components/elements/Sidebar'
import { Story } from '@storybook/react'

const Template: Story = (args) => <Sidebar />

export const Default = Template.bind({})

export default {
  title: 'Layout/Sidebar',
  component: Sidebar
}
