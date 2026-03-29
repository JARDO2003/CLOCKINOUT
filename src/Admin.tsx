import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  Settings, 
  LogOut,
  Send,
  Check,
  Search,
  Sparkles,
  User as UserIcon,
  MessageSquare,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db, collection, doc, getDocs, deleteDoc, serverTimestamp, addDoc, type User as UserType } from '@/lib/firebase';

interface AdminProps {
  onLogout: () => void;
}

export function Admin({ onLogout }: AdminProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'notifications' | 'settings'>('dashboard');
  const [users, setUsers] = useState<UserType[]>([]);
  const [, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Notification form states
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [notificationType, setNotificationType] = useState<'general' | 'post' | 'system'>('general');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    onlineUsers: 0,
    totalPosts: 0,
    totalNotifications: 0
  });

  // Load users and stats
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData: UserType[] = [];
      usersSnapshot.forEach((doc) => {
        usersData.push({ uid: doc.id, ...doc.data() } as UserType);
      });
      setUsers(usersData);

      // Load stats
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
      
      setStats({
        totalUsers: usersData.length,
        onlineUsers: usersData.filter(u => u.isOnline).length,
        totalPosts: postsSnapshot.size,
        totalNotifications: notificationsSnapshot.size
      });
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const filteredUsers = users.filter(u => 
    (u.prenom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.departement?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationBody.trim()) return;
    
    setSending(true);
    try {
      const notificationData = {
        title: notificationTitle,
        body: notificationBody,
        type: notificationType,
        senderId: 'admin',
        senderName: 'Administrateur',
        recipientIds: sendToAll ? [] : selectedUsers,
        read: false,
        ts: serverTimestamp(),
        tsMs: Date.now()
      };

      if (sendToAll) {
        // Send to all users
        await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          recipientId: 'all'
        });
      } else {
        // Send to selected users
        const promises = selectedUsers.map(userId =>
          addDoc(collection(db, 'notifications'), {
            ...notificationData,
            recipientId: userId
          })
        );
        await Promise.all(promises);
      }

      // Save to history
      await addDoc(collection(db, 'notification_history'), {
        ...notificationData,
        sentCount: sendToAll ? users.length : selectedUsers.length,
        sentAt: serverTimestamp()
      });

      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
      
      // Reset form
      setNotificationTitle('');
      setNotificationBody('');
      setSelectedUsers([]);
      
    } catch (error) {
      console.error('Error sending notification:', error);
    }
    setSending(false);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.uid));
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(prev => prev.filter(u => u.uid !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const initials = (prenom?: string, nom?: string) => 
    `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside 
        className="w-64 fixed left-0 top-0 bottom-0 z-40 hidden lg:block"
        style={{ 
          background: 'linear-gradient(180deg, #1a1a25 0%, #151520 100%)',
          borderRight: '1px solid rgba(139, 92, 246, 0.1)'
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
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
              <span className="text-xs block text-violet-400">Admin</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
              activeTab === 'dashboard'
                ? 'text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            style={activeTab === 'dashboard' ? { 
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            } : {}}
          >
            <LayoutDashboard className="w-5 h-5" />
            Tableau de bord
          </button>
          
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
              activeTab === 'users'
                ? 'text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            style={activeTab === 'users' ? { 
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            } : {}}
          >
            <Users className="w-5 h-5" />
            Utilisateurs
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
              activeTab === 'notifications'
                ? 'text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            style={activeTab === 'notifications' ? { 
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            } : {}}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 ${
              activeTab === 'settings'
                ? 'text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            style={activeTab === 'settings' ? { 
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            } : {}}
          >
            <Settings className="w-5 h-5" />
            Paramètres
          </button>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Lambda Admin</span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
          {['dashboard', 'users', 'notifications', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'text-white bg-violet-500/20 border border-violet-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-2xl font-bold text-white mb-6">Tableau de bord</h1>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-400">Utilisateurs totaux</p>
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
                      <UserIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-emerald-400">{stats.onlineUsers}</p>
                  <p className="text-sm text-gray-400">En ligne</p>
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
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.totalPosts}</p>
                  <p className="text-sm text-gray-400">Publications</p>
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
                      style={{ background: 'rgba(245, 158, 11, 0.2)' }}
                    >
                      <Bell className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats.totalNotifications}</p>
                  <p className="text-sm text-gray-400">Notifications</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div 
                className="p-6 rounded-2xl"
                style={{ 
                  background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.1)'
                }}
              >
                <h3 className="font-semibold text-white mb-4">Actions rapides</h3>
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => setActiveTab('notifications')}
                    className="px-6 py-3 rounded-xl font-medium text-white"
                    style={{ 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'
                    }}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer une notification
                  </Button>
                  <Button
                    onClick={() => setActiveTab('users')}
                    variant="outline"
                    className="px-6 py-3 rounded-xl font-medium text-white border-violet-500/30 hover:bg-violet-500/10"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Gérer les utilisateurs
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 rounded-xl text-sm text-white placeholder-gray-500 bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>

              <div 
                className="rounded-2xl overflow-hidden"
                style={{ 
                  background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.1)'
                }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Utilisateur</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Email</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Département</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Rôle</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Statut</th>
                        <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.uid} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold"
                                style={{ 
                                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                                  color: 'white'
                                }}
                              >
                                {initials(user.prenom, user.nom)}
                              </div>
                              <span className="text-white">{user.prenom} {user.nom}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-400">{user.email}</td>
                          <td className="px-6 py-4 text-gray-400">{user.departement || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              user.role === 'admin' 
                                ? 'bg-violet-500/20 text-violet-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-2 text-sm ${
                              user.isOnline ? 'text-emerald-400' : 'text-gray-500'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                user.isOnline ? 'bg-emerald-400' : 'bg-gray-500'
                              }`} />
                              {user.isOnline ? 'En ligne' : 'Hors ligne'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteUser(user.uid)}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    Aucun utilisateur trouvé
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-2xl font-bold text-white mb-6">Envoyer une notification</h1>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Form */}
                <div 
                  className="p-6 rounded-2xl"
                  style={{ 
                    background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.1)'
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Titre</label>
                      <input
                        type="text"
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                        placeholder="Titre de la notification"
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Message</label>
                      <textarea
                        value={notificationBody}
                        onChange={(e) => setNotificationBody(e.target.value)}
                        placeholder="Contenu de la notification"
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Type</label>
                      <select
                        value={notificationType}
                        onChange={(e) => setNotificationType(e.target.value as any)}
                        className="w-full px-4 py-3 rounded-xl text-white bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                      >
                        <option value="general">Générale</option>
                        <option value="post">Publication</option>
                        <option value="system">Système</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Destinataires</label>
                      <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={sendToAll}
                            onChange={() => setSendToAll(true)}
                            className="w-4 h-4 accent-violet-500"
                          />
                          <span className="text-white">Tous les utilisateurs</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!sendToAll}
                            onChange={() => setSendToAll(false)}
                            className="w-4 h-4 accent-violet-500"
                          />
                          <span className="text-white">Sélectionner</span>
                        </label>
                      </div>

                      {!sendToAll && (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                            <input
                              type="checkbox"
                              checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                              onChange={selectAllUsers}
                              className="w-4 h-4 accent-violet-500"
                            />
                            <span className="text-sm text-gray-400">Tout sélectionner</span>
                          </div>
                          {filteredUsers.map((user) => (
                            <div 
                              key={user.uid}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5"
                            >
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user.uid)}
                                onChange={() => toggleUserSelection(user.uid)}
                                className="w-4 h-4 accent-violet-500"
                              />
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                                style={{ 
                                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                                  color: 'white'
                                }}
                              >
                                {initials(user.prenom, user.nom)}
                              </div>
                              <span className="text-white text-sm">{user.prenom} {user.nom}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleSendNotification}
                      disabled={!notificationTitle.trim() || !notificationBody.trim() || sending || (!sendToAll && selectedUsers.length === 0)}
                      className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-250 hover:opacity-90 disabled:opacity-50"
                      style={{ 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                      }}
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : sendSuccess ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          Envoyé !
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Envoyer la notification
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                <div 
                  className="p-6 rounded-2xl"
                  style={{ 
                    background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.1)'
                  }}
                >
                  <h3 className="font-semibold text-white mb-4">Aperçu</h3>
                  <div 
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(139, 92, 246, 0.2)' }}
                      >
                        <Bell className="w-5 h-5 text-violet-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {notificationTitle || 'Titre de la notification'}
                        </p>
                        <p className="text-xs text-gray-400">Lambda Enterprise</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">
                      {notificationBody || 'Contenu de la notification...'}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm text-gray-400 mb-3">Informations</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span className="text-white capitalize">{notificationType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Destinataires:</span>
                        <span className="text-white">
                          {sendToAll ? `Tous (${users.length})` : `${selectedUsers.length} sélectionné(s)`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-2xl font-bold text-white mb-6">Paramètres</h1>
              
              <div 
                className="p-6 rounded-2xl"
                style={{ 
                  background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.1)'
                }}
              >
                <h3 className="font-semibold text-white mb-4">Informations système</h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-gray-400">Version</span>
                    <span className="text-white">1.0.0</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-gray-400">Firebase Project</span>
                    <span className="text-white">data-com-a94a8</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/5">
                    <span className="text-gray-400">FCM Status</span>
                    <span className="text-emerald-400">Actif</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-gray-400">Dernière mise à jour</span>
                    <span className="text-white">{new Date().toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
