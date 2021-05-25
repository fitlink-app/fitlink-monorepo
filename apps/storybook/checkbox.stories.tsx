import Checkbox, { CheckboxProps } from '../admin/src/components/elements/Checkbox'
import { Story } from '@storybook/react'

const Template: Story<CheckboxProps> = (args) => <Checkbox {...args} />

export const Default = Template.bind({})
Default.args = { label: 'Yes, keep me up to date', name: 'subscribe', checked: false } as CheckboxProps

export default {
  title: 'Inputs/Checkbox',
  component: Checkbox
}
