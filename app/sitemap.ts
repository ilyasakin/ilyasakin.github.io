import { MetadataRoute } from 'next'
import { toKebabCase } from '../utils/string'
import { blogService } from '../services/blog-service'
import { IBlogPost } from '../types/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ilyasakin.dev'
  const posts: IBlogPost[] = await blogService.getAllPosts()
  
  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${toKebabCase(post.title)}`,
    lastModified: new Date(post.pubDate),
    changeFrequency: 'monthly' as const,
    priority: 0.7
  }))

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1
    },
  ]

  return [...staticPages, ...blogEntries]
} 