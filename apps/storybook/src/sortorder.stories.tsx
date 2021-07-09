import SortOrder, {
  SortOrderProps
} from '@fitlink/admin/src/components/elements/SortOrder'
import { Story } from '@storybook/react'

const Template: Story<SortOrderProps> = (args) => <SortOrder {...args} />

export const Default = Template.bind({})
Default.args = {
  value: 'desc',
  onChange: () => {}
} as SortOrderProps

export default {
  title: 'Common/SortOrder',
  component: SortOrder
}
