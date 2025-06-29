# Roomies - University Roommate Matching App

A React Native app built with Expo that helps university students find compatible roommates based on lifestyle preferences, personality traits, and housing needs.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start --clear

# press i to open ios simulator once expo server starts or scan qr code
i
```

## 📚 Documentation

### **📋 [Backend Master Documentation](./ROOMIES_BACKEND_MASTER.md)** ⭐ **START HERE**
> **Single source of truth** for all backend architecture, current status, issues, fixes, and roadmap

### Additional Documentation
- [Implementation Plan](./implementation_plan.md) - Original project planning
- [Database Design](./DATABASE_AND_API_DESIGN.md) - Database schema and API design
- [Migration Guide](./MIGRATION_GUIDE.md) - Migration instructions

## 🏗️ Architecture

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Navigation**: Expo Router
- **Styling**: NativeWind (Tailwind CSS)

## 🧪 Current Status

✅ **Stable**: Authentication, user profiles, onboarding flow  
🔄 **Testing**: Data persistence across sign out/sign in  
⏳ **Planned**: Real-time messaging, photo storage, matching algorithm

See [Backend Master Documentation](./ROOMIES_BACKEND_MASTER.md) for detailed status and roadmap.

## 🛠️ Development

### Environment Setup
1. Copy environment variables from `app.config.js`
2. Ensure Supabase project is configured
3. Run database migrations if needed

### Testing
   ```bash
# Type checking
npx tsc --noEmit

# Run development server
npx expo start --clear
```

### Database Operations
```bash
# Generate types from Supabase
supabase gen types typescript --project-id hybyjgpcbcqpndxrquqv > types/database.ts

# Apply migrations
supabase db push
```

## 📱 Features

### Core Features
- [x] User authentication and profiles
- [x] Comprehensive onboarding flow
- [x] Personality assessment (MBTI-based)
- [x] Lifestyle preferences matching
- [x] Budget and location preferences
- [x] Photo upload and profile completion

### Planned Features
- [ ] Real-time messaging
- [ ] Advanced matching algorithm
- [ ] Push notifications
- [ ] Photo verification
- [ ] Premium features

### 🧠 **NEW: Personality Profile Section**
- **Visual MBTI Display**: Beautiful personality cards with custom illustrations for all 16 personality types
- **Animated Dimensions**: Interactive progress bars showing E/I, S/N, T/F, J/P personality dimensions  
- **Roommate Compatibility Insights**: Specific tips on how each personality type functions as a roommate
- **Expandable Details**: Tap to see full personality breakdown and compatibility information
- **Trait Integration**: Shows personality traits collected during onboarding

### Advanced Features
- **Premium Matching**: Enhanced algorithms and unlimited likes for premium users
- **Photo Management**: Upload and manage multiple profile and room photos
- **Lifestyle Matching**: Detailed compatibility based on cleanliness, noise level, sleep schedule, etc.
- **Location-Based Search**: Find roommates and places near your university
- **Verification System**: Verified profiles for trusted connections

## 🎨 Design Highlights

### Personality Section Design
- **Color-Coded Types**: Each MBTI type has its own unique color palette
- **Custom Illustrations**: Hand-crafted personality type characters
- **Smooth Animations**: Progress bars animate on load with staggered timing
- **Responsive Layout**: Mobile-first design with proper typography scaling
- **Interactive Elements**: Expandable sections with smooth transitions

### Overall UX
- **Modern Interface**: Clean, intuitive design following current mobile app trends
- **Accessibility**: Proper labels, semantic markup, and keyboard navigation
- **Performance**: Optimized animations and image loading
- **Cross-Platform**: Works seamlessly on iOS and Android

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase (PostgreSQL database, authentication, real-time)
- **Icons**: Lucide React Native
- **Animations**: React Native Reanimated
- **Storage**: AsyncStorage for local persistence

## 📱 Screenshots

### Personality Profile Feature
The personality section showcases each user's MBTI type with:
- Personality type illustration and description
- Animated dimension bars (Extroversion/Introversion, etc.)
- Roommate-specific compatibility tips
- Key personality traits from onboarding

### App Screens
- Onboarding flow with personality assessment
- Discovery feed with roommate and place cards
- Detailed profile views with personality insights
- Chat interface for matched users
- Settings and profile management

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Studio

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/roomies-app.git
cd roomies-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your Supabase credentials
```

4. Start the development server:
```bash
npm start
```

5. Run on your preferred platform:
```bash
npm run ios     # For iOS simulator
npm run android # For Android emulator
npm run web     # For web browser
```

## 🧪 Testing the Personality Feature

The app includes mock data with personality information for testing:

### Test Profiles
- **Ethan Garcia (INTJ)**: Strategic, independent, analytical personality
- **Jamie Rodriguez (ENFP)**: Creative, enthusiastic, social personality

### Testing Flow
1. Navigate to the discovery tab
2. View a roommate profile card
3. Tap to expand the detail view
4. Scroll to see the "Personality Profile" section
5. Tap the sparkle icon to expand dimensions and compatibility tips

## 📝 Development

### Project Structure
```
roomies/
├── app/                    # Main app screens (Expo Router)
├── components/            
│   ├── roommate/          # Roommate-specific components
│   │   ├── PersonalityDetailSection.tsx  # NEW: Personality section
│   │   └── RoommateDetailContent.tsx     # Updated with personality
│   └── shared/            # Reusable UI components
├── assets/
│   └── images/
│       └── personality/   # MBTI type illustrations
├── store/                 # Zustand state management
├── utils/                 # Helper functions and mock data
└── types/                 # TypeScript type definitions
```

### Key Files for Personality Feature
- `components/roommate/PersonalityDetailSection.tsx` - Main personality component
- `components/roommate/RoommateDetailContent.tsx` - Integration point
- `assets/images/personality/` - MBTI type illustrations
- `utils/mockDataSetup.ts` - Enhanced with personality test data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/roomies-app/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Future Enhancements

- Interactive personality dimension explanations
- Compatibility scoring with current user's personality
- Personality-based matching algorithm improvements
- Advanced personality insights and analytics
- Integration with additional personality frameworks (Big Five, Enneagram)

---

Built with ❤️ for university students looking for their perfect roommate match.

**For detailed backend information, architecture, and development guidelines, see [ROOMIES_BACKEND_MASTER.md](./ROOMIES_BACKEND_MASTER.md)**
