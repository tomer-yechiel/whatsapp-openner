# Welcome to TanStack.com!

This site is built with TanStack Router!

- [TanStack Router Docs](https://tanstack.com/router)

It's deployed automagically with Cloudflare!

- [Cloudflare Pages](https://pages.cloudflare.com/)

## Development

From your terminal:

```sh
pnpm install
pnpm dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

This project includes automated deployment to Cloudflare using GitHub Actions. The deployment workflow is triggered on:
- Push to the `main` branch
- Pull requests to the `main` branch

### Required GitHub Secrets

To enable automated deployment, you need to configure the following secrets in your GitHub repository settings:

1. **CLOUDFLARE_API_TOKEN**: Your Cloudflare API token with the necessary permissions
   - Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Create a token with "Cloudflare Pages:Edit" permissions
   - Include your account and zone resources

2. **CLOUDFLARE_ACCOUNT_ID**: Your Cloudflare account ID
   - Found in the right sidebar of your Cloudflare dashboard

### Setting up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add both secrets with their respective values

### Manual Deployment

You can also deploy manually using:

```sh
npm run deploy
```

This will build the project and deploy it using Wrangler CLI.

## Progressive Web App (PWA)

This project is configured as a PWA using `vite-plugin-pwa`.

What’s included:
- Web App Manifest at `public/site.webmanifest` (already linked in the app shell)
- Icons in `public/`
- Service Worker auto-generated at build time with Workbox, caching static assets
- Client-side registration with auto-updates

How to verify locally:
- Run `pnpm dev` and open the app in the browser
- Open DevTools > Application > Manifest: you should see installability details
- Go to Application > Service Workers: a SW should be registered (on production build)

Build and deploy:
- `pnpm build` will emit the service worker and related files; Wrangler serves `.output/public`
- On first production load, the app will be installable and assets will be cached offline

Updating:
- The SW uses `autoUpdate`; when you deploy a new version, clients will update in the background

## Editing and previewing the docs of TanStack projects locally

The documentations for all TanStack projects except for `React Charts` are hosted on [https://tanstack.com](https://tanstack.com), powered by this TanStack Router app.
In production, the markdown doc pages are fetched from the GitHub repos of the projects, but in development they are read from the local file system.

Follow these steps if you want to edit the doc pages of a project (in these steps we'll assume it's [`TanStack/form`](https://github.com/tanstack/form)) and preview them locally :

1. Create a new directory called `tanstack`.

```sh
mkdir tanstack
```

2. Enter the directory and clone this repo and the repo of the project there.

```sh
cd tanstack
git clone git@github.com:TanStack/tanstack.com.git
git clone git@github.com:TanStack/form.git
```

> [!NOTE]
> Your `tanstack` directory should look like this:
>
> ```
> tanstack/
>    |
>    +-- form/
>    |
>    +-- tanstack.com/
> ```

> [!WARNING]
> Make sure the name of the directory in your local file system matches the name of the project's repo. For example, `tanstack/form` must be cloned into `form` (this is the default) instead of `some-other-name`, because that way, the doc pages won't be found.

3. Enter the `tanstack/tanstack.com` directory, install the dependencies and run the app in dev mode:

```sh
cd tanstack.com
pnpm i
# The app will run on https://localhost:3000 by default
pnpm dev
```

4. Now you can visit http://localhost:3000/form/latest/docs/overview in the browser and see the changes you make in `tanstack/form/docs`.

> [!NOTE]
> The updated pages need to be manually reloaded in the browser.

> [!WARNING]
> You will need to update the `docs/config.json` file (in the project's repo) if you add a new doc page!
