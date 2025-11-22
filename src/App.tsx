import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, RequireAuth } from 'miaoda-auth-react';
import { supabase } from '@/db/supabase';
import Header from '@/components/common/Header';

import routes from './routes';

const AppContent: React.FC = () => {
  const location = useLocation();
  const showHeader = location.pathname !== '/login';

  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header />}
      <main className="flex-grow">
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider client={supabase}>
        <RequireAuth whiteList={['/login']}>
          <AppContent />
        </RequireAuth>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

export default App;
