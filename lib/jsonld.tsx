const BASE = 'https://businessideas.live'

export function articleSchema({
  title, description, url, imageUrl, datePublished, dateModified, author,
}: {
  title: string; description: string; url: string
  imageUrl?: string; datePublished?: string; dateModified?: string; author?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    ...(imageUrl && { image: imageUrl }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    author: { '@type': 'Person', name: author || 'BusinessIdeas.live' },
    publisher: {
      '@type': 'Organization',
      name: 'BusinessIdeas.live',
      url: BASE,
      logo: { '@type': 'ImageObject', url: `${BASE}/logo.png` },
    },
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }
}

export function collectionPageSchema({
  title, description, url, items,
}: {
  title: string; description: string; url: string
  items: { name: string; url: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url,
    hasPart: items.map(item => ({
      '@type': 'Article',
      name: item.name,
      url: item.url,
    })),
  }
}

export function Ld({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
