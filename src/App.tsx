import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast';
import { LandingPage } from './features/landing/LandingPage';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './features/overview/OverviewPage';
import { SosPage } from './features/sos/SosPage';
import { NetworkPage } from './features/network/NetworkPage';
import { TriagePage } from './features/triage/TriagePage';
import { MapPage } from './features/map/MapPage';
import { SmsPage } from './features/sms/SmsPage';
import { ContactsPage } from './features/contacts/ContactsPage';
import { OfflineGuidePage } from './features/guide/OfflineGuidePage';
import { SettingsPage } from './features/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Emergency Dashboard App Shell */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="sos" element={<SosPage />} />
            <Route path="network" element={<NetworkPage />} />
            <Route path="triage" element={<TriagePage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="sms" element={<SmsPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="guide" element={<OfflineGuidePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;
