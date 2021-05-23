import Button, { ButtonProps } from '../admin/src/components/elements/Button'
import { Story } from '@storybook/react'

const Template: Story<ButtonProps> = (args) => <Button {...args} />

export const Default = Template.bind({})
Default.args = { alt: false, to: '/', label: 'Default', external: false } as ButtonProps

export const Alternative = Template.bind({})
Alternative.args = { alt: true, to: '/', label: 'Alternative', external: false } as ButtonProps

export default {
  title: 'Common/Button',
  component: Button
}
