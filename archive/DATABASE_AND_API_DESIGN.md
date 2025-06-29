# Roomies Backend: Database and API Design

This document outlines the proposed database organization, data operations architecture, and backend API endpoints for the Roomies application. This design is intended for a future backend implementation using a NoSQL database like MongoDB.

## 1. Database Organization (MongoDB)

We will use MongoDB as the database. The main collections will be:

### 1.1. `users` Collection

Stores core user authentication and account information.

*   **Document Structure:**
    ```json
    {
      "_id": "ObjectId", // Unique user identifier (Primary Key)
      "email": "String", // User's email address (unique, indexed)
      "passwordHash": "String", // Hashed password for security
      "profileId": "ObjectId", // Reference to the user's profile in the 'profiles' collection
      "createdAt": "Timestamp", // Account creation timestamp
      "updatedAt": "Timestamp", // Last account update timestamp
      "settings": { // User-specific settings
        "notifications": {
          "newMatch": "Boolean",
          "newMessage": "Boolean",
          "placeUpdates": "Boolean" // e.g., if a saved place is taken
        },
        // Other settings like dark mode preference, etc.
      },
      "isPremium": "Boolean", // Indicates if the user has a premium subscription
      "lastLogin": "Timestamp" // Timestamp of the last login
    }
    ```

### 1.2. `profiles` Collection

Stores detailed user profiles, including roommate preferences and potentially place listing details.

*   **Document Structure (Roommate Profile):**
    ```json
    {
      "_id": "ObjectId", // Unique profile identifier (Primary Key)
      "userId": "ObjectId", // Reference to the 'users' collection (indexed)
      "profileType": "String", // "roommate" or "place" (indexed)
      "name": "String", // User's first name or display name
      "age": "Number", // User's age
      "gender": "String", // e.g., "male", "female", "non-binary", "prefer-not-say"
      "bio": "String", // User's self-description
      "images": ["String"], // Array of URLs to profile images
      "location": { // User's general location or desired location
        "city": "String",
        "state": "String",
        "zipCode": "String" // Optional, for more specific matching
      },
      "preferences": { // Roommate preferences
        "budget": {
          "min": "Number",
          "max": "Number"
        },
        "moveInDate": "Date", // Desired move-in date range (start/end)
        "leaseLength": "String", // e.g., "6 months", "1 year", "flexible"
        "smoking": "Boolean", // True if smoker, False otherwise
        "pets": "Boolean", // True if has/allows pets
        "cleanliness": "String", // e.g., "very tidy", "average", "relaxed"
        "guests": "String", // e.g., "rarely", "sometimes", "often"
        "workSchedule": "String" // e.g., "9-to-5", "flexible", "night shift"
        // Add other relevant lifestyle preferences
      },
      "hasPlace": "Boolean", // Indicates if this profile *also* includes a place listing
      "createdAt": "Timestamp",
      "updatedAt": "Timestamp",
      "isActive": "Boolean" // Whether the profile is currently discoverable
    }
    ```
*   **Document Structure (Place Listing - Embedded within or linked from a `profiles` document where `hasPlace` is true):**
    ```json
    // This could be embedded within the profile or potentially a separate collection linked by profileId
    {
      // ... inherits relevant fields from the hosting profile like userId, location ...
      "profileId": "ObjectId", // Link back to the hosting profile
      "placeDetails": {
          "address": "String", // Full address (potentially kept private until match)
          "rent": "Number", // Monthly rent
          "roomType": "String", // e.g., "private room", "shared room", "studio"
          "amenities": ["String"], // e.g., "in-unit laundry", "gym", "parking"
          "description": "String", // Description of the place
          "placeImages": ["String"], // Array of URLs to place images
          "availableDate": "Date" // Date the place becomes available
      }
      // ... other place-specific fields ...
    }
    ```
    *Note: Deciding between embedding place details vs. a separate `places` collection depends on query patterns. Embedding is simpler if places are always accessed via a profile. A separate collection might be better for place-specific searches.*

### 1.3. `swipes` Collection

Records swipe actions (like, dislike, superlike) performed by users.

*   **Document Structure:**
    ```json
    {
      "_id": "ObjectId",
      "swiperUserId": "ObjectId", // User who performed the swipe (indexed)
      "swipedProfileId": "ObjectId", // Profile that was swiped (indexed)
      "action": "String", // "like", "dislike", "superlike"
      "timestamp": "Timestamp" // When the swipe occurred
    }
    ```
    *Note: An index on `[swiperUserId, swipedProfileId]` would be beneficial for quickly checking swipe history.*

### 1.4. `matches` Collection

Stores information about successful matches between users.

*   **Document Structure:**
    ```json
    {
      "_id": "ObjectId", // Unique match identifier
      "participants": ["ObjectId"], // Array containing the userIds of the two matched users (indexed)
      "status": "String", // "matched", "superMatched", "mixedMatched", "unmatched" (indexed)
      // Store swipe actions that led to the match for context (optional but useful)
      "user1Action": { // Details of the first user's swipe
        "userId": "ObjectId",
        "action": "String", // "like" or "superlike"
        "timestamp": "Timestamp"
      },
      "user2Action": { // Details of the second user's swipe (if applicable)
        "userId": "ObjectId",
        "action": "String", // "like" or "superlike"
        "timestamp": "Timestamp"
      },
      "createdAt": "Timestamp", // When the match was formed
      "updatedAt": "Timestamp", // e.g., if status changes to "unmatched"
      "lastMessageTimestamp": "Timestamp", // Timestamp of the last message exchanged (for sorting conversations)
      "hasUnreadMessages": { // Track unread status per user
         "userId1": "Boolean",
         "userId2": "Boolean"
      }
    }
    ```
    *Note: An index on `participants` is crucial for finding matches involving a specific user.*

### 1.5. `conversations` Collection

Represents a chat thread between two matched users. Could potentially be merged/denormalized into the `matches` collection if messages are always accessed via a match.

*   **Document Structure:**
    ```json
    {
        "_id": "ObjectId", // Unique conversation identifier
        "matchId": "ObjectId", // Reference to the 'matches' collection (indexed)
        "participants": ["ObjectId"], // Array containing the userIds of the two users (indexed, redundant but useful for querying)
        "createdAt": "Timestamp",
        "updatedAt": "Timestamp", // Timestamp of the last message or status update
        "lastMessage": { // Snippet of the last message for previews
            "senderId": "ObjectId",
            "content": "String",
            "timestamp": "Timestamp"
        }
        // Optionally store user-specific read cursors here
    }
    ```

### 1.6. `messages` Collection

Stores individual chat messages within conversations.

*   **Document Structure:**
    ```json
    {
      "_id": "ObjectId",
      "conversationId": "ObjectId", // Reference to the 'conversations' or 'matches' collection (indexed)
      "senderId": "ObjectId", // User who sent the message (indexed)
      "receiverId": "ObjectId", // User who received the message (indexed)
      "content": "String", // Message text
      "timestamp": "Timestamp", // When the message was sent (indexed)
      "isRead": "Boolean" // Whether the receiver has read the message
    }
    ```
    *Note: Indexing `conversationId` and `timestamp` is vital for fetching messages efficiently.*

## 2. Add/Delete/Search Architecture

This section describes the permitted operations on each collection based on application functionality.

*   **`users` Collection:**
    *   **Add:** When a new user signs up.
    *   **Search/Read:**
        *   To authenticate a user during login (lookup by email).
        *   To retrieve user settings or premium status.
        *   To get basic user info linked from other collections (e.g., getting username from `userId`).
    *   **Update:**
        *   When a user changes their password or email.
        *   When updating settings (e.g., notification preferences).
        *   When updating premium status.
        *   Updating `lastLogin` timestamp.
    *   **Delete:** When a user deletes their account (should likely trigger cleanup in other collections).

*   **`profiles` Collection:**
    *   **Add:** When a user completes their profile setup (linked to user creation).
    *   **Search/Read:**
        *   Fetching the user's own profile for editing.
        *   **Core Discovery:** Fetching potential roommate/place profiles based on user preferences and filters (complex query involving location, preferences, `profileType`, `hasPlace`, `isActive`, and excluding already swiped profiles).
        *   Fetching specific profiles by ID (e.g., after a match or viewing a saved place).
    *   **Update:** When a user edits their profile information (bio, images, preferences, place details, `isActive` status).
    *   **Delete:** Unlikely directly; profiles are usually deactivated (`isActive: false`) or deleted when the parent user account is deleted.

*   **`swipes` Collection:**
    *   **Add:** Every time a user swipes left, right, or up on a profile.
    *   **Search/Read:**
        *   Primarily used internally by the backend:
            *   To check if a profile has already been swiped by the current user (to exclude from discovery).
            *   To determine if a "like" or "superlike" results in a match (checking if the other user has already liked back).
        *   Potentially for "rewind" functionality (premium feature) - finding the last swipe.
    *   **Update:** Generally not updated. A "rewind" might logically delete the last swipe entry.
    *   **Delete:** When a user account is deleted, their swipes should be removed. Maybe periodically purged for old "dislikes".

*   **`matches` Collection:**
    *   **Add:** When two users positively swipe on each other (e.g., like/like, like/superlike, superlike/superlike). Triggered after adding a `swipes` entry.
    *   **Search/Read:**
        *   Fetching all matches for a specific user (for the matches/messages list).
        *   Fetching a specific match by ID (e.g., when opening a conversation).
        *   Checking match status.
    *   **Update:**
        *   When a user unmaches someone (`status: "unmatched"`).
        *   Updating `lastMessageTimestamp` when a new message is sent in the corresponding conversation.
        *   Updating `hasUnreadMessages` flags.
    *   **Delete:** When a user account is deleted, their participation in matches should be handled (either delete the match or mark the user as deleted within the match).

*   **`conversations` / `messages` Collections:**
    *   **Add:**
        *   `conversations`: When the first message is sent between matched users (or potentially created simultaneously with the `matches` entry).
        *   `messages`: Every time a user sends a message in a chat.
    *   **Search/Read:**
        *   Fetching all conversations for a user (often joined with `matches` and last message details).
        *   Fetching all messages for a specific conversation, usually paginated and sorted by `timestamp`.
        *   Fetching unread message counts per conversation.
    *   **Update:**
        *   `conversations`: Updating `lastMessage` snippet and `updatedAt` timestamp when a new message arrives.
        *   `messages`: Marking messages as read (`isRead: true`).
    *   **Delete:** Messages might be deleted individually (less common) or purged when a conversation/match ends or a user account is deleted. Old conversations might be archived rather than deleted.

## 3. Backend Endpoint APIs (RESTful)

These are the major API endpoints needed to support the frontend functionality. Authentication (e.g., JWT tokens) would be required for most endpoints.

**Authentication:**

*   `POST /api/auth/register`
    *   Body: `{ email, password }`
    *   Response: `{ userId, token }` or error.
    *   Action: Creates a new entry in `users`.
*   `POST /api/auth/login`
    *   Body: `{ email, password }`
    *   Response: `{ userId, token, profileId, isPremium, settings }` or error.
    *   Action: Verifies credentials against `users`, returns auth token and basic user info.
*   `POST /api/auth/logout`
    *   Action: Invalidates the user's session/token on the backend (if applicable).

**User & Profile Management:**

*   `GET /api/users/me`
    *   Headers: `Authorization: Bearer <token>`
    *   Response: Full user object (from `users`) including settings.
    *   Action: Fetches details for the currently authenticated user.
*   `PUT /api/users/me/settings`
    *   Headers: `Authorization: Bearer <token>`
    *   Body: `{ settings: { ... } }`
    *   Response: Updated user object or success status.
    *   Action: Updates the `settings` field in the `users` collection.
*   `GET /api/profiles/me`
    *   Headers: `Authorization: Bearer <token>`
    *   Response: Full profile object (from `profiles`, including place details if `hasPlace` is true).
    *   Action: Fetches the authenticated user's own profile.
*   `PUT /api/profiles/me`
    *   Headers: `Authorization: Bearer <token>`
    *   Body: `{ name?, age?, gender?, bio?, images?, location?, preferences?, hasPlace?, placeDetails?, isActive? }` (Allowing partial updates)
    *   Response: Updated profile object or success status.
    *   Action: Updates the authenticated user's profile in `profiles`.
*   `GET /api/profiles/:id`
    *   Headers: `Authorization: Bearer <token>`
    *   Response: Public view of a specific profile object.
    *   Action: Fetches a specific profile by its ID (used for viewing matches' profiles or saved places).

**Discovery / Swiping:**

*   `GET /api/discover`
    *   Headers: `Authorization: Bearer <token>`
    *   Query Params: `?lookingFor=roommate|place&limit=10&...[other_filters]` (e.g., budgetMin, budgetMax, gender, etc., derived from user's preferences/filters)
    *   Response: `[ { profile1 }, { profile2 }, ... ]` (Array of profiles matching criteria, excluding already swiped/matched).
    *   Action: Performs the core discovery query against `profiles`, filtering based on user preferences, `profileType`, `hasPlace`, `isActive`, and checking against `swipes` and `matches` for the current user.
*   `POST /api/swipes`
    *   Headers: `Authorization: Bearer <token>`
    *   Body: `{ swipedProfileId: "ObjectId", action: "like|dislike|superlike" }`
    *   Response: `{ match: Match | null, status: "success" | "match_created" }`
    *   Action:
        1.  Adds an entry to the `swipes` collection.
        2.  Checks if the swipe results in a match by looking up the other user's swipes in `swipes`.
        3.  If a match occurs, creates an entry in `matches` and returns the match object.
        4.  Potentially triggers push notifications.
*   `POST /api/swipes/rewind` (Premium Feature)
    *   Headers: `Authorization: Bearer <token>`
    *   Response: `{ undoneSwipe: Swipe, status: "success" }` or error (e.g., "no swipes to rewind").
    *   Action: Finds the last swipe by the user, deletes it from `swipes`, and potentially reverts any match status change if the swipe resulted in one. Requires careful state management.

**Matches:**

*   `GET /api/matches`
    *   Headers: `Authorization: Bearer <token>`
    *   Query Params: `?status=matched|superMatched|mixedMatched` (Optional filter)
    *   Response: `[ { match1_with_profile_snippets }, { match2_with_profile_snippets }, ... ]`
    *   Action: Fetches all active matches for the user from `matches`, potentially joining with `profiles` to get names/images and `conversations`/`messages` for the last message snippet and unread status.
*   `PUT /api/matches/:matchId/unmatch`
    *   Headers: `Authorization: Bearer <token>`
    *   Response: `{ status: "success" }`
    *   Action: Updates the specified match's status to `"unmatched"` in the `matches` collection.

**Messaging:**

*   `GET /api/conversations`
    *   Headers: `Authorization: Bearer <token>`
    *   Response: `[ { conversation1_with_details }, { conversation2_with_details }, ... ]` (Similar to `GET /api/matches` but potentially focused more on chat state).
    *   Action: Fetches all conversations (or matches acting as conversations) for the user, including participant details, last message, and unread status. Sorted by `lastMessageTimestamp`.
*   `GET /api/conversations/:conversationId/messages`
    *   Headers: `Authorization: Bearer <token>`
    *   Query Params: `?limit=50&before=<messageId_or_timestamp>` (For pagination)
    *   Response: `[ { message1 }, { message2 }, ... ]`
    *   Action: Fetches messages for a specific conversation from `messages`, sorted by `timestamp`. Updates `isRead` status for fetched messages on the backend.
*   `POST /api/conversations/:conversationId/messages`
    *   Headers: `Authorization: Bearer <token>`
    *   Body: `{ content: "String" }`
    *   Response: `{ message: Message }` (The newly created message)
    *   Action:
        1.  Adds a new message to the `messages` collection.
        2.  Updates the `lastMessage` and `updatedAt` fields in the corresponding `conversations` (or `matches`) document.
        3.  Updates unread flags.
        4.  Triggers real-time events (e.g., WebSockets) and potentially push notifications to the receiver.
*   `PUT /api/conversations/:conversationId/read`
    *   Headers: `Authorization: Bearer <token>`
    *   Response: `{ status: "success" }`
    *   Action: Marks all messages in the conversation up to a certain point (or all) as read for the authenticated user. Updates `isRead` in `messages` and potentially unread flags in `matches`/`conversations`.

**Places (if separate collection or specific endpoints needed):**

*   `GET /api/places/saved`
    *   Headers: `Authorization: Bearer <token>`
    *   Response: `[ { placeProfile1 }, { placeProfile2 }, ... ]`
    *   Action: Fetches profiles where `profileType` is "place" that the user has liked/superliked (derived from `swipes` or potentially a dedicated "saved_places" list/collection).
*   `GET /api/places/:id`
    *   Headers: `Authorization: Bearer <token>`
    *   Response: Full place profile details.
    *   Action: Fetches a specific profile where `profileType` is "place".

This structure provides a solid foundation for building the backend services required by the Roomies app. Remember to implement proper indexing in MongoDB for efficient querying. 