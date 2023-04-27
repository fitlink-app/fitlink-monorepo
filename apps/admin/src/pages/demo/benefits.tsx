import { useState, useEffect } from 'react'
import Dashboard from '../../components/layouts/Dashboard'
import Drawer from '../../components/elements/Drawer'
import Benefit, { BenefitProps } from '../../components/elements/Benefit'
import Select from '../../components/elements/Select'
import SortOrder from '../../components/elements/SortOrder'
import BenefitForm from '../../components/forms/BenefitForm'
import { AnimatePresence } from 'framer-motion'
import IconPlus from '../../components/icons/IconPlus'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const benefits = require('../../services/dummy/benefits.json')

export default function page() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)

  const [sorted, setSorted] = useState([])
  const [sort, setSort] = useState<'asc' | 'desc'>('asc')
  const [sortOn, setSortOn] = useState('title')

  const options = [
    {
      label: 'Title',
      value: 'shortTitle'
    },
    {
      label: 'Brand',
      value: 'brand'
    }
  ]

  useEffect(() => {
    const orig = JSON.parse(JSON.stringify(benefits))
    switch (sortOn) {
      case 'brand':
        setSorted(
          orig.results.sort((a, b) =>
            sort === 'asc'
              ? a[sortOn].toLowerCase() > b[sortOn].toLowerCase()
              : a[sortOn].toLowerCase() < b[sortOn].toLowerCase()
          )
        )
        break
      default:
        setSorted(
          orig.results.sort((a, b) =>
            sort === 'asc'
              ? parseFloat(a[sortOn]) - parseFloat(b[sortOn])
              : parseFloat(b[sortOn]) - parseFloat(a[sortOn])
          )
        )
        break
    }
  }, [benefits, sortOn, sort])

  const loadReward = (reward: any) => {
    setWarning(true)
    setDrawContent(<BenefitForm current={reward} />)
  }

  const NewBenefitForm = () => {
    setWarning(true)
    setDrawContent(<BenefitForm />)
  }

  return (
    <Dashboard title="Benefits">
      <div className="row ai-c mb-2">
        <div className="col-12 col-lg-8">
          <div className="flex ai-c">
            <h1 className="light mb-0 mr-2">Your benefits</h1>
            <button className="button alt small mt-1" onClick={NewBenefitForm}>
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
        <div className="p-1">
          <div className="rewards__add" onClick={NewBenefitForm}>
            <IconPlus />
          </div>
        </div>
        {sorted.map((r: BenefitProps, i) => (
          <div className="rewards__wrap" key={`fl-r-${i}`}>
            <Benefit {...r} onClick={() => loadReward(r)} />
          </div>
        ))}
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
