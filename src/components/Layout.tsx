import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bookmark, User, Share2, Mail, LogOut, LogIn, X, Menu } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser, browserPopupRedirectResolver } from 'firebase/auth';
import { APP_VERSION } from '../constants';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogin = async () => {
    setAuthError(null);
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      // Use browserPopupRedirectResolver to improve compatibility in iframe/popup environments
      await signInWithPopup(auth, provider, browserPopupRedirectResolver);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError('O popup foi bloqueado pelo seu navegador. Por favor, permita popups para este site.');
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // Just user closing the popup
      } else if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        setAuthError(`Domínio não autorizado. O Firebase não reconhece "${domain}". No Console do Firebase (Authentication > Settings > Authorized Domains), certifique-se de adicionar EXATAMENTE: "${domain}" (sem https:// nem barras).`);
      } else {
        setAuthError(`Erro ao entrar: ${error.message} (Código: ${error.code})`);
      }
    } finally {
      setIsLoggingIn(false);
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

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/explore', label: 'Explorar' },
    { path: '/categories', label: 'Categorias' },
    { path: '/submit', label: 'Enviar' },
    { path: '/register-collaborator', label: 'Seja um Colaborador' },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-secondary-container selection:text-secondary">
      {/* Error Banner */}
      {authError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-red-50 text-red-600 px-6 py-3 rounded-2xl border border-red-100 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <span className="text-sm font-semibold">{authError}</span>
          <button onClick={() => setAuthError(null)} className="p-1 hover:bg-red-100 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4 md:gap-12">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="text-xl md:text-2xl font-bold text-primary tracking-tight font-sans">
              Alquimia do Prato
            </Link>
            <div className="hidden md:flex items-center gap-8 font-sans font-medium text-on-surface-variant">
              {navLinks.map(link => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`${isActive(link.path) ? 'text-primary font-bold border-b-2 border-primary' : 'hover:text-primary'} pb-1 transition-all`}
                >
                  {link.label}
                </Link>
              ))}
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
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar receitas..." 
                className="pl-10 pr-4 py-2 rounded-full border-none bg-surface-container text-body-md focus:ring-2 focus:ring-primary w-64 outline-none"
              />
            </div>
            <div className="flex items-center gap-3 md:gap-4 text-on-surface-variant">
              <button className="hover:text-primary transition-colors"><Bookmark className="w-6 h-6" /></button>
              {user ? (
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-stone-200 bg-stone-100">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-full h-full p-1 text-stone-400" />
                    )}
                  </div>
                  <button onClick={handleLogout} className="hover:text-primary transition-colors flex items-center gap-2 font-semibold text-sm">
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className="hidden sm:inline">Sair</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleLogin} 
                  disabled={isLoggingIn}
                  className={`flex items-center gap-2 font-semibold text-sm transition-all ${isLoggingIn ? 'opacity-50 cursor-wait' : 'hover:text-primary'}`}
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <LogIn className="w-6 h-6 shrink-0" />
                  )}
                  <span className="hidden sm:inline">{isLoggingIn ? 'Conectando...' : 'Entrar'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-t border-stone-100 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 space-y-2">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Buscar receitas..." 
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-none bg-stone-50 text-base focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              {navLinks.map(link => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`block p-3 rounded-xl font-bold transition-all ${isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-stone-50'}`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <Link 
                  to="/manage" 
                  className={`block p-3 rounded-xl font-bold transition-all ${isActive('/manage') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-stone-50'}`}
                >
                  Minhas Receitas
                </Link>
              )}
              {user?.email === 'sagacitas.sistemas@gmail.com' && (
                <Link 
                  to="/admin" 
                  className={`block p-3 rounded-xl font-bold transition-all ${isActive('/admin') ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-stone-50'}`}
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        )}
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
                © 2026 Alquimia do Prato. A magia da cozinha acessível a todos, em todo lugar.
                <span className="block mt-1 text-[10px] font-bold opacity-50 uppercase tracking-widest">v{APP_VERSION}</span>
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
