import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Categories from './pages/Categories';
import Submit from './pages/Submit';
import RecipeDetail from './pages/RecipeDetail';
import ManageRecipes from './pages/ManageRecipes';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/submit/:id" element={<Submit />} />
          <Route path="/manage" element={<ManageRecipes />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          {/* Fallback for others to home or useful 404 */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </Router>
  );
}
