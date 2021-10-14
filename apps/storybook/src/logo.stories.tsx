import Logo, { LogoProps } from '@fitlink/admin/src/components/elements/Logo'
import { Story } from '@storybook/react'

const Template: Story = (args) => <Logo {...args} />

export const Dark = Template.bind({})
export const Light = Template.bind({})
Light.args = { white: true, whiteDot: true } as LogoProps
Light.parameters = {
  backgrounds: {
    default: 'dark',
    values: [{ name: 'dark', value: '#333333' }]
  }
}

export default {
  title: 'Common/Logo',
  component: Logo
}
