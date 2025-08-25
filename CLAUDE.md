# CLAUDE.md

Guide for Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Caesiumy's personal blog website built with Astro and AstroPaper template. This is the production-ready blog at https://caesiumy.github.io/

## Project Information

### AstroPaper Template
- **Template**: [AstroPaper v5.5.0](https://github.com/satnaing/astro-paper)
- **Framework**: Astro v5.12.0 (SSG)
- **Styling**: TailwindCSS v4.1.11
- **Type Checking**: TypeScript v5.8.3
- **Search**: Pagefind (static search)

### Core Features
- ✅ Responsive design (mobile ~ desktop)
- ✅ Accessibility support (VoiceOver, TalkBack tested)
- ✅ SEO optimized
- ✅ Light & dark mode
- ✅ Fuzzy search functionality
- ✅ Draft posts & pagination
- ✅ Sitemap & RSS feed
- ✅ Dynamic OG image generation

## Development Commands

```bash
pnpm install       # Install dependencies
pnpm dev          # Dev server (localhost:4321)
pnpm build        # Production build
pnpm preview      # Build preview
pnpm format       # Code formatting (Prettier)
pnpm lint         # ESLint linting
pnpm sync         # Astro type sync
```

## Project Structure

```
CaesiumY.github.io/
├── contents/            # Content files
│   └── blog/           # Blog posts (Markdown)
├── src/
│   ├── components/     # Reusable components
│   ├── layouts/        # Page layouts
│   ├── pages/          # File-based routing
│   ├── styles/         # Global CSS
│   ├── utils/          # Utility functions
│   ├── config.ts       # Site configuration
│   └── content.config.ts # Content schema definitions
├── public/             # Static assets
├── dist/               # Build output
├── node_modules/       # Dependencies
├── package.json        # Project dependencies
├── tsconfig.json       # TypeScript configuration
├── astro.config.ts     # Astro configuration
├── CLAUDE.md          # This file
└── README.md          # Project documentation
```

## Content Management

### Blog Posts
- **Location**: `contents/blog/`
- **Format**: Markdown/MDX
- **Frontmatter Schema**:
```yaml
title: "Post title"
description: "Post description"
pubDate: 2025-01-01
updatedDate: 2025-01-02  # Optional
heroImage: "/hero.jpg"    # Optional
draft: false             # Default: false
tags: ["tag1", "tag2"]   # Optional
```

### Blog Images
- **⚠️ IMPORTANT**: Blog post images must be located in the same directory as the blog post markdown file
- **Structure**: `contents/blog/[post-folder]/[image-file]`
- **Example**:
  ```
  contents/blog/
  └── my-blog-post/
      ├── index.md        # Blog post content
      ├── hero-image.png  # Post images
      └── diagram.jpg     # Additional images
  ```
- **Usage in Markdown**: Use relative paths `![alt text](./image.png)`
- **❌ DO NOT**: Place blog images in `public/` folder - this bypasses Astro's image optimization
- **✅ Benefits**: Automatic WebP conversion, srcset generation, compression, and caching

### Static Assets
- **Images**: `public/assets/` or `src/assets/images/` (for site-wide assets only)
- **Icons**: `src/assets/icons/`
- **Favicon**: `public/favicon.svg`

## Styling Guidelines

### TailwindCSS
- Uses TailwindCSS v4
- Typography plugin enabled
- Dark mode support (`dark:` prefix)

### Component Development
- Prefer Astro components (.astro)
- TypeScript support
- Accessibility considerations (ARIA, semantic HTML)

## SEO & Performance

### SEO Optimization
- Automatic sitemap generation
- RSS feed support
- Dynamic OG image generation
- Meta tag optimization

### Performance Optimization
- Astro Island Architecture
- Image optimization (Sharp)
- Code splitting
- Lighthouse score: 100 target

## Deployment

### Build Process
1. `astro check` - Type checking
2. `astro build` - Production build
3. `pagefind` - Search index generation
4. Static files generation (`dist/`)

### Environment Variables (Optional)
```bash
PUBLIC_GOOGLE_SITE_VERIFICATION=your-google-site-verification-value
```

## Development Guidelines

### Code Quality
- ESLint + Prettier usage
- TypeScript strict mode
- Conventional Commits compliance
- **⚠️ IMPORTANT**: Do NOT disable ESLint rules or ignore files without explicit user permission
- If ESLint errors occur, investigate and fix the root cause rather than bypassing the linter
- **If ESLint disabling is absolutely necessary:**
  - Add a detailed comment explaining the reason for disabling
  - Include the issue in the final response as a "Confirmation Required" item
  - Example: `// eslint-disable-next-line rule-name -- Reason: [detailed explanation]`

### Component Development
- Write reusable components
- Define Props types
- Follow accessibility guidelines

### Content Writing
- SEO-friendly titles and descriptions
- Proper tag categorization
- Provide image alt text
- Use markdown image syntax (not HTML `<img>` tags) for Astro optimization
- Place images in same directory as markdown files for proper processing

## Key Features

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- ARIA labels provided

### Search Functionality
- Static search via Pagefind
- Fuzzy search support
- Real-time search results

### Dark Mode
- System preference detection
- Toggle button provided
- Settings stored in localStorage