# All-in-One Firebase Video Website

This is a single React/Vite website that contains both:

- Public user website
- Private admin panel

The admin panel controls videos, branding, the home hero section, category visibility, age confirmation, demo videos, global ads, individual ad placements, popunder/social-bar script toggles, and direct-link buttons.

---

## Latest UI controls added

Inside **Admin → Settings** you can now turn the home hero section on/off and enable or disable the public category feature.

Inside **Admin → Ads** you can use a master ads switch and also turn each placement on/off individually:

- Top banner
- In-feed banner
- Watch page banner
- Native/sidebar banner
- Popunder script
- Social bar script
- Direct-link buttons

The public video cards now show views and duration directly on the thumbnail, and the watch-page helper text has been removed.

---

## 1. Project structure

```txt
/
├── src
│   ├── admin              # Admin panel pages and controls
│   ├── components         # Public website components
│   ├── config             # Main local config
│   ├── data               # Demo videos
│   ├── pages              # Public pages
│   ├── utils              # Format helpers
│   ├── App.jsx
│   ├── firebase.js
│   └── main.jsx
├── public/_redirects      # Cloudflare Pages SPA routing
├── vercel.json            # Vercel SPA routing
├── .env.example
└── package.json
```

---

## 2. Local setup

Install dependencies:

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Run locally:

```bash
npm run dev
```

Build locally:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

---

## 3. Admin URL / directory

The default admin URL is:

```txt
/admin
```

Example:

```txt
https://yourdomain.com/admin
```

To change the admin path, edit `.env`:

```env
VITE_ADMIN_PATH=/control-room
```

Then the admin panel becomes:

```txt
https://yourdomain.com/control-room
```

You can use almost any clean path:

```env
VITE_ADMIN_PATH=/dashboard
VITE_ADMIN_PATH=/panel
VITE_ADMIN_PATH=/my-private-url
```

Avoid using these reserved paths:

```txt
/
/watch
/legal
```

After changing `VITE_ADMIN_PATH`, redeploy the website.

Important: changing the admin path is only for convenience. Real protection comes from Firebase Authentication and Firestore Security Rules.

---

## 4. Firebase setup

Use one Firebase project for the full website.

You need:

- Firebase Web App config
- Firebase Authentication
- Firestore Database
- Firestore Security Rules

---

## 5. Create Firebase project

1. Go to Firebase Console.
2. Create a new project.
3. Open the project.
4. Go to **Project settings**.
5. Add a **Web app**.
6. Copy the Firebase config values.

Firebase gives you values like:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

Put those values in `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_ADMIN_PATH=/admin
```

Use the same environment variables on Vercel or Cloudflare Pages.

---

## 6. Enable Firebase Authentication

1. Firebase Console → **Build** → **Authentication**.
2. Click **Get started**.
3. Go to **Sign-in method**.
4. Enable **Email/Password**.
5. Go to **Users**.
6. Click **Add user**.
7. Add your admin email and password.

Example:

```txt
Email: youradmin@gmail.com
Password: your-secure-password
```

You will use this email and password to log in to the admin panel.

---

## 7. Add authorized domains for login

In Firebase Console:

```txt
Authentication → Settings → Authorized domains
```

Add your deployed domains.

Examples:

```txt
your-site.vercel.app
your-site.pages.dev
yourdomain.com
```

Localhost is usually already allowed for local development.

---

## 8. Create Firestore Database

1. Firebase Console → **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose **Production mode**.
4. Pick a location close to your audience.
5. Finish setup.

You do not need to manually create collections. The admin panel will create them when you save settings or add videos.

The database will use this structure:

```txt
videos / videoId
settings / public
```

---

## 9. Firestore Security Rules

Go to:

```txt
Firestore Database → Rules
```

Replace the rules with this.

Change this email:

```txt
youradmin@gmail.com
```

To your real admin email.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        request.auth.token.email in [
          "youradmin@gmail.com"
        ];
    }

    match /videos/{videoId} {
      allow read: if resource.data.status == "active" || isAdmin();
      allow create, update, delete: if isAdmin();
    }

    match /settings/{docId} {
      allow read: if docId == "public";
      allow create, update, delete: if isAdmin();
    }
  }
}
```

Click **Publish**.

This means:

- Public visitors can only read active videos.
- Public visitors can read public website settings.
- Only your admin email can create, edit, hide, or delete videos.
- Only your admin email can change website settings and ad settings.

To allow multiple admins:

```js
request.auth.token.email in [
  "firstadmin@gmail.com",
  "secondadmin@gmail.com"
]
```

---

## 10. First admin setup

After deployment:

1. Open your admin URL.

Example:

```txt
https://yourdomain.com/admin
```

2. Login with the Firebase Authentication user.
3. Go to **Settings**.
4. Set website name, logo URL, categories, support email, and age gate.
5. Turn demo videos on/off.
6. Click **Save settings**.
7. Go to **Videos**.
8. Add your first video.
9. Open the public homepage.

---

## 11. Remove demo videos

You can remove demo videos from the admin panel:

```txt
Admin Panel → Settings → Website behavior → Demo videos → Off
```

Then click:

```txt
Save settings
```

When demo videos are off, the public website will show only real active videos from Firebase.

You can also change the default before Firebase is connected:

```txt
src/config/siteConfig.js
```

Find:

```js
showDemoDataWhenFirebaseEmpty: true
```

Change it to:

```js
showDemoDataWhenFirebaseEmpty: false
```

---

## 12. Add videos

Go to:

```txt
Admin Panel → Videos
```

Each video supports:

- Title
- Thumbnail URL
- Embed video URL
- Views
- Duration
- Category
- Tags
- Direct-link button URL
- Active/Hidden status

For the embed URL, use an iframe/embed link from your video platform.

Example:

```txt
https://example-video-platform.com/embed/abc123
```

Do not use a normal watch-page URL unless the platform supports iframe embedding.

---

## 13. Hide or delete videos

In the admin video list:

- **Hide** keeps the video in Firebase but removes it from the public website.
- **Show** makes it public again.
- **Delete** permanently removes it from Firestore.

---

## 14. Ads setup

Go to:

```txt
Admin Panel → Ads
```

Available controls:

- Enable/disable all ads
- Popunder script URL
- Social bar script URL
- Top banner HTML
- In-feed banner HTML
- Watch page banner HTML
- Native/sidebar banner HTML
- Direct-link buttons

For banner/native ads, paste the ad network HTML code into the matching textarea.

For popunder/social bar, paste the direct JavaScript file URL when your ad network gives one.

If your ad network gives a full script tag instead of a direct URL, place it in one of the HTML ad slots, or modify `src/components/AdSlot.jsx` to support full global script snippets.

---

## 15. Branding setup

Go to:

```txt
Admin Panel → Settings → Branding
```

You can control:

- Website name
- Short logo text
- Logo image URL
- Tagline
- Domain hint
- Support email

If `Logo image URL` is empty, the website uses the short logo text.

---

## 16. Categories

Go to:

```txt
Admin Panel → Settings → Website behavior → Categories
```

Example:

```txt
All, Trending, Latest, Popular, Featured
```

Keep `All` as the first category because it is used for the full video grid.

---

## 17. Deploy on Vercel

Create a Vercel project from your GitHub repository.

Use:

```txt
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Add Environment Variables in Vercel:

```txt
Project → Settings → Environment Variables
```

Add:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_PATH=/admin
```

Redeploy after adding environment variables.

`vercel.json` is already included, so direct URLs like `/watch/video-id` and `/admin` should work.

---

## 18. Deploy on Cloudflare Pages

Create a Cloudflare Pages project from your GitHub repository.

Use:

```txt
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

Add Environment Variables:

```txt
Cloudflare Pages → Project → Settings → Environment variables
```

Add:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_ADMIN_PATH=/admin
```

Redeploy after adding environment variables.

`public/_redirects` is already included, so direct URLs like `/watch/video-id` and `/admin` should work.

---

## 19. Important notes

- Do not host real videos inside this project.
- Use an external video platform and paste embed URLs into the admin panel.
- Keep thumbnails lightweight for faster loading.
- Only embed content you are allowed to use.
- Keep legal/contact/removal information updated.
- Keep your Firebase rules strict.
- Your Firebase web config is visible in frontend apps by design, so security must come from Firebase rules.

---

## 20. Common issues

### Admin login says unauthorized or permission denied

Check:

1. Email/Password auth is enabled.
2. Your admin user exists in Firebase Authentication.
3. Your exact admin email is included in Firestore rules.
4. Your deployed domain is added to Authentication authorized domains.

### Public site shows no videos

Check:

1. Video status is `active`.
2. Firestore rules are published.
3. Firebase environment variables are set in hosting.
4. Demo videos are turned on or you have real videos added.

### Admin path does not open after deployment

Check:

1. `VITE_ADMIN_PATH` starts with `/`.
2. You redeployed after changing it.
3. Vercel has `vercel.json`.
4. Cloudflare Pages has `public/_redirects`.

### Embed video does not load

The video platform may block iframe embedding. Use the platform's official embed URL.

---

## 21. Premium UI refresh included in this version

This build includes a refreshed public and admin interface:

- Premium glass/dark visual system with smoother cards, buttons, shadows, gradients, and responsive spacing.
- Mobile-first public header with custom category chips instead of a basic browser dropdown.
- New homepage hero section, better loading skeletons, polished video cards, improved watch page, and refined legal/footer pages.
- Admin dashboard redesign with better stats, recent videos, improved forms, responsive navigation, and cleaner video management.
- Browser `alert()` and `confirm()` were replaced with custom toast notifications and a custom delete confirmation dialog.
- Video form status/category controls were changed to touch-friendly segmented buttons/chips.

The Firebase data structure and environment variables remain the same.
