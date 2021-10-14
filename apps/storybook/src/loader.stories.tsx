import { Story } from '@storybook/react'
import Loader from '@fitlink/admin/src/components/elements/Loader'

const Template: Story = (args) => <Loader {...args} />

export const All = Template.bind({})

export default {
  title: 'Common/Loader',
  component: Loader
}