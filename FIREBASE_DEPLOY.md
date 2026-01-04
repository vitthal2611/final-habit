# Firebase Deployment Instructions

## Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
```

## Step 2: Install Firebase packages
```bash
npm install @angular/fire firebase
```

## Step 3: Login to Firebase
```bash
firebase login
```

## Step 4: Initialize Firebase
```bash
firebase init
```
- Select "Hosting" and "Realtime Database"
- Choose existing project or create new one
- Set public directory to: `dist/final-habit/browser`
- Configure as single-page app: Yes
- Set up automatic builds: No

## Step 5: Update environment.ts
Replace the placeholder values in `src/environments/environment.ts` with your Firebase project credentials from Firebase Console > Project Settings

## Step 6: Update app.config.ts
Add Firebase providers:
```typescript
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideDatabase(() => getDatabase())
  ]
};
```

## Step 7: Update HabitService
Replace StorageService with FirebaseService in habit.service.ts

## Step 8: Build the app
```bash
ng build --configuration production
```

## Step 9: Deploy to Firebase
```bash
firebase deploy
```

Your app will be live at: https://YOUR_PROJECT_ID.web.app
