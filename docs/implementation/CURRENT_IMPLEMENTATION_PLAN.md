# Current Implementation Plan - Roomies Critical Issues Fix

## 🎯 **Objective**: Fix the 3 critical bugs identified by user

### **Original Issues to Fix:**
1. **"Test User" appearing in messages without any message being sent**
2. **Back navigation from message lobby redirecting to discovery instead of matches tab**  
3. **Jamie reappearing in discovery after being swiped on**

## 📊 **Current Status Assessment**

### ✅ **Completed (Architecture Ready)**
- Feature flags system (`UNIFIED_MESSAGES: true`)
- Unified store interface (`hooks/useConversationsStore.ts`)
- NavigationService enhancements  
- Database migration scripts exist
- Supabase credentials configured

### ❌ **Critical Blockers**
- Database tables don't exist (migrations not applied)
- Supabase conversations store incomplete
- Legacy system bugs still present

## 🚀 **IMMEDIATE ACTION PLAN**

### **Phase 1: Fix Legacy System Bugs (PRIORITY 1)** 🐛
*Reason: Get immediate working solution while database is being set up*

#### 1.1 Fix "Test User" Issue  
- **File**: `store/messageStore.ts`
- **Problem**: Empty conversations created with placeholder participants
- **Fix**: Prevent conversation creation without actual message intent

#### 1.2 Fix Navigation Issue
- **File**: `app/conversation/[id].tsx` 
- **Problem**: Back navigation goes to discovery instead of matches
- **Fix**: Ensure proper NavigationService usage

#### 1.3 Fix Profile Reappearing Issue
- **File**: `store/roommateStore.ts`
- **Problem**: Swipe history fallback allows re-showing swiped profiles
- **Fix**: Ensure swipe persistence

### **Phase 2: Database Setup (PRIORITY 2)** 🏗️  
*Reason: Enable Supabase store for future migrations*

#### 2.1 Apply Database Migrations
- Run the comprehensive migration files
- Test database connection
- Verify table creation

#### 2.2 Complete Supabase Store Implementation
- **File**: `store/supabaseConversationsStore.ts`
- Add missing CRUD operations
- Implement real-time subscriptions

### **Phase 3: Test and Validate (PRIORITY 3)** 🧪
- Test Jamie Rodriguez flow with legacy fixes
- Verify unified store switching works
- Test migration rollback scenarios

## 🔧 **IMPLEMENTATION DETAILS**

### **Legacy Store Fixes**

#### Fix 1: Prevent "Test User" Creation
```typescript
// In store/messageStore.ts - createConversation method
// BEFORE: Always creates conversation with placeholder participants
// AFTER: Only create when participants are properly resolved

const createConversation = async (participantIds: string[], matchId?: string) => {
  // Validate all participants are real before creating
  const validParticipants = await resolveRealParticipants(participantIds, matchId);
  if (validParticipants.length < 2) {
    console.log('[MessageStore] Skipping conversation creation - insufficient valid participants');
    return null;
  }
  // Continue with creation...
}
```

#### Fix 2: Ensure Proper Navigation
```typescript
// In app/conversation/[id].tsx
// BEFORE: router.back() goes to wrong screen
// AFTER: NavigationService.backToMatches()

const handleBackPress = () => {
  NavigationService.backToMatches();
};
```

#### Fix 3: Fix Swipe History Persistence  
```typescript
// In store/roommateStore.ts - getFilteredProfiles method
// BEFORE: Fallback ignores swipe history when no profiles remain
// AFTER: Never ignore swipe history, show empty state instead

const getFilteredProfiles = () => {
  const filtered = profiles.filter(profile => 
    !likedProfiles.includes(profile.id) && 
    !dislikedProfiles.includes(profile.id) &&
    !superLikedProfiles.includes(profile.id)
  );
  
  // NEVER fall back to showing swiped profiles
  return filtered; // Return empty array if no unswiped profiles
};
```

## 🧪 **Testing Protocol**

### **Test Case: Jamie Rodriguez Flow**
1. Start app in legacy mode (`UNIFIED_MESSAGES: false`)
2. Swipe right on Jamie Rodriguez  
3. Tap her match card
4. **Expected**: 
   - ✅ Conversation opens showing "Jamie Rodriguez" (not "Test User")
   - ✅ Back navigation goes to matches tab
   - ✅ Jamie doesn't reappear in discovery

### **Test Case: Store Migration**
1. Test legacy mode works (above test passes)
2. Switch to unified mode (`UNIFIED_MESSAGES: true`)
3. **Expected**: Same behavior with Supabase backend

## 📁 **Files to Modify**

### **Immediate Fixes (Phase 1)**
- `store/messageStore.ts` - Fix conversation creation logic
- `app/conversation/[id].tsx` - Fix navigation
- `store/roommateStore.ts` - Fix swipe history filtering

### **Database Setup (Phase 2)**  
- Apply migrations in `supabase/migrations/`
- Complete `store/supabaseConversationsStore.ts`

## 🎯 **Success Criteria**

- ✅ No "Test User" appears in any conversations
- ✅ Back navigation always goes to matches tab  
- ✅ Swiped profiles never reappear in discovery
- ✅ Database migrations applied successfully
- ✅ Feature flag switching works properly

---

**NEXT STEP**: Implement Phase 1 fixes in legacy system for immediate results. 