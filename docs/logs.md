&platform=ios&dev=true&hot=false&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app&unstable_transformProfile=hermes-stable:444753 Bridgeless mode is enabled
console.js:589 Running "main" with {"rootTag":101,"initialProps":{"exp":{"manifestString":"{\"runtimeVersion\":\"exposdk:52.0.0\",\"metadata\":{},\"createdAt\":\"2025-06-26T16:42:28.095Z\",\"extra\":{\"eas\":{},\"scopeKey\":\"@anonymous\\/bolt-expo-nativewind-2af57800-e3e9-4625-9e02-1d5f0189bf6b\",\"expoClient\":{\"extra\":{\"supabaseUrl\":\"https:\\/\\/hybyjgpcbcqpndxrquqv.supabase.co\",\"supabaseAnonKey\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnlqZ3BjYmNxcG5keHJxdXF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2ODQ3NTIsImV4cCI6MjA2MzI2MDc1Mn0.u4xgnUehjnA45i2I8n7Cml82g1IMtbx0KuQNDfNwbJ0\",\"supabaseServiceKey\":\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnlqZ3BjYmNxcG5keHJxdXF2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzY4NDc1MiwiZXhwIjoyMDYzMjYwNzUyfQ.9Z1zaIrlQOBcpcQ826mzF6qj7qj1sA4symdh69Y6_kw\",\"router\":{\"origin\":false}},\"orientation\":\"portrait\",\"version\":\"1.0.0\",\"userInterfaceStyle\":\"automatic\",\"newArchEnabled\":true,\"ios\":{\"infoPlist\":{\"NSLocationAlwaysAndWhenInUseUsageDescription\":\"Roomies uses background location to notify you of new matches nearby.\",\"NSLocationWhenInUseUsageDescription\":\"Roomies needs your location to show nearby listings.\"},\"bundleIdentifier\":\"com.anonymous.bolt-expo-nativewind\",\"supportsTablet\":true},\"experiments\":{\"typedRoutes\":true},\"_internal\":{\"packageJsonPath\":\"\\/Users\\/mona\\/code\\/Roomies\\/package.json\",\"projectRoot\":\"\\/Users\\/mona\\/code\\/Roomies\",\"staticConfigPath\":\"\\/Users\\/mona\\/code\\/Roomies\\/app.json\",\"pluginHistory\":{\"react-native-video\":{\"name\":\"react-native-video\",\"version\":\"6.13.0\"},\"expo-secure-store\":{\"name\":\"expo-secure-store\",\"version\":\"14.0.1\"}},\"isDebug\":false,\"dynamicConfigPath\":\"\\/Users\\/mona\\/code\\/Roomies\\/app.config.js\"},\"hostUri\":\"10.178.90.140:8081\",\"android\":{\"package\":\"com.anonymous.boltexponativewind\",\"permissions\":[]},\"plugins\":[\"expo-router\",\"expo-video\",\"react-native-video\",\"expo-secure-store\"],\"icon\":\".\\/assets\\/images\\/icon.png\",\"slug\":\"bolt-expo-nativewind\",\"scheme\":\"myapp\",\"web\":{\"bundler\":\"metro\",\"favicon\":\".\\/assets\\/images\\/favicon.png\",\"output\":\"single\"},\"platforms\":[\"ios\",\"android\",\"web\"],\"iconUrl\":\"http:\\/\\/10.178.90.140:8081\\/assets\\/.\\/assets\\/images\\/icon.png\",\"sdkVersion\":\"52.0.0\",\"name\":\"bolt-expo-nativewind\"},\"expoGo\":{\"developer\":{\"projectRoot\":\"\\/Users\\/mona\\/code\\/Roomies\",\"tool\":\"expo-cli\"},\"__flipperHack\":\"React Native packager is running\",\"mainModuleName\":\"node_modules\\/expo-router\\/entry\",\"packagerOpts\":{\"dev\":true},\"debuggerHost\":\"10.178.90.140:8081\"}},\"id\":\"5399752b-2349-4a2f-a389-51a357672723\",\"assets\":[],\"launchAsset\":{\"key\":\"bundle\",\"contentType\":\"application\\/javascript\",\"url\":\"http:\\/\\/10.178.90.140:8081\\/node_modules\\/expo-router\\/entry.bundle?platform=ios&dev=true&hot=false&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app&unstable_transformProfile=hermes-stable\"},\"isVerified\":true}","shell":false,"initialUri":"exp://10.178.90.140:8081","appOwnership":"expo"},"concurrentRoot":true},"fabric":true}
notifications.tsx:10 expo-notifications: Push notifications (remote notifications) functionality provided by expo-notifications will be removed from Expo Go in SDK 53. Instead, use a development build. Read more at https://docs.expo.dev/develop/development-builds/introduction/. Error Component Stack:
    at ContextNavigator (ExpoRoot.js:73:36)
    at ExpoRoot (ExpoRoot.js:47:76)
    at App (<anonymous>)
    at ErrorToastContainer (ErrorToastContainer.tsx:4:11)
    at ErrorOverlay (<anonymous>)
    at withDevTools(ErrorOverlay) (withDevTools.ios.tsx:27:25)
    at RCTView (<anonymous>)
    at View (View.js:32:34)
    at RCTView (<anonymous>)
    at View (View.js:32:34)
    at AppContainer (AppContainer-dev.js:87:11)
    at main(RootComponent) (getCachedComponentWithDebugName.js:28:42)
anonymous @ console.js:589
anonymous @ setUpDeveloperTools.js:67
registerWarning @ LogBox.js:149
anonymous @ LogBox.js:72
overrideMethod @ backend.js:14284
warnOfExpoGoPushUsage @ warnOfExpoGoPushUsage.js:6
addPushTokenListener @ TokenEmitter.js:34
anonymous @ DevicePushTokenAutoRegistration.fx.js:60
loadModuleImplementation @ require.js:277
guardedLoadModule @ require.js:184
metroRequire @ require.js:92
anonymous @ getExpoPushTokenAsync.js:4
loadModuleImplementation @ require.js:277
guardedLoadModule @ require.js:184
metroRequire @ require.js:92
anonymous @ index.js:12
loadModuleImplementation @ require.js:277
guardedLoadModule @ require.js:184
metroRequire @ require.js:92
anonymous @ notifications.tsx:10
loadModuleImplementation @ require.js:277
guardedLoadModule @ require.js:177
metroRequire @ require.js:92
get @ app:35
metroContext @ app:88
loadRoute @ getRoutesCore.js:72
_loop @ getRoutesCore.js:102
getDirectoryTree @ getRoutesCore.js:49
getRoutes @ getRoutesCore.js:19
getRoutes @ getRoutes.js:18
initialize @ router-store.js:87
anonymous @ router-store.js:245
mountMemo @ ReactFabric-dev.js:11309
useMemo @ ReactFabric-dev.js:11835
useMemo @ react.development.js:1650
useInitializeExpoRouter @ router-store.js:245
ContextNavigator @ ExpoRoot.js:106
renderWithHooks @ ReactFabric-dev.js:10083
mountIndeterminateComponent @ ReactFabric-dev.js:15531
beginWork @ ReactFabric-dev.js:17384
performUnitOfWork @ ReactFabric-dev.js:23749
workLoopSync @ ReactFabric-dev.js:23484
renderRootSync @ ReactFabric-dev.js:23444
performConcurrentWorkOnRoot @ ReactFabric-dev.js:22518
Show 43 more frames
Show less
notifications.tsx:10 `expo-notifications` functionality is not fully supported in Expo Go:
We recommend you instead use a development build to avoid limitations. Learn more: https://expo.fyi/dev-client. Error Component Stack:
    at ContextNavigator (ExpoRoot.js:73:36)
    at ExpoRoot (ExpoRoot.js:47:76)
    at App (<anonymous>)
    at ErrorToastContainer (ErrorToastContainer.tsx:4:11)
    at ErrorOverlay (<anonymous>)
    at withDevTools(ErrorOverlay) (withDevTools.ios.tsx:27:25)
    at RCTView (<anonymous>)
    at View (View.js:32:34)
    at RCTView (<anonymous>)
    at View (View.js:32:34)
    at AppContainer (AppContainer-dev.js:87:11)
    at main(RootComponent) (getCachedComponentWithDebugName.js:28:42)
anonymous @ console.js:589
anonymous @ setUpDeveloperTools.js:67
registerWarning @ LogBox.js:149
anonymous @ LogBox.js:72
overrideMethod @ backend.js:14284
anonymous @ index.js:8
loadModuleImplementation @ require.js:277
guardedLoadModule @ require.js:184
metroRequire @ require.js:92
anonymous @ notifications.tsx:10
loadModuleImplementation @ require.js:277
guardedLoadModule @ require.js:177
metroRequire @ require.js:92
get @ app:35
metroContext @ app:88
loadRoute @ getRoutesCore.js:72
_loop @ getRoutesCore.js:102
getDirectoryTree @ getRoutesCore.js:49
getRoutes @ getRoutesCore.js:19
getRoutes @ getRoutes.js:18
initialize @ router-store.js:87
anonymous @ router-store.js:245
mountMemo @ ReactFabric-dev.js:11309
useMemo @ ReactFabric-dev.js:11835
useMemo @ react.development.js:1650
useInitializeExpoRouter @ router-store.js:245
ContextNavigator @ ExpoRoot.js:106
renderWithHooks @ ReactFabric-dev.js:10083
mountIndeterminateComponent @ ReactFabric-dev.js:15531
beginWork @ ReactFabric-dev.js:17384
performUnitOfWork @ ReactFabric-dev.js:23749
workLoopSync @ ReactFabric-dev.js:23484
renderRootSync @ ReactFabric-dev.js:23444
performConcurrentWorkOnRoot @ ReactFabric-dev.js:22518
Show 33 more frames
Show less
place-details.tsx:1 [PlaceDetails] Module Loaded
preferencesStore.ts:216 Rehydrated preferences store state: Object
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] Auth state changed: INITIAL_SESSION No session
console.js:589 ⚠️ [expo-av]: Video component from `expo-av` is deprecated in favor of `expo-video`. See the documentation at https://docs.expo.dev/versions/latest/sdk/video/ for the new API reference.
testAccountHelper.ts:267 [TestAccount] Saved test accounts:
testAccountHelper.ts:269 [TestAccount] 1: test_06-26-25_09-42@roomies.com (password: Test1234)
account.tsx:381 [Account] Using test account: test_06-26-25_09-42@roomies.com
Welcome to React Native DevTools
Debugger integration: iOS Bridgeless (RCTHost)
account.tsx:203 [DATA PERSISTENCE TEST] Creating user account in Supabase...
testAccountHelper.ts:40 [TestAccount] Creating test account with email: test_06-26-25_09-42@roomies.com
testAccountHelper.ts:48 [TestAccount] Attempting admin API user creation with pre-confirmation...
testAccountHelper.ts:57 [TestAccount] Using admin client with service role key
testAccountHelper.ts:74 [TestAccount] Admin API success! User created with ID: 3e9abbea-d65f-4565-b20c-35b8809a5f0c (pre-confirmed)
testAccountHelper.ts:77 [TestAccount] Signing in with pre-confirmed account...
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] Auth state changed: SIGNED_IN Session exists
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] User signed in, fetching profile for data verification 
2onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 🔍 Fetching profile for user ID: 3e9abbea-d65f-4565-b20c-35b8809a5f0c 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Raw Supabase data - onboarding_completed: false, name: Test Lister, personality_type: null 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Raw personality_dimensions from DB: 
supabaseUserStore.ts:122 [SupabaseUserStore] Formatting user from Supabase: {id: '3e9abbea-d65f-4565-b20c-35b8809a5f0c', email: 'test_06-26-25_09-42@roomies.com', name: 'Test Lister', onboarding_completed: false}
supabaseUserStore.ts:168 [formatSupabaseUser] Raw personality_dimensions from DB: null
supabaseUserStore.ts:178 [formatSupabaseUser] Using fallback personality dimensions: {ei: 50, sn: 50, tf: 50, jp: 50}
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Formatted user - onboardingCompleted: false, name: Test Lister, personalityType: null 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Formatted personalityDimensions: {ei: 50, sn: 50, tf: 50, jp: 50}
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] ✅ Profile loaded successfully into Supabase user store 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Raw Supabase data - onboarding_completed: false, name: Test Lister, personality_type: null 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Raw personality_dimensions from DB: 
supabaseUserStore.ts:122 [SupabaseUserStore] Formatting user from Supabase: {id: '3e9abbea-d65f-4565-b20c-35b8809a5f0c', email: 'test_06-26-25_09-42@roomies.com', name: 'Test Lister', onboarding_completed: false}
supabaseUserStore.ts:168 [formatSupabaseUser] Raw personality_dimensions from DB: null
supabaseUserStore.ts:178 [formatSupabaseUser] Using fallback personality dimensions: {ei: 50, sn: 50, tf: 50, jp: 50}
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Formatted user - onboardingCompleted: false, name: Test Lister, personalityType: null 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Formatted personalityDimensions: {ei: 50, sn: 50, tf: 50, jp: 50}
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] ✅ Profile loaded successfully into Supabase user store 
testAccountHelper.ts:86 [TestAccount] Sign-in successful with pre-confirmed account
testAccountHelper.ts:254 [TestAccount] Account test_06-26-25_09-42@roomies.com already exists, skipping save
account.tsx:212 [DATA PERSISTENCE TEST] Test account created successfully with email: test_06-26-25_09-42@roomies.com
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] Auth state changed: SIGNED_IN Session exists
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] User signed in, fetching profile for data verification 
2onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 🔍 Fetching profile for user ID: 3e9abbea-d65f-4565-b20c-35b8809a5f0c 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Raw Supabase data - onboarding_completed: false, name: Test Lister, personality_type: null 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Raw personality_dimensions from DB: 
supabaseUserStore.ts:122 [SupabaseUserStore] Formatting user from Supabase: {id: '3e9abbea-d65f-4565-b20c-35b8809a5f0c', email: 'test_06-26-25_09-42@roomies.com', name: 'Test Lister', onboarding_completed: false}
supabaseUserStore.ts:168 [formatSupabaseUser] Raw personality_dimensions from DB: null
supabaseUserStore.ts:178 [formatSupabaseUser] Using fallback personality dimensions: {ei: 50, sn: 50, tf: 50, jp: 50}
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Formatted user - onboardingCompleted: false, name: Test Lister, personalityType: null 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Formatted personalityDimensions: {ei: 50, sn: 50, tf: 50, jp: 50}
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] ✅ Profile loaded successfully into Supabase user store 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Raw Supabase data - onboarding_completed: false, name: Test Lister, personality_type: null 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Raw personality_dimensions from DB: 
supabaseUserStore.ts:122 [SupabaseUserStore] Formatting user from Supabase: {id: '3e9abbea-d65f-4565-b20c-35b8809a5f0c', email: 'test_06-26-25_09-42@roomies.com', name: 'Test Lister', onboarding_completed: false}
supabaseUserStore.ts:168 [formatSupabaseUser] Raw personality_dimensions from DB: null
supabaseUserStore.ts:178 [formatSupabaseUser] Using fallback personality dimensions: {ei: 50, sn: 50, tf: 50, jp: 50}
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Formatted user - onboardingCompleted: false, name: Test Lister, personalityType: null 
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 📋 Formatted personalityDimensions: {ei: 50, sn: 50, tf: 50, jp: 50}
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] ✅ Profile loaded successfully into Supabase user store 
supabaseUserStore.ts:328 [SupabaseUserStore] Complete updateData being sent to Supabase: {profile_strength: 10}
supabaseUserStore.ts:341 [SupabaseUserStore] ✅ Successfully updated user in Supabase
supabaseOnboardingProfileUpdater.ts:22 [Onboarding] Updating profile after completing step: get-started
supabaseOnboardingProfileUpdater.ts:27 [Onboarding] Using authenticated user ID: 3e9abbea-d65f-4565-b20c-35b8809a5f0c
supabaseOnboardingProfileUpdater.ts:96 [Onboarding] Formatting step data for get-started: {}
supabaseOnboardingProfileUpdater.ts:228 [Onboarding] Formatted data for get-started: {}
supabaseOnboardingProfileUpdater.ts:68 [Onboarding] Updating profile for user 3e9abbea-d65f-4565-b20c-35b8809a5f0c with data: {
  "completed_steps": [
    "get-started"
  ],
  "profile_strength": 10
}
supabaseOnboardingProfileUpdater.ts:81 [Onboarding] Successfully updated profile after step get-started. New strength: 10%
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 1
userStore.ts:335 [UserStore] Profile updated successfully
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 1
supabaseOnboardingProfileUpdater.ts:22 [Onboarding] Updating profile after completing step: goals
supabaseOnboardingProfileUpdater.ts:27 [Onboarding] Using authenticated user ID: 3e9abbea-d65f-4565-b20c-35b8809a5f0c
supabaseOnboardingProfileUpdater.ts:96 [Onboarding] Formatting step data for goals: {
  "housing_goals": {
    "goal_type": "find-roommates",
    "user_role": "place_lister",
    "has_place": true
  },
  "move_in_timeframe": "flexible"
}
supabaseOnboardingProfileUpdater.ts:228 [Onboarding] Formatted data for goals: {
  "housing_goals": {
    "goal_type": "find-roommates",
    "user_role": "place_lister",
    "has_place": true
  },
  "move_in_timeframe": "flexible"
}
supabaseOnboardingProfileUpdater.ts:68 [Onboarding] Updating profile for user 3e9abbea-d65f-4565-b20c-35b8809a5f0c with data: {
  "completed_steps": [
    "get-started",
    "goals"
  ],
  "housing_goals": {
    "goal_type": "find-roommates",
    "user_role": "place_lister",
    "has_place": true
  },
  "move_in_timeframe": "flexible",
  "profile_strength": 10
}
supabaseOnboardingProfileUpdater.ts:81 [Onboarding] Successfully updated profile after step goals. New strength: 10%
goals.tsx:181 [Goals] Background profile update completed
33place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 1
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 2
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 2
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 2
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 3
3place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 4
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 5
PhotoSelector.tsx:35 [expo-image-picker] `ImagePicker.MediaTypeOptions` have been deprecated. Use `ImagePicker.MediaType` or an array of `ImagePicker.MediaType` instead.
anonymous @ console.js:589
anonymous @ setUpDeveloperTools.js:67
registerWarning @ LogBox.js:149
anonymous @ LogBox.js:72
overrideMethod @ backend.js:14284
parseMediaTypes @ utils.js:12
mapDeprecatedOptions @ utils.js:26
?anon_0_ @ ImagePicker.js:148
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
anonymous @ asyncToGenerator.js:22
anonymous @ asyncToGenerator.js:14
_launchImageLibraryAsync @ ImagePicker.js:158
launchImageLibraryAsync @ ImagePicker.js:147
?anon_0_ @ PhotoSelector.tsx:35
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
Show 16 more frames
Show less
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 5
43place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 5
userStore.ts:335 [UserStore] Profile updated successfully
supabasePlaceDetailsSync.ts:20 [PlaceDetailsSync] Starting sync for user: 123
supabasePlaceDetailsSync.ts:21 [PlaceDetailsSync] Place details: {
  "bedrooms": 2,
  "bathrooms": 1,
  "amenities": [
    "furnished",
    "parking"
  ],
  "photos": [
    "file:///Users/mona/Library/Developer/CoreSimulator/Devices/6061094F-CB74-46A8-9E0E-46EAB845235F/data/Containers/Data/Application/84C798F2-74A0-4319-97D7-6B18FE68EB7C/Library/Caches/ExponentExperienceData/@anonymous/bolt-expo-nativewind-2af57800-e3e9-4625-9e02-1d5f0189bf6b/ImagePicker/D36FEE03-25C9-4B01-AEF9-C49ED23B3072.jpg"
  ],
  "roomType": "private",
  "monthlyRent": "1200",
  "address": "123 Main St",
  "leaseDuration": "1 year",
  "moveInDate": "06/27/2025",
  "description": "Shared bath, near beautiful waterfall"
}
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 5
supabasePlaceDetailsSync.ts:31 [PlaceDetailsSync] Authentication error: undefined
anonymous @ console.js:589
reactConsoleErrorHandler @ ExceptionsManager.js:168
anonymous @ setUpDeveloperTools.js:67
registerError @ LogBox.js:198
anonymous @ LogBox.js:68
overrideMethod @ backend.js:14284
?anon_0_ @ supabasePlaceDetailsSync.ts:31
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
Show 8 more frames
Show less
place-details.tsx:87 [PlaceDetails] Failed to sync to roommate profile: Authentication failed
anonymous @ console.js:589
anonymous @ setUpDeveloperTools.js:67
registerWarning @ LogBox.js:149
anonymous @ LogBox.js:72
overrideMethod @ backend.js:14284
?anon_0_ @ place-details.tsx:87
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
Show 7 more frames
Show less
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 5
photos.tsx:80 [Photos] Component mounted, debugging values:
photos.tsx:81 [Photos] - userExists: true
photos.tsx:82 [Photos] - user?.userRole: place_lister
photos.tsx:83 [Photos] - user?.personalityType: INTJ
photos.tsx:84 [Photos] - typeFromParams: undefined
photos.tsx:85 [Photos] - hasPersonalityImage state: false
photos.tsx:86 [Photos] - showPotatoDefault state: false
photos.tsx:91 [Photos] ✅ PLACE LISTER DETECTED - Using potato default
photos.tsx:92 [Photos] - User role: place_lister
photos.tsx:93 [Photos] - Personality type: INTJ (will be ignored for place listers)
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 5
userStore.ts:335 [UserStore] Profile updated successfully
supabasePlaceDetailsSync.ts:20 [PlaceDetailsSync] Starting sync for user: 123
supabasePlaceDetailsSync.ts:21 [PlaceDetailsSync] Place details: {
  "bedrooms": 2,
  "bathrooms": 1,
  "amenities": [
    "furnished",
    "parking"
  ],
  "photos": [
    "file:///Users/mona/Library/Developer/CoreSimulator/Devices/6061094F-CB74-46A8-9E0E-46EAB845235F/data/Containers/Data/Application/84C798F2-74A0-4319-97D7-6B18FE68EB7C/Library/Caches/ExponentExperienceData/@anonymous/bolt-expo-nativewind-2af57800-e3e9-4625-9e02-1d5f0189bf6b/ImagePicker/D36FEE03-25C9-4B01-AEF9-C49ED23B3072.jpg"
  ],
  "roomType": "private",
  "monthlyRent": "1200",
  "address": "123 Main St",
  "leaseDuration": "1 year",
  "moveInDate": "06/27/2025",
  "description": "Shared bath, near beautiful waterfall"
}
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 5
supabasePlaceDetailsSync.ts:31 [PlaceDetailsSync] Authentication error: undefined
anonymous @ console.js:589
reactConsoleErrorHandler @ ExceptionsManager.js:168
anonymous @ setUpDeveloperTools.js:67
registerError @ LogBox.js:198
anonymous @ LogBox.js:68
overrideMethod @ backend.js:14284
?anon_0_ @ supabasePlaceDetailsSync.ts:31
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
Show 8 more frames
Show less
place-details.tsx:87 [PlaceDetails] Failed to sync to roommate profile: Authentication failed
anonymous @ console.js:589
anonymous @ setUpDeveloperTools.js:67
registerWarning @ LogBox.js:149
anonymous @ LogBox.js:72
overrideMethod @ backend.js:14284
?anon_0_ @ place-details.tsx:87
asyncGeneratorStep @ asyncToGenerator.js:3
_next @ asyncToGenerator.js:17
Show 7 more frames
Show less
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 5
photos.tsx:80 [Photos] Component mounted, debugging values:
photos.tsx:81 [Photos] - userExists: true
photos.tsx:82 [Photos] - user?.userRole: place_lister
photos.tsx:83 [Photos] - user?.personalityType: INTJ
photos.tsx:84 [Photos] - typeFromParams: undefined
photos.tsx:85 [Photos] - hasPersonalityImage state: false
photos.tsx:86 [Photos] - showPotatoDefault state: false
photos.tsx:91 [Photos] ✅ PLACE LISTER DETECTED - Using potato default
photos.tsx:92 [Photos] - User role: place_lister
photos.tsx:93 [Photos] - Personality type: INTJ (will be ignored for place listers)
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 5
userStore.ts:335 [UserStore] Profile updated successfully
supabaseOnboardingProfileUpdater.ts:22 [Onboarding] Updating profile after completing step: photos
photos.tsx:476 [Photos] Updating profile strength after completing photos step
photos.tsx:477 [Photos] Using ProfileImageService for consistent profile picture handling
photos.tsx:485 Saved user data with photos: {photoCount: 0, personalityType: 'INTJ', profilePictureIdentifier: 'local://potato.png'}
place-details.tsx:42 [PlaceDetails] PlaceDetailsContent Rendered, Step: 5
photos.tsx:80 [Photos] Component mounted, debugging values:
photos.tsx:81 [Photos] - userExists: true
photos.tsx:82 [Photos] - user?.userRole: place_lister
photos.tsx:83 [Photos] - user?.personalityType: INTJ
photos.tsx:84 [Photos] - typeFromParams: undefined
photos.tsx:85 [Photos] - hasPersonalityImage state: false
photos.tsx:86 [Photos] - showPotatoDefault state: true
photos.tsx:91 [Photos] ✅ PLACE LISTER DETECTED - Using potato default
photos.tsx:92 [Photos] - User role: place_lister
photos.tsx:93 [Photos] - Personality type: INTJ (will be ignored for place listers)
supabaseOnboardingProfileUpdater.ts:27 [Onboarding] Using authenticated user ID: 3e9abbea-d65f-4565-b20c-35b8809a5f0c
supabaseOnboardingProfileUpdater.ts:96 [Onboarding] Formatting step data for photos: {
  "profile_picture_url": "local://potato.png",
  "additional_photos": [],
  "date_of_birth": "2006-06-26T07:00:00.000Z"
}
supabaseOnboardingProfileUpdater.ts:228 [Onboarding] Formatted data for photos: {
  "profile_picture": "local://potato.png",
  "additional_photos": {},
  "date_of_birth": "2006-06-26T07:00:00.000Z"
}
supabaseOnboardingProfileUpdater.ts:68 [Onboarding] Updating profile for user 3e9abbea-d65f-4565-b20c-35b8809a5f0c with data: {
  "completed_steps": [
    "get-started",
    "goals",
    "photos"
  ],
  "profile_picture": "local://potato.png",
  "additional_photos": {},
  "date_of_birth": "2006-06-26T07:00:00.000Z",
  "profile_strength": 10
}
supabaseOnboardingProfileUpdater.ts:81 [Onboarding] Successfully updated profile after step photos. New strength: 10%
onboardingDebugUtils.ts:16 [DATA PERSISTENCE] 🎯 Completing onboarding and saving to Supabase... 
supabaseOnboardingProfileUpdater.ts:22 [Onboarding] Updating profile after completing step: notifications