import { MetadataRoute } from 'next'
import { getMediumPosts, MediumPost } from '../utils/medium'
import { toKebabCase } from '../utils/string'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ilyasakin.dev'
  
  // Get all blog posts
  const posts: MediumPost[] = await getMediumPosts()
  
  // Create sitemap entries for blog posts
  const blogEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${toKebabCase(post.title)}`,
    lastModified: new Date(post.pubDate),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    description: `Read ${post.title} - A blog post by İlyas Akın about web development, software engineering, and technology.`
  }))

  // Add static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
      description: "İlyas Akın's personal website - Senior full-stack web developer crafting code at Kuika Software. Blog posts about web development, software engineering, and technology."
    },
  ]

  return [...staticPages, ...blogEntries]
} 