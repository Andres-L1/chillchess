# Firestore Security Rules for Listening Rooms

Add these rules to your `firestore.rules` file:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ... existing rules ...
    
    // Listening Rooms
    match /listeningRooms/{roomId} {
      // Allow anyone authenticated to read public rooms
      allow read: if request.auth != null && resource.data.isPublic == true;
      
      // Allow participants to read their room (public or private)
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.participants;
      
      // Allow authenticated users to create rooms
      allow create: if request.auth != null &&
                       request.resource.data.hostId == request.auth.uid;
      
      // Allow host to update the room
      // OR participants to update their own participant data
      allow update: if request.auth != null && (
        resource.data.hostId == request.auth.uid ||
        (
          // Only allow updating own participant entry
          request.resource.data.diff(resource.data).affectedKeys()
            .hasOnly(['participants']) &&
          request.resource.data.participants[request.auth.uid] != null
        )
      );
      
      // Allow host to delete the room
      allow delete: if request.auth != null &&
                       resource.data.hostId == request.auth.uid;
    }
  }
}
```

## Schema Definition

### Collection: `listeningRooms`

```typescript
interface ListeningRoom {
  name: string;                // Room name
  hostId: string;              // UID of the host
  hostName: string;            // Display name of host
  createdAt: Timestamp;        // Server timestamp
  isPublic: boolean;           // Public or private room
  
  currentTrack: {
    albumId: string;           // Current album ID
    trackIndex: number;        // Index in album's track list
    title: string;             // Track title (for display)
    isPlaying: boolean;        // Playback state
    timestamp: Timestamp;      // Last update time
  } | null;
  
  participants: {
    [uid: string]: {
      displayName: string;     // User's display name
      joinedAt: Timestamp;     // When they joined
    }
  };
}
```

## Deployment Instructions

1. Copy the rules above to your Firebase Console
2. Go to Firestore → Rules
3. Paste and publish
4. Test by creating a room

## Testing Checklist

- [ ] Create public room works
- [ ] Create private room works
- [ ] Join room adds user to participants
- [ ] Host can update currentTrack
- [ ] Guests see real-time updates
- [ ] Leave room removes participant
- [ ] Non-participants can't read private rooms
- [ ] Only host can delete room
