
import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse, generateMarketSearch, SearchResult } from '../services/geminiService';
import { ChatMessage, Language } from '../types';
import { Send, Bot, Search, Globe, ExternalLink, X, Mic, MicOff } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';

interface ChatAdvisorViewProps {
  language: Language;
}

export const ChatAdvisorView: React.FC<ChatAdvisorViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language].chat;
  const common = TRANSLATIONS[language].common;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      text: language === 'en' 
        ? 'Namaste! I am your Kisan Assistant. Ask me about:\n• Crop Selling & Prices\n• Mixed Farming Ideas\n• B2B Negotiation Tips'
        : `${TRANSLATIONS[language].dashboard.welcome}! ${t.title} here.` , // Simplified intro for other langs
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear messages if language changes to avoid mixed language history confusion (optional UX choice)
  useEffect(() => {
    setMessages([{
      id: Date.now().toString(),
      role: 'model',
      text: language === 'en' 
        ? 'Namaste! I am your Kisan Assistant. Ask me about:\n• Crop Selling & Prices\n• Mixed Farming Ideas\n• B2B Negotiation Tips'
        : `${TRANSLATIONS[language].dashboard.welcome}!`,
      timestamp: Date.now()
    }]);
  }, [language]);

  // Voice Input Setup
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser.');
      return;
    }
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    // Map app language code to speech recognition code
    const langMap: Record<string, string> = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'pa': 'pa-IN',
        'mr': 'mr-IN',
        'te': 'te-IN',
        'ta': 'ta-IN',
        'kn': 'kn-IN'
    };
    
    recognitionRef.current.lang = langMap[language] || 'en-US';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.onerror = (event: any) => {
        console.error(event.error);
        setIsListening(false);
    };
    
    recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
      if (recognitionRef.current) {
          recognitionRef.current.stop();
      }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      let responseText = '';
      let sources: { uri: string, title: string }[] | undefined;

      if (isSearchMode) {
        // Use B2B Market Search with Grounding
        const result: SearchResult = await generateMarketSearch(userMsg.text, language);
        responseText = result.text;
        sources = result.sources;
        setIsSearchMode(false); // Reset mode after search
      } else {
        // Standard Chat
        responseText = await getChatResponse(userMsg.text, language);
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
        sources: sources
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const suggestionChips = t.chips;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-gray-50">
       <header className="bg-white p-4 border-b border-emerald-100 shadow-sm z-10 flex justify-between items-center pt-14">
        <h2 className="text-lg font-bold text-emerald-900 flex items-center gap-2">
          <Bot className="text-emerald-600" size={24}/>
          {t.title}
        </h2>
        <button
          onClick={() => setIsSearchMode(!isSearchMode)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            isSearchMode 
              ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          {isSearchMode ? <X size={14} /> : <Globe size={14} />}
          {isSearchMode ? t.btnExit : t.btnSearch}
        </button>
      </header>

      {/* Search Mode Indicator Banner */}
      {isSearchMode && (
        <div className="bg-blue-50 px-4 py-2 text-xs text-blue-800 flex items-center justify-center border-b border-blue-100 animate-in slide-in-from-top-2">
          <Search size={12} className="mr-1.5" />
          <span>{t.searchBanner}</span>
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
              }`}
            >
              {msg.text}
              
              {/* Display Sources/Citations if available */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">{common.sources}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((source, idx) => (
                            <a 
                                key={idx}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 bg-gray-50 text-[10px] text-blue-600 px-2 py-1 rounded border border-gray-100 hover:bg-blue-50 transition-colors"
                            >
                                <ExternalLink size={10} /> {source.title}
                            </a>
                        ))}
                    </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Loading Indicator */}
         {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-emerald-100 shadow-sm flex items-center gap-2 text-emerald-600 text-sm">
               <Bot size={16} className="animate-pulse"/> {common.loading}
            </div>
          </div>
        )}
        
        {/* Listening Indicator */}
        {isListening && (
             <div className="flex justify-end">
                <div className="bg-red-50 p-2 rounded-xl border border-red-100 text-red-600 text-xs flex items-center gap-2 animate-pulse">
                    <Mic size={12} /> {t.listening}
                </div>
             </div>
        )}
      </div>

      {/* Suggestion Chips (only if empty or just welcome msg) */}
      {messages.length < 3 && !loading && !isSearchMode && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar mb-20">
             {suggestionChips.map((chip, i) => (
                 <button 
                    key={i}
                    onClick={() => setInput(chip)}
                    className="bg-white border border-emerald-100 px-3 py-1.5 rounded-full text-xs text-emerald-700 whitespace-nowrap shadow-sm active:scale-95 transition-transform"
                 >
                    {chip}
                 </button>
             ))}
          </div>
      )}

      {/* Input Area */}
      <div className="absolute bottom-[60px] left-0 right-0 bg-white border-t border-emerald-100 p-3 safe-area-pb">
          <div className="flex items-center gap-2 max-w-md mx-auto">
             <div className={`flex-1 bg-gray-50 rounded-full border border-gray-200 pl-4 pr-2 py-2 flex items-center gap-2 ${isSearchMode ? 'ring-2 ring-blue-100 border-blue-200' : 'focus-within:ring-2 focus-within:ring-emerald-500'}`}>
                {isSearchMode && <Search size={16} className="text-blue-500 shrink-0"/>}
                <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={isSearchMode ? t.placeholderSearch : (isListening ? t.listening : t.placeholder)}
                    className={`bg-transparent border-none outline-none text-sm w-full ${isSearchMode ? 'text-blue-900 placeholder-blue-300' : 'text-black placeholder-gray-400'}`}
                />
                {/* Voice Button inside input */}
                <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-2 rounded-full transition-colors shrink-0 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:text-emerald-600'}`}
                    title={t.tapToSpeak}
                >
                    {isListening ? <MicOff size={16}/> : <Mic size={16}/>}
                </button>
             </div>
             <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className={`p-3 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:shadow-none ${isSearchMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
             >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
             </button>
          </div>
      </div>
    </div>
  );
};
