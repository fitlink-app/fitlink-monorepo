import Select, {
  SelectProps
} from '@fitlink/admin/src/components/elements/Select'
import { Story } from '@storybook/react'

const Template: Story<SelectProps> = (args) => <Select {...args} />

export const Default = Template.bind({})
Default.args = {
  label: 'Select your platform',
  inline: true,
  options: [
    { label: 'iOS', value: 'ios' },
    { label: 'Android', value: 'android' }
  ]
} as SelectProps

export default {
  title: 'Inputs/Select',
  component: Select
}
