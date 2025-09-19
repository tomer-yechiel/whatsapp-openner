# WhatsApp Opener

A simple, elegant web application that allows you to quickly open WhatsApp chats with any phone number. Built with React, TanStack Router, and TypeScript.

## Features

- 📱 **Phone Number Input**: Smart phone number input with international format validation
- 🌍 **Country Detection**: Automatic country detection based on user location
- 📋 **Clipboard Integration**: Automatically detect phone numbers from your clipboard
- ✅ **Number Validation**: Real-time phone number validation using libphonenumber
- 🎯 **One-Click WhatsApp**: Direct integration with WhatsApp web/app
- 🌙 **Dark Mode Support**: Beautiful light and dark themes
- 📱 **PWA Ready**: Install as a Progressive Web App for quick access
- 🚀 **Fast & Lightweight**: Built with modern web technologies

## How It Works

1. **Enter a Phone Number**: Type or paste any phone number in international format
2. **Auto-Detection**: The app automatically detects the country and validates the number
3. **Clipboard Magic**: If you have a phone number in your clipboard, the app will offer to use it
4. **Open WhatsApp**: Click the button to instantly start a WhatsApp chat

## Development

Install dependencies and start the development server:

```sh
npm install
npm run dev
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

This application is configured as a PWA using `vite-plugin-pwa`, making it installable on your device for quick access.

**Features:**
- Web App Manifest for installation
- Service Worker for offline caching
- Auto-updates when new versions are deployed
- Works offline after first load

**To install:**
1. Visit the app in your browser
2. Look for the "Install" prompt or check your browser's install options
3. The app will be added to your home screen/applications

## Tech Stack

- **Framework**: React 19 with TanStack Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Phone Validation**: libphonenumber-js
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages
- **PWA**: vite-plugin-pwa with Workbox

## Browser Support

Works in all modern browsers that support:
- ES6+ JavaScript
- Web App Manifest
- Service Workers
- Clipboard API (for clipboard detection feature)

## Privacy

This application:
- Does not store or send your phone numbers to any server
- Only uses your location for country detection (with permission)
- Clipboard access is only used locally to detect phone numbers
- All processing happens in your browser
