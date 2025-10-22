/**
 * hA.I.r - AI-Powered Hair Salon Management Platform
 * Copyright © 2025 hA.I.r. All Rights Reserved.
 */

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initSentry } from "@/lib/monitoring";

// Initialize Sentry error monitoring first
initSentry();

// Render app
createRoot(document.getElementById("root")!).render(<App />);
