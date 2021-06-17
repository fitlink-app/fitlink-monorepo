import { useState } from 'react'
import Input from '../elements/Input'

export default function ImportUsers() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  return (
    <>
      <h4 className="light mb-3">Bulk invite users to your team</h4>
      
      <div className="text-right mt-2">
        <button className="button">
          Invite users
        </button>
      </div>
    </>
  )
}
