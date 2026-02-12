@echo off
echo ================================
echo Mobile Auth Fix Deployment
echo ================================
echo.

echo [1/4] Building production bundle...
call npm run build:prod
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b 1
)
echo Build complete!
echo.

echo [2/4] Checking Firebase config...
echo Project: habit-tracker-86281
echo Auth Domain: habit-tracker-86281.firebaseapp.com
echo.

echo [3/4] Deploying to Firebase...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo Deployment failed!
    exit /b 1
)
echo.

echo [4/4] Deployment complete!
echo.
echo ================================
echo IMPORTANT: Verify Firebase Console
echo ================================
echo.
echo 1. Go to: https://console.firebase.google.com/project/habit-tracker-86281/authentication/providers
echo 2. Click Google provider
echo 3. Ensure these domains are authorized:
echo    - habit-tracker-86281.web.app
echo    - habit-tracker-86281.firebaseapp.com
echo    - localhost
echo.
echo Your app is live at:
echo https://habit-tracker-86281.web.app
echo.
pause
