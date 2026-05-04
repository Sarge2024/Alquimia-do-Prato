import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bookmark, User, Share2, Mail, LogOut, LogIn } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background selection:bg-secondary-container selection:text-secondary">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-2xl font-bold text-primary tracking-tight font-sans">
              Alquimia do Prato
            </Link>
            <div className="hidden md:flex items-center gap-8 font-sans font-medium text-on-surface-variant">
              <Link 
                to="/" 
                className={`${isActive('/') ? 'text-primary font-bold border-b-2 border-primary' : 'hover:text-primary'} pb-1 transition-all`}
              >
                Início
              </Link>
              <Link 
                to="/explore" 
                className={`${isActive('/explore') ? 'text-primary font-bold border-b-2 border-primary' : 'hover:text-primary'} pb-1 transition-all`}
              >
                Explorar
              </Link>
              <Link 
                to="/categories" 
                className={`${isActive('/categories') ? 'text-primary font-bold border-b-2 border-primary' : 'hover:text-primary'} pb-1 transition-all`}
              >
                Categorias
              </Link>
              <Link 
                to="/submit" 
                className={`${isActive('/submit') ? 'text-primary font-bold border-b-2 border-primary' : 'hover:text-primary'} pb-1 transition-all`}
              >
                Enviar
              </Link>
              {user && (
                <Link 
                  to="/manage" 
                  className={`${isActive('/manage') ? 'text-primary font-bold border-b-2 border-primary' : 'hover:text-primary'} pb-1 transition-all`}
                >
                  Minhas Receitas
                </Link>
              )}
              {user?.email === 'sagacitas.sistemas@gmail.com' && (
                <Link 
                  to="/admin" 
                  className={`${isActive('/admin') ? 'text-primary font-bold border-b-2 border-primary' : 'hover:text-primary'} pb-1 transition-all`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar receitas..." 
                className="pl-10 pr-4 py-2 rounded-full border-none bg-surface-container text-body-md focus:ring-2 focus:ring-primary w-64 outline-none"
              />
            </div>
            <div className="flex items-center gap-4 text-on-surface-variant">
              <button className="hover:text-primary transition-colors"><Bookmark className="w-6 h-6" /></button>
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 bg-stone-100">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-full h-full p-1 text-stone-400" />
                    )}
                  </div>
                  <button onClick={handleLogout} className="hover:text-primary transition-colors flex items-center gap-2 font-semibold text-sm">
                    <LogOut className="w-5 h-5" />
                    <span className="hidden lg:inline">Sair</span>
                  </button>
                </div>
              ) : (
                <button onClick={handleLogin} className="hover:text-primary transition-colors flex items-center gap-2 font-semibold text-sm">
                  <LogIn className="w-6 h-6" />
                  <span className="hidden lg:inline">Entrar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-28">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest border-t border-stone-200 mt-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex flex-col items-center md:items-start gap-2">
              <span className="text-2xl font-bold text-primary">Alquimia do Prato</span>
              <p className="text-on-surface-variant text-center md:text-left">
                © 2024 Alquimia do Prato. Nutricionando cozinheiros de todos os lugares.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:flex gap-8 text-on-surface-variant font-semibold">
              <Link to="/" className="hover:text-primary transition-colors">Sobre Nós</Link>
              <Link to="/" className="hover:text-primary transition-colors">Privacidade</Link>
              <Link to="/" className="hover:text-primary transition-colors">Termos</Link>
              <Link to="/" className="hover:text-primary transition-colors">Contato</Link>
            </div>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 rounded-full border border-stone-200 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary transition-all">
                <Mail className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
