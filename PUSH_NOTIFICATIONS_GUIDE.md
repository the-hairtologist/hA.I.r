# 🔔 Push Notifications Setup Guide

How to implement push notifications for appointment reminders and important updates.

---

## 📱 Current Status

**Configured:** ✅ Push notification plugin installed and configured in `capacitor.config.ts`

**Implemented:** ⚠️ Not yet - This guide shows how to complete implementation

**Priority:** Optional for v1.0, Recommended for v1.1

---

## 🎯 Use Cases

Perfect for:
- Appointment reminders (24 hours before)
- Client messages received
- New appointment requests
- Formula shared by stylist
- Rebooking reminders (6 weeks after)
- Promotional announcements

---

## 🏗️ Architecture

```
User Device (iOS/Android)
      ↓
Capacitor Push Plugin
      ↓
Firebase Cloud Messaging (FCM)
      ↓
Supabase Edge Function
      ↓
Your Database (triggers)
```

---

## ⚙️ Setup Steps

### 1. Firebase Setup (30 mins)

1. Go to https://console.firebase.google.com
2. Create new project: "hA.I.r Pro"
3. Add iOS app:
   - Bundle ID: `app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2`
   - Download `GoogleService-Info.plist`
   - Place in `ios/App/App/` folder

4. Add Android app:
   - Package name: `app.lovable.a1a18f9db2f94d81aa8ce28408bee3a2`
   - Download `google-services.json`
   - Place in `android/app/` folder

5. Get Server Key:
   - Project Settings → Cloud Messaging
   - Copy "Server key" (starts with `AAAA...`)
   - Save as Supabase secret: `FCM_SERVER_KEY`

### 2. iOS Configuration

Add to `ios/App/App/Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
    <string>remote-notification</string>
</array>
```

In Xcode:
1. Select target → Signing & Capabilities
2. Add Capability → Push Notifications
3. Add Capability → Background Modes
4. Check "Remote notifications"

Upload APNs Authentication Key:
1. Apple Developer → Certificates, IDs & Profiles
2. Keys → + (Create new key)
3. Name: "hA.I.r Push Notifications"
4. Check "Apple Push Notifications service (APNs)"
5. Download .p8 file
6. Upload to Firebase: Project Settings → Cloud Messaging → iOS → Upload APNs Auth Key

### 3. Android Configuration

File: `android/app/google-services.json` (downloaded from Firebase)

Update `android/app/build.gradle`:
```gradle
dependencies {
    // ... existing dependencies
    implementation 'com.google.firebase:firebase-messaging:23.4.0'
}

apply plugin: 'com.google.gms.google-services'
```

Update `android/build.gradle`:
```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

---

## 💻 Frontend Implementation

### 1. Create Push Notification Service

File: `src/lib/notifications/pushNotifications.ts`
```typescript
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

export class PushNotificationService {
  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('[Push] Web platform, notifications not supported');
      return;
    }

    // Request permission
    const permStatus = await PushNotifications.requestPermissions();
    
    if (permStatus.receive !== 'granted') {
      console.log('[Push] Permission denied');
      return;
    }

    console.log('[Push] Permission granted');

    // Register with Apple / Google
    await PushNotifications.register();

    // Handle successful registration
    await PushNotifications.addListener('registration', async (token: Token) => {
      console.log('[Push] Token:', token.value);
      await this.saveTokenToBackend(token.value);
    });

    // Handle errors
    await PushNotifications.addListener('registrationError', (error: any) => {
      console.error('[Push] Registration error:', error);
    });

    // Handle notification received (app in foreground)
    await PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Received:', notification);
      // Show in-app notification or update UI
    });

    // Handle notification tapped (app in background)
    await PushNotifications.addListener('pushNotificationActionPerformed', 
      (action: ActionPerformed) => {
        console.log('[Push] Action:', action);
        this.handleNotificationTap(action);
      }
    );
  }

  private async saveTokenToBackend(token: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('push_tokens')
      .upsert({
        user_id: session.user.id,
        token,
        platform: Capacitor.getPlatform(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,platform'
      });

    if (error) {
      console.error('[Push] Error saving token:', error);
    } else {
      console.log('[Push] Token saved to backend');
    }
  }

  private handleNotificationTap(action: ActionPerformed) {
    const data = action.notification.data;
    
    // Navigate based on notification type
    switch (data.type) {
      case 'appointment_reminder':
        window.location.href = `/appointments/${data.appointment_id}`;
        break;
      case 'new_message':
        window.location.href = `/messages/${data.conversation_id}`;
        break;
      case 'new_appointment':
        window.location.href = `/appointments`;
        break;
      default:
        window.location.href = '/dashboard';
    }
  }

  async cleanup() {
    await PushNotifications.removeAllListeners();
  }
}

export const pushNotifications = new PushNotificationService();
```

### 2. Initialize in App

File: `src/App.tsx`
```typescript
import { useEffect } from 'react';
import { pushNotifications } from '@/lib/notifications/pushNotifications';

function App() {
  useEffect(() => {
    // Initialize push notifications
    pushNotifications.initialize();

    return () => {
      pushNotifications.cleanup();
    };
  }, []);

  // ... rest of app
}
```

---

## 🗄️ Database Setup

Create table for storing push tokens:

```sql
CREATE TABLE push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'ios' or 'android'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Enable RLS
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tokens
CREATE POLICY "Users can manage own tokens"
  ON push_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);
```

---

## 🔧 Backend: Send Notifications

### Edge Function: `send-push-notification`

File: `supabase/functions/send-push-notification/index.ts`
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, title, body, data } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user's push tokens
    const { data: tokens, error: tokenError } = await supabaseAdmin
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', userId);

    if (tokenError || !tokens || tokens.length === 0) {
      throw new Error('No push tokens found for user');
    }

    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");
    if (!fcmServerKey) {
      throw new Error('FCM_SERVER_KEY not configured');
    }

    // Send to each device
    const promises = tokens.map(async (tokenData) => {
      const message = {
        to: tokenData.token,
        notification: {
          title,
          body,
          sound: "default",
        },
        data: data || {},
      };

      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${fcmServerKey}`,
        },
        body: JSON.stringify(message),
      });

      return response.json();
    });

    const results = await Promise.all(promises);
    
    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

---

## 📅 Appointment Reminder Example

### Database Trigger for Auto-Reminders

```sql
CREATE OR REPLACE FUNCTION send_appointment_reminder()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  appointment_record RECORD;
BEGIN
  -- Find appointments 24 hours from now
  FOR appointment_record IN
    SELECT 
      a.id,
      a.client_id,
      a.appointment_date,
      a.service_type,
      cp.user_id,
      cp.full_name
    FROM appointments a
    JOIN client_profiles cp ON cp.id = a.client_id
    WHERE a.appointment_date BETWEEN NOW() + INTERVAL '23 hours 50 minutes'
      AND NOW() + INTERVAL '24 hours 10 minutes'
      AND a.status = 'scheduled'
      AND a.reminder_sent = false
  LOOP
    -- Call edge function to send push notification
    PERFORM net.http_post(
      url := 'https://your-project-ref.supabase.co/functions/v1/send-push-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'userId', appointment_record.user_id,
        'title', 'Appointment Reminder',
        'body', 'Your appointment for ' || appointment_record.service_type || ' is tomorrow!',
        'data', jsonb_build_object(
          'type', 'appointment_reminder',
          'appointment_id', appointment_record.id
        )
      )
    );

    -- Mark reminder as sent
    UPDATE appointments
    SET reminder_sent = true
    WHERE id = appointment_record.id;
  END LOOP;
END;
$$;
```

### Schedule with pg_cron

```sql
-- Run every hour
SELECT cron.schedule(
  'appointment-reminders',
  '0 * * * *',
  'SELECT send_appointment_reminder();'
);
```

---

## 🧪 Testing

### Test on Device

1. Install app on physical device (simulators don't support push)
2. Grant notification permission
3. Check logs for token registration
4. Send test notification:

```typescript
// From admin panel or backend
await supabase.functions.invoke('send-push-notification', {
  body: {
    userId: 'user-uuid-here',
    title: 'Test Notification',
    body: 'This is a test!',
    data: {
      type: 'test',
    }
  }
});
```

### Test Different Scenarios

- [ ] App in foreground (should show in-app)
- [ ] App in background (should show system notification)
- [ ] App completely closed (should show system notification)
- [ ] Tap notification (should open correct screen)
- [ ] Silent notification (data only)

---

## 📊 Analytics & Monitoring

Track notification performance:

```sql
CREATE TABLE push_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered BOOLEAN DEFAULT false,
  opened BOOLEAN DEFAULT false,
  opened_at TIMESTAMPTZ,
  error TEXT
);

-- Log when notification is sent
-- Update when user opens notification
```

---

## 🚨 Best Practices

### Do's ✅
- Only send valuable, timely notifications
- Allow users to customize notification preferences
- Respect quiet hours (no notifications 10pm-8am)
- Test thoroughly on real devices
- Provide easy way to disable notifications
- Use clear, actionable notification text

### Don'ts ❌
- Don't send marketing spam
- Don't send identical notifications repeatedly
- Don't send notifications without user permission
- Don't include sensitive data in notification body
- Don't rely solely on push (have in-app fallback)

---

## 📱 User Settings

Add notification preferences to user profile:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "appointment_reminders": true,
  "new_messages": true,
  "rebooking_reminders": true,
  "promotional": false
}'::jsonb;
```

---

## 🔍 Troubleshooting

### iOS Issues

**No token received:**
- Check Xcode capabilities (Push Notifications enabled)
- Verify APNs key uploaded to Firebase
- Test on real device, not simulator

**Notifications not showing:**
- Check notification settings in iOS Settings app
- Ensure app has permission granted
- Verify badge, sound, alert enabled

### Android Issues

**No token received:**
- Verify `google-services.json` in correct location
- Check Firebase project has Android app added
- Ensure package name matches exactly

**Notifications not showing:**
- Check Android notification settings
- Verify channel importance level
- Test with high-priority notification

---

## ✅ Completion Checklist

- [ ] Firebase project created
- [ ] iOS app added to Firebase (GoogleService-Info.plist)
- [ ] Android app added to Firebase (google-services.json)
- [ ] FCM Server Key saved as Supabase secret
- [ ] APNs key uploaded (iOS)
- [ ] Push notification plugin configured
- [ ] Frontend service implemented
- [ ] Database table created
- [ ] Edge function deployed
- [ ] Test notification sent successfully
- [ ] Notification preferences UI added
- [ ] Analytics tracking implemented
- [ ] App Store privacy disclosure updated

---

**Need Help?** Email ThehA.I.rtologist@gmail.com

**Documentation:**
- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notifications](https://developer.apple.com/documentation/usernotifications)
