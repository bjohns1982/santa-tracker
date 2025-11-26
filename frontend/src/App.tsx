import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import TourGuideDashboard from './pages/TourGuideDashboard';
import FamilySignUp from './pages/FamilySignUp';
import FamilyView from './pages/FamilyView';
import FamilyLookup from './pages/FamilyLookup';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<TourGuideDashboard />} />
          <Route path="/signup/:inviteCode" element={<FamilySignUp />} />
          <Route path="/lookup/:inviteCode" element={<FamilyLookup />} />
          <Route path="/family/:familyId" element={<FamilyView />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

