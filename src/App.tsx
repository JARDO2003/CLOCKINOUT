import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Users, 
  MessageSquare, 
  Bell, 
  Shield,
  ArrowRight,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { LoginModal } from '@/components/LoginModal';
import { NotificationPanel } from '@/components/NotificationPanel';
import { CommunityFeed } from '@/components/CommunityFeed';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { usePosts } from '@/hooks/usePosts';

function App() {
  const { user, loading: authLoading, error: authError, login, register, logout } = useAuth();
  const { 
    notifications, 
    unreadCount, 
    permissionStatus,
    requestPermission,
    markAsRead, 
    markAllAsRead 
  } = useNotifications(user);
  const {
    posts,
    loading: postsLoading,
    uploadProgress,
    publishPost,
    toggleLike,
    deletePost,
    addComment,
    loadComments,
    toggleComments,
    sharePost
  } = usePosts(user);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'community'>('home');
  const [stats, setStats] = useState({ users: 0, posts: 0, online: 0 });

  // Request notification permission on login
  useEffect(() => {
    if (user && permissionStatus === 'default') {
      requestPermission();
    }
  }, [user, permissionStatus]);

  // Load stats
  useEffect(() => {
    // Simulate stats - in real app, fetch from Firestore
    setStats({
      users: 42,
      posts: 128,
      online: 15
    });
  }, []);

  // Scroll to section
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Navbar */}
      <Navbar
        user={user}
        unreadCount={unreadCount}
        onNotificationClick={() => setIsNotificationOpen(true)}
        onLogout={logout}
        onLoginClick={() => setIsLoginOpen(true)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={login}
        onRegister={register}
        error={authError}
        loading={authLoading}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />

      {/* Main Content */}
      <main className="pt-24 pb-16">
        {!user ? (
          /* Landing Page */
          <div className="space-y-24">
            {/* Hero Section */}
            <section className="relative px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  {/* Left Content */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center lg:text-left"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                      style={{ 
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                      <span className="text-sm text-violet-300">Système actif 2025</span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
                    >
                      L'espace de travail{' '}
                      <span 
                        className="bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
                      >
                        intelligent
                      </span>{' '}
                      pour votre entreprise
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-lg text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0"
                    >
                      Lambda Enterprise connecte vos équipes avec des outils modernes : 
                      notifications en temps réel, communauté interne, et gestion intelligente.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    >
                      <Button
                        onClick={() => setIsLoginOpen(true)}
                        className="px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-250 hover:opacity-90"
                        style={{ 
                          background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)'
                        }}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Commencer maintenant
                      </Button>
                      <Button
                        onClick={() => scrollToSection('features')}
                        variant="outline"
                        className="px-8 py-4 rounded-xl font-semibold text-white border-violet-500/30 hover:bg-violet-500/10"
                      >
                        Découvrir les fonctionnalités
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex gap-8 mt-12 justify-center lg:justify-start"
                    >
                      <div>
                        <p className="text-3xl font-bold text-white">{stats.users}+</p>
                        <p className="text-sm text-gray-400">Employés</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-white">{stats.posts}+</p>
                        <p className="text-sm text-gray-400">Publications</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-emerald-400">{stats.online}</p>
                        <p className="text-sm text-gray-400">En ligne</p>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Right Visual */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="relative hidden lg:block"
                  >
                    <div 
                      className="relative rounded-3xl p-8"
                      style={{ 
                        background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.2)'
                      }}
                    >
                      {/* Mock UI */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ 
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                            }}
                          >
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">Lambda Enterprise</p>
                            <p className="text-xs text-gray-400">Espace collaboratif</p>
                          </div>
                        </div>

                        {/* Mock Posts */}
                        {[1, 2].map((i) => (
                          <div 
                            key={i}
                            className="p-4 rounded-xl"
                            style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                          >
                            <div className="flex gap-3 mb-3">
                              <div 
                                className="w-8 h-8 rounded-lg"
                                style={{ 
                                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                                }}
                              />
                              <div>
                                <p className="text-sm text-white">Jean Dupont</p>
                                <p className="text-xs text-gray-500">Il y a 2h</p>
                              </div>
                            </div>
                            <div className="h-2 bg-white/10 rounded mb-2" />
                            <div className="h-2 bg-white/10 rounded w-2/3" />
                          </div>
                        ))}

                        {/* Mock Notification */}
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -right-4 top-1/3 p-4 rounded-xl"
                          style={{ 
                            background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                            >
                              <Bell className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">Nouvelle notification</p>
                              <p className="text-xs text-gray-400">Marie a publié un post</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Glow Effect */}
                    <div 
                      className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-30 blur-3xl"
                      style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)' }}
                    />
                    <div 
                      className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-20 blur-3xl"
                      style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.5) 0%, transparent 70%)' }}
                    />
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section id="features" className="px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-16"
                >
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Tout ce dont votre équipe a besoin
                  </h2>
                  <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    Une suite complète d'outils pour communiquer, collaborer et rester informé.
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      icon: Bell,
                      title: 'Notifications temps réel',
                      description: 'Recevez des alertes instantanées pour les publications importantes et les annonces.',
                      color: 'from-violet-500 to-purple-500'
                    },
                    {
                      icon: MessageSquare,
                      title: 'Communauté interne',
                      description: 'Partagez des idées, photos et vidéos avec vos collègues dans un espace dédié.',
                      color: 'from-cyan-500 to-blue-500'
                    },
                    {
                      icon: Users,
                      title: 'Gestion des équipes',
                      description: 'Organisez vos collaborateurs par départements et suivez leur activité.',
                      color: 'from-emerald-500 to-teal-500'
                    },
                    {
                      icon: Shield,
                      title: 'Sécurité entreprise',
                      description: 'Vos données sont protégées avec un chiffrement de niveau entreprise.',
                      color: 'from-amber-500 to-orange-500'
                    },
                    {
                      icon: Zap,
                      title: 'Performance optimale',
                      description: 'Interface rapide et réactive pour une expérience utilisateur fluide.',
                      color: 'from-pink-500 to-rose-500'
                    },
                    {
                      icon: Bell,
                      title: 'Accessibilité totale',
                      description: 'Accédez à votre espace depuis n\'importe quel appareil, n\'importe où.',
                      color: 'from-indigo-500 to-violet-500'
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group p-6 rounded-2xl transition-all duration-300 hover:scale-105"
                      style={{ 
                        background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.1)'
                      }}
                    >
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.color}`}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative rounded-3xl p-12 text-center overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <div 
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)'
                    }}
                  />
                  
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Prêt à rejoindre Lambda ?
                  </h2>
                  <p className="text-lg text-gray-400 mb-8 max-w-xl mx-auto">
                    Créez votre compte maintenant et découvrez un nouvel espace de travail collaboratif.
                  </p>
                  
                  <Button
                    onClick={() => setIsLoginOpen(true)}
                    className="px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-250 hover:opacity-90"
                    style={{ 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)'
                    }}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Créer mon compte
                  </Button>

                  {/* Glow */}
                  <div 
                    className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, transparent 70%)' }}
                  />
                </motion.div>
              </div>
            </section>

            {/* Footer */}
            <footer className="px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
              <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                      }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-white">Lambda</span>
                      <span className="text-xs block text-gray-400">Enterprise</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    © 2025 Lambda Enterprise. Tous droits réservés.
                  </p>
                  
                  <div className="flex items-center gap-6">
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Confidentialité
                    </a>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Conditions
                    </a>
                    <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        ) : (
          /* Dashboard */
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              {/* Welcome */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
              >
                <h1 className="text-3xl font-bold text-white mb-2">
                  Bonjour, {user.prenom} !
                </h1>
                <p className="text-gray-400">
                  Bienvenue dans votre espace de travail Lambda.
                </p>
              </motion.div>

              {/* Tabs */}
              <div className="flex gap-2 mb-8">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-250 ${
                    activeTab === 'home'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={activeTab === 'home' ? { 
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  } : {}}
                >
                  Accueil
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-250 ${
                    activeTab === 'community'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  style={activeTab === 'community' ? { 
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  } : {}}
                >
                  Communauté
                </button>
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'home' ? (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {/* Quick Stats */}
                    <div 
                      className="p-6 rounded-2xl"
                      style={{ 
                        background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.1)'
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                        >
                          <Users className="w-5 h-5 text-violet-400" />
                        </div>
                        <h3 className="font-semibold text-white">Collègues</h3>
                      </div>
                      <p className="text-3xl font-bold text-white">{stats.users}</p>
                      <p className="text-sm text-gray-400">Employés actifs</p>
                    </div>

                    <div 
                      className="p-6 rounded-2xl"
                      style={{ 
                        background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.1)'
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(6, 182, 212, 0.2)' }}
                        >
                          <MessageSquare className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h3 className="font-semibold text-white">Publications</h3>
                      </div>
                      <p className="text-3xl font-bold text-white">{stats.posts}</p>
                      <p className="text-sm text-gray-400">Posts ce mois</p>
                    </div>

                    <div 
                      className="p-6 rounded-2xl"
                      style={{ 
                        background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.1)'
                      }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(16, 185, 129, 0.2)' }}
                        >
                          <Zap className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="font-semibold text-white">En ligne</h3>
                      </div>
                      <p className="text-3xl font-bold text-emerald-400">{stats.online}</p>
                      <p className="text-sm text-gray-400">Connectés maintenant</p>
                    </div>

                    {/* Recent Activity */}
                    <div 
                      className="md:col-span-2 lg:col-span-3 p-6 rounded-2xl"
                      style={{ 
                        background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.1)'
                      }}
                    >
                      <h3 className="font-semibold text-white mb-4">Activité récente</h3>
                      <div className="space-y-4">
                        {posts.slice(0, 3).map((post) => (
                          <div 
                            key={post.id}
                            className="flex items-center gap-4 p-4 rounded-xl"
                            style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                          >
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                              style={{ 
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                                color: 'white'
                              }}
                            >
                              {post.uName?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">{post.uName}</p>
                              <p className="text-sm text-gray-400 line-clamp-1">{post.txt}</p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(post.tsMs).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        ))}
                        {posts.length === 0 && (
                          <p className="text-gray-400 text-center py-8">
                            Aucune activité récente
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="community"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <CommunityFeed
                      user={user}
                      posts={posts}
                      loading={postsLoading}
                      uploadProgress={uploadProgress}
                      onPublish={publishPost}
                      onLike={toggleLike}
                      onDelete={deletePost}
                      onComment={addComment}
                      onLoadComments={loadComments}
                      onToggleComments={toggleComments}
                      onShare={sharePost}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
