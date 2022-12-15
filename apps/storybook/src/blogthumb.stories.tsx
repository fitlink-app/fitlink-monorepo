import BlogThumb, {
  BlogThumbProps
} from '@fitlink/admin/src/components/elements/BlogThumb'
import { Story } from '@storybook/react'

const Template: Story<BlogThumbProps> = (args) => <BlogThumb {...args} />

export const Default = Template.bind({})
Default.args = {
  id: '3389',
  title: 'Why Trees Are Good For Our Mental & Physical Wellbeing.',
  excerpt:
    'Trees are good for our mental & physical wellbeing. Immersing in forests can boost our immune systems, lower blood pressure, & more.',
  date: '2021-02-19T17:30:58',
  image:
    'https://blog.fitlinkteams.com/wp-content/uploads/2021/02/Trees-are-good-for-mental-wellbeing-1024x538.jpg'
} as BlogThumbProps

export default {
  title: 'Cards/BlogThumb',
  component: BlogThumb
}
