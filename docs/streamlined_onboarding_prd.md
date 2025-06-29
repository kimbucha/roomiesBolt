# Lean PRD Outline: Streamlined Onboarding & Rewards

## 1. Problem Statement  
Users drop off during our 8-step flow. We need to cut friction by surfacing only 2 required fields up front and turning the rest into optional, reward-driven “quests.”

---

## 2. Objectives & Success Metrics  
- **↑ Onboarding completion** by ≥20%  
- **↓ Time-to-first-action** (name→email) to <1 min  
- **≥30% DAU engagement** with daily quests  
- **≥X referrals/month**  

---

## 3. Core User Flow  
1. **Step 1 (Required)**: Enter name  
2. **Step 2 (Required)**: Email + password  
3. **Onboarding complete** → launch main app (Discover)

---

## 4. Optional Quests & Rewards  
- **Rotating daily quest**: one leftover profile task (photo, bio, budget, etc.) → +25 XP  
- **Referral mega-quest**: invite a friend → +100 XP + 30 days premium  
- **XP redemption**: 50 XP → peek who liked you or +1 swipe  
- **Badge tiers**: Bronze (50 XP), Silver (150 XP), Gold (300 XP)  

---

## 5. High-Level UI Changes  
### Onboarding header  
- Top-right ghost button: **Skip for now** ↔ **→ Continue**  
- Mini-step pill: `Next: Upload Photo (2/6)` shown until skipped  

### Discover screen  
- Replace refresh icon with treasure-chest next to filter  
- Red dot + wiggle on new rewards  
- Bottom sheet on tap: daily quest + referral status  

---

## 6. Technical & Design Notes  
- New `MiniStepHeader` component (props: `questText`, `step/total`, `onSkip`, `onContinue`)  
- Use React Native `Animated.View` for fade/slide toggle  
- Persist quest progress in `userStore` (Zustand)  
- Referral link generation + XP grant handled server-side  

---

## 7. Next Steps & Timeline  
1. Wireframes for header & chest icon (1d)  
2. Tech spec & task breakdown (0.5d)  
3. Implement core 2-step flow + UI components (2d)  
4. Hook up XP logic & bottom sheet (1d)  
5. QA + analytics instrumentation (1d)  
6. Release & monitor metrics (ongoing)
