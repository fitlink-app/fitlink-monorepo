import Feedback, { FeedbackProps } from '@fitlink/admin/src/components/elements/Feedback'
import { Story } from '@storybook/react'

const Template: Story<FeedbackProps> = (args) => <Feedback {...args} />

export const Default = Template.bind({})
Default.args = {
  message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
} as FeedbackProps

export default {
  title: 'Messaging/Feedback',
  component: Feedback
}
