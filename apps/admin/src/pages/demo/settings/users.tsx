import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import Drawer from '../../../components/elements/Drawer'
import InviteUser from '../../../components/forms/InviteUser'
import ImportUsers from '../../../components/forms/ImportUsers'
import Dashboard from '../../../components/layouts/Dashboard'

export default function components() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)

  const InviteUserForm = () => {
    setWarning(true)
    setDrawContent(
      <InviteUser />
    )
  }

  const ImportUsersForm = () => {
    setWarning(true)
    setDrawContent(
      <ImportUsers />
    )
  }

  return (
    <Dashboard title="Settings Users">
      <div className="flex ai-c">
        <h1 className="light mb-0 mr-2">Manage users</h1>
        <button
          className="button alt small mt-1"
          onClick={InviteUserForm}
          >
          Invite
        </button>
        <button
          className="button alt small mt-1 ml-1"
          onClick={ImportUsersForm}
          >
          Bluk import
        </button>
      </div>

      <AnimatePresence initial={false}>
        {drawContent && (
          <Drawer
            remove={() => setDrawContent(null)}
            key="drawer"
            warnBeforeClose={warning}>
            {drawContent}
          </Drawer>
        )}
      </AnimatePresence>
    </Dashboard>
  )
}
