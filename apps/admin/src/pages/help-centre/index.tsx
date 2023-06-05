import { useState } from 'react'
import { useIntercom } from 'react-use-intercom'
import Loader from '../../components/elements/Loader'
import Dashboard from '../../components/layouts/Dashboard'

export default function page() {

  return (
    <Dashboard title="Help Centre">
      <div className="flex ai-c mb-2">
        <h1 className="light mb-0 mr-2">Help Centre</h1>
          <iframe
            src="https://www.chatbase.co/chatbot-iframe/rjhhmaF2LZeVMARWE3WJC"
            width="100%"
            height="700"
            frameBorder="0"
          />
      </div>
    </Dashboard>
  )
}
