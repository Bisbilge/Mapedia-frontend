#!/bin/bash
set -e

cd "$(dirname "$0")"

MODE=${1:-debug}  # debug veya release

echo "==> [1/4] Building frontend..."
npm run build

echo "==> [2/4] Syncing Capacitor..."
ANDROID_SDK_ROOT=~/Android/Sdk npx cap sync android

cd android

if [ "$MODE" = "release" ]; then
  echo "==> [3/4] Building release AAB (Play Store)..."
  ANDROID_SDK_ROOT=~/Android/Sdk JAVA_HOME=/usr/lib/jvm/java-21-openjdk ./gradlew bundleRelease
  echo "==> AAB: android/app/build/outputs/bundle/release/app-release.aab"
  echo "==> [4/4] Play Store'a yükle: https://play.google.com/console"
else
  echo "==> [3/4] Building debug APK..."
  ANDROID_SDK_ROOT=~/Android/Sdk JAVA_HOME=/usr/lib/jvm/java-21-openjdk ./gradlew assembleDebug
  echo "==> [4/4] Installing on device..."
  adb install -r app/build/outputs/apk/debug/app-debug.apk
  echo "==> Done!"
fi
