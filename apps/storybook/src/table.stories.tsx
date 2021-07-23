import TableContainer, {
  TableContainerProps
} from '@fitlink/admin/src/components/Table/TableContainer'
import {
  toLocaleCell,
  toDateCell,
  toChipCell
} from '@fitlink/admin/src/components/Table/helpers'
import { AnimatePresence } from 'framer-motion'
import Drawer from '@fitlink/admin/src/components/elements/Drawer'
import UserStats from '@fitlink/admin/src/components/forms/UserStats'
import IconSearch from '@fitlink/admin/src/components/icons/IconSearch'
import dummy from '@fitlink/admin/src/services/dummy/users.json'
import { Story } from '@storybook/react'
import { useState } from 'react'

const Template: Story<TableContainerProps> = (args) => {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)

  const displayImage = ({
    cell: {
      row: {
        original: { avatar, initials }
      }
    }
  }) => {
    return (
      <div className="bua">
        <img src={avatar} alt="User avatar" />
        <span>{initials}</span>
      </div>
    )
  }

  const viewDetails = ({
    cell: {
      row: {
        original: {
          date_joined,
          mobile_os,
          tracker,
          points,
          rank,
          last_activity,
          total_leagues,
          rewards,
          last_session,
          created_leagues
        }
      }
    }
  }) => {
    return (
      <button
        className="icon-button"
        onClick={() => {
          setDrawContent(
            <UserStats
              date_joined={date_joined}
              mobile_os={mobile_os}
              tracker={tracker}
              points={points}
              rank={rank}
              last_activity={last_activity}
              total_leagues={total_leagues}
              rewards={rewards}
              last_session={last_session}
              created_leagues={created_leagues}
            />
          )
        }}>
        <IconSearch />
      </button>
    )
  }
  return (
    <>
      <TableContainer
        columns={[
          { Header: 'User', accessor: 'avatar', Cell: displayImage },
          {
            Header: 'Date Joined',
            accessor: 'date_joined',
            Cell: toDateCell
          },
          { Header: 'Mobile OS', accessor: 'mobile_os' },
          { Header: 'Tracker', accessor: 'tracker' },
          { Header: 'Total Points', accessor: 'points', Cell: toLocaleCell },
          { Header: 'Rank', accessor: 'rank', Cell: toChipCell },
          { Header: 'Last activity', accessor: 'last_activity' },
          { Header: 'Total leagues', accessor: 'total_leagues' },
          {
            Header: 'Reward redeemed',
            accessor: 'rewards',
            Cell: toLocaleCell
          },
          { Header: ' ', Cell: viewDetails }
        ]}
        fetch={() => Promise.resolve(dummy)}
      />
      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer remove={() => setDrawContent(null)} key="drawer">
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </>
  )
}

export const Default = Template.bind({})

export default {
  title: 'Layout/Table',
  component: TableContainer
}
