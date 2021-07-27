import Confirm, { ConfirmProps } from '@fitlink/admin/src/components/elements/Confirm'
import { Story } from '@storybook/react'

const Template: Story<ConfirmProps> = (args) => <Confirm {...args} />

export const Default = Template.bind({})
Default.args = {
  title: 'This is a title',
  message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  close: () => {},
  onConfirm: () => {},
} as ConfirmProps

export default {
  title: 'Messaging/Confirm',
  component: Confirm
}
