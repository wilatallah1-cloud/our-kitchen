# Our Kitchen

A full-stack family recipe web app with AI-powered features, built with React, Firebase, and Google Gemini.

## Features

- **Two Cookbooks**: Mom's Kitchen (rustic, earthy) and Girlfriend's Bakery (pastel, sweet) — each with independent collections, styling, and pages
- **Full CRUD**: Add, edit, delete recipes with a multi-step form
- **AI-Powered Features** (Gemini 1.5 Flash):
  - Recipe chat assistant with streaming responses
  - Ingredient substitution suggestions
  - Auto-tagging on save
  - "What Can I Cook?" ingredient-based recipe finder
  - URL recipe import
  - AI review with tags, difficulty, and tips
- **Baking Tools** (bakery only): Unit converter, baker's percentage, altitude adjustments
- **Smart Scaling**: Serving scaler with AI notes for non-linear ingredients
- **Authentication**: Email/password via Firebase Auth, restricted to 3 allowed emails
- **Mobile Optimized**: Bottom nav, large tap targets, Wake Lock API for screen-awake cooking
- **Rich Recipe Data**: Photos, story/memories, ratings, "Made it!" tracking, tags, categories

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Backend/DB**: Firebase (Firestore, Auth, Storage)
- **AI**: Google Gemini API (gemini-1.5-flash)
- **Drag & Drop**: @dnd-kit for step reordering
- **Notifications**: react-hot-toast
- **Icons**: lucide-react

## Prerequisites

- Node.js 18+ and npm
- A Firebase project with Firestore, Authentication (Email/Password), and Storage enabled
- A Google Gemini API key

## Setup

1. **Clone and install:**
   ```bash
   cd our-kitchen
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Fill in your `.env` with your Firebase and Gemini credentials:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

3. **Configure allowed emails:**
   Edit `src/config/allowedEmails.js` and add the 3 email addresses allowed to register.

4. **Firebase setup:**
   - Enable **Email/Password** authentication in Firebase Console > Authentication > Sign-in method
   - Create **Firestore Database** in production or test mode
   - Enable **Firebase Storage**
   - Set Firestore rules (example):
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /recipes_moms/{document=**} {
           allow read, write: if request.auth != null;
         }
         match /recipes_bakery/{document=**} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```
   - Set Storage rules:
     ```
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /recipes/{allPaths=**} {
           allow read, write: if request.auth != null;
         }
       }
     }
     ```

5. **Run development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment

### Vercel
```bash
npm i -g vercel
vercel
```
Add environment variables in Vercel dashboard.

### Netlify
```bash
npm run build
```
Deploy the `dist` folder. Add a `_redirects` file in `public/`:
```
/*    /index.html   200
```
Add environment variables in Netlify dashboard.

## Project Structure

```
src/
  components/
    layout/       Navbar, MobileNav, Layout
    recipes/      RecipeCard, RecipeForm, RecipeDetail
    ai/           RecipeChat, SubstitutePopover, WhatCanICookWidget
    baking/       BakingTools (unit converter, baker's %, altitude)
    ui/           Button, Modal, Badge, StarRating, Skeleton, EmptyState
  pages/
    Home.jsx          Dashboard with cookbook cards + recent activity
    Cookbook.jsx       Grid view with search, filters, sorting
    RecipeDetailPage  Full recipe view with all features
    AddEditRecipe     Multi-step recipe form
    ImportRecipe      URL-based recipe import
    WhatCanICook      Ingredient-based recipe finder
  hooks/
    useAuth.jsx       Firebase auth context + login/register/logout
    useRecipes.js     Firestore CRUD + real-time listeners
    useAI.js          All Gemini API integrations
  lib/
    firebase.js       Firebase initialization
    gemini.js         Gemini API client
    recipeUtils.js    Scaling, formatting, theme config, conversions
  config/
    allowedEmails.js  Whitelisted registration emails
```

## Routes

| Path | Page |
|------|------|
| `/` | Homepage/Dashboard |
| `/moms` | Mom's Kitchen cookbook |
| `/bakery` | Girlfriend's Bakery cookbook |
| `/recipe/:id` | Recipe detail (uses `?cb=moms` or `?cb=bakery`) |
| `/add` | Add new recipe |
| `/edit/:id` | Edit recipe |
| `/import` | Import from URL |
| `/cook` | What Can I Cook? |
| `/login` | Authentication |
