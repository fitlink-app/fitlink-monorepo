import DateInput, { DateInputProps } from '@fitlink/admin/src/components/elements/DateInput'
import { Story } from '@storybook/react'

const Template: Story<DateInputProps> = (args) => <DateInput {...args} />

export const Default = Template.bind({})
Default.args = {
  label: 'Date of Birth',
  name: 'date'
} as DateInputProps

export default {
  title: 'Inputs/DateInput',
  component: DateInput
}
