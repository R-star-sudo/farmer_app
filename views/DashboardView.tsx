
import React, { useEffect, useState } from 'react';
import { AppView, Language, User, Scheme } from '../types';
import { getDashboardInsights, getGovernmentSchemes } from '../services/geminiService';
import { ScanLine, Sun, DollarSign, ArrowRight, Store, Languages, UserCircle, Lightbulb, TrendingUp, Loader2, X, BookOpen, Calendar, FlaskConical, Users } from 'lucide-react';
import { TRANSLATIONS, LANGUAGES } from '../constants/translations';

interface DashboardProps {
  onChangeView: (view: AppView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  user: User;
}

export const DashboardView: React.FC<DashboardProps> = ({ onChangeView, language, setLanguage, user }) => {
  const t = TRANSLATIONS[language].dashboard;
  const common = TRANSLATIONS[language].common;
  const [insights, setInsights] = useState<{ tip: string, market: string } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  
  // Schemes State
  const [showSchemes, setShowSchemes] = useState(false);
  const [schemesData, setSchemesData] = useState<Scheme[] | null>(null);
  const [loadingSchemes, setLoadingSchemes] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const data = await getDashboardInsights(language);
      if (isMounted) {
        setInsights(data);
        setLoadingInsights(false);
      }
    };
    fetchInsights();
    return () => { isMounted = false; };
  }, [language]); // Re-fetch when language changes

  const handleFetchSchemes = async () => {
      setShowSchemes(true);
      if (!schemesData) {
          setLoadingSchemes(true);
          const data = await getGovernmentSchemes(user.location || 'India', language);
          setSchemesData(data);
          setLoadingSchemes(false);
      }
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div onClick={() => onChangeView(AppView.PROFILE)} className="cursor-pointer">
            <h1 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">
              {t.welcome}, {user.name.split(' ')[0]}
            </h1>
            <p className="text-emerald-600 text-sm font-medium">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
           {/* Profile Button */}
           <button 
            onClick={() => onChangeView(AppView.PROFILE)}
            className="bg-white border border-emerald-100 p-2 rounded-full text-emerald-700 shadow-sm"
           >
             <UserCircle size={24} />
           </button>

           {/* Language Button */}
           <div className="relative group">
            <button className="bg-emerald-100 p-2 rounded-full text-emerald-700 flex items-center justify-center">
               <Languages size={24} />
            </button>
            {/* Language Dropdown */}
            <div className="absolute right-0 top-12 bg-white shadow-xl rounded-xl p-2 w-40 border border-emerald-100 hidden group-hover:block z-50">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${language === lang.code ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'}`}
                >
                  {lang.native}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Insights Section */}
      <div className="mb-8 grid gap-3">
        {loadingInsights ? (
          <div className="bg-white p-4 rounded-2xl border border-emerald-100 flex items-center justify-center gap-2 text-emerald-600 text-sm py-8">
             <Loader2 className="animate-spin" size={18}/> {t.loadingInsights}
          </div>
        ) : (
          <>
            {/* Daily Tip Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100 shadow-sm flex items-start gap-3">
               <div className="bg-amber-100 p-2 rounded-full text-amber-600 shrink-0 mt-1">
                 <Lightbulb size={18} />
               </div>
               <div>
                 <h4 className="font-bold text-amber-900 text-sm mb-1">{t.dailyTip}</h4>
                 <p className="text-amber-800 text-sm leading-relaxed">{insights?.tip}</p>
               </div>
            </div>
            
            {/* Market Pulse Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 shadow-sm flex items-start gap-3">
               <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0 mt-1">
                 <TrendingUp size={18} />
               </div>
               <div>
                 <h4 className="font-bold text-blue-900 text-sm mb-1">{t.marketPulse}</h4>
                 <p className="text-blue-800 text-sm leading-relaxed">{insights?.market}</p>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Hero Action: Diagnosis */}
      <div 
        onClick={() => onChangeView(AppView.DIAGNOSIS)}
        className="bg-emerald-600 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200 mb-8 cursor-pointer transform transition hover:scale-[1.02] active:scale-95"
      >
        <div className="flex justify-between items-start">
            <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/50 px-3 py-1 rounded-full text-xs font-semibold mb-3 backdrop-blur-sm">
                    <ScanLine size={12} /> AI DETECT
                </div>
                <h3 className="text-xl font-bold mb-1">{t.scanTitle}</h3>
                <p className="text-emerald-100 text-sm opacity-90">{t.scanDesc}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-2xl">
                <ScanLine size={32} />
            </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">{t.quickTools}</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div 
            onClick={() => onChangeView(AppView.MARKETPLACE)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 cursor-pointer hover:border-emerald-200 transition-colors"
        >
            <div className="bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center mb-3 text-orange-600">
                <Store size={20} />
            </div>
            <h4 className="font-bold text-gray-800 mb-1">{t.mandi}</h4>
            <p className="text-xs text-gray-500">{t.mandiDesc}</p>
        </div>

        {/* Community Shortcut */}
        <div 
            onClick={() => onChangeView(AppView.CHOUPAL)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 cursor-pointer hover:border-emerald-200 transition-colors"
        >
            <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center mb-3 text-blue-600">
                <Users size={20} />
            </div>
            <h4 className="font-bold text-gray-800 mb-1">{t.community}</h4>
            <p className="text-xs text-gray-500">{t.communityDesc}</p>
        </div>

        <div 
            onClick={() => onChangeView(AppView.WEATHER)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 cursor-pointer hover:border-emerald-200 transition-colors"
        >
            <div className="bg-amber-50 w-10 h-10 rounded-full flex items-center justify-center mb-3 text-amber-600">
                <Sun size={20} />
            </div>
            <h4 className="font-bold text-gray-800 mb-1">{t.weather}</h4>
            <p className="text-xs text-gray-500">{t.weatherDesc}</p>
        </div>

        <div 
            onClick={() => onChangeView(AppView.CALENDAR)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 cursor-pointer hover:border-emerald-200 transition-colors"
        >
             <div className="bg-pink-50 w-10 h-10 rounded-full flex items-center justify-center mb-3 text-pink-600">
                <Calendar size={20} />
            </div>
            <h4 className="font-bold text-gray-800 mb-1">{t.calendar}</h4>
            <p className="text-xs text-gray-500">{t.calendarDesc}</p>
        </div>

        <div 
            onClick={() => onChangeView(AppView.FERTILIZER)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 cursor-pointer hover:border-emerald-200 transition-colors"
        >
             <div className="bg-lime-50 w-10 h-10 rounded-full flex items-center justify-center mb-3 text-lime-600">
                <FlaskConical size={20} />
            </div>
            <h4 className="font-bold text-gray-800 mb-1">{t.fertilizer}</h4>
            <p className="text-xs text-gray-500">{t.fertilizerDesc}</p>
        </div>

        <div 
            onClick={() => onChangeView(AppView.FINANCE)}
            className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 cursor-pointer hover:border-emerald-200 transition-colors"
        >
             <div className="bg-green-50 w-10 h-10 rounded-full flex items-center justify-center mb-3 text-green-600">
                <DollarSign size={20} />
            </div>
            <h4 className="font-bold text-gray-800 mb-1">{t.khata}</h4>
            <p className="text-xs text-gray-500">{t.khataDesc}</p>
        </div>

        {/* Schemes Button */}
        <div 
            onClick={handleFetchSchemes}
            className="bg-purple-50 p-5 rounded-2xl shadow-sm border border-purple-100 cursor-pointer hover:border-purple-200 transition-colors flex items-center justify-between"
        >
            <div className="flex items-center gap-3">
                <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center text-purple-600">
                    <BookOpen size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 mb-1">{t.schemes}</h4>
                    <p className="text-xs text-gray-500">{t.schemesDesc}</p>
                </div>
            </div>
            <ArrowRight size={18} className="text-purple-400"/>
        </div>

        <div 
            onClick={() => onChangeView(AppView.CHAT)}
            className="col-span-2 bg-emerald-50 p-4 rounded-2xl shadow-sm border border-emerald-100 cursor-pointer flex items-center justify-between"
        >
            <div>
               <h4 className="font-bold text-emerald-700 mb-0.5">{t.askAi}</h4>
               <p className="text-xs text-emerald-600">{t.askAiDesc}</p>
            </div>
            <ArrowRight size={18} className="text-emerald-500"/>
        </div>
      </div>

      {/* Schemes Modal */}
      {showSchemes && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowSchemes(false)}
        >
           <div 
             className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl max-h-[80vh] overflow-y-auto"
             onClick={(e) => e.stopPropagation()}
           >
             <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-purple-900">{t.schemesTitle}</h3>
                <button onClick={() => setShowSchemes(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
             </div>
             
             {loadingSchemes ? (
                <div className="flex flex-col items-center justify-center py-8 text-purple-600">
                    <Loader2 size={32} className="animate-spin mb-2" />
                    <p className="text-sm">{common.loading}</p>
                </div>
             ) : (
                <div className="space-y-3">
                    {schemesData && schemesData.length > 0 ? (
                        schemesData.map((scheme, index) => (
                            <div key={index} className="bg-purple-50 p-3 rounded-xl border border-purple-100 mb-2 last:mb-0 hover:bg-purple-100 transition-colors">
                                <h4 className="font-bold text-purple-900 text-sm mb-1">{scheme.name}</h4>
                                <p className="text-xs text-purple-700 leading-relaxed">{scheme.benefit}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center">No schemes found.</p>
                    )}
                </div>
             )}
             
             <button 
               onClick={() => setShowSchemes(false)}
               className="w-full mt-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
             >
               {common.close}
             </button>
           </div>
        </div>
      )}

    </div>
  );
};
