# CLAUDE.md

Guide for Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CaesiumY's personal blog website - Astro blog based on AstroPaper template

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
astro-paper/
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
└── astro.config.ts     # Astro configuration
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

### Static Assets
- **Images**: `public/assets/` or `src/assets/images/`
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

### Component Development
- Write reusable components
- Define Props types
- Follow accessibility guidelines

### Content Writing
- SEO-friendly titles and descriptions
- Proper tag categorization
- Provide image alt text

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