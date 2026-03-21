# User FCM Token Update Documentation

## 📡 API Details

- **Endpoint**: `/api/user/fcm-token`
- **Method**: `PUT`
- **Authentication**: `Bearer <User_JWT_Token>`
- **Access Level**: Private (Role: `User`)

### Request Body
```json
{
  "fcmToken": "string",
  "platform": "app" | "web"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "FCM token updated successfully",
  "data": {
    "fcmToken": {
      "app": "fcm_token_here",
      "web": "old_or_new_web_token"
    }
  }
}
```

## 🏗️ Frontend Integration

### Implementation Location
`Frontend/src/common/components/FirebaseNotificationHandler.jsx`

### Trigger
Automatically called when:
1. The User logs in.
2. The Firebase Cloud Messaging (FCM) token is successfully generated/refreshed.

### Integration Code Fragment
```javascript
case 'user':
  endpoint = `${API_BASE_URL}/user/fcm-token`;
  break;

// ... axios call ...
await axios.put(endpoint, {
  fcmToken: fcmToken,
  platform: isApp ? 'app' : 'web'
}, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---
*This documentation is part of the Saathi-Grow notification system.*
