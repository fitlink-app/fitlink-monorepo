import axios from 'axios'
import Dashboard from '../../../components/layouts/Dashboard'
import parse from 'html-react-parser'
import Link from 'next/link'
import IconArrowLeft from '../../../components/icons/IconArrowLeft'

export type PostType = {
  title: {
    rendered: string
  }
  id: string
  date: string
  excerpt: {
    rendered: string
    yoast: string
  }
  content: {
    rendered: string
  }
  _embedded: any
}

type PostProp = {
  post: PostType
}

export async function getServerSideProps(context: any) {
  const { id } = context.query
  let url = `https://blog.fitlinkapp.com/wp-json/wp/v2/posts/${id}?_embed`
  
  try {
    const { data } = await axios.get(url)
    if (data.length > 0) {
      let str = data[0].yoast_head
      str = str.substr(str.indexOf('name=\"description\" content=\"')+28)
      str = str.substr(0, str.indexOf('" />'))
      data[0].excerpt.yoast = str
    }
    return {
      props: {post: data}
    }
  } catch (error) {
    return {
      props: {post: {}}
    }
  }
}

export default function page({post}: PostProp) {
  
  if (post.id === undefined) return (
    <Dashboard title="Knowledge base">
      <h1 className="light mb-1">
        Post not found
      </h1>
    </Dashboard>
  )

  return (
    <Dashboard title={post?.title.rendered} description={post?.excerpt.yoast}>
      <h1 className="light mb-1">
        <Link href="/demo/knowledge-base">
          <a className="h1-back">
            <IconArrowLeft />
          </a>
        </Link>
        { parse(post?.title.rendered || '') }
      </h1>
      <div className="blog-post">
        { parse(post?.content.rendered || '') }
      </div>
    </Dashboard>
  )
}
