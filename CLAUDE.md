# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Caesiumy's personal blog website, currently migrating from Gatsby to Astro.

## Project Structure

### Current Active Version (AstroPaper)
- **Path**: `./astro-paper/`  
- **Branch**: `version-astro-paper`
- **Framework**: Astro v5.12.0 (SSG) + AstroPaper v5.5.0 template
- **Content**: Markdown blog posts (in `astro-paper/src/data/blog/`)

### Migration Version (Astro)
- **Path**: `./astro/`  
- **Branch**: `version-astro-1.0`
- **Framework**: Astro v5 (SSG)
- **Status**: Migrating to AstroPaper
- **Content**: Markdown/MDX blog & about pages (in `astro/content/`)

### Legacy Version (Gatsby)  
- **Path**: `./gatsby-legacy/`
- **Framework**: Gatsby v2 (React-based SSG)
- **Status**: Maintenance mode

## Development Commands

### AstroPaper (Current Active)
```bash
cd astro-paper/
pnpm install          # Install dependencies
pnpm dev              # Dev server (localhost:4321)
pnpm build            # Production build with Pagefind
pnpm preview          # Preview build
pnpm format           # Code formatting (Prettier)
pnpm lint             # ESLint linting
```

### Astro (Migration in Progress)
```bash
cd astro/
pnpm install          # Install dependencies
pnpm dev              # Dev server (localhost:4321)
pnpm build            # Production build
pnpm preview          # Preview build
```

### Gatsby Legacy


## Content Management

### Astro Content Collections
- **Blog**: `astro/content/blog/` (Markdown/MDX)
- **About**: `astro/content/about/` (Markdown/MDX)
- **Schema**: Type definitions in `astro/src/content.config.ts`

### Frontmatter Structure
```yaml
title: "Post title"
description: "Description"
pubDate: "2025-01-01"
updatedDate: "2025-01-02" # Optional
heroImage: "/image.jpg"   # Optional
```

## Architecture

### Astro Structure
- **Content Collections**: Type-safe content management (`blog`, `about`) in `content/`
- **Components**: `.astro` file-based components in `src/components/`
- **Layouts**: Page templates in `src/layouts/`
- **Routing**: File-system based routing (`src/pages/`)
- **Configuration**: Content schema in `src/content.config.ts`

### Frontend Development Guidelines
- **Design Guidelines**: `astro/docs/frontend-design-guideline.md`
  - **When to use**: Follow when creating/refactoring frontend components, hooks, or UI logic
  - **Key areas**: Readability (naming, abstraction), Predictability (return types), Cohesion (feature organization), Coupling (state management)
  - **Apply for**: Component abstractions, form validation, state hooks, conditional rendering, magic numbers

**Directory Structure**:
```
astro/
├── content/           # Content files (separate from code)
│   ├── blog/         # Blog posts (Markdown/MDX)
│   └── about/        # About pages (Markdown/MDX)
├── src/              # Source code only
│   ├── components/   # Reusable components
│   ├── layouts/      # Page templates
│   ├── pages/        # Route-based pages
│   └── content.config.ts  # Content schema definitions
└── public/           # Static assets
```

### Legacy Gatsby Structure  
- **GraphQL**: Data query layer
- **React Components**: JSX-based component system
- **Plugin Ecosystem**: Rich plugin functionality
- **Build Optimization**: Image optimization, code splitting, SEO

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
- Image optimization (Astro/Gatsby)
- Bundle optimization
- Lighthouse 100 score target

## Migration Status

Gatsby → Astro → AstroPaper migration:
- ✅ Gatsby legacy (complete)
- ✅ Basic Astro structure (complete)
- ✅ Content Collections setup (complete)  
- ✅ AstroPaper template adoption (in progress)
- 🔄 AstroPaper customization in progress
- 🔄 Content migration in progress
- 🔄 SEO & performance optimization in progress

## Testing Guidelines

- **Build Testing**: Use `pnpm run build` to test production builds
- **Dev Server**: DO NOT run `pnpm run dev` during testing - only use for development when explicitly requested
- **Preview**: Use `pnpm run preview` to test built site if needed