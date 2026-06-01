import type { Metadata } from 'next'
import { OG_IMAGE_PATH, SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site'

const ogImage = {
  url: OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: SITE_TITLE,
}

export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
}: {
  title: string
  description?: string
  path: string
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE_PATH],
    },
  }
}
