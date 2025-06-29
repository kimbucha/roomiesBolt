# Documentation Index - Current Tasks & Messaging System

## 🎯 **Current Task Documentation** (Essential Reading)

### 🚀 **Start Here - Current Work**
1. **`docs/implementation/CURRENT_TASK.md`** - Current objective, status, and testing instructions
2. **`docs/migrations/SUPABASE_MIGRATION_STATUS.md`** - Detailed migration progress and technical status
3. **`README.md`** - Project overview with focus on messaging system

### 🔧 **Technical Guides**
- **`docs/COMPONENT_GUIDE.md`** - Key components for messaging system
- **Feature Flags**: Check `constants/featureFlags.ts` for `UNIFIED_MESSAGES` setting

## 📁 **Updated File Organization**

### ✅ **Active Files** (Work with these)
```
docs/implementation/CURRENT_TASK.md            # Current objective
docs/migrations/SUPABASE_MIGRATION_STATUS.md   # Migration status
README.md                                       # Project overview
docs/COMPONENT_GUIDE.md                        # Component reference
docs/status/IMPLEMENTATION_STATUS.md           # Legacy status (reference only)
```

### 🆕 **New Organized Structure**
- **`docs/messaging/`** - All messaging system documentation
- **`docs/fixes/`** - Critical fixes and resolutions
- **`docs/implementation/`** - Implementation plans and current tasks
- **`supabase/fixes/`** - All SQL fix scripts (moved from root)
- **`supabase/schemas/`** - Database schemas

### 🗄️ **Archived Files** (Reference only)
```
archive/                           # Old planning documents
docs/archive/                      # Old component docs
```

## 🎯 **Quick Navigation - Current Work**

### Current Status Check:
```bash
# View current task
cat docs/implementation/CURRENT_TASK.md

# Check migration status
cat docs/migrations/SUPABASE_MIGRATION_STATUS.md

# Verify feature flag
grep "UNIFIED_MESSAGES" constants/featureFlags.ts
```

### Testing the Fix:
1. `npx expo start`
2. Navigate to Matches tab
3. Tap Jamie Rodriguez's card
4. Verify conversation opens without errors

### Database Fixes:
```bash
# Check organized SQL fixes
ls supabase/fixes/

# View Supabase organization
cat supabase/README.md
```

## 💬 **Messaging System Focus**

All messaging-related documentation now organized in:
- **`docs/messaging/`** - Complete messaging system documentation
- **`supabase/fixes/`** - Database fix scripts
- **`docs/implementation/CURRENT_TASK.md`** - Current active work

## 🚫 **What to Ignore**
- Files in `archive/` directories  
- Old planning documents
- Unrelated feature documentation
- Anything not mentioned in current task files

## 📋 **Complete Documentation Index**
For full project documentation structure, see: **`docs/INDEX.md`**

---
**🎯 Rule**: Focus on files in `docs/implementation/` and `docs/messaging/`  
**📋 Current Priority**: Complete the messaging system migration (90% → 100%)  
**🗂️ Full Index**: See `docs/INDEX.md` for complete project documentation
 