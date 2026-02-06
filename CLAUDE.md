# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a **monorepo** containing two independent Shopify landing page projects. Each project is self-contained in its own directory:

- **`enklab/`** - "Inklab" Shopify theme for e-ink Lab (digital planners for e-ink tablets)
- **`vinted/`** - "Vinted Tracker Pro" landing page (SaaS for Vinted sellers)

## Working with This Repository

### Always Specify the Project Directory

When working on files, always use the full path including the project subdirectory:
- `/Users/jakareaparvez/Documents/shopify-dev/shopify-landing-page/enklab/...`
- `/Users/jakareaparvez/Documents/shopify-dev/shopify-landing-page/vinted/...`

### Project-Specific Documentation

Each project has its own `CLAUDE.md` with detailed architecture and development instructions:

- **enklab**: See `enklab/CLAUDE.md` for Liquid templates, Tailwind CSS, 16-language translation system, and Shopify Markets integration
- **vinted**: See `vinted/CLAUDE.md` for single-page HTML/CSS/JS landing page and post-purchase registration code system

### Key Differences Between Projects

| Aspect | enklab | vinted |
|--------|--------|--------|
| **Type** | Full Shopify Liquid theme | Single HTML landing page |
| **Styling** | Tailwind CDN + `application.css` | Tailwind CDN + embedded `<style>` |
| **JavaScript** | `application.js` + embedded scripts | Embedded `<script>` tags only |
| **Languages** | 16 (client-side via `translations.js`) | 18 (client-side) |
| **Currencies** | 12 via Shopify Markets (EUR base) | 12 via client-side conversion |
| **Build** | No build required | No build required |

## No Build Process

Neither project uses a build tool, package manager, or compilation step. Edit files directly and test in browser or deploy to Shopify.
