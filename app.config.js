module.exports = {
  expo: {
    name: "bolt-expo-nativewind",
    slug: "bolt-expo-nativewind",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.bolt-expo-nativewind",
      infoPlist: {
        "NSLocationWhenInUseUsageDescription": "Roomies needs your location to show nearby listings.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Roomies uses background location to notify you of new matches nearby."
      }
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-video",
      "react-native-video",
      "expo-secure-store"
    ],
    experiments: {
      typedRoutes: true
    },
    android: {
      package: "com.anonymous.boltexponativewind"
    },
    // Add extra configuration for environment variables
    extra: {
      // Supabase configuration
      supabaseUrl: process.env.SUPABASE_URL || "https://hybyjgpcbcqpndxrquqv.supabase.co",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnlqZ3BjYmNxcG5keHJxdXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODQ3NTIsImV4cCI6MjA2MzI2MDc1Mn0.u4xgnUehjnA45i2I8n7Cml82g1IMtbx0KuQNDfNwbJ0",
      supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnlqZ3BjYmNxcG5keHJxdXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzY4NDc1MiwiZXhwIjoyMDYzMjYwNzUyfQ.9Z1zaIrlQOBcpcQ826mzF6qj7qj1sA4symdh69Y6_kw",
      // Add any other environment variables here
    }
  }
};
