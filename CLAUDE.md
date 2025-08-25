# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Caesiumy's personal blog website, fully migrated to AstroPaper template.

## Project Structure

### Active Project (AstroPaper)
- **Path**: `./astro-paper/`  
- **Branch**: `version-astro-paper`
- **Framework**: Astro v5.12.0 (SSG) + AstroPaper v5.5.0 template
- **Content**: Markdown blog posts (in `astro-paper/contents/blog/`)
- **Status**: ✅ Production ready

### Legacy History
- **Previous versions**: Available in Git commit history
- **Status**: Gatsby and Astro versions cleanly migrated

## Development Commands

### AstroPaper (Production)
```bash
cd astro-paper/
pnpm install          # Install dependencies
pnpm dev              # Dev server (localhost:4321)
pnpm build            # Production build with Pagefind
pnpm preview          # Preview build
pnpm format           # Code formatting (Prettier)
pnpm lint             # ESLint linting
```


## Content Management

### AstroPaper Content Collections
- **Blog**: `astro-paper/contents/blog/` (Markdown)
- **Schema**: Type definitions in `astro-paper/src/content.config.ts`

### Frontmatter Structure
```yaml
title: "Post title"
description: "Description"
pubDate: "2025-01-01"
updatedDate: "2025-01-02" # Optional
heroImage: "/image.jpg"   # Optional
```

## Architecture

### AstroPaper Structure
- **Content**: Blog posts and pages in `contents/`
- **Components**: `.astro` file-based components in `src/components/`
- **Layouts**: Page templates in `src/layouts/`
- **Routing**: File-system based routing (`src/pages/`)
- **Configuration**: Content schema in `src/content.config.ts`

**Directory Structure**:
```
astro-paper/
├── contents/          # Content files
│   └── blog/         # Blog posts (Markdown)
├── src/              # Source code
│   ├── components/   # Reusable components
│   ├── layouts/      # Page templates
│   ├── pages/        # Route-based pages
│   ├── styles/       # Global styles
│   └── utils/        # Utility functions
├── public/           # Static assets
└── astro.config.ts   # Astro configuration
```

## Deployment

- **Hosting**: GitHub Pages (caesiumy.github.io)  
- **Main Branch**: `main` (PR target)
- **Deploy Branch**: `gh-pages` (auto-deploy)
- **Dev Branch**: `version-astro-1.0` (current work)

## Key Features

### SEO
- Auto sitemap generation
- RSS feed support
- Open Graph metadata
- Search engine optimization

### Performance
- Static Site Generation (SSG)
- Image optimization with Sharp
- Bundle optimization
- Lighthouse 100 score target

## Migration Status

✅ **Migration Complete** (2025-08-25)

Gatsby → Astro → AstroPaper migration:
- ✅ Gatsby legacy (archived)
- ✅ Basic Astro structure (archived)
- ✅ Content Collections setup (complete)
- ✅ AstroPaper template adoption (complete)
- ✅ AstroPaper customization (complete)
- ✅ Content migration (15 posts migrated)
- ✅ SEO & performance optimization (complete)
- ✅ Korean localization (complete)
- ✅ Legacy cleanup (complete)

## Testing Guidelines

- **Build Testing**: Use `pnpm run build` to test production builds
- **Dev Server**: DO NOT run `pnpm run dev` during testing - only use for development when explicitly requested
- **Preview**: Use `pnpm run preview` to test built site if needed