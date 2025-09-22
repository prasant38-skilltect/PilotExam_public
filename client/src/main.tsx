import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';
const clientId = "763566059319-6u38bncbnh24iomicrm5hss7b5s4n60g.apps.googleusercontent.com"

createRoot(document.getElementById("root")!).render(<GoogleOAuthProvider clientId={clientId}><App /></GoogleOAuthProvider>);
