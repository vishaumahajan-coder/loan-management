import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, Clock, Trash2, ShieldAlert } from 'lucide-react';
import api from '../../services/api';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/contact');
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      setMessages(messages.map(m => m.id === id ? { ...m, status: 'read' } : m));
    } catch (error) {
      console.error('Failed to mark message as read', error);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading inquiries...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight italic">Support <span className="text-blue-600">Inquiries</span></h2>
        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest border border-blue-100">
          Total: {messages.length}
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-100 rounded-3xl">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <Mail size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-1">No Inquiries Yet</h3>
          <p className="text-sm font-medium text-slate-500">When users submit the contact form, they will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`p-6 rounded-3xl border transition-all ${msg.status === 'unread' ? 'bg-white border-blue-200 shadow-lg shadow-blue-900/5' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${msg.status === 'unread' ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{msg.first_name} {msg.last_name}</h4>
                    <a href={`mailto:${msg.email}`} className="text-[11px] font-bold text-blue-600 hover:underline">{msg.email}</a>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={12} /> {new Date(msg.created_at).toLocaleString()}
                  </span>
                  {msg.status === 'unread' ? (
                    <button 
                      onClick={() => markAsRead(msg.id)}
                      className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors flex items-center gap-1"
                    >
                      <CheckCircle size={12} /> Mark Read
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle size={12} /> Read
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium text-slate-700 whitespace-pre-wrap">
                {msg.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
