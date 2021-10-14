import ImageStack, { ImageStackProps } from '@fitlink/admin/src/components/elements/ImageStack'
import { Story } from '@storybook/react'

const Template: Story<ImageStackProps> = (args) => <ImageStack {...args} />

export const Default = Template.bind({})
Default.args = {
  files: [
    {
      "url": "https://picsum.photos/id/10/800/400",
      "width": 800,
      "height": 400
    },
    {
      "url": "https://picsum.photos/id/123/500/500",
      "width": 500,
      "height": 500
    },
    {
      "url": "https://picsum.photos/id/1000/500/800",
      "width": 500,
      "height": 800
    },
    {
      "url": "https://picsum.photos/id/99/600/400",
      "width": 600,
      "height": 400
    },
    {
      "url": "https://picsum.photos/id/87/800/500",
      "width": 800,
      "height": 500
    },
    {
      "url": "https://picsum.photos/id/5/600/400",
      "width": 600,
      "height": 400
    }
  ]
} as ImageStackProps

export default {
  title: 'Cards/ImageStack',
  component: ImageStack
}
