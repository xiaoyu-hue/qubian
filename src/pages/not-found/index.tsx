import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/empty-state'

/** 404 页：路由未匹配时的兜底，给出返回出口。 */
export default function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon="compass"
        title="这里没有内容"
        description="页面可能已移动或不存在。回到首页，继续你的学习之旅。"
        action={
          <Link to="/">
            <Button>返回首页</Button>
          </Link>
        }
      />
    </section>
  )
}
