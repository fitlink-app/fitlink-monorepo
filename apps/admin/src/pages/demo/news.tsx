import { useState, useEffect } from 'react'
import Select from '../../components/elements/Select'
import SortOrder from '../../components/elements/SortOrder'
import Dashboard from '../../components/layouts/Dashboard'
import Drawer from '../../components/elements/Drawer'
import NewsForm from '../../components/forms/NewsForm'
import { AnimatePresence } from 'framer-motion'
import NewsItem from '../../components/elements/NewsItem'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const news = require('../../services/dummy/news.json')

export default function page() {
  const [drawContent, setDrawContent] = useState<
    React.ReactNode | undefined | false
  >(false)
  const [warning, setWarning] = useState(false)
  const [sorted, setSorted] = useState([])
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')
  const [sortOn, setSortOn] = useState('created')

  const options = [
    {
      label: 'Date',
      value: 'created'
    },
    {
      label: 'Title',
      value: 'title'
    }
  ]

  useEffect(() => {
    const orig = JSON.parse(JSON.stringify(news))
    switch (sortOn) {
      default:
        setSorted(
          sort === 'asc'
            ? orig.results.sort((a, b) => a[sortOn].localeCompare(b[sortOn]))
            : orig.results
                .sort((a, b) => a[sortOn].localeCompare(b[sortOn]))
                .reverse()
        )
    }
  }, [news, sortOn, sort])

  useEffect(() => {
    console.log(sorted)
  }, [sorted])

  const loadNewsItem = (newsItem: any) => {
    setWarning(true)
    setDrawContent(<NewsForm current={newsItem} />)
  }

  const NewNewsForm = () => {
    setWarning(true)
    setDrawContent(<NewsForm />)
  }

  return (
    <Dashboard title="News" linkPrefix="/demo">
      <div className="row ai-c mb-2">
        <div className="col-12 col-lg-8">
          <div className="flex ai-c">
            <h1 className="light mb-0 mr-2">News</h1>
            <button className="button alt small mt-1" onClick={NewNewsForm}>
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
        {sorted.map((r: any, i) => (
          <div className="rewards__wrap" key={`fl-r-${i}`}>
            <NewsItem
              title={r.title}
              date={r.created}
              excerpt={r.shortDescription}
              image={r.image?.url}
              author={r.author}
              onClick={() => loadNewsItem(r)}
            />
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
