<!-- Markdown with HTML -->
<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://refref.ai/github-readme-header-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://refref.ai/github-readme-header-light.png">
  <img alt="RefRef" src="https://refref.ai/github-readme-header-light.png">
</picture>
</div>

<p align="center">
  <a href='http://makeapullrequest.com'>
    <img alt='PRs Welcome' src='https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields'/>
  </a>
  <a href="https://opensource.org/license/agpl-v3/">
    <img src="https://img.shields.io/github/license/refrefhq/refref?logo=opensourceinitiative&logoColor=white&label=License&color=8A2BE2" alt="license">
  </a>
  <br>
  <a href="https://refref.ai/community">
    <img src="https://img.shields.io/badge/discord-7289da.svg?style=flat-square&logo=discord" alt="discord" style="height: 20px;">
  </a>
</p>

<p align="center">
  <a href="https://refref.ai">Website</a> - <a href="https://refref.ai/docs">Docs</a> - <a href="https://refref.ai/community">Community</a> - <a href="https://github.com/refrefhq/refref/issues/new?assignees=&labels=bug&template=bug_report.md">Bug reports</a>
</p>

## Table of Contents

- [🔮 Overview](#-overview)
- [🚀 Getting Started](#-getting-started)
- [✨ Features](#-features)
- [🔰 Tech Stack](#-tech-stack)
- [🤗 Contributing](#-contributing)
- [🎗 License](#-license)

> [!CAUTION]
> RefRef is still in alpha, expect bugs and breaking changes.

## 🔮 Overview

Build powerful referral programs for your products with RefRef's open source referral management platform.

## 🚀 Getting Started

### Quick Start with Docker (Recommended)

Get RefRef running in under a minute:

```bash
# Clone the repository
git clone https://github.com/refrefhq/refref.git
cd refref

# Start everything with Docker Compose
docker-compose up
```

That's it! 🎉 The webapp portal will be available at http://localhost:3000.

Docker Compose automatically handles:

- PostgreSQL database setup
- Database migrations
- Initial data seeding
- Webapp portal configuration

### Local Development Setup

If you prefer running RefRef locally without Docker:

#### Prerequisites

- Node.js 20+
- pnpm 10.15.0
- PostgreSQL database
- [portless](https://github.com/vercel-labs/portless) (`npm install -g portless`)

#### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/webapp/.env.example apps/webapp/.env

# Edit .env and add your database URL and auth secret
# Generate auth secret with: openssl rand -base64 32

# Push database schema
pnpm -F @refref/webapp db:push

# (Optional) Seed with template data
pnpm -F @refref/webapp db:seed

# Start development server
pnpm dev
```

Each app gets a stable `.localhost` URL via [portless](https://github.com/vercel-labs/portless):

| App    | URL                                 |
| ------ | ----------------------------------- |
| Webapp | http://refref-webapp.localhost:1355 |
| WWW    | http://refref-www.localhost:1355    |
| API    | http://refref-api.localhost:1355    |
| Refer  | http://refref-refer.localhost:1355  |
| Acme   | http://refref-acme.localhost:1355   |

> Portless is a global CLI tool (`npm install -g portless`). The proxy auto-starts when you run `pnpm dev`. To bypass portless, set `PORTLESS=0 pnpm dev`.

### Environment Variables

#### Required

- `DATABASE_URL` - PostgreSQL connection string (e.g., `postgresql://user:password@localhost:5432/refref`)
- `BETTER_AUTH_SECRET` - Authentication secret key (generate with `openssl rand -base64 32`)

#### Optional

- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - For Google OAuth authentication
- `RESEND_API_KEY` - For sending emails via Resend
- `BETTER_AUTH_URL` - Authentication URL (defaults to http://refref-webapp.localhost:1355)

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run linting
pnpm lint

# Format code
pnpm format

# Type checking
pnpm check-types

# Database commands
pnpm -F @refref/coredb db:push     # Push schema changes
pnpm -F @refref/coredb db:migrate  # Run migrations
pnpm -F @refref/coredb db:studio   # Open Drizzle Studio GUI
pnpm -F @refref/coredb db:seed     # Seed with templates
```

## ✨ Features

- **Referral Attribution**: JS snippet for tracking referrals, enabling accurate attribution of referrals to referrers

- **Customizable Rewards**: Flexible reward system for different referral programs

- **Referrer Portal**: UI components for referrers to refer and track rewards

- **Partner Portal**: Dedicated interface for affiliates

- **Personalized Pages**: Automatic personalization of referral landing pages

- **Nudges**: Automated reminders to boost referral engagement

- **Fraud Monitoring**: Detect and prevent fraudulent referral activity

- **Manual Reward Approval**: Review and approve rewards manually

- **Automatic Reward Approval**: Set rules for automatic reward validation

- **Manual Reward Dispersal**: Control when rewards are sent out

- **Automatic Reward Dispersal**: Schedule automated reward payments

- **Engagement Analytics**: Track referral program performance metrics

- **Testing Environment**: Sandbox for testing referral programs

## 🔰 Tech Stack

- 💻 [Typescript](https://www.typescriptlang.org/)
- 🚀 [React](https://react.dev/)
- ☘️ [Next.js](https://nextjs.org/)
- 🎨 [TailwindCSS](https://tailwindcss.com/)
- 🧑🏼‍🎨 [Shadcn](https://ui.shadcn.com/)
- 🔒 [Better-Auth](https://better-auth.com/)
- 🧘‍♂️ [Zod](https://zod.dev/)
- 🐞 [Jest](https://jestjs.io/)
- 🗄️ [PostgreSQL](https://www.postgresql.org/)
- 📚 [Fumadocs](https://github.com/fuma-nama/fumadocs)
- 🐂 [BullMQ](https://github.com/OptimalBits/bullmq)
- 🗃️ [Redis](https://redis.io/)
- 💽 [Drizzle](https://drizzle.dev/)
- 🌀 [Turborepo](https://turbo.build/)

## 🤗 Contributing

Contributions are welcome! Please read the [Contributing Guide][contributing] to get started.

- **💡 [Contributing Guide][contributing]**: Learn about our contribution process and coding standards.
- **🐛 [Report an Issue][issues]**: Found a bug? Let us know!
- **💬 [Start a Discussion][discussions]**: Have ideas or suggestions? We'd love to hear from you.

# 🎗 License

Released under [AGPLv3][license].

<!-- REFERENCE LINKS -->

[contributing]: https://github.com/refrefhq/refref/blob/main/CONTRIBUTING.md
[license]: https://github.com/refrefhq/refref/blob/main/LICENSE
[discussions]: https://discuss.refref.ai
[issues]: https://github.com/refrefhq/refref/issues
[pulls]: https://github.com/refrefhq/refref/pulls "submit a pull request"
