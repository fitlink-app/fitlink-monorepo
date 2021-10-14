import { Story } from '@storybook/react'
import IconActivities from '@fitlink/admin/src/components/icons/IconActivities'
import IconArrowLeft from '@fitlink/admin/src/components/icons/IconArrowLeft'
import IconArrowLeftDouble from '@fitlink/admin/src/components/icons/IconArrowLeftDouble'
import IconArrowRight from '@fitlink/admin/src/components/icons/IconArrowRight'
import IconArrowRightDouble from '@fitlink/admin/src/components/icons/IconArrowRightDouble'
import IconBike from '@fitlink/admin/src/components/icons/IconBike'
import IconCheck from '@fitlink/admin/src/components/icons/IconCheck'
import IconClose from '@fitlink/admin/src/components/icons/IconClose'
import IconCreditCard from '@fitlink/admin/src/components/icons/IconCreditCard'
import IconDownload from '@fitlink/admin/src/components/icons/IconDownload'
import IconEye from '@fitlink/admin/src/components/icons/IconEye'
import IconEyeSlash from '@fitlink/admin/src/components/icons/IconEyeSlash'
import IconFriends from '@fitlink/admin/src/components/icons/IconFriends'
import IconGear from '@fitlink/admin/src/components/icons/IconGear'
import IconGraph from '@fitlink/admin/src/components/icons/IconGraph'
import IconImage from '@fitlink/admin/src/components/icons/IconImage'
import IconLeagues from '@fitlink/admin/src/components/icons/IconLeagues'
import IconMarker from '@fitlink/admin/src/components/icons/IconMarker'
import IconMasterCard from '@fitlink/admin/src/components/icons/IconMasterCard'
import IconPlus from '@fitlink/admin/src/components/icons/IconPlus'
import IconRewards from '@fitlink/admin/src/components/icons/IconRewards'
import IconRun from '@fitlink/admin/src/components/icons/IconRun'
import IconSearch from '@fitlink/admin/src/components/icons/IconSearch'
import IconSettings from '@fitlink/admin/src/components/icons/IconSettings'
import IconSignOut from '@fitlink/admin/src/components/icons/IconSignOut'
import IconSleep from '@fitlink/admin/src/components/icons/IconSleep'
import IconStairs from '@fitlink/admin/src/components/icons/IconStairs'
import IconSteps from '@fitlink/admin/src/components/icons/IconSteps'
import IconTrash from '@fitlink/admin/src/components/icons/IconTrash'
import IconUpload from '@fitlink/admin/src/components/icons/IconUpload'
import IconVisa from '@fitlink/admin/src/components/icons/IconVisa'
import IconWater from '@fitlink/admin/src/components/icons/IconWater'
import IconYoga from '@fitlink/admin/src/components/icons/IconYoga'

const iconSet = [
  <IconActivities width="2rem" height="2rem" />,
  <IconArrowLeft width="2rem" height="2rem" />,
  <IconArrowLeftDouble width="2rem" height="2rem" />,
  <IconArrowRight width="2rem" height="2rem" />,
  <IconArrowRightDouble width="2rem" height="2rem" />,
  <IconBike width="2rem" height="2rem" />,
  <IconCheck width="2rem" height="2rem" />,
  <IconClose width="2rem" height="2rem" />,
  <IconCreditCard width="2rem" height="2rem" />,
  <IconDownload width="2rem" height="2rem" />,
  <IconEye width="2rem" height="2rem" />,
  <IconEyeSlash width="2rem" height="2rem" />,
  <IconFriends width="2rem" height="2rem" />,
  <IconGear width="2rem" height="2rem" />,
  <IconGraph width="2rem" height="2rem" />,
  <IconImage width="2rem" height="2rem" />,
  <IconLeagues width="2rem" height="2rem" />,
  <IconMarker width="2rem" height="2rem" />,
  <IconMasterCard width="2rem" height="2rem" />,
  <IconPlus width="2rem" height="2rem" />,
  <IconRewards width="2rem" height="2rem" />,
  <IconRun width="2rem" height="2rem" />,
  <IconSearch width="2rem" height="2rem" />,
  <IconSettings width="2rem" height="2rem" />,
  <IconSignOut width="2rem" height="2rem" />,
  <IconSleep width="2rem" height="2rem" />,
  <IconStairs width="2rem" height="2rem" />,
  <IconSteps width="2rem" height="2rem" />,
  <IconTrash width="2rem" height="2rem" />,
  <IconUpload width="2rem" height="2rem" />,
  <IconVisa width="2rem" height="2rem" />,
  <IconWater width="2rem" height="2rem" />,
  <IconYoga width="2rem" height="2rem" />
]

const Icons = () => (
  <div className="row">
    {iconSet.map((e, i) => (
      <div className="col-1 text-center my-1" key={`icon_${i}`}>
        {e}
      </div>
    ))}
  </div>
)

const Template: Story = (args) => <Icons {...args} />

export const All = Template.bind({})

export default {
  title: 'Common/Icons',
  component: Icons
}
