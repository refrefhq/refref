# Scripts

This directory contains utility scripts for the RefRef website.

## fetch-content.mts

This script fetches blog content and images from the Wasabi S3 bucket (`refref-www`).

### What it does

- Creates the necessary directories (`content/blogs` and `public/blog`) if they don't exist
- Fetches MDX files from the `blog/` folder in the S3 bucket and saves them to `content/blogs/`
- Fetches images from the `blog-images/` folder in the S3 bucket and saves them to `public/blog/`

### Prerequisites

- AWS SDK for JavaScript v3 (`@aws-sdk/client-s3`) - installed as a devDependency
- dotenv package - installed as a devDependency
- Proper S3 credentials configured in your environment

### Usage

Run the script using:

```bash
pnpm fetch-content
```

To test the script without making actual S3 requests (dry run mode):

```bash
pnpm fetch-content -- --dry-run
```

The `--skip-errors` flag is available for testing purposes, but is not used in the build process:

```bash
pnpm fetch-content -- --skip-errors
```

### Build Process Behavior

The script is integrated into the build process:

```bash
pnpm build
```

The build will fail if the content fetch fails. This ensures that the site is always built with the latest content and that any issues with the content fetch process are immediately apparent.

For CI/CD environments, you must configure the appropriate AWS credentials as environment variables to ensure successful builds.

### Behavior in Different Environments

The script behaves differently based on the environment:

1. **Normal mode** (with AWS credentials): Fetches content from S3 as expected.

2. **Dry run mode** (`--dry-run`):
   - Logs what actions it would take
   - Does not make actual S3 requests
   - Does not download any files
   - Uses mock data to simulate the S3 bucket contents
   - Still creates the necessary directories if they don't exist

3. **No credentials mode** (missing AWS credentials):
   - Creates the necessary directories
   - Skips all S3 operations
   - Logs that operations are being skipped
   - The script will exit with an error code, causing the build to fail

### AWS Credentials

To use this script, you need to have AWS credentials configured. You can do this in several ways:

1. Environment variables:
   ```
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   ```

2. AWS credentials file (`~/.aws/credentials`):
   ```
   [default]
   aws_access_key_id = your_access_key
   aws_secret_access_key = your_secret_key
   ```

3. For more options, see the [AWS SDK documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html).

### Customization

If you need to modify the script behavior, you can edit the following constants in `fetch-content.mts`:

- `BUCKET_NAME`: The name of the S3 bucket
- `ENDPOINT`: The S3 endpoint URL
- `BLOG_PREFIX`: The prefix for blog MDX files
- `BLOG_IMAGES_PREFIX`: The prefix for blog images
- `CONTENT_DIR`: The parent directory for blog content
- `PUBLIC_DIR`: The parent directory for public assets
- `LOCAL_BLOG_DIR`: The local directory for blog MDX files
- `LOCAL_BLOG_IMAGES_DIR`: The local directory for blog images

You can also override these settings using environment variables (see `.env.example` in the project root).

## cleanup-content.mts

This script cleans up previously downloaded blog content and images.

### What it does

- Removes the `content/blogs` directory and all its contents
- Removes the `public/blog` directory and all its contents

### Prerequisites

- rimraf package - installed as a devDependency

### Usage

Run the script using:

```bash
pnpm cleanup-content
```

To test the script without actually deleting any files (dry run mode):

```bash
pnpm cleanup-content -- --dry-run
```

For more verbose output:

```bash
pnpm cleanup-content -- --verbose
```

### Combined Usage

To clean up old content and fetch fresh content in one command:

```bash
pnpm refresh-content
```

This is equivalent to running:

```bash
pnpm cleanup-content && pnpm fetch-content
```