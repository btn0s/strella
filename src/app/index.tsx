import { StrictMode } from "react";

import ReactDOM from "react-dom/client";

import "@/app/globals.css";
import "@xyflow/react/dist/style.css";

import App from "@/app/main";

// Render the app
const rootElement = document.getElementById("root");

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
