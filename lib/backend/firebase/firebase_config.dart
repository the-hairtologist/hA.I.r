import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

Future initFirebase() async {
  if (kIsWeb) {
    await Firebase.initializeApp(
        options: FirebaseOptions(
            apiKey: "AIzaSyD32vkrXD_-gz6FL9g5j4PUkr-HVn6kGm4",
            authDomain: "h-a-ir-4iwwhv.firebaseapp.com",
            projectId: "h-a-ir-4iwwhv",
            storageBucket: "h-a-ir-4iwwhv.firebasestorage.app",
            messagingSenderId: "904463110293",
            appId: "1:904463110293:web:4ad6f817c6f49262b78b9c",
            measurementId: "G-NQEF7XZT19"));
  } else {
    await Firebase.initializeApp();
  }
}
