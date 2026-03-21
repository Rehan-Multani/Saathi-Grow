# Admin FCM Token Update Documentation

## 📡 API Details

- **Endpoint**: `/api/admin/fcm-token`
- **Method**: `PUT`
- **Authentication**: `Bearer <Admin_JWT_Token>`
- **Access Level**: Private (Role: `Admin`)

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
1. The Admin/Staff/Manager logs in.
2. The Firebase Cloud Messaging (FCM) token is successfully generated/refreshed.

### Integration Code Fragment
```javascript
case 'admin':
  endpoint = `${API_BASE_URL}/admin/fcm-token`;
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
