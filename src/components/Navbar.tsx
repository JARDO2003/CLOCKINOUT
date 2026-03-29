import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Menu, 
  X, 
  LogOut, 
  User, 
  Settings, 
  Shield,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User as UserType } from '@/lib/firebase';

interface NavbarProps {
  user: UserType | null;
  unreadCount: number;
  onNotificationClick: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
}

export function Navbar({ user, unreadCount, onNotificationClick, onLogout, onLoginClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initials = user 
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() 
    : '?';

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-3' : 'py-4'
        }`}
      >
        <div 
          className={`mx-4 md:mx-8 rounded-2xl transition-all duration-300 ${
            isScrolled 
              ? 'glass-strong shadow-lg' 
              : 'glass'
          }`}
        >
          <div className="flex items-center justify-between px-6 py-3">
            {/* Logo */}
            <motion.a 
              href="/"
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-white">Lambda</span>
                <span className="text-xs block text-gray-400 -mt-0.5">Enterprise</span>
              </div>
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {user ? (
                <>
                  {/* Notification Bell */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNotificationClick}
                    className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-250 hover:bg-white/5"
                  >
                    <Bell className="w-5 h-5 text-gray-300" />
                    <AnimatePresence>
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                          style={{ 
                            background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
                            color: 'white'
                          }}
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-xl transition-all duration-250 hover:bg-white/5"
                    >
                      <div 
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                        style={{ 
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                          color: 'white'
                        }}
                      >
                        {initials}
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-medium text-white">{user.prenom} {user.nom}</p>
                        <p className="text-xs text-gray-400">{user.departement || 'Employé'}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                    </motion.button>

                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50"
                          style={{ 
                            background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.2)',
                            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          <div className="p-4 border-b border-white/5">
                            <p className="font-medium text-white">{user.prenom} {user.nom}</p>
                            <p className="text-sm text-gray-400">{user.email}</p>
                          </div>
                          <div className="p-2">
                            <button 
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors"
                            >
                              <User className="w-4 h-4" />
                              Mon profil
                            </button>
                            <button 
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              Paramètres
                            </button>
                            {user.role === 'admin' && (
                              <a 
                                href="/admin"
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 transition-colors"
                              >
                                <Shield className="w-4 h-4" />
                                Administration
                              </a>
                            )}
                          </div>
                          <div className="p-2 border-t border-white/5">
                            <button 
                              onClick={onLogout}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Déconnexion
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <Button
                  onClick={onLoginClick}
                  className="px-6 py-2.5 rounded-xl font-semibold text-white transition-all duration-250 hover:opacity-90"
                  style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  Connexion
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-250 hover:bg-white/5"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(20px)' }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-80 p-6"
              style={{ 
                background: 'linear-gradient(180deg, #1a1a25 0%, #151520 100%)',
                borderLeft: '1px solid rgba(139, 92, 246, 0.2)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {user ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold"
                      style={{ 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                        color: 'white'
                      }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-white">{user.prenom} {user.nom}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button 
                      onClick={() => { onNotificationClick(); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      Notifications
                      {unreadCount > 0 && (
                        <span 
                          className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ 
                            background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
                            color: 'white'
                          }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">
                      <User className="w-5 h-5" />
                      Mon profil
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">
                      <Settings className="w-5 h-5" />
                      Paramètres
                    </button>
                    {user.role === 'admin' && (
                      <a 
                        href="/admin"
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-white/5 transition-colors"
                      >
                        <Shield className="w-5 h-5" />
                        Administration
                      </a>
                    )}
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <button 
                      onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Déconnexion
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)'
                    }}
                  >
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Lambda Enterprise</h3>
                    <p className="text-gray-400 text-sm">Connectez-vous pour accéder à votre espace</p>
                  </div>
                  <Button
                    onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}
                    className="w-full py-4 rounded-xl font-semibold text-white"
                    style={{ 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                    }}
                  >
                    Connexion
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
