# Supabase Database Management

This directory contains all Supabase-related database files, migrations, and SQL scripts for the Roomies app.

## 📁 Directory Structure

### 🗄️ Schema (`/schemas`)
Database schema definitions:
- `schema.sql` - Main database schema (moved to schemas/ for organization)

### 🔧 Fixes (`/fixes`)
Critical database fixes and maintenance scripts:
- `COMPREHENSIVE_ONBOARDING_FIX.sql` - Complete onboarding system database fix
- `CRITICAL_DATABASE_FIX_FINAL.sql` - Critical database fixes (366 lines)
- `MISSING_COLUMNS_FIX.sql` - Missing columns fix script
- `complete_fix.sql` - Complete system fix script
- `full_user_cleanup.sql` - User data cleanup script
- `check_rpc_function.sql` - RPC function verification
- `fixed_rpc_function.sql` - Fixed RPC function implementations
- `fixed_user_cleanup.sql` - Fixed user cleanup procedures

### 🚀 Migrations (`/migrations`)
Structured database migrations (chronological):
- `001_add_missing_user_columns.sql` - Add missing user table columns
- `002_add_personality_traits_column.sql` - Add personality traits support
- `003_add_company_role_columns.sql` - Add company and role columns
- `20250107_*` - January 2025 migration batch
- `20250115_*` - January 2025 messaging system migrations
- `20250617_*` - June 2025 notification and conversation enhancements

### ⚙️ Functions (`/functions`)
Supabase Edge Functions:
- `delete-user/` - User deletion functionality

### 🔄 Auto Scripts (Root Level)
Automated database maintenance:
- `auto_profile_trigger.sql` - Automatic profile creation triggers
- `enhanced_auto_profile_trigger.sql` - Enhanced profile automation
- `create_user_profile_function.sql` - User profile creation function
- `delete_user_functions.sql` - User deletion functions
- `auto_confirm_emails.sql` - Email auto-confirmation setup

### 📊 Column Management (Root Level)
Database structure management:
- `add_missing_columns.sql` - Add missing table columns
- `add_complex_columns.sql` - Add complex data type columns
- `add_completed_steps_column.sql` - Add onboarding progress tracking

## 🚀 Getting Started

### For Database Setup
1. Run `schema.sql` to set up the base database structure
2. Execute migrations in chronological order (use migration folder)
3. Apply any necessary fixes from the `/fixes` folder

### For Emergency Fixes
- Use files in `/fixes` folder for critical database issues
- `CRITICAL_DATABASE_FIX_FINAL.sql` is the most comprehensive fix

### For Development
- Add new migrations to `/migrations` with proper naming convention
- Use format: `YYYYMMDD_description.sql` or numbered sequence
- Test all changes in development environment first

## 🔧 Migration Best Practices

### Naming Convention
- Use timestamp prefix: `YYYYMMDD_descriptive_name.sql`
- Or sequential numbering: `001_descriptive_name.sql`
- Keep descriptions clear and specific

### Migration Structure
1. **Schema Changes** - Table structure modifications
2. **Data Migrations** - Data transformation scripts  
3. **Function Updates** - Stored procedure changes
4. **Index Optimizations** - Performance improvements
5. **RLS Policies** - Row Level Security updates

### Safety Guidelines
- Always backup before running migrations
- Test in development environment first
- Use transactions for complex migrations
- Document all changes thoroughly

## 📋 Current Status

### Active Issues
- Check `/fixes` folder for any unresolved database issues
- Monitor migration logs for any failed executions

### Recent Updates
- Messaging system completely revised (January 2025)
- Enhanced notification fields (June 2025)
- Comprehensive onboarding fixes applied

## 🔍 Troubleshooting

### Common Issues
1. **Duplicate Users**: Use `CRITICAL_DATABASE_FIX_FINAL.sql`
2. **Missing Columns**: Apply appropriate migration from `/migrations`
3. **Function Errors**: Check and update functions in `/functions`

### Debug Process
1. Check logs in Supabase dashboard
2. Verify schema matches expected structure
3. Run appropriate fix scripts from `/fixes`
4. Re-run failed migrations if necessary

---

*All SQL files are organized for easy maintenance and deployment. Always test changes in development first.* 