import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Categories from './pages/Categories';
import Submit from './pages/Submit';
import RecipeDetail from './pages/RecipeDetail';
import ManageRecipes from './pages/ManageRecipes';
import AdminDashboard from './pages/AdminDashboard';
import Manifesto from './pages/Manifesto';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/categories" element={<Categories />} />
            
            {/* Protected Client Routes */}
            <Route path="/submit" element={<ProtectedRoute><Submit /></ProtectedRoute>} />
            <Route path="/submit/:id" element={<ProtectedRoute><Submit /></ProtectedRoute>} />
            <Route path="/manage" element={<ProtectedRoute><ManageRecipes /></ProtectedRoute>} />
            
            {/* Admin Only Routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/manifesto" element={<Manifesto />} />
            
            <Route path="*" element={<Home />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
