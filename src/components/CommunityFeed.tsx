import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Send, 
  Image as ImageIcon, 
  Video, 
  X,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/firebase';
import type { PostWithComments, Comment } from '@/hooks/usePosts';

interface CommunityFeedProps {
  user: User | null;
  posts: PostWithComments[];
  loading: boolean;
  uploadProgress: number;
  onPublish: (text: string, mediaFile?: File, mediaType?: 'image' | 'video') => Promise<boolean>;
  onLike: (postId: string) => void;
  onDelete: (postId: string, postUid: string) => void;
  onComment: (postId: string, text: string) => Promise<boolean>;
  onLoadComments: (postId: string) => Promise<Comment[]>;
  onToggleComments: (postId: string) => void;
  onShare: (postId: string) => void;
}

export function CommunityFeed({
  user,
  posts,
  loading,
  uploadProgress,
  onPublish,
  onLike,
  onDelete,
  onComment,
  onLoadComments,
  onToggleComments,
  onShare
}: CommunityFeedProps) {
  const [newPostText, setNewPostText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const initials = user 
    ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() 
    : '?';

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedMedia(file);
    setMediaType(type);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = () => {
    setSelectedMedia(null);
    setMediaType(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handlePublish = async () => {
    if (!newPostText.trim() && !selectedMedia) return;
    
    setPublishing(true);
    const success = await onPublish(
      newPostText, 
      selectedMedia || undefined, 
      mediaType || undefined
    );
    
    if (success) {
      setNewPostText('');
      clearMedia();
    }
    setPublishing(false);
  };

  const handleLoadComments = async (postId: string) => {
    if (comments[postId]) {
      onToggleComments(postId);
      return;
    }

    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    const loadedComments = await onLoadComments(postId);
    setComments(prev => ({ ...prev, [postId]: loadedComments }));
    setLoadingComments(prev => ({ ...prev, [postId]: false }));
    onToggleComments(postId);
  };

  const handleAddComment = async (postId: string) => {
    const text = commentTexts[postId];
    if (!text?.trim()) return;

    const success = await onComment(postId, text);
    if (success) {
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      // Reload comments
      const loadedComments = await onLoadComments(postId);
      setComments(prev => ({ ...prev, [postId]: loadedComments }));
    }
  };

  const formatTime = (tsMs: number) => {
    const date = new Date(tsMs);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Compose Post */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5"
          style={{ 
            background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
            border: '1px solid rgba(139, 92, 246, 0.15)'
          }}
        >
          <div className="flex gap-4">
            <div 
              className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
              style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                color: 'white'
              }}
            >
              {initials}
            </div>
            <div className="flex-1">
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Partagez une information avec votre équipe..."
                className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none min-h-[80px]"
              />
              
              {/* Media Preview */}
              <AnimatePresence>
                {mediaPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative mt-3 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={clearMedia}
                      className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {mediaType === 'image' ? (
                      <img 
                        src={mediaPreview} 
                        alt="Preview" 
                        className="w-full max-h-64 object-cover"
                      />
                    ) : (
                      <video 
                        src={mediaPreview} 
                        className="w-full max-h-64 object-cover"
                        controls
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Upload en cours...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ 
                        background: 'linear-gradient(90deg, #8b5cf6 0%, #06b6d4 100%)',
                        width: `${uploadProgress}%`
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMediaSelect(e, 'image')}
                    className="hidden"
                  />
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleMediaSelect(e, 'video')}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 transition-all"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Photo
                  </button>
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                  >
                    <Video className="w-4 h-4" />
                    Vidéo
                  </button>
                </div>
                <Button
                  onClick={handlePublish}
                  disabled={(!newPostText.trim() && !selectedMedia) || publishing}
                  className="px-6 py-2 rounded-xl font-semibold text-white transition-all duration-250 hover:opacity-90 disabled:opacity-50"
                  style={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)'
                  }}
                >
                  {publishing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publier
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {loading ? (
          // Skeleton loading
          [...Array(3)].map((_, i) => (
            <div 
              key={i}
              className="rounded-2xl p-5 animate-pulse"
              style={{ 
                background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                border: '1px solid rgba(139, 92, 246, 0.1)'
              }}
            >
              <div className="flex gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-700" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-1/3" />
                  <div className="h-3 bg-gray-700 rounded w-1/4" />
                  <div className="h-20 bg-gray-700 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div 
              className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4"
              style={{ 
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}
            >
              <MessageCircle className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Aucune publication</h3>
            <p className="text-gray-400">Soyez le premier à partager avec votre équipe !</p>
          </motion.div>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden"
              style={{ 
                background: 'linear-gradient(145deg, #1a1a25 0%, #151520 100%)',
                border: '1px solid rgba(139, 92, 246, 0.1)'
              }}
            >
              {/* Post Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{ 
                        background: post.uPhoto 
                          ? 'transparent' 
                          : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                        color: 'white'
                      }}
                    >
                      {post.uPhoto ? (
                        <img 
                          src={post.uPhoto} 
                          alt={post.uName}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        post.uName?.[0]?.toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{post.uName}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{post.uDept}</span>
                        <span>•</span>
                        <span>{formatTime(post.tsMs)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete button for owner or admin */}
                  {(user?.uid === post.uid || user?.role === 'admin') && (
                    <button
                      onClick={() => onDelete(post.id, post.uid)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                {post.txt && (
                  <p className="mt-4 text-white whitespace-pre-wrap">{post.txt}</p>
                )}
              </div>

              {/* Post Media */}
              {post.mediaURL && (
                <div className="mt-2">
                  {post.mediaType === 'video' ? (
                    <video 
                      src={post.mediaURL}
                      className="w-full max-h-96 object-cover"
                      controls
                    />
                  ) : (
                    <img 
                      src={post.mediaURL}
                      alt="Post media"
                      className="w-full max-h-96 object-cover"
                    />
                  )}
                </div>
              )}

              {/* Post Actions */}
              <div className="px-5 py-3 border-t border-white/5">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => onLike(post.id)}
                    className={`flex items-center gap-2 transition-all ${
                      post.likes?.[user?.uid || ''] 
                        ? 'text-pink-500' 
                        : 'text-gray-400 hover:text-pink-500'
                    }`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${post.likes?.[user?.uid || ''] ? 'fill-current' : ''}`} 
                    />
                    <span className="text-sm">{post.likeCount || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => handleLoadComments(post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-violet-400 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.commentCount || 0}</span>
                  </button>
                  
                  <button
                    onClick={() => onShare(post.id)}
                    className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">{post.shareCount || 0}</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {post.showComments && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/5 overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Comment List */}
                      {loadingComments[post.id] ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                      ) : (
                        comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                              style={{ 
                                background: comment.uPhoto 
                                  ? 'transparent' 
                                  : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                                color: 'white'
                              }}
                            >
                              {comment.uPhoto ? (
                                <img 
                                  src={comment.uPhoto} 
                                  alt={comment.uName}
                                  className="w-full h-full rounded-lg object-cover"
                                />
                              ) : (
                                comment.uName?.[0]?.toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <div 
                                className="rounded-xl px-3 py-2"
                                style={{ background: 'rgba(255, 255, 255, 0.03)' }}
                              >
                                <p className="text-xs font-medium text-violet-400 mb-1">
                                  {comment.uName}
                                </p>
                                <p className="text-sm text-gray-300">{comment.txt}</p>
                              </div>
                              <p className="text-xs text-gray-500 mt-1 ml-1">
                                {formatTime(comment.tsMs)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Add Comment */}
                      {user && (
                        <div className="flex gap-3 pt-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{ 
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                              color: 'white'
                            }}
                          >
                            {initials}
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={commentTexts[post.id] || ''}
                              onChange={(e) => setCommentTexts(prev => ({ 
                                ...prev, 
                                [post.id]: e.target.value 
                              }))}
                              placeholder="Ajouter un commentaire..."
                              className="flex-1 px-4 py-2 rounded-xl text-sm text-white placeholder-gray-500 bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500/50"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleAddComment(post.id);
                                }
                              }}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!commentTexts[post.id]?.trim()}
                              className="px-3 py-2 rounded-xl bg-violet-500 text-white disabled:opacity-50 transition-opacity"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
