import Card, { CardProps } from '@fitlink/admin/src/components/elements/Card'
import { Story } from '@storybook/react'

const Template: Story<CardProps> = (args) => <Card {...args} />

export const Default = Template.bind({})
Default.args = {
  children: <p>hello world!</p>
} as CardProps

export default {
  title: 'Cards/Card',
  component: Card
}
