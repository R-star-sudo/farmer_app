
import React, { useState, useEffect } from 'react';
import { db } from '../services/database';
import { generatePostTags } from '../services/geminiService';
import { CommunityPost, Language } from '../types';
import { authService } from '../services/authService';
import { Users, Heart, MessageCircle, Send, MapPin, Tag, Image as ImageIcon, Loader2 } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';

interface CommunityViewProps {
  language: Language;
}

export const CommunityView: React.FC<CommunityViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language].community;
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(false);
  const user = authService.getCurrentUser();

  useEffect(() => {
    const loadPosts = async () => {
      const data = await db.posts.find();
      setPosts(data);
    };
    loadPosts();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    
    setLoading(true);
    
    // Generate AI Tags
    const tags = await generatePostTags(newPost);
    
    const post: CommunityPost = {
      id: '',
      author: user?.name || 'Farmer',
      location: user?.location || 'India',
      content: newPost,
      likes: 0,
      comments: 0,
      time: 'Just now',
      tags: tags
    };
    
    await db.posts.insertOne(post);
    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setLoading(false);
  };

  return (
    <div className="pb-24 pt-14 px-4 max-w-md mx-auto min-h-screen bg-gray-50">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
            {t.title}
          </h2>
          <p className="text-emerald-600 text-sm">{t.subtitle}</p>
        </div>
        <div className="bg-emerald-100 p-2 rounded-full text-emerald-700">
            <Users size={24} />
        </div>
      </header>

      {/* Create Post Box */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 mb-6">
        <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {user?.name?.charAt(0) || 'F'}
            </div>
            <textarea
                value={newPost}
                onChange={e => setNewPost(e.target.value)}
                placeholder={t.createPost}
                className="flex-1 bg-gray-50 rounded-xl p-3 text-sm outline-none border border-transparent focus:border-emerald-200 focus:bg-white transition-all resize-none text-black"
                rows={2}
            />
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
            <button className="text-gray-400 hover:text-emerald-600 transition-colors">
                <ImageIcon size={20} />
            </button>
            <button 
                onClick={handlePost}
                disabled={!newPost.trim() || loading}
                className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
                {loading ? <Loader2 size={14} className="animate-spin"/> : <Send size={14} />}
                {t.postBtn}
            </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {posts.map((post, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                            {post.author.charAt(0)}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm leading-tight">{post.author}</h4>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <MapPin size={10} /> {post.location} • {post.time}
                            </div>
                        </div>
                    </div>
                </div>
                
                <p className="text-sm text-gray-800 leading-relaxed mb-3">{post.content}</p>
                
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.map((tag, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full">
                                <Tag size={8} /> {tag}
                            </span>
                        ))}
                    </div>
                )}
                
                <div className="flex items-center gap-6 pt-3 border-t border-gray-50">
                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-pink-500 transition-colors text-xs font-medium">
                        <Heart size={16} /> {post.likes} {t.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-500 transition-colors text-xs font-medium">
                        <MessageCircle size={16} /> {post.comments} {t.comments}
                    </button>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
