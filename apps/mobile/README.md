# Fitlink React Native app

### Generate Keystore
Use this script to generate `fitlinkappdebug.keystore`
```shell
keytool -genkey -v -keystore fitlinkappdebug.keystore -storepass android -alias fitlinkappdebug -keypass android -keyalg RSA -keysize 2048 -validity 10000
```

### ENV
1. [Add RNGP_ANDROID_API_KEY to your environment](https://github.com/tolu360/react-native-google-places#android-api-key). Look for API_KEY in Firebase google-services.json `client.api_key.current_key`

2. Configure [mapbox](https://github.com/rnmapbox/maps#readme) ENV for [Android](https://docs.mapbox.com/android/maps/guides/install/#configure-credentials) and [iOS](https://docs.mapbox.com/ios/maps/guides/install/#configure-credentials). Use `hello@fitlinkapp.com` account to access the secrets

### Patches
Table of patches applied for different libraries

| Name                              | version | reason |
|-----------------------------------|---------|--------|
| @react-native-community+blur+4.3.0.patch | 4.3.0   | https://github.com/Kureev/react-native-blur/issues/489       |
| @rnmapbox+maps+10.0.0-beta.68.patch | 10.0.0-beta.68   | https://github.com/rnmapbox/maps/issues/2264       |
