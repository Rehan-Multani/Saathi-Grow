# Flutter WebView Camera Bridge Documentation

This document describes the bridge implementation between the **saathigro React Frontend** (WebView) and the **Flutter App (APK)** to resolve camera access issues and enable high-quality image uploads for order returns and profile updates.

## 1. Overview
Standard `input type="file"` often fails or provides a poor UX within mobile WebViews. This bridge delegates the camera/gallery action to the native Flutter layer, which then passes the image back to React as a Base64 string.

---

## 2. Flutter Side Implementation (Native)
In your Flutter app's `WebView` widget, you must register a `JavascriptChannel`.

```dart
// Flutter Code (Inside your WebView Widget)
JavascriptChannel(
  name: 'FlutterCameraBridge',
  onMessageReceived: (JavascriptMessage message) async {
    if (message.message == 'openCamera') {
      final ImagePicker picker = ImagePicker();
      // 1. Pick Image from Camera
      final XFile? image = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 70, // Optimized for upload
      );

      if (image != null) {
        final bytes = await image.readAsBytes();
        String base64Image = base64Encode(bytes);
        
        // 2. Send back to React
        _webViewController.runJavascript(
          "window.onFlutterImageReceived('data:image/jpeg;base64,$base64Image')"
        );
      }
    }
  },
)
```

---

## 3. React Frontend Implementation (WebView)
The frontend checks if it's running inside the Flutter WebView and invokes the bridge.

### Bridge Handler
```javascript
// Global handler for Flutter response
window.onFlutterImageReceived = (base64Data) => {
    // Custom event to notify components
    const event = new CustomEvent('flutter_image_captured', { 
        detail: base64Data 
    });
    window.dispatchEvent(event);
};

// Function to trigger Flutter camera
const triggerNativeCamera = () => {
    if (window.FlutterCameraBridge) {
        window.FlutterCameraBridge.postMessage('openCamera');
    }
};
```

---

## 4. Backend Usage
The backend remains unchanged as it already handles multipart/form-data. Base64 images are converted back to File objects in the frontend before being sent to the `API`, ensuring compatibility with existing `Multer` configurations.

---

## 5. Benefits
- **Full Camera Control**: Uses native iOS/Android camera UI.
- **No Permission Issues**: Bypasses browser-level `getUserMedia` restrictions in WebViews.
- **Optimized Size**: Flutter compresses the image before sending, reducing upload time.
- **Fallback**: Automatically falls back to standard browser file input if not running in the App.
