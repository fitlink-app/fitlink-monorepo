import { useState } from 'react'
import Input from '../elements/Input'
import Select from '../elements/Select'
import { countries } from 'countries-list'

export type BillingFormProps = {
  firstname: string
  lastname: string
  address1: string
  address2: string
  city: string
  state: string
  country: {
    label: string
    value: string
  }
  postalcode: string
}

export default function BillingForm({
  firstname,
  lastname,
  address1,
  address2,
  city,
  state,
  country,
  postalcode
}) {
  const [fn, setFn] = useState(firstname)
  const [ln, setLn] = useState(lastname)
  const [ad1, setAd1] = useState(address1)
  const [ad2, setAd2] = useState(address2)
  const [ct, setCt] = useState(city)
  const [st, setSt] = useState(state)
  const [co, setCo] = useState(country)
  const [pc, setPc] = useState(postalcode)

  return (
    <form onSubmit={ (e) => e.preventDefault() }>
      <h4 className="light mb-3">Update billing information</h4>
      <Input
        name="firstname"
        placeholder="First name"
        label="First name"
        value={fn}
        onChange={(v) => setFn(v)}
      />
      <Input
        name="lastName"
        placeholder="Last name"
        label="Last name"
        value={ln}
        onChange={(v) => setLn(v)}
      />
      <Input
        name="address1"
        placeholder="Address line 1"
        label="Address line 1"
        value={ad1}
        onChange={(v) => setAd1(v)}
      />
      <Input
        name="address1"
        placeholder="Address line 2"
        label="Address line 2"
        value={ad2}
        onChange={(v) => setAd2(v)}
      />
      <Input
        name="city"
        placeholder="City"
        label="City"
        value={ct}
        onChange={(v) => setCt(v)}
      />
      <Input
        name="state"
        placeholder="State / Province"
        label="State / Province"
        value={st}
        onChange={(v) => setSt(v)}
      />
      <Input
        name="postalcode"
        placeholder="Zip / Postal code"
        label="Zip / Postal code"
        value={pc}
        onChange={(v) => setPc(v)}
      />
      {/* <Input
        name="country"
        placeholder="Country"
        label="Country"
        value={co}
        onChange={(v) => setCo(v)}
      /> */}
      <Select
        id="country"
        isSearchable={true}
        label="Country"
        value={co}
        options={
          Object.entries(countries)
            .sort(([, a], [, b]) => {
              if (a.name < b.name) return -1
              if (a.name > b.name) return 1
              return 0
            })
            .map(([code, country]) => (
              {value: code, label: country.name}
            ))
        }
        onChange={(v) => setCo(v)}
        />
      <div className="text-right mt-2">
        <button className="button">
          Update
        </button>
      </div>
    </form>
  )
}
