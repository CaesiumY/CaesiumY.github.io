# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Caesiumy's personal blog website, currently migrating from Gatsby to Astro.

## Project Structure

### Current Active Version (Astro)
- **Path**: `./astro/`  
- **Branch**: `version-astro-1.0`
- **Framework**: Astro v5 (SSG)
- **Content**: Markdown/MDX blog & about pages (in `astro/content/`)

### Legacy Version (Gatsby)  
- **Path**: `./gatsby-legacy/`
- **Framework**: Gatsby v2 (React-based SSG)
- **Status**: Maintenance mode

## Development Commands

### Astro (Current Active)
```bash
cd astro/
pnpm install          # Install dependencies
pnpm run dev          # Dev server (localhost:4321)
pnpm run build        # Production build
pnpm run preview      # Preview build
```

### Gatsby Legacy
```bash
cd gatsby-legacy/
npm install
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run format       # Prettier formatting
npm run deploy       # Deploy to GitHub Pages
```

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

Gatsby → Astro migration in progress:
- ✅ Basic blog structure complete
- ✅ Content Collections configured
- ✅ About page structure created
- ✅ Content directory restructured (moved outside src/)
- 🔄 Content migration ongoing
- 🔄 Design/styling in progress