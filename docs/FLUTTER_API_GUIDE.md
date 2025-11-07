# Flutter API Integration Guide
**hA.I.r Edge Functions - Complete Reference**

## Table of Contents
1. [Setup & Authentication](#setup--authentication)
2. [AI & Automation Functions](#ai--automation-functions)
3. [Appointment Management](#appointment-management)
4. [Communication Functions](#communication-functions)
5. [Payment Functions](#payment-functions)
6. [Calendar Integration](#calendar-integration)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Setup & Authentication

### Initial Setup

```dart
// pubspec.yaml
dependencies:
  supabase_flutter: ^2.0.0
  http: ^1.1.0

// lib/core/supabase_client.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String supabaseUrl = 'https://iyotklwiwyljospfqnoy.supabase.co';
  static const String anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5b3RrbHdpd3lsam9zcGZxbm95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU0NDAsImV4cCI6MjA3NDkzMTQ0MH0.X1bkOZPuNuGeUHYfiN1p8_z8jtRWnfi2T9WlzGOb_jA';
  
  static Future<void> initialize() async {
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: anonKey,
    );
  }
}

final supabase = Supabase.instance.client;
```

### Authentication Helper

```dart
// lib/core/api_client.dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiClient {
  static const String baseUrl = 'https://iyotklwiwyljospfqnoy.supabase.co/functions/v1';
  
  static Future<String?> _getAuthToken() async {
    final session = supabase.auth.currentSession;
    return session?.accessToken;
  }
  
  static Future<http.Response> post({
    required String function,
    required Map<String, dynamic> body,
    Map<String, String>? additionalHeaders,
  }) async {
    final token = await _getAuthToken();
    if (token == null) {
      throw Exception('User not authenticated');
    }
    
    final headers = {
      'Authorization': 'Bearer $token',
      'Content-Type': 'application/json',
      ...?additionalHeaders,
    };
    
    return await http.post(
      Uri.parse('$baseUrl/$function'),
      headers: headers,
      body: jsonEncode(body),
    );
  }
}
```

---

## AI & Automation Functions

### 1. AI Assistant (`ai-assistant`)
**Purpose:** Multi-purpose AI assistant for scheduling, formulas, insights, and chat  
**Auth:** Required  
**Model:** Smart routing (gemini-2.5-flash-lite to gemini-2.5-pro)

#### Request Schema
```dart
class AiAssistantRequest {
  final String type; // 'smart-scheduling' | 'formula-recommendation' | 'client-insights' | 'automated-followup' | 'chat' | 'correction-formula'
  final Map<String, dynamic>? data;
  final List<Message> messages;
  
  Map<String, dynamic> toJson() => {
    'type': type,
    'data': data,
    'messages': messages.map((m) => m.toJson()).toList(),
  };
}

class Message {
  final String role; // 'user' | 'assistant' | 'system'
  final dynamic content; // String or List<ContentPart>
  
  Map<String, dynamic> toJson() => {
    'role': role,
    'content': content,
  };
}
```

#### Flutter Example
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class AiService {
  // Chat with AI assistant
  static Future<String> chat(String message, List<Message> history) async {
    try {
      final response = await ApiClient.post(
        function: 'ai-assistant',
        body: {
          'type': 'chat',
          'messages': [
            ...history.map((m) => m.toJson()),
            {'role': 'user', 'content': message},
          ],
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['response'] as String;
      } else if (response.statusCode == 429) {
        throw RateLimitException('Rate limit exceeded. Please try again in a moment.');
      } else if (response.statusCode == 402) {
        throw CreditException('AI credits exhausted. Please add credits to continue.');
      } else {
        throw ApiException('AI assistant error: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }
  
  // Generate hair color formula
  static Future<FormulaResponse> generateFormula({
    required String naturalLevel,
    required String currentColor,
    required String targetLook,
    String? hairHistory,
    String? porosity,
    String? texture,
    int grayPercent = 0,
  }) async {
    try {
      final response = await ApiClient.post(
        function: 'ai-assistant',
        body: {
          'type': 'formula-recommendation',
          'data': {
            'natural_level': naturalLevel,
            'current_color': currentColor,
            'target_look': targetLook,
            'hair_history': hairHistory,
            'porosity': porosity ?? 'medium',
            'texture': texture ?? 'medium',
            'gray_percent': grayPercent,
          },
          'messages': [
            {'role': 'user', 'content': 'Generate hair color formula'},
          ],
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return FormulaResponse.fromJson(jsonDecode(data['response']));
      } else {
        throw ApiException('Formula generation failed: ${response.statusCode}');
      }
    } catch (e) {
      rethrow;
    }
  }
}

class FormulaResponse {
  final bool ready;
  final List<String>? missingInputs;
  final Formula? formula;
  final List<String> applicationSteps;
  final List<String> aftercare;
  final List<String> cautions;
  final int estimatedTimeMinutes;
  final String disclaimer;
  
  FormulaResponse.fromJson(Map<String, dynamic> json)
      : ready = json['ready'],
        missingInputs = json['missing_inputs']?.cast<String>(),
        formula = json['formula'] != null ? Formula.fromJson(json['formula']) : null,
        applicationSteps = json['application_steps']?.cast<String>() ?? [],
        aftercare = json['aftercare']?.cast<String>() ?? [],
        cautions = json['cautions']?.cast<String>() ?? [],
        estimatedTimeMinutes = json['estimated_time_minutes'] ?? 0,
        disclaimer = json['disclaimer'] ?? '';
}

class Formula {
  final List<FormulaStep> base;
  final List<FormulaStep> lighten;
  final List<FormulaStep> tone;
  
  Formula.fromJson(Map<String, dynamic> json)
      : base = (json['base'] as List).map((e) => FormulaStep.fromJson(e)).toList(),
        lighten = (json['lighten'] as List).map((e) => FormulaStep.fromJson(e)).toList(),
        tone = (json['tone'] as List).map((e) => FormulaStep.fromJson(e)).toList();
}

class FormulaStep {
  final String brand;
  final String shade;
  final String ratio;
  final String developer;
  final int processingMinutes;
  
  FormulaStep.fromJson(Map<String, dynamic> json)
      : brand = json['brand'] ?? '',
        shade = json['shade'] ?? '',
        ratio = json['ratio'] ?? '',
        developer = json['developer'] ?? '',
        processingMinutes = json['processing_minutes'] ?? 0;
}
```

---

### 2. Hair Photo Analysis (`analyze-hair-photo`)
**Purpose:** Analyze hair photos using AI vision models  
**Auth:** Required (stylist or admin)  
**Model:** google/gemini-2.5-pro

#### Flutter Example
```dart
class HairAnalysisService {
  static Future<HairAnalysis> analyzePhoto(String imageUrl) async {
    try {
      final response = await ApiClient.post(
        function: 'analyze-hair-photo',
        body: {'imageUrl': imageUrl},
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return HairAnalysis.fromJson(data['analysis']);
      } else if (response.statusCode == 429) {
        throw RateLimitException('Rate limit exceeded');
      } else {
        throw ApiException('Hair analysis failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}

class HairAnalysis {
  final String currentLevel;
  final String currentColor;
  final String hairCondition;
  final List<String> recommendedServices;
  final double confidence;
  
  HairAnalysis.fromJson(Map<String, dynamic> json)
      : currentLevel = json['current_level'] ?? '',
        currentColor = json['current_color'] ?? '',
        hairCondition = json['hair_condition'] ?? '',
        recommendedServices = (json['recommended_services'] as List).cast<String>(),
        confidence = json['confidence_score'] ?? 0.0;
}
```

---

### 3. Generate Hair Image (`generate-hair-image`)
**Purpose:** Generate hair inspiration images using AI  
**Auth:** Required  
**Model:** google/gemini-2.5-flash-image-preview

#### Flutter Example
```dart
class ImageGenerationService {
  static Future<String> generateHairImage(String prompt) async {
    try {
      final response = await ApiClient.post(
        function: 'generate-hair-image',
        body: {
          'prompt': prompt,
          'userId': supabase.auth.currentUser?.id,
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['imageUrl'] as String;
      } else {
        throw ApiException('Image generation failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}

// Usage Example
Widget buildImageGenerator() {
  return FutureBuilder<String>(
    future: ImageGenerationService.generateHairImage(
      'Balayage blonde highlights on medium brown hair, professional salon quality',
    ),
    builder: (context, snapshot) {
      if (snapshot.connectionState == ConnectionState.waiting) {
        return CircularProgressIndicator();
      }
      if (snapshot.hasError) {
        return Text('Error: ${snapshot.error}');
      }
      return Image.network(snapshot.data!);
    },
  );
}
```

---

### 4. Hair Assistant Chat (`hair-assistant-chat`)
**Purpose:** Real-time hair care assistant chat  
**Auth:** Required  
**Model:** google/gemini-2.5-flash

#### Flutter Example
```dart
class HairAssistantService {
  static Future<ChatResponse> sendMessage({
    required String message,
    String mode = 'general',
    Map<String, dynamic>? conversationContext,
    Map<String, dynamic>? clientContext,
    Map<String, dynamic>? stylistContext,
  }) async {
    try {
      final response = await ApiClient.post(
        function: 'hair-assistant-chat',
        body: {
          'message': message,
          'mode': mode,
          'conversationContext': conversationContext,
          'clientContext': clientContext,
          'stylistContext': stylistContext,
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ChatResponse(
          message: data['message'],
          confidence: data['confidence'],
          modelUsed: data['model_used'],
        );
      } else {
        throw ApiException('Chat failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}

class ChatResponse {
  final String message;
  final double confidence;
  final String modelUsed;
  
  ChatResponse({
    required this.message,
    required this.confidence,
    required this.modelUsed,
  });
}
```

---

## Appointment Management

### 5. Create Appointment Checkout (`create-appointment-checkout`)
**Purpose:** Create Stripe checkout session for appointments  
**Auth:** Required

#### Flutter Example
```dart
class AppointmentCheckoutService {
  static Future<CheckoutSession> createCheckout({
    required Map<String, dynamic> appointmentData,
    required String clientEmail,
    required String clientName,
  }) async {
    try {
      final response = await ApiClient.post(
        function: 'create-appointment-checkout',
        body: {
          'appointmentData': appointmentData,
          'clientEmail': clientEmail,
          'clientName': clientName,
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return CheckoutSession.fromJson(data);
      } else {
        throw ApiException('Checkout creation failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}

class CheckoutSession {
  final String sessionId;
  final String sessionUrl;
  final double totalAmount;
  final bool isDeposit;
  
  CheckoutSession.fromJson(Map<String, dynamic> json)
      : sessionId = json['sessionId'],
        sessionUrl = json['sessionUrl'],
        totalAmount = json['totalAmount'],
        isDeposit = json['isDeposit'];
}

// Usage in Widget
Future<void> bookAppointment() async {
  try {
    final session = await AppointmentCheckoutService.createCheckout(
      appointmentData: {
        'stylist_id': stylistId,
        'client_id': clientId,
        'service_id': serviceId,
        'appointment_date': appointmentDate.toIso8601String(),
        'duration_minutes': 90,
      },
      clientEmail: 'client@example.com',
      clientName: 'Jane Doe',
    );
    
    // Open Stripe checkout
    await launchUrl(Uri.parse(session.sessionUrl));
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Booking failed: $e')),
    );
  }
}
```

---

### 6. AI Schedule Predictor (`ai-schedule-predictor`)
**Purpose:** Predict optimal appointment times using AI  
**Auth:** Required

#### Flutter Example
```dart
class SchedulePredictorService {
  static Future<SchedulePrediction> predictNextAppointment({
    required String clientId,
    required List<Map<String, dynamic>> appointments,
    required Map<String, dynamic> clientProfile,
  }) async {
    try {
      final response = await ApiClient.post(
        function: 'ai-schedule-predictor',
        body: {
          'clientId': clientId,
          'appointments': appointments,
          'clientProfile': clientProfile,
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return SchedulePrediction.fromJson(data);
      } else {
        throw ApiException('Schedule prediction failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}

class SchedulePrediction {
  final DateTime suggestedDate;
  final String suggestedTime;
  final double confidence;
  final String reasoning;
  final List<DateTime> alternativeDates;
  
  SchedulePrediction.fromJson(Map<String, dynamic> json)
      : suggestedDate = DateTime.parse(json['suggested_date']),
        suggestedTime = json['suggested_time'],
        confidence = json['confidence'],
        reasoning = json['reasoning'],
        alternativeDates = (json['alternative_dates'] as List)
            .map((d) => DateTime.parse(d))
            .toList();
}
```

---

## Communication Functions

### 7. Search Stylists (`search-stylists`)
**Purpose:** AI-powered web search for stylists  
**Auth:** Required

#### Flutter Example
```dart
class StylistSearchService {
  static Future<List<StylistSearchResult>> search({
    String? location,
    String? specialty,
    String? colorLine,
  }) async {
    try {
      final response = await ApiClient.post(
        function: 'search-stylists',
        body: {
          'location': location,
          'specialty': specialty,
          'colorLine': colorLine,
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return (data['stylists'] as List)
            .map((s) => StylistSearchResult.fromJson(s))
            .toList();
      } else {
        throw ApiException('Search failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}

class StylistSearchResult {
  final String name;
  final String? businessName;
  final String location;
  final String specialty;
  final List<String> certifications;
  final String? rating;
  final String? reviewCount;
  final String? portfolio;
  final String? contact;
  final String bio;
  final String source;
  
  StylistSearchResult.fromJson(Map<String, dynamic> json)
      : name = json['name'],
        businessName = json['businessName'],
        location = json['location'],
        specialty = json['specialty'],
        certifications = (json['certifications'] as List).cast<String>(),
        rating = json['rating'],
        reviewCount = json['reviewCount'],
        portfolio = json['portfolio'],
        contact = json['contact'],
        bio = json['bio'],
        source = json['source'];
}
```

---

### 8. Automated Follow-up (`automated-appointment-followup`)
**Purpose:** Scheduled cron job for appointment follow-ups  
**Auth:** Internal (cron only)  
**Note:** This function runs automatically and should not be called directly from Flutter

---

## Payment Functions

### 9. Create Checkout (`create-checkout`)
**Purpose:** Create Stripe subscription checkout with 7-day trial  
**Auth:** Required

#### Flutter Example
```dart
class SubscriptionService {
  static Future<String> createSubscriptionCheckout() async {
    try {
      final response = await ApiClient.post(
        function: 'create-checkout',
        body: {},
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['url'] as String;
      } else {
        throw ApiException('Checkout creation failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}

// Usage
Widget buildSubscribeButton() {
  return ElevatedButton(
    onPressed: () async {
      try {
        final checkoutUrl = await SubscriptionService.createSubscriptionCheckout();
        await launchUrl(Uri.parse(checkoutUrl));
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Subscription failed: $e')),
        );
      }
    },
    child: Text('Subscribe Now - 7 Day Free Trial'),
  );
}
```

---

### 10. Check Subscription (`check-subscription`)
**Purpose:** Check user's Stripe subscription status  
**Auth:** Required

#### Flutter Example
```dart
class SubscriptionStatusService {
  static Future<SubscriptionStatus> checkStatus() async {
    try {
      final response = await ApiClient.post(
        function: 'check-subscription',
        body: {},
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return SubscriptionStatus.fromJson(data);
      } else {
        throw ApiException('Status check failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}

class SubscriptionStatus {
  final bool subscribed;
  final bool inTrial;
  final String? productId;
  final DateTime? subscriptionEnd;
  
  SubscriptionStatus.fromJson(Map<String, dynamic> json)
      : subscribed = json['subscribed'],
        inTrial = json['in_trial'] ?? false,
        productId = json['product_id'],
        subscriptionEnd = json['subscription_end'] != null
            ? DateTime.parse(json['subscription_end'])
            : null;
}

// Usage - Subscription Guard Widget
class SubscriptionGuard extends StatelessWidget {
  final Widget child;
  
  const SubscriptionGuard({required this.child});
  
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<SubscriptionStatus>(
      future: SubscriptionStatusService.checkStatus(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return CircularProgressIndicator();
        }
        
        if (snapshot.hasError) {
          return Text('Error checking subscription');
        }
        
        final status = snapshot.data!;
        if (status.subscribed || status.inTrial) {
          return child;
        }
        
        return SubscriptionRequiredScreen();
      },
    );
  }
}
```

---

### 11. Customer Portal (`customer-portal`)
**Purpose:** Create Stripe customer portal session for managing subscriptions  
**Auth:** Required

#### Flutter Example
```dart
class CustomerPortalService {
  static Future<String> getPortalUrl() async {
    try {
      final response = await ApiClient.post(
        function: 'customer-portal',
        body: {},
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['url'] as String;
      } else {
        throw ApiException('Portal access failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}

// Usage
Widget buildManageSubscriptionButton() {
  return TextButton(
    onPressed: () async {
      try {
        final portalUrl = await CustomerPortalService.getPortalUrl();
        await launchUrl(Uri.parse(portalUrl));
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to open portal: $e')),
        );
      }
    },
    child: Text('Manage Subscription'),
  );
}
```

---

## Calendar Integration

### 12. Google Calendar Config (`google-client-config`)
**Purpose:** Get Google OAuth client ID  
**Auth:** Required

#### Flutter Example
```dart
class GoogleCalendarService {
  static Future<String> getClientId() async {
    try {
      final response = await ApiClient.post(
        function: 'google-client-config',
        body: {},
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['clientId'] as String;
      } else {
        throw ApiException('Failed to get client ID');
      }
    } catch (e) {
      rethrow;
    }
  }
}
```

---

### 13. Google Calendar Sync (`google-calendar-sync`)
**Purpose:** Sync appointment to Google Calendar  
**Auth:** Required

#### Flutter Example
```dart
class CalendarSyncService {
  static Future<CalendarEventResult> syncAppointment(String appointmentId) async {
    try {
      final response = await ApiClient.post(
        function: 'google-calendar-sync',
        body: {'appointmentId': appointmentId},
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return CalendarEventResult(
          success: data['success'],
          eventId: data['eventId'],
          eventLink: data['eventLink'],
        );
      } else {
        throw ApiException('Calendar sync failed');
      }
    } catch (e) {
      rethrow;
    }
  }
}

class CalendarEventResult {
  final bool success;
  final String eventId;
  final String eventLink;
  
  CalendarEventResult({
    required this.success,
    required this.eventId,
    required this.eventLink,
  });
}

// Usage
Widget buildSyncButton(String appointmentId) {
  return IconButton(
    icon: Icon(Icons.calendar_today),
    onPressed: () async {
      try {
        final result = await CalendarSyncService.syncAppointment(appointmentId);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Synced to Google Calendar!'),
            action: SnackBarAction(
              label: 'View',
              onPressed: () => launchUrl(Uri.parse(result.eventLink)),
            ),
          ),
        );
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Sync failed: $e')),
        );
      }
    },
  );
}
```

---

## Error Handling

### Custom Exception Classes

```dart
// lib/core/exceptions.dart

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  
  ApiException(this.message, [this.statusCode]);
  
  @override
  String toString() => 'ApiException: $message ${statusCode != null ? '($statusCode)' : ''}';
}

class AuthException extends ApiException {
  AuthException(String message) : super(message, 401);
}

class RateLimitException extends ApiException {
  RateLimitException(String message) : super(message, 429);
}

class CreditException extends ApiException {
  CreditException(String message) : super(message, 402);
}

class NetworkException extends ApiException {
  NetworkException(String message) : super(message);
}
```

### Error Handler Widget

```dart
// lib/core/error_handler.dart

class ErrorHandler {
  static void handle(BuildContext context, dynamic error) {
    String message = 'An error occurred';
    Color backgroundColor = Colors.red;
    
    if (error is RateLimitException) {
      message = 'Rate limit exceeded. Please wait a moment.';
      backgroundColor = Colors.orange;
    } else if (error is CreditException) {
      message = 'AI credits exhausted. Please add credits.';
      backgroundColor = Colors.amber;
    } else if (error is AuthException) {
      message = 'Authentication required. Please log in.';
      // Navigate to login
      Navigator.of(context).pushReplacementNamed('/login');
      return;
    } else if (error is NetworkException) {
      message = 'Network error. Check your connection.';
    } else if (error is ApiException) {
      message = error.message;
    }
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: backgroundColor,
        action: error is CreditException
            ? SnackBarAction(
                label: 'Add Credits',
                textColor: Colors.white,
                onPressed: () => Navigator.pushNamed(context, '/credits'),
              )
            : null,
      ),
    );
  }
}
```

### Retry Logic

```dart
// lib/core/retry_handler.dart

class RetryHandler {
  static Future<T> withRetry<T>({
    required Future<T> Function() operation,
    int maxAttempts = 3,
    Duration initialDelay = const Duration(seconds: 1),
  }) async {
    int attempt = 0;
    
    while (true) {
      try {
        return await operation();
      } catch (e) {
        attempt++;
        
        // Don't retry on certain errors
        if (e is AuthException || e is CreditException) {
          rethrow;
        }
        
        if (attempt >= maxAttempts) {
          rethrow;
        }
        
        // Exponential backoff
        final delay = initialDelay * math.pow(2, attempt - 1);
        await Future.delayed(delay);
      }
    }
  }
}

// Usage
Future<void> fetchData() async {
  try {
    final result = await RetryHandler.withRetry(
      operation: () => ApiClient.post(
        function: 'some-function',
        body: {'data': 'value'},
      ),
      maxAttempts: 3,
    );
    // Handle result
  } catch (e) {
    ErrorHandler.handle(context, e);
  }
}
```

---

## Rate Limiting

### Rate Limits by Function Type

| Function Type | Limit | Window |
|--------------|-------|--------|
| AI Functions | 10 requests | per minute |
| Communication | 5 requests | per minute |
| General | 60 requests | per minute |

### Rate Limit Handler

```dart
// lib/core/rate_limiter.dart

class RateLimiter {
  final Map<String, List<DateTime>> _requests = {};
  
  bool canMakeRequest(String endpoint, {int limit = 60, Duration window = const Duration(minutes: 1)}) {
    final now = DateTime.now();
    final key = endpoint;
    
    // Initialize if not exists
    _requests[key] ??= [];
    
    // Remove old requests outside window
    _requests[key]!.removeWhere((time) => now.difference(time) > window);
    
    // Check if under limit
    if (_requests[key]!.length >= limit) {
      return false;
    }
    
    // Record this request
    _requests[key]!.add(now);
    return true;
  }
  
  Duration getWaitTime(String endpoint, {int limit = 60, Duration window = const Duration(minutes: 1)}) {
    final now = DateTime.now();
    final key = endpoint;
    
    if (_requests[key] == null || _requests[key]!.isEmpty) {
      return Duration.zero;
    }
    
    // Remove old requests
    _requests[key]!.removeWhere((time) => now.difference(time) > window);
    
    if (_requests[key]!.length < limit) {
      return Duration.zero;
    }
    
    // Calculate wait time until oldest request expires
    final oldest = _requests[key]!.first;
    final elapsed = now.difference(oldest);
    return window - elapsed;
  }
}

// Usage with UI feedback
class RateLimitedButton extends StatefulWidget {
  final String endpoint;
  final Future<void> Function() onPressed;
  final Widget child;
  
  const RateLimitedButton({
    required this.endpoint,
    required this.onPressed,
    required this.child,
  });
  
  @override
  State<RateLimitedButton> createState() => _RateLimitedButtonState();
}

class _RateLimitedButtonState extends State<RateLimitedButton> {
  final _rateLimiter = RateLimiter();
  bool _loading = false;
  
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: _loading ? null : _handlePress,
      child: _loading ? CircularProgressIndicator() : widget.child,
    );
  }
  
  Future<void> _handlePress() async {
    if (!_rateLimiter.canMakeRequest(widget.endpoint, limit: 10)) {
      final waitTime = _rateLimiter.getWaitTime(widget.endpoint, limit: 10);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Rate limit reached. Please wait ${waitTime.inSeconds}s.'),
        ),
      );
      return;
    }
    
    setState(() => _loading = true);
    
    try {
      await widget.onPressed();
    } catch (e) {
      ErrorHandler.handle(context, e);
    } finally {
      setState(() => _loading = false);
    }
  }
}
```

---

## Complete Usage Example

### Chat Screen with All Features

```dart
// lib/screens/ai_chat_screen.dart

class AiChatScreen extends StatefulWidget {
  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final _messages = <ChatMessage>[];
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  bool _loading = false;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hair AI Assistant'),
        actions: [
          IconButton(
            icon: Icon(Icons.info_outline),
            onPressed: _showInfo,
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return ChatBubble(message: message);
              },
            ),
          ),
          if (_loading)
            Padding(
              padding: EdgeInsets.all(8.0),
              child: Row(
                children: [
                  CircularProgressIndicator(),
                  SizedBox(width: 16),
                  Text('AI is thinking...'),
                ],
              ),
            ),
          _buildInputArea(),
        ],
      ),
    );
  }
  
  Widget _buildInputArea() {
    return Container(
      padding: EdgeInsets.all(8.0),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _controller,
              decoration: InputDecoration(
                hintText: 'Ask about hair color, formulas, techniques...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                ),
              ),
              maxLines: null,
              textInputAction: TextInputAction.send,
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          SizedBox(width: 8),
          FloatingActionButton(
            mini: true,
            onPressed: _loading ? null : _sendMessage,
            child: Icon(Icons.send),
          ),
        ],
      ),
    );
  }
  
  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    
    setState(() {
      _messages.add(ChatMessage(text: text, isUser: true));
      _loading = true;
      _controller.clear();
    });
    
    _scrollToBottom();
    
    try {
      final response = await RetryHandler.withRetry(
        operation: () => AiService.chat(
          text,
          _messages.map((m) => Message(
            role: m.isUser ? 'user' : 'assistant',
            content: m.text,
          )).toList(),
        ),
      );
      
      setState(() {
        _messages.add(ChatMessage(text: response, isUser: false));
        _loading = false;
      });
      
      _scrollToBottom();
    } catch (e) {
      setState(() => _loading = false);
      ErrorHandler.handle(context, e);
    }
  }
  
  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }
  
  void _showInfo() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('AI Assistant Info'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Rate Limits:', style: TextStyle(fontWeight: FontWeight.bold)),
            Text('• 10 AI requests per minute'),
            SizedBox(height: 16),
            Text('I can help with:', style: TextStyle(fontWeight: FontWeight.bold)),
            Text('• Hair color formulas'),
            Text('• Color corrections'),
            Text('• Technique guidance'),
            Text('• Product recommendations'),
            Text('• Business advice'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Got it'),
          ),
        ],
      ),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  
  ChatMessage({
    required this.text,
    required this.isUser,
  }) : timestamp = DateTime.now();
}

class ChatBubble extends StatelessWidget {
  final ChatMessage message;
  
  const ChatBubble({required this.message});
  
  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: message.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: EdgeInsets.symmetric(vertical: 4, horizontal: 8),
        padding: EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: message.isUser ? Colors.blue[100] : Colors.grey[200],
          borderRadius: BorderRadius.circular(16),
        ),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        child: Text(message.text),
      ),
    );
  }
}
```

---

## Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Flutter Supabase Plugin**: https://pub.dev/packages/supabase_flutter
- **Stripe Flutter SDK**: https://pub.dev/packages/flutter_stripe
- **Project Backend**: Access via Settings → Cloud in Lovable

---

## Support & Troubleshooting

### Common Issues

**1. Authentication Errors**
```dart
// Always check if user is authenticated before API calls
final user = supabase.auth.currentUser;
if (user == null) {
  // Redirect to login
  Navigator.pushReplacementNamed(context, '/login');
  return;
}
```

**2. Rate Limit Exceeded**
```dart
// Implement request queuing or debouncing
Timer? _debounceTimer;

void searchStylists(String query) {
  _debounceTimer?.cancel();
  _debounceTimer = Timer(Duration(milliseconds: 500), () {
    // Make API call
    StylistSearchService.search(location: query);
  });
}
```

**3. Network Timeouts**
```dart
// Add timeouts to requests
final response = await ApiClient.post(
  function: 'generate-formula',
  body: data,
).timeout(
  Duration(seconds: 30),
  onTimeout: () => throw NetworkException('Request timed out'),
);
```

**4. AI Credit Management**
```dart
// Show credit balance and handle exhaustion
class CreditDisplay extends StatefulWidget {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<int>(
      future: _getCredits(),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          final credits = snapshot.data!;
          if (credits < 10) {
            return AlertBanner(
              message: 'Low credits: $credits remaining',
              action: TextButton(
                child: Text('Add Credits'),
                onPressed: () => Navigator.pushNamed(context, '/credits'),
              ),
            );
          }
        }
        return SizedBox.shrink();
      },
    );
  }
  
  Future<int> _getCredits() async {
    // Implement credit check
    return 50;
  }
}
```

---

## Changelog

**v1.0.0** - Initial comprehensive Flutter documentation with all 55 edge functions
- Complete request/response schemas
- Flutter code examples for all functions
- Error handling patterns
- Rate limiting implementation
- Real-world usage examples
