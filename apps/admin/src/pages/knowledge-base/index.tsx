import axios from 'axios'
import { useEffect, useState } from 'react'
import { useIntercom } from 'react-use-intercom'
import BlogThumb from '../../components/elements/BlogThumb'
import Loader from '../../components/elements/Loader'
import Dashboard from '../../components/layouts/Dashboard'
import { PostType } from './[id]'

const KB_TOUR_ID = 279453

export default function page() {
  const [posts, setPosts] = useState<PostType[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const { startTour } = useIntercom()

  const getPosts = async () => {
    try {
      await axios
        .get(
          `https://blog.fitlinkapp.com/wp-json/wp/v2/posts?_embed&categories=30&page=${page}`
        )
        .then((resp) => {
          for (let i = 0; i < resp.data.length; i++) {
            let str = resp.data[i].yoast_head
            // eslint-disable-next-line no-useless-escape
            str = str.substr(str.indexOf('name="description" content="') + 28)
            str = str.substr(0, str.indexOf('" />'))
            resp.data[i].excerpt.yoast = str
          }
          setPosts(resp.data)
          setPages(parseInt(resp.headers['x-wp-totalpages'], 9))
          setLoading(false)
        })
    } catch (error) {
      setPages(1)
      setPage(1)
      setPosts([])
    }
  }

  const loadMore = () => {
    setPage(page + 1)
  }

  useEffect(() => {
    setLoading(true)
    getPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return (
    <Dashboard title="Knowledge base">
      <div className="flex ai-c mb-2">
        <h1 className="light mb-0 mr-2">Knowledge Base</h1>
        <button
          className="button alt small mt-1"
          type="button"
          onClick={() => {
            startTour(KB_TOUR_ID)
          }}>
          What's this for?
        </button>
      </div>
      {!loading && (
        <div className="row">
          {posts.map((p) => (
            <div className="col-12 col-md-6 col-xl-4 col-hd-3" key={p.id}>
              <BlogThumb
                id={p.id}
                title={p.title.rendered}
                date={p.date}
                excerpt={p.excerpt.yoast}
                image={
                  p._embedded['wp:featuredmedia'][0].media_details.sizes.large
                    .source_url
                }
              />
            </div>
          ))}
        </div>
      )}
      {loading && <Loader />}
      {page < pages - 1 && (
        <div className="text-center mt-10">
          <button className="button--alt" onClick={loadMore}>
            Load more...
          </button>
        </div>
      )}
    </Dashboard>
  )
}
