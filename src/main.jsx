import { createRoot } from "react-dom/client";
import { DeviceProvider } from "./contexts/DeviceContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PopupProvider } from "./contexts/PopupContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Provider as ReduxProvider } from "react-redux";
import store from "./app/store";
import App from "./App";

// Chỉ dev: dựng hàng chờ thử từ console khi chưa có backend
if (import.meta.env.DEV) window.__store = store;

createRoot(document.getElementById("root")).render(
  <ReduxProvider store={store}>
    <DeviceProvider>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <PopupProvider>
              <App />
            </PopupProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </DeviceProvider>
  </ReduxProvider>
);
