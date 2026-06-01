import Home from '@/components/Home'
import { pageMetadata } from '@/lib/metadata'
import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site'

export const metadata = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: '/',
})

export default function Page() {
  return <Home />
}
