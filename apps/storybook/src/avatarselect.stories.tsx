import AvatarSelect, { AvatarSelectProps } from '@fitlink/admin/src/components/elements/AvatarSelect'
import { Story } from '@storybook/react'

const Template: Story<AvatarSelectProps> = (args) => <AvatarSelect {...args} />

export const Default = Template.bind({})
Default.args = {} as AvatarSelectProps

export default {
  title: 'Inputs/AvatarSelect',
  component: AvatarSelect
}
