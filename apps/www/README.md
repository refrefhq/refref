# www

This is a Next.js application generated with
[Create Fumadocs](https://github.com/fuma-nama/fumadocs).

Run development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 with your browser to see the result.

## Content Management

### Fetching Blog Content

This project includes a script to fetch blog content and images from an S3-compatible storage (Wasabi):

```bash
# Set up environment variables (see .env.example)
pnpm fetch-content
```

The script will:
- Fetch MDX files from the `blog/` folder in the S3 bucket and save them to `content/blogs/`
- Fetch images from the `blog-images/` folder in the S3 bucket and save them to `public/blog/`

For more details, see the [scripts README](./scripts/README.md).

## Learn More

To learn more about Next.js and Fumadocs, take a look at the following
resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js
  features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Fumadocs](https://fumadocs.vercel.app) - learn about Fumadocs
