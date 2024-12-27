import { MetadataRoute } from 'next'
import { getMediumPosts, MediumPost } from '../utils/medium'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ilyasakin.dev'
  
  // Get all blog posts
  const posts: MediumPost[] = await getMediumPosts()
  
  // Create sitemap entries for blog posts
  const blogEntries = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.link.split('/').pop()}`,
    lastModified: new Date(post.pubDate),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Add static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
  ]

  return [...staticPages, ...blogEntries]
} 