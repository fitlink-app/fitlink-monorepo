import ImageSelect, { ImageSelectProps } from '@fitlink/admin/src/components/elements/ImageSelect'
import { Story } from '@storybook/react'

const Template: Story<ImageSelectProps> = (args) => <ImageSelect {...args} />

export const Default = Template.bind({})
Default.args = {
} as ImageSelectProps

export default {
  title: 'Inputs/ImageSelect',
  component: ImageSelect
}
