# SpaceMoney Vercel Deployment Guide

This document provides instructions on how to deploy the SpaceMoney frontend to Vercel.

## Prerequisites
- A Vercel account (Free tier is sufficient)
- GitHub/GitLab/Bitbucket account connected to Vercel
- The SpaceMoney repository pushed to your Git provider

## Automated Deployment (Recommended)

The easiest way to deploy is to connect your repository directly to Vercel:

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import the `spacemoney` repository.
3. Vercel should automatically detect the `vercel.json` in the root and configure the following:
    - **Framework Preset**: Vite
    - **Root Directory**: `spacemoney-frontend`
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
4. Click **Deploy**.

Future pushes to the main branch will automatically trigger a new deployment.

## Manual Deployment via CLI

If you prefer using the Vercel CLI:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to your account:
   ```bash
   vercel login
   ```

3. Run the deployment from the root of the project:
   ```bash
   vercel --prod
   ```

## Environment Variables

Although the current setup uses hardcoded constants for Solana Devnet, you can override them by adding environment variables in the Vercel Dashboard:

| Variable | Description | Default (in code) |
|----------|-------------|-------------------|
| `VITE_PROGRAM_ID` | The Solana Program ID | `Fg6Pa4H2Qv7Vu86vAisdStXVNoTMTgks9R59yQhF6P2` |
| `VITE_RPC_ENDPOINT` | Solana RPC Endpoint | `https://api.devnet.solana.com` |
| `VITE_USDT_MINT` | USDT Mint Address | `EPjFWaJsq4DcaRKmqsPb94k8ao64C1MwMUeFqwxDRvPj` |

## Post-Deployment Verification
Once live, verify:
1. Wallet connection works (Phantom, Solflare).
2. Dashboard correctly fetches data from the Solana Devnet.
3. Navigation works without broken links.
