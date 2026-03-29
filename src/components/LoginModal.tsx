import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, User, Building2, Phone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (data: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    contact?: string;
    departement?: string;
    poste?: string;
  }) => Promise<boolean>;
  error: string | null;
  loading: boolean;
}

export function LoginModal({ isOpen, onClose, onLogin, onRegister, error, loading }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [contact, setContact] = useState('');
  const [departement, setDepartement] = useState('');
  const [poste, setPoste] = useState('');
  
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setStep(1);
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setNom('');
    setPrenom('');
    setContact('');
    setDepartement('');
    setPoste('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onLogin(email, password);
    if (success) {
      onClose();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onRegister({
      nom,
      prenom,
      email,
      password,
      contact,
      departement,
      poste
    });
    if (success) {
      onClose();
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setStep(1);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(16px)' }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl"
          style={{ 
            background: 'linear-gradient(145deg, #151520 0%, #1a1a25 100%)',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}
        >
          {/* Glow effect */}
          <div 
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)' }}
          />
          <div 
            className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.5) 0%, transparent 70%)' }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-250 hover:bg-white/5 z-10"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Header */}
          <div className="relative p-8 pb-4 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)'
              }}
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' ? 'Bon retour' : 'Rejoindre Lambda'}
            </h2>
            <p className="text-sm text-gray-400">
              {mode === 'login' 
                ? 'Connectez-vous à votre espace professionnel' 
                : 'Créez votre compte entreprise'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex px-8 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all duration-250 ${
                mode === 'login' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={mode === 'login' ? { 
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              } : {}}
            >
              Connexion
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all duration-250 ${
                mode === 'register' 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={mode === 'register' ? { 
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              } : {}}
            >
              Inscription
            </button>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-xl text-sm"
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171'
                }}
              >
                {error}
              </motion.div>
            )}

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email professionnel"
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500 transition-all duration-250 focus:outline-none"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(139, 92, 246, 0.15)'
                    }}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className="w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-gray-500 transition-all duration-250 focus:outline-none"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(139, 92, 246, 0.15)'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-250 hover:opacity-90 disabled:opacity-50"
                  style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                {step === 1 ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={nom}
                          onChange={(e) => setNom(e.target.value)}
                          placeholder="Nom"
                          className="w-full pl-10 pr-3 py-3 rounded-xl text-white text-sm placeholder-gray-500 transition-all duration-250 focus:outline-none"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(139, 92, 246, 0.15)'
                          }}
                          required
                        />
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={prenom}
                          onChange={(e) => setPrenom(e.target.value)}
                          placeholder="Prénom"
                          className="w-full pl-10 pr-3 py-3 rounded-xl text-white text-sm placeholder-gray-500 transition-all duration-250 focus:outline-none"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(139, 92, 246, 0.15)'
                          }}
                          required
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email professionnel"
                        className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500 transition-all duration-250 focus:outline-none"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(139, 92, 246, 0.15)'
                        }}
                        required
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe (8 caractères min)"
                        minLength={8}
                        className="w-full pl-12 pr-12 py-4 rounded-xl text-white placeholder-gray-500 transition-all duration-250 focus:outline-none"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(139, 92, 246, 0.15)'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!nom || !prenom || !email || password.length < 8}
                      className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-250 hover:opacity-90 disabled:opacity-50"
                      style={{ 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                      }}
                    >
                      Continuer
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={departement}
                        onChange={(e) => setDepartement(e.target.value)}
                        placeholder="Département"
                        className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500 transition-all duration-250 focus:outline-none"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(139, 92, 246, 0.15)'
                        }}
                      />
                    </div>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={poste}
                        onChange={(e) => setPoste(e.target.value)}
                        placeholder="Poste / Fonction"
                        className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500 transition-all duration-250 focus:outline-none"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(139, 92, 246, 0.15)'
                        }}
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Téléphone (optionnel)"
                        className="w-full pl-12 pr-4 py-4 rounded-xl text-white placeholder-gray-500 transition-all duration-250 focus:outline-none"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(139, 92, 246, 0.15)'
                        }}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 rounded-xl font-semibold transition-all duration-250"
                        variant="outline"
                      >
                        Retour
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 rounded-xl font-semibold text-white transition-all duration-250 hover:opacity-90 disabled:opacity-50"
                        style={{ 
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                          boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                        }}
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          'Créer mon compte'
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {mode === 'login' ? "Pas encore de compte ?" : "Déjà un compte ?"}
                <button
                  onClick={switchMode}
                  className="ml-1 font-medium hover:underline"
                  style={{ color: '#a78bfa' }}
                >
                  {mode === 'login' ? "S'inscrire" : "Se connecter"}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
