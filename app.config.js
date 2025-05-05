require('dotenv').config();

module.exports = {
  expo: {
    name: 'FoodTruckApp',
    slug: 'FoodTruckApp',
    scheme: 'foodtruckapp',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          'We need access to your photos to upload images for your food trucks and profile avatars.',
      },
    },
    android: {
      // Unique Android package identifier
      package: 'com.anonymous.FoodTruckApp',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE', 'CAMERA'],
    },
    web: {
      favicon: './assets/favicon.png',
    },

    // Native plugins configuration
    plugins: [
      [
        'expo-image-picker',
        {
          photosPermission:
            'We need access to your photos to upload images for your food trucks and profile avatars.',
        },
      ],
      'expo-router',
      ['expo-secure-store', {}],
      'expo-dev-client'
    ],

    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      mapTilerKey: process.env.MAPTILER_KEY,
    },
  },
};
