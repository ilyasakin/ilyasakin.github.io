export interface BlogPost {
  slug: string;
  title: string;
  preview: string;
  status: "Coming soon" | "Published";
  content?: React.ReactNode;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "building-modern-web-portfolio",
    title: "Building a Modern Web Portfolio",
    preview: "A deep dive into how I built this website using Next.js, Three.js, and TypeScript. Exploring performance optimization and modern design principles.",
    status: "Coming soon"
  },
  {
    slug: "webgl-and-threejs-effects",
    title: "WebGL and Three.js Effects",
    preview: "Learn how to create engaging 3D backgrounds and effects using WebGL and Three.js. From basic setup to advanced post-processing.",
    status: "Coming soon"
  },
  {
    slug: "typescript-best-practices",
    title: "TypeScript Best Practices",
    preview: "Essential TypeScript patterns and practices I've learned while building large-scale applications. Including real-world examples and common pitfalls.",
    status: "Coming soon"
  }
]; 