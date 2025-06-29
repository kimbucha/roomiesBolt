import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';
import { Alert } from 'react-native';

/**
 * Utility to migrate all app data from AsyncStorage to Supabase
 * This should be used during the transition period
 */
export const migrateAllDataToSupabase = async (userId: string) => {
  try {
    console.log('[Migration] Starting full data migration to Supabase...');
    
    // Migrate matches
    await migrateMatchesToSupabase(userId);
    
    // Migrate messages
    await migrateMessagesToSupabase(userId);
    
    // Clear AsyncStorage data after successful migration
    // Uncomment when ready to fully transition
    // await clearAsyncStorageData();
    
    console.log('[Migration] Full data migration completed successfully');
    return { success: true };
    
  } catch (error: any) {
    console.error('[Migration] Error during full data migration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Migrate matches data from AsyncStorage to Supabase
 */
export const migrateMatchesToSupabase = async (userId: string) => {
  try {
    console.log('[Migration] Starting matches migration...');
    
    // Get matches data from AsyncStorage
    const matchesDataString = await AsyncStorage.getItem('roomies-matches-storage');
    if (!matchesDataString) {
      console.log('[Migration] No matches data found in AsyncStorage');
      return { success: true, message: 'No matches data to migrate' };
    }
    
    // Parse the matches data
    const matchesData = JSON.parse(matchesDataString);
    if (!matchesData.state || !matchesData.state.matches) {
      console.log('[Migration] Invalid matches data format in AsyncStorage');
      return { success: true, message: 'Invalid matches data format' };
    }
    
    const matches = matchesData.state.matches;
    console.log(`[Migration] Found ${matches.length} matches to migrate`);
    
    // Insert each match into Supabase
    for (const match of matches) {
      // Skip if either user ID is missing
      if (!match.user1Id || !match.user2Id) {
        console.log('[Migration] Skipping match with missing user ID');
        continue;
      }
      
      // Check if match already exists in Supabase
      const { data: existingMatch, error: checkError } = await supabase
        .from('matches')
        .select('id')
        .or(`user1_id.eq.${match.user1Id},user1_id.eq.${match.user2Id}`)
        .or(`user2_id.eq.${match.user1Id},user2_id.eq.${match.user2Id}`)
        .maybeSingle();
        
      if (checkError) {
        console.error('[Migration] Error checking for existing match:', checkError);
        continue;
      }
      
      if (existingMatch) {
        console.log('[Migration] Match already exists in Supabase');
        continue;
      }
      
      // Insert the match into Supabase
      const { error: insertError } = await supabase
        .from('matches')
        .insert({
          user1_id: match.user1Id,
          user2_id: match.user2Id,
          status: match.status || 'pending',
          created_at: match.createdAt || new Date().toISOString(),
          updated_at: match.updatedAt || new Date().toISOString(),
          user1_action: match.user1Action || null,
          user2_action: match.user2Action || null
        });
        
      if (insertError) {
        console.error('[Migration] Error inserting match:', insertError);
      }
    }
    
    console.log('[Migration] Matches migration completed successfully');
    return { success: true };
    
  } catch (error: any) {
    console.error('[Migration] Error during matches migration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Migrate messages data from AsyncStorage to Supabase
 */
export const migrateMessagesToSupabase = async (userId: string) => {
  try {
    console.log('[Migration] Starting messages migration...');
    
    // Get messages data from AsyncStorage
    const messagesDataString = await AsyncStorage.getItem('roomies-messages-storage');
    if (!messagesDataString) {
      console.log('[Migration] No messages data found in AsyncStorage');
      return { success: true, message: 'No messages data to migrate' };
    }
    
    // Parse the messages data
    const messagesData = JSON.parse(messagesDataString);
    if (!messagesData.state || !messagesData.state.conversations) {
      console.log('[Migration] Invalid messages data format in AsyncStorage');
      return { success: true, message: 'Invalid messages data format' };
    }
    
    const conversations = messagesData.state.conversations;
    console.log(`[Migration] Found ${conversations.length} conversations to migrate`);
    
    // Insert each conversation and its messages into Supabase
    for (const conversation of conversations) {
      // Skip if conversation ID is missing
      if (!conversation.id) {
        console.log('[Migration] Skipping conversation with missing ID');
        continue;
      }
      
      // Get the other participant (not the current user)
      const otherParticipant = conversation.participants.find(
        (p: any) => p.id !== userId && p.id !== 'currentUser' && p.id !== 'current-user'
      );
      
      if (!otherParticipant) {
        console.log('[Migration] Skipping conversation with no other participant');
        continue;
      }
      
      // Check if a match exists between these users
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .or(`user1_id.eq.${userId},user1_id.eq.${otherParticipant.id}`)
        .or(`user2_id.eq.${userId},user2_id.eq.${otherParticipant.id}`)
        .maybeSingle();
        
      if (matchError) {
        console.error('[Migration] Error checking for match:', matchError);
        continue;
      }
      
      if (!matchData) {
        console.log('[Migration] No match found for conversation, creating one...');
        
        // Create a match if one doesn't exist
        const { data: newMatch, error: createMatchError } = await supabase
          .from('matches')
          .insert({
            user1_id: userId,
            user2_id: otherParticipant.id,
            status: 'matched',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user1_action: 'like',
            user2_action: 'like'
          })
          .select('id')
          .single();
          
        if (createMatchError) {
          console.error('[Migration] Error creating match:', createMatchError);
          continue;
        }
        
        // Use the new match ID
        if (newMatch) {
          const matchId = newMatch.id;
          
          // Migrate messages for this conversation
          await migrateConversationMessages(conversation, matchId, userId);
        }
      } else {
        // Use the existing match ID
        const matchId = matchData.id;
        
        // Migrate messages for this conversation
        await migrateConversationMessages(conversation, matchId, userId);
      }
    }
    
    console.log('[Migration] Messages migration completed successfully');
    return { success: true };
    
  } catch (error: any) {
    console.error('[Migration] Error during messages migration:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper function to migrate messages for a specific conversation
 */
const migrateConversationMessages = async (conversation: any, matchId: string, userId: string) => {
  try {
    // Skip if no messages
    if (!conversation.messages || conversation.messages.length === 0) {
      console.log('[Migration] No messages to migrate for conversation');
      return;
    }
    
    console.log(`[Migration] Migrating ${conversation.messages.length} messages for conversation`);
    
    // Insert each message into Supabase
    for (const message of conversation.messages) {
      // Skip if message content is missing
      if (!message.content) {
        continue;
      }
      
      // Determine sender ID
      const senderId = message.senderId === 'currentUser' || message.senderId === 'current-user' 
        ? userId 
        : message.senderId;
      
      // Check if message already exists
      const { data: existingMessage, error: checkError } = await supabase
        .from('messages')
        .select('id')
        .eq('match_id', matchId)
        .eq('sender_id', senderId)
        .eq('content', message.content)
        .eq('created_at', message.timestamp || message.createdAt)
        .maybeSingle();
        
      if (checkError) {
        console.error('[Migration] Error checking for existing message:', checkError);
        continue;
      }
      
      if (existingMessage) {
        console.log('[Migration] Message already exists in Supabase');
        continue;
      }
      
      // Insert the message into Supabase
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          match_id: matchId,
          sender_id: senderId,
          content: message.content,
          created_at: message.timestamp || message.createdAt || new Date().toISOString(),
          is_read: message.isRead || false
        });
        
      if (insertError) {
        console.error('[Migration] Error inserting message:', insertError);
      }
    }
    
  } catch (error: any) {
    console.error('[Migration] Error migrating conversation messages:', error);
  }
};

/**
 * Clear AsyncStorage data after successful migration
 * CAUTION: Only use this when fully transitioning to Supabase
 */
export const clearAsyncStorageData = async () => {
  try {
    console.log('[Migration] Clearing AsyncStorage data...');
    
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Filter for Roomies-specific keys
    const roomiesKeys = keys.filter(key => key.startsWith('roomies-'));
    
    if (roomiesKeys.length > 0) {
      // Ask for confirmation before clearing
      const shouldClear = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Clear Local Data',
          `Are you sure you want to clear ${roomiesKeys.length} items from local storage? This cannot be undone.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'Clear Data',
              style: 'destructive',
              onPress: () => resolve(true)
            }
          ]
        );
      });
      
      if (shouldClear) {
        // Clear all Roomies-specific keys
        await AsyncStorage.multiRemove(roomiesKeys);
        console.log(`[Migration] Cleared ${roomiesKeys.length} items from AsyncStorage`);
        return { success: true, count: roomiesKeys.length };
      } else {
        console.log('[Migration] Data clearing cancelled by user');
        return { success: false, message: 'Cancelled by user' };
      }
    } else {
      console.log('[Migration] No Roomies data found in AsyncStorage');
      return { success: true, count: 0 };
    }
    
  } catch (error: any) {
    console.error('[Migration] Error clearing AsyncStorage data:', error);
    return { success: false, error: error.message };
  }
};
