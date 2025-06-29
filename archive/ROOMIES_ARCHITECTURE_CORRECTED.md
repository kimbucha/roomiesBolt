# Roomies Architecture - CORRECTED FOR DUAL-PURPOSE MODEL 🏗️
## Properly Designed for Roommate + Place Finding

---

## 🎯 **ROOMIES APP UNDERSTANDING**

Roomies is a **dual-purpose mobile app** that helps people:
1. **Find roommates** to live with
2. **Find available places** to rent
3. **Browse both people AND places** in the same discovery flow
4. **Swipe on potential roommates OR places**
5. **Chat with roommates and place owners**

### **User Types:**
- **`roommate_seeker`**: Looking for places/roommates  
- **`place_lister`**: Has a place, looking for roommates
- **`both`**: Flexible (can list places AND seek roommates)

---

## 🗄️ **CORRECTED DATABASE ARCHITECTURE**

### **Key Insight: Places = Special Roommate Profiles**
In Roomies, **places are stored as `roommate_profiles`** with `hasPlace: true`. This unified approach means:
- ✅ Users swipe on **profiles** (not just users)
- ✅ Profiles can represent **people OR places**
- ✅ Same swipe/match logic works for both
- ✅ Conversations work the same way

### **Corrected Schema Design**

#### **1. Swipes Table** ✅ **FIXED**
```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),           -- User doing the swipe
  target_profile_id UUID REFERENCES roommate_profiles(id), -- Profile being swiped
  swipe_type TEXT CHECK (swipe_type IN ('like', 'dislike', 'super_like')),
  swiped_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, target_profile_id) -- Can't swipe same profile twice
);
```

**Why This Works:**
- ✅ Handles both user profiles AND place profiles
- ✅ Single table for all swipe tracking
- ✅ Replaces the problematic local swipe arrays

#### **2. Matches Table** ✅ **FIXED**
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),           -- User who initiated
  target_profile_id UUID REFERENCES roommate_profiles(id), -- Matched profile
  target_user_id UUID REFERENCES users(id),    -- User behind profile (NULL for places)
  match_type TEXT CHECK (match_type IN ('regular', 'super', 'mixed', 'place_interest')),
  is_mutual BOOLEAN DEFAULT false,             -- True when both parties interested
  conversation_id UUID REFERENCES conversations(id),
  matched_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, target_profile_id)
);
```

**Match Types:**
- **`regular`**: Both users liked each other
- **`super`**: One super-liked, other liked
- **`mixed`**: Super-like + regular like
- **`place_interest`**: User interested in place (owner can accept/decline)

#### **3. Enhanced Conversations** ✅ **UNCHANGED**
```sql
-- Already properly designed
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ
);
```

---

## 🔄 **ROOMIES SWIPE & MATCH FLOWS**

### **Flow 1: User-to-User (Roommate Seeking)**
```
1. User A swipes right on User B's profile
   → INSERT INTO swipes (user_id=A, target_profile_id=B_profile, swipe_type='like')

2. Check if User B already liked User A
   → Query swipes WHERE user_id=B AND target_profile_id=A_profile

3. If mutual like found:
   → INSERT INTO matches (user_id=A, target_profile_id=B_profile, target_user_id=B, is_mutual=true)
   → CREATE conversation
   → Send real-time notification
```

### **Flow 2: User-to-Place (Place Interest)**
```
1. User A swipes right on Place X (owned by User B)
   → INSERT INTO swipes (user_id=A, target_profile_id=X_profile, swipe_type='like')

2. Create place interest match:
   → INSERT INTO matches (user_id=A, target_profile_id=X_profile, target_user_id=B, 
                         match_type='place_interest', is_mutual=false)

3. Place owner (User B) can:
   → Accept: UPDATE matches SET is_mutual=true → CREATE conversation
   → Decline: UPDATE matches SET is_active=false
```

### **Flow 3: Discovery Filtering**
```
1. Get user's swipe history:
   → SELECT target_profile_id FROM swipes WHERE user_id = current_user

2. Filter discovery feed:
   → SELECT * FROM roommate_profiles 
     WHERE id NOT IN (swiped_profile_ids)
     AND [other filters]

3. Real-time updates when new swipes occur
```

---

## 🚀 **MIGRATION BENEFITS FOR ROOMIES**

### **Eliminates Current Issues:**
- ✅ **No more "Jamie Rodriguez excluded" persistence bugs**
- ✅ **Real-time swipe filtering works across app restarts**
- ✅ **Unified match system for users AND places**
- ✅ **Conversations always find their matches**
- ✅ **No more data synchronization conflicts**

### **Enables New Functionality:**
- 🔄 **Real-time match notifications**
- 📱 **Cross-device swipe synchronization**  
- 🏠 **Place owner match management dashboard**
- 💬 **Seamless user-to-place conversations**
- 📊 **Analytics on swipe patterns**

---

## 🛠️ **SERVICE LAYER FOR ROOMIES**

### **SupabaseSwipeService**
```typescript
export class SupabaseSwipeService {
  // Handle swiping on ANY profile (user or place)
  static async recordSwipe(userId: string, targetProfileId: string, swipeType: SwipeType) {
    // 1. Insert swipe record
    const { data: swipe } = await supabase
      .from('swipes')
      .insert({ user_id: userId, target_profile_id: targetProfileId, swipe_type: swipeType });

    // 2. Check for mutual interest
    if (swipeType === 'like' || swipeType === 'super_like') {
      return await this.checkForMatch(userId, targetProfileId, swipeType);
    }
  }
  
  // Get profiles to exclude from discovery
  static async getSwipedProfiles(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('swipes')
      .select('target_profile_id')
      .eq('user_id', userId);
      
    return data?.map(s => s.target_profile_id) || [];
  }
}
```

### **SupabaseMatchService**
```typescript
export class SupabaseMatchService {
  // Create match for user-to-user OR user-to-place
  static async createMatch(userId: string, targetProfileId: string, matchType: string) {
    // Get profile details to determine if it's a user or place
    const profile = await this.getProfileDetails(targetProfileId);
    
    const matchData = {
      user_id: userId,
      target_profile_id: targetProfileId,
      target_user_id: profile.user_id, // The owner of the profile
      match_type: matchType,
      is_mutual: matchType !== 'place_interest' // Places start as non-mutual
    };
    
    // Create match and conversation
    const match = await supabase.from('matches').insert(matchData);
    
    if (matchData.is_mutual) {
      await this.createConversation(match.id);
    }
    
    return match;
  }
}
```

---

## ✅ **VALIDATION: PERFECT FIT FOR ROOMIES**

### **Handles All Roomies Use Cases:**
- ✅ **Roommate seeker swipes on people** → User-to-user matches
- ✅ **Roommate seeker swipes on places** → User-to-place interest  
- ✅ **Place owner gets notifications** → Place interest management
- ✅ **Both parties can chat** → Unified conversation system
- ✅ **Real-time updates work** → Supabase subscriptions
- ✅ **No data persistence issues** → Single source of truth

### **Scales with Roomies Growth:**
- 🚀 **Multi-user place applications**
- 📊 **Place owner analytics dashboard**
- 🔍 **Advanced matching algorithms**
- 📱 **Mobile + web synchronization**
- 🌍 **Multi-market expansion ready**

---

## 🎯 **NEXT STEPS: EXECUTE THE CORRECTED MIGRATION**

1. **✅ DONE**: Corrected database schema
2. **🔄 NEXT**: Run migrations to create tables
3. **🔄 NEXT**: Implement corrected service layer
4. **🔄 NEXT**: Replace local swipe tracking
5. **🔄 NEXT**: Test complete user + place flows

**This corrected architecture properly supports Roomies' dual-purpose model and eliminates all current data synchronization issues!**

---

**Ready to run the corrected migrations? 🚀** 