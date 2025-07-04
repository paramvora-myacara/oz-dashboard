# Authentication Setup Guide

This guide will help you set up Google OAuth authentication with Supabase for your OZ Dashboard.

## 1. Set up Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project
2. Wait for the project to be fully provisioned
3. Go to Project Settings > API and copy:
   - Project URL
   - Project API Key (anon key)

## 2. Configure Google OAuth

### Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google Identity API

### Set up OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required fields:
   - Application name: "OZ Dashboard"
   - User support email: your email
   - Developer contact information: your email
4. Add authorized domains:
   - `localhost` (for development)
   - Your production domain
   - `yoursupabseprojectref.supabase.co`
5. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`

### Create OAuth Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth Client ID"
3. Choose "Web application"
4. Set authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain
5. Set authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - Your production domain + `/auth/callback`
   - Get the Supabase callback URL from your Supabase dashboard under Authentication > Providers > Google
6. Copy the Client ID and Client Secret

## 3. Configure Supabase Authentication

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Enter your Google Client ID and Client Secret
4. Go to Authentication > URL Configuration
5. Add your site URLs to the redirect URLs list:
   - `http://localhost:3000/**` (for development)
   - Your production domain + `/**`

## 4. Set up Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Configuration (optional - only needed for Google's pre-built signin)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## 5. Test the Authentication

1. Start your development server: `npm run dev`
2. Open the app and try sending a message to the chatbot
3. On the second message, you should see the authentication overlay
4. Click "Continue with Google" to test the OAuth flow
5. After successful authentication, you should see your email in the header

## Authentication Flow

- **First message**: Users can send their first message without authentication
- **Second message**: Authentication is required, overlay appears
- **Post-authentication**: User can continue chatting, email appears in header
- **Logout**: Click on the email in the header to sign out

## Troubleshooting

### Common Issues

1. **"Authorization Error"**: Check that your Google OAuth client is configured with the correct redirect URIs
2. **"Invalid Redirect URI"**: Ensure the redirect URI in Google Cloud Console matches exactly with your Supabase callback URL
3. **"Invalid Client"**: Verify that your Google Client ID and Secret are correctly entered in Supabase
4. **Environment Variables**: Make sure all environment variables are set correctly and restart your development server

### Debug Steps

1. Check browser console for errors
2. Verify all URLs match between Google Cloud Console and Supabase
3. Ensure your Supabase project is active and accessible
4. Test authentication in an incognito window to avoid cached auth states

## Features Implemented

- [x] **Progressive Authentication**: First message without auth, second message requires auth  
- [x] **Perplexity-style Overlay**: Beautiful authentication UI similar to Perplexity  
- [x] **Dynamic Header**: Shows "Ozzie" or "Ozzie, [email]" based on auth state  
- [x] **Logout Tooltip**: Hover over email to see logout option  
- [x] **Session Management**: Automatic session refresh with middleware  
- [x] **Error Handling**: Proper error pages and fallbacks  

The dashboard slides and map remain fully accessible throughout - only the chatbot requires authentication after the first message. 