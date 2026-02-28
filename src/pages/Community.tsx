import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Plus, Trash2, Send, X, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
const backendBaseUrl = apiUrl.replace('/api/v1', '');

interface Author {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
}

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: Author;
}

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  author: Author;
}

function getDisplayName(a?: Author, fallback?: string) {
  if (!a) return fallback || 'Usuário';
  if (a.first_name || a.last_name) return `${a.first_name || ''} ${a.last_name || ''}`.trim();
  return a.email;
}

function getInitials(a?: Author) {
  if (!a) return 'U';
  const f = a.first_name?.charAt(0) || '';
  const l = a.last_name?.charAt(0) || '';
  return (f + l).toUpperCase() || a.email?.charAt(0).toUpperCase() || 'U';
}

function Avatar({ author, size = 10 }: { author?: Author; size?: number }) {
  const avatarSrc = author?.avatar_url ? `${backendBaseUrl}${author.avatar_url}` : null;
  const cls = `w-${size} h-${size} rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-sm`;

  if (avatarSrc) return <img src={avatarSrc} alt={getDisplayName(author)} className={`${cls} object-cover`} style={{ width: `${size * 4}px`, height: `${size * 4}px`, borderRadius: '9999px' }} />;

  const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
  const color = colors[(author?.email?.charCodeAt(0) || 0) % colors.length];

  return (
    <div className={cls} style={{ backgroundColor: color, width: `${size * 4}px`, height: `${size * 4}px`, borderRadius: '9999px', flexShrink: 0 }}>
      {getInitials(author)}
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}m atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs / 24);
  return `${days}d atrás`;
}

function PostCard({ post: initialPost, currentUserId, onDelete }: { post: Post; currentUserId: string; onDelete: (id: string) => void }) {
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const toggleLike = async () => {
    try {
      const res = await axios.post(`${apiUrl}/community/posts/${post.id}/like`);
      setPost(p => ({
        ...p,
        liked_by_me: res.data.liked,
        like_count: res.data.liked ? p.like_count + 1 : p.like_count - 1,
      }));
    } catch { toast.error('Erro ao curtir.'); }
  };

  const fetchComments = async () => {
    if (loadingComments) return;
    setLoadingComments(true);
    try {
      const res = await axios.get(`${apiUrl}/community/posts/${post.id}/comments`);
      setComments(res.data);
    } catch { toast.error('Erro ao carregar comentários.'); }
    finally { setLoadingComments(false); }
  };

  const toggleComments = () => {
    const next = !showComments;
    setShowComments(next);
    if (next && comments.length === 0) fetchComments();
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await axios.post(`${apiUrl}/community/posts/${post.id}/comments`, { content: newComment });
      setComments(c => [...c, res.data]);
      setPost(p => ({ ...p, comment_count: p.comment_count + 1 }));
      setNewComment('');
    } catch { toast.error('Erro ao comentar.'); }
    finally { setSubmittingComment(false); }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await axios.delete(`${apiUrl}/community/comments/${commentId}`);
      setComments(c => c.filter(x => x.id !== commentId));
      setPost(p => ({ ...p, comment_count: Math.max(0, p.comment_count - 1) }));
    } catch { toast.error('Erro ao deletar comentário.'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Post Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar author={post.author} size={10} />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 text-sm">{getDisplayName(post.author)}</p>
                {/* Badge/Conquista baseada em lógicas do sistema (simulado para UI) */}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200" title="Investidor Ativo">
                  Pioneiro 🏆
                </span>
              </div>
              <p className="text-xs text-slate-400">{timeAgo(post.created_at)}</p>
            </div>
          </div>
          {post.user_id === currentUserId && (
            <button onClick={() => onDelete(post.id)} className="text-slate-300 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-50" title="Deletar post">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        <h3 className="font-bold text-slate-800 text-lg mb-2 leading-snug">{post.title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-4">
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all px-3 py-1.5 rounded-full ${
            post.liked_by_me
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
              : 'text-slate-400 hover:text-rose-400 hover:bg-rose-50'
          }`}
        >
          <Heart size={16} fill={post.liked_by_me ? 'currentColor' : 'none'} />
          <span>{post.like_count}</span>
        </button>

        <button
          onClick={toggleComments}
          className={`flex items-center gap-1.5 text-sm font-medium transition-all px-3 py-1.5 rounded-full ${
            showComments ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'
          }`}
        >
          <MessageCircle size={16} />
          <span>{post.comment_count} {post.comment_count === 1 ? 'comentário' : 'comentários'}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-5 pb-4 bg-slate-50 border-t border-slate-100">
          {loadingComments && <p className="text-xs text-slate-400 py-3 text-center">Carregando...</p>}

          <div className="space-y-3 pt-3">
            {comments.map(c => (
              <div key={c.id} className="flex items-start gap-2.5">
                <Avatar author={c.author} size={7} />
                <div className="flex-1 bg-white rounded-xl px-3 py-2 border border-slate-200">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-slate-700">{getDisplayName(c.author)}</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                      Membro Ativo
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-slate-400">{timeAgo(c.created_at)}</span>
                      {c.user_id === currentUserId && (
                        <button onClick={() => deleteComment(c.id)} className="text-slate-300 hover:text-rose-400 transition-colors ml-1">
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={submitComment} className="flex gap-2 mt-3">
            <input
              type="text"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-400"
              placeholder="Escreva um comentário..."
            />
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${apiUrl}/community/posts`);
      setPosts(res.data);
    } catch { toast.error('Erro ao carregar posts.'); }
    finally { setLoading(false); }
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return toast.error('Preencha título e conteúdo.');
    setSubmitting(true);
    try {
      const res = await axios.post(`${apiUrl}/community/posts`, { title, content });
      setPosts(p => [res.data, ...p]);
      setTitle('');
      setContent('');
      setShowNewPost(false);
      toast.success('Post publicado!');
    } catch { toast.error('Erro ao publicar.'); }
    finally { setSubmitting(false); }
  };

  const deletePost = async (postId: string) => {
    try {
      await axios.delete(`${apiUrl}/community/posts/${postId}`);
      setPosts(p => p.filter(x => x.id !== postId));
      toast.success('Post removido.');
    } catch { toast.error('Erro ao remover post.'); }
  };

  return (
    <div className="col-span-1 lg:col-span-3 w-full max-w-[780px] mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <Users size={20} className="text-emerald-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Comunidade</h1>
            <p className="text-xs text-slate-500">Compartilhe experiências financeiras</p>
          </div>
        </div>

        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus size={18} />
          Novo Post
        </button>
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Criar novo post</h3>
          <form onSubmit={submitPost} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-base font-medium"
              placeholder="Título do post..."
            />
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-sm resize-none"
              placeholder="Compartilhe sua experiência, dica ou insight financeiro..."
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowNewPost(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={submitting} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {submitting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
          <p className="text-4xl mb-3">💬</p>
          <p className="font-semibold text-slate-800">Nenhum post ainda</p>
          <p className="text-slate-500 text-sm mt-1">Seja o primeiro a compartilhar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(p => (
            <PostCard
              key={p.id}
              post={p}
              currentUserId={user?.id || ''}
              onDelete={deletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
