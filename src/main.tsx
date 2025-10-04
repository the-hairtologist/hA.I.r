import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

// Initialize analytics on app load
initAnalytics();

createRoot(document.getElementById("root")!).render(<App />);
