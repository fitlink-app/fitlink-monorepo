import Input, { InputProps } from '@fitlink/admin/src/components/elements/Input'
import { Story } from '@storybook/react'

const Template: Story<InputProps> = (args) => <Input {...args} />

export const Default = Template.bind({})
Default.args = {
  type: 'text',
  label: 'Your name',
  name: 'name',
  placeholder: 'Placeholder'
} as InputProps

export default {
  title: 'Inputs/Input',
  component: Input
}
