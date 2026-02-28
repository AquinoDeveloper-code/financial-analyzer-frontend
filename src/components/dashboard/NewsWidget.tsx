import { useState, useEffect } from 'react';
import axios from 'axios';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Article {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source_name: string;
  image_url: string;
}

interface NewsResponse {
  status: string;
  articles: Article[];
}

export default function NewsWidget({ apiUrl }: { apiUrl: string }) {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get<NewsResponse>(`${apiUrl}/news/`);
      if (res.data.status === 'success') {
        setNews(res.data.articles);
      }
    } catch (err) {
      console.error('Failed to fetch news', err);
      toast.error('Não foi possível carregar as notícias financeiras.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm animate-pulse mt-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-200"></div>
          <div className="w-48 h-6 bg-slate-200 rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mt-8 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Newspaper size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Principais Notícias Econômicas</h2>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Em Alta
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {news.map((n, idx) => (
          <a
            key={idx}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
          >
            {n.image_url && (
              <div className="w-full md:w-32 h-32 md:h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 relative">
                <img 
                  src={n.image_url} 
                  alt={n.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors">
                  {n.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2">
                  {n.description || "Sem descrição disponível para esta matéria."}
                </p>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                <span className="font-medium text-slate-600">{n.source_name}</span>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{formatDate(n.publishedAt)}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex flex-col justify-center items-center text-slate-300 group-hover:text-blue-500 transition-colors px-2">
              <ExternalLink size={18} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
