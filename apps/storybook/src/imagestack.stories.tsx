import ImageStack, { ImageStackProps } from '@fitlink/admin/src/components/elements/ImageStack'
import { Story } from '@storybook/react'

const Template: Story<ImageStackProps> = (args) => <ImageStack {...args} />

export const Default = Template.bind({})
Default.args = {
  files: [
    {
      "url": "https://picsum.photos/id/10/600/400"
    },
    {
      "url": "https://picsum.photos/id/123/600/400"
    },
    {
      "url": "https://picsum.photos/id/1000/600/400"
    },
    {
      "url": "https://picsum.photos/id/99/600/400"
    },
    {
      "url": "https://picsum.photos/id/87/600/400"
    },
    {
      "url": "https://picsum.photos/id/5/600/400"
    }
  ]
} as ImageStackProps

export default {
  title: 'Cards/ImageStack',
  component: ImageStack
}
