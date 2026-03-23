import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sileo";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      position="top-center"
      options={{
        fill: "#171717",
        roundness: 16,
        styles: {
          title: "sileo-title",
          description: "sileo-description",
          badge: "sileo-badge",
        },
      }}
    />
    <App />
  </StrictMode>,
);
