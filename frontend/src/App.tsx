import { useState, useEffect } from "react";
import type { ComponentType } from "react";
import type { PageKey } from "./components/layout/nav";
import type { User, Alert } from "./types";
import { api, removeToken } from "./services/api";
import AppShell from "./components/layout/AppShell";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Forecasts from "./pages/Forecasts";
import Stations from "./pages/Stations";
import Heatwaves from "./pages/Heatwaves";
import Alerts from "./pages/Alerts";
import Advisories from "./pages/Advisories";
import Validation from "./pages/Validation";
import Settings from "./pages/Settings";

const pages: Record<PageKey, ComponentType> = {
  overview: Dashboard,
  forecasts: Forecasts,
  stations: Stations,
  heatwaves: Heatwaves,
  alerts: Alerts,
  advisories: Advisories,
  validation: Validation,
  settings: Settings,
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<PageKey>("overview");
  const [notifications, setNotifications] = useState<Alert[]>([]);

  useEffect(() => {
    if (user) {
      api.getAlerts()
        .then((alerts) => setNotifications(alerts))
        .catch(() => setNotifications([]));
    }
  }, [user, page]);

  function handleLogout() {
    removeToken();
    setUser(null);
    setPage("overview");
  }

  if (!user) return <Login onLogin={setUser} />;

  const Page = pages[page];

  return (
    <AppShell
      active={page}
      onNavigate={setPage}
      user={user}
      onLogout={handleLogout}
      notifications={notifications}
    >
      <Page />
    </AppShell>
  );
}
