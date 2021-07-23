import Alert, { AlertProps } from '@fitlink/admin/src/components/elements/Alert'
import { Story } from '@storybook/react'

const Template: Story<AlertProps> = (args) => <Alert {...args} />

export const Default = Template.bind({})
Default.args = {
  title: 'This is a title',
  message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  close: () => {}
} as AlertProps

export default {
  title: 'Messaging/Alert',
  component: Alert
}
