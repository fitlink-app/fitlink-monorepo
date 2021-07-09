import LocationSelect, { LocationSelectProps } from '@fitlink/admin/src/components/elements/LocationSelect'
import { Story } from '@storybook/react'

const Template: Story<LocationSelectProps> = (args) => <LocationSelect {...args} />

export const Default = Template.bind({})
Default.args = {
} as LocationSelectProps

export default {
  title: 'Inputs/LocationSelect',
  component: LocationSelect
}
