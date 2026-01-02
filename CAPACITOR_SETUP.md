# Capacitor Setup Guide

This project is configured with Capacitor for native Android and iOS builds.

## Prerequisites

- Node.js 18+
- For Android: Android Studio with SDK installed
- For iOS: macOS with Xcode installed

## Initial Setup

After cloning this project, run:

```bash
npm install
npm run build
npx cap sync
```

## Adding Platforms

### Android
```bash
npx cap add android
```

### iOS
```bash
npx cap add ios
```

## Microphone Permissions

### Android

After adding the Android platform, open `android/app/src/main/AndroidManifest.xml` and add:

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### iOS

After adding the iOS platform, open `ios/App/App/Info.plist` and add:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access to record voice memos.</string>
<key>NSSpeechRecognitionUsageDescription</key>
<string>This app needs speech recognition to transcribe your recordings.</string>
```

## Build Commands

### Development Build
```bash
npm run build
npx cap sync
```

### Open in Android Studio
```bash
npx cap open android
```

### Open in Xcode
```bash
npx cap open ios
```

### Run on Device/Emulator
```bash
# Android
npx cap run android

# iOS
npx cap run ios
```

## Live Reload (Development)

For live reload during development, update `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  // ... existing config
  server: {
    url: 'http://YOUR_LOCAL_IP:5173',
    cleartext: true
  }
};
```

Then run:
```bash
npm run dev
npx cap run android # or ios
```

## Troubleshooting

### MediaRecorder not working
- Ensure microphone permissions are granted
- On Android, the `androidScheme: 'https'` config helps with secure context requirements

### Speech Recognition not working
- iOS: Speech recognition requires the `NSSpeechRecognitionUsageDescription` permission
- Android: Speech recognition uses the device's built-in service

### Build errors
- Run `npx cap sync` after any dependency changes
- Ensure `npm run build` completes without errors before syncing
