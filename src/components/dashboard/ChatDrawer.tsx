import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Bot, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  docHash: string;
  apiUrl: string;
}

export default function ChatDrawer({ isOpen, onClose, docHash, apiUrl }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && docHash) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, docHash]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    setFetching(true);
    try {
      const response = await axios.get(`${apiUrl}/chat/${docHash}`);
      setMessages(response.data);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        toast.error('Erro ao buscar histórico do chat.');
      }
    } finally {
      setFetching(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/chat`, {
        doc_hash: docHash,
        content: userMsg.content
      });
      setMessages(prev => [...prev, response.data]);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erro ao enviar mensagem.');
      // Remove the optimistic message if it failed
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-slate-900/40 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-sm md:max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 text-emerald-700 p-2 rounded-lg">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Chat Inteligente</h2>
              <p className="text-xs text-slate-500">Analista Especialista</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {fetching ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-emerald-500" size={24} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-60">
              <Bot size={48} className="text-slate-400" />
              <p className="text-sm text-slate-500 max-w-[250px]">
                Olá! Eu li seu documento. Tem alguma pergunta sobre as categorias ou maiores gastos?
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                </div>
                <div 
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-sm' 
                      : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
             <div className="flex gap-3">
               <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 text-emerald-600">
                  <Bot size={16} />
               </div>
               <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3 shadow-sm flex items-center gap-2 text-slate-400">
                 <Loader2 className="animate-spin" size={16} />
                 <span className="text-xs">Processando...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunte sobre sua fatura..."
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700 placeholder:text-slate-400"
              disabled={loading || fetching}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || fetching}
              className={`absolute right-2 p-2 rounded-full transition-colors flex items-center justify-center ${
                input.trim() && !loading && !fetching
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : 'bg-slate-100 text-slate-300'
              }`}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
