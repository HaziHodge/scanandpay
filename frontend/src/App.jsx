import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Public Menu Drop-in
import MenuPage from './pages/menu/MenuPage';
import ConfirmacionPage from './pages/menu/ConfirmacionPage';

// Dashboard Views
import LoginPage from './pages/dashboard/LoginPage';
import Sidebar from './components/dashboard/Sidebar';
import OrdersPage from './pages/dashboard/OrdersPage';
import MenuEditorPage from './pages/dashboard/MenuEditorPage';
import TablesPage from './pages/dashboard/TablesPage';
import StatsPage from './pages/dashboard/StatsPage';

const DashboardLayout = ({ children }) => (
  <div className="flex bg-gray-50 min-h-screen font-sans">
    <Sidebar />
    <main className="flex-1 p-4 sm:p-8 ml-0 sm:ml-64 overflow-y-auto">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/menu/:venueSlug/:tableId" element={<MenuPage />} />
        <Route path="/menu/:venueSlug/confirmacion/:orderId" element={<ConfirmacionPage />} />

        {/* DASHBOARD ROUTES */}
        <Route path="/dashboard/login" element={<LoginPage />} />
        
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route path="" element={<Navigate to="/dashboard/orders" replace />} />
          <Route path="orders" element={<DashboardLayout><OrdersPage /></DashboardLayout>} />
          <Route path="menu" element={<DashboardLayout><MenuEditorPage /></DashboardLayout>} />
          <Route path="tables" element={<DashboardLayout><TablesPage /></DashboardLayout>} />
          <Route path="stats" element={<DashboardLayout><StatsPage /></DashboardLayout>} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/dashboard/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
