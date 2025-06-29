# Roomies Backend Refactor Master Plan 🏗️
## From Multi-Store Architecture to Supabase Single Source of Truth

---

## 📋 **EXECUTIVE SUMMARY**

This document outlines the complete migration from the current problematic multi-store architecture to a clean, Supabase-centered backend system. The refactor will eliminate persistent data synchronization issues, enable real-time functionality, and create a scalable foundation for production use.

**Migration Impact**: 3-hour systematic refactor that prevents cascading bugs and enables professional architecture.

---

## 🚨 **CURRENT ARCHITECTURE PROBLEMS**

### **The Core Issue: Data Persistence Crisis**

**Problem**: Even with `npx expo start --clear`, swipe history persists, showing fundamental architecture flaws.

**Evidence from logs**:
```
[DEBUG_FILTER] Liked profiles: 2 Array(2)
[DEBUG_FILTER] Excluding swiped profile: Jamie Rodriguez (user2)  
[DEBUG_FILTER] Excluding swiped profile: Marcus Johnson (user7)
```

### **Root Cause Analysis**

#### **1. Multiple Stores Managing Similar Data**
```
❌ roommateStore (local swipes + profiles)
   - Persistence: 'roomies-roommate-storage'
   - Contains: likedProfiles, dislikedProfiles, superLikedProfiles
   - Issue: Local-only, no Supabase sync

❌ matchesStore (legacy matches)
   - Persistence: 'matches-storage'
   - Contains: matches, pendingLikes
   - Issue: Disconnected from roommateStore swipes

❌ supabaseMatchesStore (conversations)
   - Persistence: 'supabase-matches-storage'  
   - Contains: conversation data only
   - Issue: Doesn't know about swipes/matches
```

#### **2. Data Flow Chaos**
```
Current Broken Flow:
Swipe → roommateStore (local) ❌ NO SYNC ❌ supabaseMatchesStore
         ↓
    Match Created Locally ❌ NOT IN SUPABASE
         ↓
    Conversation Lookup FAILS ❌ "Match not found"
```

#### **3. Persistence Issues**
- **Expo `--clear` doesn't clear Zustand persistent stores**
- **Manual store clearing required with specific names**
- **Data reappears after app restart**
- **No real-time synchronization**

#### **4. Technical Debt Symptoms**
- Match cards appear then disappear
- Context menus break after first use
- Navigation goes to wrong screens
- Conversations can't find their matches
- Cards reappear after swiping

---

## 🎯 **SOLUTION: SUPABASE SINGLE SOURCE OF TRUTH**

### **New Architecture Vision**

```
✅ UNIFIED DATA FLOW:
Swipe → Supabase Database → Real-time Update → UI Refresh
         ↓
    Match Instantly Available Everywhere
         ↓
    Conversation System Works Seamlessly
```

### **Benefits of Supabase Migration**

#### **Immediate Benefits**
- ✅ **Eliminates data synchronization bugs**
- ✅ **Real-time updates across devices**
- ✅ **No more persistence issues**
- ✅ **Single source of truth**

#### **Long-term Benefits**
- 🚀 **Scalable architecture for production**
- 🔄 **Cross-device synchronization**
- 🛡️ **Data integrity guarantees**
- 📱 **Multi-platform support ready**
- 🔍 **Better debugging and monitoring**

#### **Development Benefits**
- 🐛 **Fewer bugs to fix**
- 🧪 **Easier testing**
- 📚 **Cleaner codebase**
- 🔧 **Easier maintenance**

---

## 📊 **DATABASE DESIGN**

### **New Supabase Tables**

#### **1. swipes Table**
```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  swipe_type TEXT NOT NULL CHECK (swipe_type IN ('like', 'dislike', 'super_like')),
  swiped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure user can't swipe same person twice
  UNIQUE(user_id, target_user_id)
);

-- Indexes for performance
CREATE INDEX idx_swipes_user_id ON swipes(user_id);
CREATE INDEX idx_swipes_target_user_id ON swipes(target_user_id);
CREATE INDEX idx_swipes_swiped_at ON swipes(swiped_at);
```

#### **2. Enhanced matches Table**
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('regular', 'super', 'mixed')),
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  conversation_id UUID REFERENCES conversations(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure no duplicate matches
  UNIQUE(user1_id, user2_id)
);

-- Indexes for performance
CREATE INDEX idx_matches_user1_id ON matches(user1_id);
CREATE INDEX idx_matches_user2_id ON matches(user2_id);
CREATE INDEX idx_matches_matched_at ON matches(matched_at);
```

#### **3. Enhanced conversations Table**
```sql
-- Extend existing table
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS match_id UUID REFERENCES matches(id);
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ;
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_conversations_match_id ON conversations(match_id);
```

### **Real-time Subscriptions**
```sql
-- Enable real-time for swipes
ALTER TABLE swipes REPLICA IDENTITY FULL;

-- Enable real-time for matches  
ALTER TABLE matches REPLICA IDENTITY FULL;

-- Enable real-time for conversations
ALTER TABLE conversations REPLICA IDENTITY FULL;
```

---

## 🏗️ **IMPLEMENTATION PHASES**

### **Phase 1: Database Setup & Services (45 minutes)**

#### **Step 1.1: Create Database Tables (15 minutes)**
- [ ] Create `swipes` table with proper indexes
- [ ] Enhance `matches` table structure
- [ ] Update `conversations` table
- [ ] Enable real-time subscriptions
- [ ] Add Row Level Security (RLS) policies

#### **Step 1.2: Create Supabase Services (30 minutes)**
- [ ] `SupabaseSwipeService` - Handle all swipe operations
- [ ] `SupabaseMatchService` - Unified match management
- [ ] `SupabaseConversationService` - Enhanced conversation handling
- [ ] Real-time subscription utilities

### **Phase 2: Replace Local Swipe System (1 hour)**

#### **Step 2.1: Remove Local Swipe Tracking (20 minutes)**
- [ ] Remove `likedProfiles`, `dislikedProfiles`, `superLikedProfiles` from roommateStore
- [ ] Remove local swipe persistence
- [ ] Update store interface

#### **Step 2.2: Implement Supabase Swipe Flow (40 minutes)**
- [ ] Replace `likeProfile()` with Supabase call
- [ ] Replace `dislikeProfile()` with Supabase call  
- [ ] Replace `superLikeProfile()` with Supabase call
- [ ] Update filtering to use Supabase data
- [ ] Add real-time swipe subscriptions

### **Phase 3: Unified Match System (1 hour)**

#### **Step 3.1: Remove Legacy Match Store (20 minutes)**
- [ ] Remove `matchesStore` completely
- [ ] Update all imports to use `supabaseMatchesStore`
- [ ] Clean up redundant code

#### **Step 3.2: Enhance Supabase Match Store (40 minutes)**
- [ ] Extend for all match operations
- [ ] Add real-time match notifications
- [ ] Implement match creation logic
- [ ] Update conversation linking

### **Phase 4: UI & Navigation Updates (45 minutes)**

#### **Step 4.1: Update Match Card Components (25 minutes)**
- [ ] Fix navigation to use unified match system
- [ ] Update context menus for new data flow
- [ ] Fix back navigation issues

#### **Step 4.2: Update Conversation System (20 minutes)**
- [ ] Use unified match lookup
- [ ] Fix "Match not found" errors
- [ ] Ensure proper navigation flow

### **Phase 5: Testing & Cleanup (30 minutes)**

#### **Step 5.1: Integration Testing (20 minutes)**
- [ ] Test complete swipe → match → conversation flow
- [ ] Verify real-time updates
- [ ] Test data persistence

#### **Step 5.2: Code Cleanup (10 minutes)**
- [ ] Remove debug logging
- [ ] Clean up unused imports
- [ ] Update documentation

---

## 🛠️ **TECHNICAL IMPLEMENTATION DETAILS**

### **Service Layer Architecture**

#### **SupabaseSwipeService**
```typescript
export class SupabaseSwipeService {
  static async recordSwipe(userId: string, targetUserId: string, swipeType: 'like' | 'dislike' | 'super_like') {
    // Insert swipe record
    // Check for mutual like → create match
    // Return match result if created
  }
  
  static async getUserSwipes(userId: string) {
    // Get all swipes for filtering
  }
  
  static async checkMutualLike(userId: string, targetUserId: string) {
    // Check if target user also liked this user
  }
}
```

#### **SupabaseMatchService**
```typescript
export class SupabaseMatchService {
  static async createMatch(user1Id: string, user2Id: string, matchType: string) {
    // Create match record
    // Create conversation
    // Send real-time notification
  }
  
  static async getUserMatches(userId: string) {
    // Get all matches for user
  }
  
  static async getMatchById(matchId: string) {
    // Get specific match with user details
  }
}
```

### **Real-time Subscriptions**

#### **Match Notifications**
```typescript
// Subscribe to new matches
supabase
  .channel('matches')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'matches',
    filter: `user1_id=eq.${userId}`
  }, handleNewMatch)
  .subscribe();
```

#### **Swipe Updates**
```typescript
// Subscribe to swipe changes for real-time filtering
supabase
  .channel('swipes')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public', 
    table: 'swipes',
    filter: `user_id=eq.${userId}`
  }, updateFilteredProfiles)
  .subscribe();
```

### **Data Flow Diagrams**

#### **New Swipe Flow**
```
User Swipes Right on Jamie
         ↓
SupabaseSwipeService.recordSwipe()
         ↓
Insert into swipes table
         ↓
Check if Jamie also liked user
         ↓
If mutual like → SupabaseMatchService.createMatch()
         ↓
Real-time notification → UI update
         ↓
Navigation to conversation works seamlessly
```

#### **Profile Filtering Flow**
```
User opens Discover tab
         ↓
SupabaseSwipeService.getUserSwipes()
         ↓
Filter profiles excluding swiped users
         ↓
Real-time subscription updates on new swipes
         ↓
UI automatically refreshes filtered list
```

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests**
- [ ] SupabaseSwipeService methods
- [ ] SupabaseMatchService methods
- [ ] Data transformation functions
- [ ] Error handling scenarios

### **Integration Tests**
- [ ] Complete swipe → match → conversation flow
- [ ] Real-time subscription functionality
- [ ] Data persistence across app restarts
- [ ] Multi-user swipe scenarios

### **Manual Testing Scenarios**
1. **Basic Swipe Flow**
   - Swipe right → check Supabase record
   - Swipe left → verify filtering
   - Super like → check match type

2. **Match Creation**
   - Mutual like → verify match creation
   - Navigate to conversation → verify functionality
   - Real-time match notification

3. **Data Persistence**
   - Restart app → verify swipes persist
   - Clear app data → verify clean state
   - Multiple devices → verify sync

### **Performance Testing**
- [ ] Profile filtering with large datasets
- [ ] Real-time subscription performance
- [ ] Database query optimization
- [ ] Memory usage optimization

---

## 🚀 **MIGRATION EXECUTION PLAN**

### **Pre-Migration Checklist**
- [ ] Backup current database
- [ ] Create development branch
- [ ] Set up test environment
- [ ] Document current functionality

### **Migration Day Timeline**

#### **Hour 1: Database & Services**
- 0:00-0:15 - Create Supabase tables
- 0:15-0:45 - Implement service layer
- 0:45-1:00 - Test service functions

#### **Hour 2: Replace Swipe System**
- 1:00-1:20 - Remove local swipe tracking
- 1:20-2:00 - Implement Supabase swipe flow

#### **Hour 3: Unified Matches & Testing**
- 2:00-2:20 - Remove legacy match store
- 2:20-2:40 - Enhance Supabase match store
- 2:40-3:00 - Integration testing

### **Post-Migration Validation**
- [ ] All swipe actions work correctly
- [ ] Matches are created properly
- [ ] Conversations link correctly
- [ ] Real-time updates function
- [ ] No data persistence issues
- [ ] Performance is acceptable

---

## 📈 **SUCCESS METRICS**

### **Technical Metrics**
- ✅ Zero "Match not found" errors
- ✅ Real-time updates working
- ✅ No card reappearing issues
- ✅ Context menus remain functional
- ✅ Navigation works consistently

### **Code Quality Metrics**
- ✅ Reduced code complexity
- ✅ Eliminated redundant stores
- ✅ Improved error handling
- ✅ Better test coverage

### **User Experience Metrics**
- ✅ Consistent swipe behavior
- ✅ Reliable match notifications
- ✅ Smooth navigation flow
- ✅ No data loss issues

---

## 🔧 **ROLLBACK PLAN**

### **If Migration Fails**
1. **Immediate Rollback**
   - Restore previous code from git
   - Revert database schema changes
   - Test basic functionality

2. **Partial Migration Issues**
   - Identify specific failing component
   - Rollback only that component
   - Continue with working parts

3. **Data Recovery**
   - Restore from backup if needed
   - Verify data integrity
   - Re-test core functionality

---

## 📚 **DOCUMENTATION UPDATES**

### **Files to Update**
- [ ] `README.md` - Architecture overview
- [ ] `implementation_plan.md` - Progress tracking
- [ ] API documentation - Service layer docs
- [ ] Component documentation - Updated data flows

### **New Documentation**
- [ ] Supabase schema documentation
- [ ] Service layer API reference
- [ ] Real-time subscription guide
- [ ] Troubleshooting guide

---

## 🎯 **CONCLUSION**

This backend refactor represents a fundamental shift from problematic multi-store architecture to a professional, scalable system. The 3-hour investment will eliminate current bugs, prevent future issues, and create a solid foundation for production deployment.

**Key Benefits Summary**:
- 🐛 **Eliminates all current data sync bugs**
- 🚀 **Enables real-time functionality** 
- 🏗️ **Creates scalable architecture**
- 🔒 **Ensures data integrity**
- 🧪 **Simplifies testing and debugging**

**This is the RIGHT architectural decision for long-term success.**

---

## 📋 **NEXT STEPS**

1. **Review and approve this plan**
2. **Create development branch**
3. **Begin Phase 1: Database setup**
4. **Execute systematic migration**
5. **Test and validate results**

**Ready to build the backend right? Let's make Roomies production-ready! 🚀** 