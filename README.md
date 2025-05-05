# PainWise - Patient Pain Management Application

## Deployment Guide for Netlify

This guide will help you deploy the PainWise application to Netlify and troubleshoot common issues like the white screen problem.

### Prerequisites

- A Netlify account
- Git repository with your code

### Deployment Steps

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Import your project to Netlify**:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Configure the project:
     - Build Command: `npm run build`
     - Publish Directory: `dist`

3. **Configure Environment Variables**:
   - Add the following environment variable in Netlify site settings (Site settings → Build & deploy → Environment):
     - `VITE_API_BASE_URL`: Set to your API endpoint URL

4. **Configure Redirects for SPA Routing**:
   - Create a `_redirects` file in your project's `public` folder with the following content:
     ```
     /* /index.html 200
     ```
   - This ensures that all routes are handled by your React application

### Fixing White Screen Issues

If you're experiencing a white screen after deployment, try these solutions:

1. **Check browser console for errors**
   - Open browser developer tools (F12) and look for error messages

2. **API Connection Issues**:
   - Ensure your backend API is accessible from Netlify
   - Verify the `VITE_API_BASE_URL` environment variable is set correctly
   - For local testing with XAMPP, use `http://localhost/app/api`
   - For production, use your actual API endpoint

3. **Routing Issues**:
   - The application uses client-side routing with React Router
   - Ensure the `_redirects` file is properly configured in your `public` folder
   - You can also configure redirects in `netlify.toml` file at the root of your project:
     ```toml
     [[redirects]]
       from = "/*"
       to = "/index.html"
       status = 200
     ```

4. **Build Issues**:
   - Try rebuilding the project with `npm run build` locally
   - Check for any build errors
   - Review Netlify build logs for deployment errors

### Project Structure

- `/src` - React application source code
- `/api` - PHP backend API files (not deployed to Netlify)
- `/public` - Static assets

### Important Files

- `_redirects` or `netlify.toml` - Configuration for Netlify deployment
- `.env.production` - Production environment variables
- `vite.config.js` - Vite configuration
- `src/services/api.js` - API service configuration

### Backend Deployment

Note that Netlify only hosts the frontend. Your PHP backend needs to be hosted separately on a server that supports PHP (like shared hosting, VPS, or a specialized PHP hosting service).

Update the `VITE_API_BASE_URL` environment variable in Netlify to point to your hosted backend API.

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```