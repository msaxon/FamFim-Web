import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoginScreen } from './screens/LoginScreen';
import { BudgetsScreen } from './screens/BudgetsScreen';
import { CreateBudgetScreen } from './screens/CreateBudgetScreen';
import { BudgetDetailScreen } from './screens/BudgetDetailScreen';
import { TransactionsScreen } from './screens/TransactionsScreen';
import { AuthManager } from './services/auth/authManager';
import { DataProvider } from './context/DataContext';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    AuthManager.isSignedIn().then(setIsAuthenticated);
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DataProvider>{children}</DataProvider>;
};

function App() {
  return (
    <GoogleOAuthProvider clientId="461292220360-aaos9ejh6ftrahi1es5t4irgjave7prd.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <BudgetsScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-budget"
            element={
              <ProtectedRoute>
                <CreateBudgetScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budget/:budgetId"
            element={
              <ProtectedRoute>
                <BudgetDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsScreen />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/budgets" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
