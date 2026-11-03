> **About this file.** My planning document for this rebuild, kept as written on 2026-11-04. I wrote
> it calling the rebuild "V1"; I've since kept the original site as v1, so **"V1" below means this
> site, v2**. What's done and what's still open is tracked in [ROADMAP.md](ROADMAP.md), and how each
> point was actually implemented is in [DECISIONS.md](DECISIONS.md).

---

# Portfolio V1 Decisions & Future Enhancements

## Overview

This document captures the major decisions made while preparing the first version of the portfolio and knowledge platform.

The goal is to preserve current thinking, implementation choices, roadmap items, and future enhancements so they can be revisited later.

---

# Positioning

This project should NOT be presented simply as:

```text
Personal Portfolio
```

It is more accurately:

```text
Portfolio
+
Developer Knowledge Platform
+
Technical Publishing System
+
Custom Content Pipeline
```

That combination is the strongest differentiator of the entire website.

---

# Featured Project

## Project Title

```text
Custom Documentation Engine
```

### Why this title?

The title communicates the engineering side of the system rather than focusing solely on the visual portfolio.

The project is ultimately powered by:

- Content compilation
- Metadata generation
- Search indexing
- Build tooling
- Documentation architecture

---

## Featured Project Screenshot

### Use

✅ Chapter page screenshot

### Avoid

❌ Home page screenshot

### Reason

A home page screenshot communicates:

```text
Portfolio
```

A chapter page screenshot communicates:

```text
Documentation Platform
Knowledge Base
Learning System
```

which is the actual differentiator.

---

## Featured Project Description

```text
A portfolio and knowledge platform built to publish long-form technical content without a CMS. Authored HTML is compiled into structured JSON, enabling generated metadata, chapter navigation, search indexing, and an accessible reading experience.
```

---

## Featured Project Tags

```text
React
Node.js
Content Pipeline
Search
Documentation
```

### Why "Content Pipeline"?

Originally:

```text
Automation
```

was used.

However:

```text
Content Pipeline
```

better describes the most unique aspect of the project.

---

# Learn Is The Core Product

## Important Realization

The strongest part of the website is not:

```text
Projects
```

It is:

```text
Learn
```

because Learn showcases:

- The content system
- Long-form writing
- Search architecture
- Publishing workflow
- Future scalability
- Engineering depth

Without Learn:

```text
Portfolio + Projects
```

With Learn:

```text
Portfolio + Knowledge Platform
```

---

# Navigation Decision

## Learn should receive subtle emphasis

### Avoid

```text
Huge font increase
Bright attention-grabbing highlight
Badges everywhere
```

### Preferred

Give Learn a subtle accent colour and slightly stronger weight.

Example:

```jsx
className={`${linkClass} ${
  l.label === "Learn" ? "text-brand font-medium" : ""
}`}
```

This creates:

```text
Learn    Projects    About
 ↑
slightly emphasized
```

without looking promotional.

---

# Hero CTA

Keep the primary CTA as:

```text
Read the docs →
```

### Why?

The button already communicates:

> This is the most important area of the site.

It naturally drives visitors toward the strongest content.

No change required.

---

# Future Feature: Project Case Studies

## Status

Planned after V1 deployment.

---

## Purpose

Move from:

```text
Look what I built
```

to:

```text
Look how I think
```

The goal is not just to showcase projects but to document:

- Architecture
- Trade-offs
- Constraints
- Decision making
- Lessons learned

---

# Current Project Flow

```text
Project Card
     ↓
Live Application
```

Example:

```text
Custom Documentation Engine
     ↓
Portfolio website
```

---

# Future Project Flow

```text
Project Card
     ↓
Project Details Page
     ↓
Case Study
     ↓
Live Application
```

Example:

```text
Custom Documentation Engine
     ↓
/projects/documentation-engine
     ↓
Engineering Case Study
     ↓
View Live Project
```

---

# Future Route Structure

```text
/projects/:slug
```

Examples:

```text
/projects/documentation-engine

/projects/event-report-generator

/projects/animated-mern-app
```

---

# Recommended Case Study Template

## 1. Problem

What was the original problem?

Example:

> I wanted a portfolio that could grow into a long-term technical learning platform without relying on a CMS or external documentation framework.

---

## 2. Requirements

What requirements shaped the solution?

Example:

```text
- Static deployment
- Subject-based learning
- Search capability
- Minimal dependencies
- Easy content authoring
- Full control over rendering
```

---

## 3. Architecture

High-level system diagram.

Example:

```text
content/*.html
        ↓
build-notes.mjs
        ↓
Generated JSON
        ↓
build-search.mjs
        ↓
search.json
        ↓
React Reader
```

Future enhancement:

Visual architecture diagram.

---

## 4. Technical Decisions

Examples:

### Why HTML?

### Why Generated JSON?

### Why Not Markdown?

### Why Not Docusaurus?

### Why Build Custom Search?

The purpose of this section is to explain reasoning rather than implementation.

---

## 5. Challenges

Discuss real engineering challenges faced.

Potential topics:

```text
Parser Design
Content Modelling
Search Ranking
Navigation
Accessibility
Responsive Layouts
```

---

## 6. Trade-offs

Document compromises and limitations.

Examples:

### Current SEO Limitations

Because the site is SPA-based:

```text
- Runtime metadata
- Shared HTML shell
- No prerendered chapter pages
```

Accepted for V1.

---

### Testing

Custom parser currently lacks automated tests.

Accepted for V1 in favour of:

```text
Publishing content
Deployment
User feedback
```

---

## 7. Lessons Learned

Reflect on:

```text
System Design
Build Tooling
Search
Accessibility
Publishing Workflows
Information Architecture
AI-Assisted Development
```

---

## 8. Future Improvements

Example roadmap:

```text
- Automated parser tests
- Search tests
- Route prerendering
- Better SEO
- More subjects
- Interactive diagrams
- Learning progress tracking
```

---

# First Case Study Priority

## Priority #1

```text
Custom Documentation Engine
```

### Why?

It contains the richest engineering story in the portfolio.

Topics worth covering:

```text
Content Pipeline
Search Architecture
Publishing Workflow
Generator Scripts
Information Architecture
Technical Trade-offs
```

---

# Personal Learning Plan

The project itself should become a learning vehicle.

Create private notes:

```text
Portfolio Architecture Notes
```

and progressively document how everything works.

---

## Content Pipeline

Understand:

```text
content/*.html
      ↓
build-notes.mjs
      ↓
Generated JSON
      ↓
build-search.mjs
      ↓
search.json
      ↓
React UI
```

---

## Search

Understand:

```js
searchChapters()
```

Questions:

```text
Why weighted search?
Why AND-based matching?
Why tags?
Why not fuzzy search?
```

---

## Reader Experience

Understand:

```text
TOC generation
Reading progress
Practice questions
Section highlighting
Navigation
```

---

## Deployment

Understand:

```text
npm run docs
npm run build
Vercel deployment
Generated content
```

This preparation helps answer architecture and project questions confidently during interviews.

---

# V1 Priorities

## Do Now

```text
✅ Deploy website

✅ Publish JavaScript content

✅ Improve project descriptions

✅ Add Custom Documentation Engine as a featured project

✅ Continue documenting architecture while learning it
```

---

## Do Later

```text
✅ Project Case Studies

✅ Automated Tests

✅ SEO Improvements

✅ Analytics

✅ Route Prerendering

✅ Advanced Documentation Features
```

---

# Final Guiding Principle

The goal of V1 is:

```text
Publish
Learn
Iterate
```

not:

```text
Perfect
Optimize
Over-engineer
```

Shipping real content and understanding the architecture over time will provide more value than delaying release for perfect testing, SEO, or advanced project pages.

The strongest long-term asset is the combination of:

```text
Portfolio
+
Knowledge Platform
+
Consistently Published Technical Content
```

which compounds in value with every chapter added.
