import { useState } from 'react'
import { useIntercom } from 'react-use-intercom'
import Loader from '../../components/elements/Loader'
import Dashboard from '../../components/layouts/Dashboard'

export default function page() {

  return (
    <Dashboard title="Help Centre">
      <iframe
        src="https://www.chatbase.co/chatbot-iframe/rjhhmaF2LZeVMARWE3WJC"
        width="100%"
        height="700"
        frameBorder="0"
      />
    </Dashboard>
  )
}
