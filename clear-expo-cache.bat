@echo off
echo Clearing Expo cache and restarting...

echo 1. Removing node_modules/.cache/metro
if exist node_modules\.cache\metro rmdir /s /q node_modules\.cache\metro

echo 2. Removing node_modules/.cache/babel-loader
if exist node_modules\.cache\babel-loader rmdir /s /q node_modules\.cache\babel-loader

echo 3. Stopping running Expo instances
taskkill /f /im node.exe

echo 4. Waiting 5 seconds...
timeout /t 5 /nobreak

echo 5. Starting Expo with cleared cache
npx expo start --clear

echo Done!
