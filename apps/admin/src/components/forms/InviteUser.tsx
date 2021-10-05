import { useState } from 'react'
import Input from '../elements/Input'

export type InviteUserProps = {
  current?: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function InviteUser({ current }: InviteUserProps) {
  const [firstName, setFirstName] = useState(current?.firstName || '')
  const [lastName, setLastName] = useState(current?.lastName || '')
  const [email, setEmail] = useState(current?.email || '')

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h4 className="light mb-3">
        {current ? 'Edit user details' : 'Invite a user to join your team'}
      </h4>
      <Input
        name="firstname"
        placeholder="First name"
        label="First name"
        value={firstName}
        onChange={(v) => setFirstName(v)}
      />
      <Input
        name="lastName"
        placeholder="Last name"
        label="Last name"
        value={lastName}
        onChange={(v) => setLastName(v)}
      />
      <Input
        name="email"
        placeholder="Email address"
        label="Email address"
        value={email}
        type="email"
        onChange={(v) => setEmail(v)}
      />
      <div className="text-right mt-2">
        <button className="button" type="submit">
          {current ? 'Edit user' : 'Invite user'}
        </button>
      </div>
    </form>
  )
}
