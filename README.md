# FocusDev

Focus is a high-level, production-grade application featuring a robust Next.js 14 web client and an Expo React Native mobile client. Both applications consume the identical Next.js API routes and share a unified MongoDB backend.

## Tech Stack
- **Web App / Backend**: Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui.
- **Mobile App**: React Native via Expo.
- **Database**: MongoDB (via Mongoose or raw driver).
- **Core Language**: TypeScript across the whole stack for end-to-end type safety.
- **Data Validation**: Zod (schemas shared between client and server).

## System Architecture Highlights
1. **Monorepo Architecture**: Structured to share types and business logic efficiently between Next.js and Expo ensuring consistency.
2. **Security-First Approach**: Implement rate-limiting, robust input validation, secure session token management, and NoSQL injection protection from the ground up.
3. **Test-Driven Development (TDD)**: Emphasizing reliable releases by writing API and logical behavior tests before locking implementation.

---

## 🐛 Bug Audit Trail
*This section logs significant errors encountered during development, the root cause, and the applied resolution for continuous learning and reference purposes.*

| Date | Issue/Bug Description | Root Cause | Resolution / Learnings |
|------|-----------------------|------------|------------------------|
|      |                       |            |                        |

---
