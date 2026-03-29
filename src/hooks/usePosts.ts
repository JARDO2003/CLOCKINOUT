import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  increment,
  type User,
  type Post
} from '@/lib/firebase';

export interface Comment {
  id: string;
  uid: string;
  uName: string;
  uPhoto?: string;
  txt: string;
  ts: { seconds: number; nanoseconds: number };
  tsMs: number;
}

export interface PostWithComments extends Post {
  comments?: Comment[];
  showComments?: boolean;
}

export function usePosts(user: User | null) {
  const [posts, setPosts] = useState<PostWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to posts
  useEffect(() => {
    setLoading(true);
    
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('tsMs', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData: PostWithComments[] = [];
      snapshot.forEach((doc) => {
        postsData.push({ 
          id: doc.id, 
          ...doc.data(),
          showComments: false
        } as PostWithComments);
      });
      setPosts(postsData);
      setLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, []);

  // Publish a new post
  const publishPost = useCallback(async (
    text: string,
    mediaFile?: File,
    mediaType?: 'image' | 'video'
  ): Promise<boolean> => {
    if (!user?.uid) return false;
    if (!text.trim() && !mediaFile) return false;

    setUploadProgress(0);

    try {
      let mediaURL = '';
      let finalMediaType: 'image' | 'video' | undefined;

      // Upload media if provided
      if (mediaFile && mediaType) {
        const endpoint = mediaType === 'video' 
          ? 'https://api.cloudinary.com/v1_1/djxcqczh1/video/upload'
          : 'https://api.cloudinary.com/v1_1/djxcqczh1/image/upload';

        const formData = new FormData();
        formData.append('file', mediaFile);
        formData.append('upload_preset', 'database');

        const response = await new Promise<any>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(progress);
            }
          });

          xhr.addEventListener('load', () => {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(e);
            }
          });

          xhr.addEventListener('error', () => reject(new Error('Upload failed')));
          xhr.open('POST', endpoint);
          xhr.send(formData);
        });

        mediaURL = response.secure_url || '';
        finalMediaType = mediaType;

        // Optimize image URL
        if (mediaURL && mediaType === 'image') {
          mediaURL = mediaURL.replace('/upload/', '/upload/f_auto,q_auto/');
        }
      }

      // Create post document
      await addDoc(collection(db, 'posts'), {
        txt: text.trim(),
        mediaURL,
        mediaType: finalMediaType,
        uid: user.uid,
        uName: `${user.prenom} ${user.nom}`,
        uPhoto: user.photoURL || '',
        uDept: user.departement || '',
        ts: serverTimestamp(),
        tsMs: Date.now(),
        likes: {},
        likeCount: 0,
        shareCount: 0,
        commentCount: 0
      });

      setUploadProgress(0);
      return true;

    } catch (error) {
      console.error('Error publishing post:', error);
      setUploadProgress(0);
      return false;
    }
  }, [user]);

  // Like/unlike a post
  const toggleLike = useCallback(async (postId: string): Promise<void> => {
    if (!user?.uid) return;

    try {
      const postRef = doc(db, 'posts', postId);
      const post = posts.find(p => p.id === postId);
      
      if (!post) return;

      const hasLiked = post.likes?.[user.uid];

      if (hasLiked) {
        // Unlike - use updateDoc with deleteField pattern
        const updates: Record<string, any> = {
          [`likes.${user.uid}`]: null,
          likeCount: increment(-1)
        };
        await updateDoc(postRef, updates);
      } else {
        // Like
        await updateDoc(postRef, {
          [`likes.${user.uid}`]: true,
          likeCount: increment(1)
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, [user, posts]);

  // Delete a post
  const deletePost = useCallback(async (postId: string, postUid: string): Promise<boolean> => {
    if (!user?.uid) return false;
    if (postUid !== user.uid && user.role !== 'admin') {
      console.warn('Cannot delete: not owner or admin');
      return false;
    }

    try {
      // Delete all comments first
      const commentsQuery = query(collection(db, `posts/${postId}/comments`));
      const commentsSnapshot = await getDocs(commentsQuery);
      
      const deletePromises = commentsSnapshot.docs.map(commentDoc =>
        deleteDoc(doc(db, `posts/${postId}/comments`, commentDoc.id))
      );
      
      await Promise.all(deletePromises);
      
      // Delete the post
      await deleteDoc(doc(db, 'posts', postId));
      
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }, [user]);

  // Add comment to a post
  const addComment = useCallback(async (postId: string, text: string): Promise<boolean> => {
    if (!user?.uid || !text.trim()) return false;

    try {
      // Add comment to subcollection
      await addDoc(collection(db, `posts/${postId}/comments`), {
        uid: user.uid,
        uName: `${user.prenom} ${user.nom}`,
        uPhoto: user.photoURL || '',
        txt: text.trim(),
        ts: serverTimestamp(),
        tsMs: Date.now()
      });

      // Increment comment count
      await updateDoc(doc(db, 'posts', postId), {
        commentCount: increment(1)
      });

      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  }, [user]);

  // Load comments for a post
  const loadComments = useCallback(async (postId: string): Promise<Comment[]> => {
    try {
      const commentsQuery = query(
        collection(db, `posts/${postId}/comments`),
        orderBy('tsMs', 'asc')
      );
      
      const snapshot = await getDocs(commentsQuery);
      const comments: Comment[] = [];
      
      snapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() } as Comment);
      });
      
      return comments;
    } catch (error) {
      console.error('Error loading comments:', error);
      return [];
    }
  }, []);

  // Toggle comments visibility
  const toggleComments = useCallback((postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, showComments: !post.showComments }
        : post
    ));
  }, []);

  // Share a post
  const sharePost = useCallback(async (postId: string): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      await updateDoc(doc(db, 'posts', postId), {
        shareCount: increment(1)
      });
      
      // Copy link to clipboard
      const shareUrl = `${window.location.origin}/post/${postId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      return true;
    } catch (error) {
      console.error('Error sharing post:', error);
      return false;
    }
  }, [user]);

  return {
    posts,
    loading,
    uploadProgress,
    publishPost,
    toggleLike,
    deletePost,
    addComment,
    loadComments,
    toggleComments,
    sharePost
  };
}
