import Currency, { CurrencyProps } from '@fitlink/admin/src/components/elements/Currency'
import { Story } from '@storybook/react'

const Template: Story<CurrencyProps> = (args) => <Currency {...args} />

export const Default = Template.bind({})
Default.args = {
  label: 'Enter Price',
  placeholder: '£2.00',
} as CurrencyProps

export default {
  title: 'Inputs/Currency',
  component: Currency
}
