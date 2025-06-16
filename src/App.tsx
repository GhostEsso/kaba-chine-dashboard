import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Deliveries from './pages/Deliveries';
import DeliveryDetail from './pages/DeliveryDetail';
import Finances from './pages/Finances';
import Clients from './pages/Clients';
import Communications from './pages/Communications';
import ApiAdmin from './pages/ApiAdmin';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import TrainingRequests from './pages/TrainingRequests';
import ShippingRates from './pages/ShippingRates';
import AfalikaAdmin from './pages/AfalikaAdmin';
import Layout from './components/layout/Layout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/deliveries"
            element={
              <ProtectedRoute>
                <Layout>
                  <Deliveries />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/deliveries/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <DeliveryDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/finances"
            element={
              <ProtectedRoute>
                <Layout>
                  <Finances />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Layout>
                  <Clients />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/communications"
            element={
              <ProtectedRoute>
                <Layout>
                  <Communications />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/api-admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <ApiAdmin />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/shipping-rates"
            element={
              <ProtectedRoute>
                <Layout>
                  <ShippingRates />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/afalika-admin"
            element={
              <ProtectedRoute>
                <Layout>
                  <AfalikaAdmin />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/training"
            element={
              <ProtectedRoute>
                <Layout>
                  <TrainingRequests />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;