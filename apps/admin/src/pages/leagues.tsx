import { useState, useEffect } from 'react'
import League from '../components/elements/League'
import Select from '../components/elements/Select'
import SortOrder from '../components/elements/SortOrder'
import Dashboard from '../components/layouts/Dashboard'

export default function components() {

  const [sorted, setSorted] = useState([])
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [sortOn, setSortOn] = useState('points')

  const options = [
    {
      label: 'Members',
      value: 'members'
    },
    {
      label: 'Title',
      value: 'shortDescription'
    },
    {
      label: 'Reset date',
      value: 'resetDate'
    }
  ]

  return (
    <Dashboard
      title="Leagues"
      >
      <div className="row ai-c mb-1">
        <div className="col-12 col-lg-8">
          <div className="flex ai-c">
            <h1 className="light mb-0 mr-2">Your rewards</h1>
            <button
              className="button alt small mt-1"
              >
              Add new
            </button>
          </div>
        </div>
        <div className="col-12 col-lg-4 text-lg-right">
          <Select
            id="sort"
            defaultValue={options[0]}
            isSearchable={false}
            options={options}
            label="Sort by"
            inline={true}
            onChange={(v) => setSortOn(v.value)}
          />
          <SortOrder value={sort} onChange={(e) => setSort(e)} />
        </div>
      </div>
      <div className="rewards flex mb-4">
        <div className="reward-wrap">
          <League
            image="https://source.unsplash.com/ljoCgjs63SM/760"
            name="Weekly Steps Challenge"
            description="Join this weekly steps league to see if you can get all the steps!"
            members={1256}
            resetDate="2021-06-30T07:22:48.220Z"
            type="Steps"
            />
        </div>
      </div>
    </Dashboard>
  )
}