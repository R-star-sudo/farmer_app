
import React, { useState, useEffect } from 'react';
import { optimizeListing, getGovMarketRate, SearchResult } from '../services/geminiService';
import { MarketListing, MarketPrice, Language } from '../types';
import { db } from '../services/database';
import { authService } from '../services/authService';
import { Store, MapPin, Scale, Wand2, Phone, CheckCircle, Loader2, UserCircle, TrendingUp, TrendingDown, Minus, Filter, ShoppingBag, Tag, Landmark, Search, ExternalLink, Star, ShieldCheck, X, Calendar, ChevronRight, Sprout, Droplets, Clock, Tractor, Hammer, Battery } from 'lucide-react';
import { TRANSLATIONS } from '../constants/translations';

interface MarketplaceViewProps {
  language: Language;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy'); // 'buy' = Browse, 'sell' = Post
  const [loading, setLoading] = useState(false);
  
  // Flow State
  const [selectedProfile, setSelectedProfile] = useState<MarketListing | null>(null);
  const [contactConfirmItem, setContactConfirmItem] = useState<MarketListing | null>(null);
  
  const [listings, setListings] = useState<MarketListing[]>([]);
  
  // New States for Enhanced Features: 'rent' type added
  const [postType, setPostType] = useState<'sell' | 'buy' | 'rent'>('sell');
  const [viewFilter, setViewFilter] = useState<'all' | 'sell' | 'buy' | 'rent'>('all');

  // Gov Rate Check State
  const [rateCheck, setRateCheck] = useState({ crop: '', mandi: '' });
  const [rateResult, setRateResult] = useState<SearchResult | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  
  // Validation
  const [errors, setErrors] = useState<{crop?: string, price?: string, location?: string}>({});

  const t = TRANSLATIONS[language].market;
  const user = authService.getCurrentUser();

  // Load Listings from DB on mount
  useEffect(() => {
    const fetchListings = async () => {
      const data = await db.listings.find();
      setListings(data);
    };
    fetchListings();
  }, []);

  // Fake Data for Nearby Markets
  const nearbyMarkets: MarketPrice[] = [
    { mandi: 'Azadpur Mandi', crop: 'Potato', price: '₹800/Q', trend: 'up', distance: '12 km' },
    { mandi: 'Okhla Mandi', crop: 'Tomato', price: '₹1200/Q', trend: 'down', distance: '18 km' },
    { mandi: 'Ghazipur Mandi', crop: 'Onion', price: '₹1500/Q', trend: 'stable', distance: '22 km' },
    { mandi: 'Najafgarh Mandi', crop: 'Wheat', price: '₹2150/Q', trend: 'up', distance: '35 km' },
  ];

  // Form State
  const [formData, setFormData] = useState({
    crop: '', quantity: '', price: '', location: user?.location || '', description: '',
    seedType: '', fertilizer: '', harvestDate: '', equipmentBrand: '', equipmentPower: ''
  });

  const validateForm = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!formData.crop.trim()) {
        newErrors.crop = "Required";
        isValid = false;
    }
    if (!formData.price.trim()) {
        newErrors.price = "Required";
        isValid = false;
    }
    if (!formData.location.trim()) {
        newErrors.location = "Required";
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleOptimize = async () => {
    if (!formData.crop) {
        setErrors({...errors, crop: "Required for AI"});
        return;
    }
    setLoading(true);
    const desc = await optimizeListing(postType, formData.crop, formData.quantity, formData.price, formData.location, language);
    setFormData(prev => ({ ...prev, description: desc }));
    setLoading(false);
  };

  const handleList = async () => {
    if (!validateForm()) return;
    
    const newListingData: MarketListing = {
      id: '', // DB will assign
      ...formData,
      seller: user?.name || 'Farmer',
      time: 'Just now',
      type: postType
    };

    // Save to DB
    const savedListing = await db.listings.insertOne(newListingData);
    
    // Update UI
    setListings([savedListing, ...listings]);
    setFormData({ crop: '', quantity: '', price: '', location: user?.location || '', description: '', seedType: '', fertilizer: '', harvestDate: '', equipmentBrand: '', equipmentPower: '' });
    setActiveTab('buy'); // Go back to browse
    setViewFilter('all');
  };

  const handleCheckRate = async () => {
    if (!rateCheck.crop || !rateCheck.mandi) return;
    setRateLoading(true);
    setRateResult(null);
    const result = await getGovMarketRate(rateCheck.crop, rateCheck.mandi, language);
    setRateResult(result);
    setRateLoading(false);
  };

  // ... (Render Helper Functions kept same)
  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp size={14} className="text-green-500" />;
    if (trend === 'down') return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const getMockStats = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const rating = (3.8 + (Math.abs(hash) % 12) / 10).toFixed(1); // 3.8 to 4.9
    const memberYear = 2020 + (Math.abs(hash) % 4); // 2020 - 2023
    const reviews = 4 + (Math.abs(hash) % 50);
    return { rating, memberYear, reviews };
  };

  const filteredListings = listings.filter(item => viewFilter === 'all' || item.type === viewFilter);

  const stats = selectedProfile ? getMockStats(selectedProfile.seller) : { rating: '4.5', memberYear: 2023, reviews: 10 };
  const currentYear = new Date().getFullYear();
  const memberDuration = currentYear - stats.memberYear;

  return (
    <div className="pb-24 pt-14 px-4 max-w-md mx-auto min-h-screen bg-gray-50">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-2">{t.title}</h2>
          <p className="text-emerald-600 text-xs">{t.subtitle}</p>
        </div>
        <div className="bg-emerald-100 p-2 rounded-full text-emerald-700"><Store size={24} /></div>
      </header>

      {/* Live Gov Rate Checker Widget */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-2xl shadow-sm border border-blue-100 mb-6">
        <div className="flex items-start justify-between mb-3">
            <div>
                <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                  <Landmark size={16} className="text-indigo-600"/> {t.govRateTitle}
                </h3>
                <p className="text-[10px] text-indigo-600">{t.govRateSubtitle}</p>
            </div>
        </div>
        
        <div className="flex gap-2 mb-3">
             <input 
                type="text" 
                placeholder={t.crop}
                value={rateCheck.crop}
                onChange={e => setRateCheck({...rateCheck, crop: e.target.value})}
                className="flex-1 text-xs p-2 rounded-lg border border-blue-200 focus:ring-1 focus:ring-indigo-500 outline-none text-black placeholder-gray-500"
             />
             <input 
                type="text" 
                placeholder={t.mandiInput}
                value={rateCheck.mandi}
                onChange={e => setRateCheck({...rateCheck, mandi: e.target.value})}
                className="flex-1 text-xs p-2 rounded-lg border border-blue-200 focus:ring-1 focus:ring-indigo-500 outline-none text-black placeholder-gray-500"
             />
             <button 
                onClick={handleCheckRate}
                disabled={rateLoading || !rateCheck.crop}
                className="bg-indigo-600 text-white p-2 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50"
             >
                 {rateLoading ? <Loader2 size={16} className="animate-spin"/> : <Search size={16}/>}
             </button>
        </div>

        {rateResult && (
            <div className="bg-white/80 p-3 rounded-xl border border-blue-100 animate-fade-in">
                <p className="text-xs text-gray-800 font-medium whitespace-pre-wrap mb-2">{rateResult.text}</p>
                {rateResult.sources && rateResult.sources.length > 0 && (
                     <div className="flex flex-wrap gap-1">
                         {rateResult.sources.map((s, i) => (
                             <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded flex items-center gap-1 hover:bg-blue-200">
                                 <ExternalLink size={8}/> {s.title.substring(0, 15)}...
                             </a>
                         ))}
                     </div>
                )}
            </div>
        )}
      </div>

      {/* Nearby Markets Widget */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 mb-6 animate-fade-in">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <MapPin size={16} className="text-emerald-500"/> {t.nearby}
        </h3>
        <div className="space-y-3">
          {nearbyMarkets.map((m, i) => (
            <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-semibold text-gray-800">{m.mandi}</p>
                <p className="text-xs text-gray-500">{m.crop} • {m.distance}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-700">{m.price}</p>
                <div className="flex items-center justify-end gap-1 text-xs text-gray-400">
                  {renderTrendIcon(m.trend)} {m.trend.toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex p-1 bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <button onClick={() => setActiveTab('buy')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'buy' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
          <ShoppingBag size={16}/> {t.tabBuy}
        </button>
        <button onClick={() => setActiveTab('sell')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'sell' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
          <Tag size={16}/> {t.tabSell}
        </button>
      </div>

      {activeTab === 'sell' ? (
        /* POST FORM */
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 space-y-4 animate-fade-in">
          <h3 className="font-bold text-gray-800">{t.create}</h3>
          
          {/* Post Type Selection */}
          <div>
             <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{t.iWantTo}</label>
             <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                <button 
                    onClick={() => setPostType('sell')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border whitespace-nowrap ${
                        postType === 'sell' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                        : 'border-gray-200 text-gray-500'
                    }`}
                >
                    {t.optSell}
                </button>
                <button 
                    onClick={() => setPostType('buy')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border whitespace-nowrap ${
                        postType === 'buy' 
                        ? 'bg-blue-50 border-blue-500 text-blue-700' 
                        : 'border-gray-200 text-gray-500'
                    }`}
                >
                    {t.optBuy}
                </button>
                <button 
                    onClick={() => setPostType('rent')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border whitespace-nowrap ${
                        postType === 'rent' 
                        ? 'bg-purple-50 border-purple-500 text-purple-700' 
                        : 'border-gray-200 text-gray-500'
                    }`}
                >
                    {t.optRent}
                </button>
             </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">
                {postType === 'rent' ? t.equipment : t.crop}
            </label>
            <input 
                type="text" 
                value={formData.crop} 
                onChange={e => {
                    setFormData({...formData, crop: e.target.value});
                    if (errors.crop) setErrors({...errors, crop: undefined});
                }} 
                placeholder={postType === 'rent' ? "e.g. Tractor 50HP" : "e.g. Basmati Rice"} 
                className={`w-full p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none text-black placeholder-gray-400 ${errors.crop ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
            />
            {errors.crop && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.crop}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                  {postType === 'sell' ? (t.qtySell || t.qty) : postType === 'buy' ? (t.qtyBuy || t.qty) : t.qty}
              </label>
              <input 
                type="text" 
                value={formData.quantity} 
                onChange={e => setFormData({...formData, quantity: e.target.value})} 
                placeholder={postType === 'rent' ? "e.g. 1 Unit" : "e.g. 100 Kg"} 
                className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-black placeholder-gray-400" 
            />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">
                  {postType === 'sell' ? (t.priceSell || t.price) : postType === 'buy' ? (t.priceBuy || t.price) : t.rateRent}
              </label>
              <input 
                type="text" 
                value={formData.price} 
                onChange={e => {
                    setFormData({...formData, price: e.target.value});
                    if (errors.price) setErrors({...errors, price: undefined});
                }} 
                placeholder={postType === 'sell' ? "e.g. ₹4000/Q" : postType === 'rent' ? "e.g. ₹500/hr" : "e.g. Market Rate"} 
                className={`w-full p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none text-black placeholder-gray-400 ${errors.price ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
            />
             {errors.price && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.price}</p>}
            </div>
          </div>
          
          {/* Detailed Fields for Sellers */}
          {postType === 'sell' && (
             <div className="bg-emerald-50/50 p-4 rounded-xl space-y-4 border border-emerald-100 animate-in slide-in-from-top-2">
                 <h4 className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5 border-b border-emerald-200 pb-2">
                    <Sprout size={14} className="text-emerald-600"/> Crop Details (Optional)
                 </h4>
                 
                 <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">{t.seedType}</label>
                    <input 
                        type="text" 
                        value={formData.seedType} 
                        onChange={e => setFormData({...formData, seedType: e.target.value})} 
                        placeholder="e.g. Certified Hybrid 456" 
                        className="w-full p-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow text-black placeholder-gray-400" 
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">{t.fertilizer}</label>
                        <input 
                            type="text" 
                            value={formData.fertilizer} 
                            onChange={e => setFormData({...formData, fertilizer: e.target.value})} 
                            placeholder="e.g. Urea, DAP, Organic" 
                            className="w-full p-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow text-black placeholder-gray-400" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">{t.harvestDate}</label>
                        <input 
                            type="date" 
                            value={formData.harvestDate} 
                            onChange={e => setFormData({...formData, harvestDate: e.target.value})} 
                            className="w-full p-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:ring-1 focus:ring-emerald-500 outline-none transition-shadow text-black" 
                        />
                    </div>
                 </div>
             </div>
          )}

          {/* Detailed Fields for Rentals */}
          {postType === 'rent' && (
             <div className="bg-purple-50/50 p-4 rounded-xl space-y-4 border border-purple-100 animate-in slide-in-from-top-2">
                 <h4 className="text-xs font-bold text-purple-800 uppercase flex items-center gap-1.5 border-b border-purple-200 pb-2">
                    <Tractor size={14} className="text-purple-600"/> Equipment Details
                 </h4>
                 
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">{t.brand}</label>
                        <input 
                            type="text" 
                            value={formData.equipmentBrand} 
                            onChange={e => setFormData({...formData, equipmentBrand: e.target.value})} 
                            placeholder="e.g. Mahindra" 
                            className="w-full p-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:ring-1 focus:ring-purple-500 outline-none transition-shadow text-black placeholder-gray-400" 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1.5">{t.power}</label>
                        <input 
                            type="text" 
                            value={formData.equipmentPower} 
                            onChange={e => setFormData({...formData, equipmentPower: e.target.value})} 
                            placeholder="e.g. 50 HP"
                            className="w-full p-2.5 text-sm bg-white rounded-lg border border-gray-200 focus:ring-1 focus:ring-purple-500 outline-none transition-shadow text-black placeholder-gray-400" 
                        />
                    </div>
                 </div>
             </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">{t.loc}</label>
            <input 
                type="text" 
                value={formData.location} 
                onChange={e => {
                    setFormData({...formData, location: e.target.value});
                    if (errors.location) setErrors({...errors, location: undefined});
                }}
                placeholder="e.g. Nashik, Maharashtra" 
                className={`w-full p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-emerald-500 outline-none text-black placeholder-gray-400 ${errors.location ? 'border-red-500 bg-red-50' : 'border-gray-200'}`} 
            />
            {errors.location && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.location}</p>}
          </div>
          <div>
             <div className="flex justify-between items-end mb-1">
                <label className="text-xs font-bold text-gray-500 uppercase">{t.desc}</label>
                <button onClick={handleOptimize} disabled={loading || !formData.crop} className="text-xs flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100">
                    {loading ? <Loader2 size={10} className="animate-spin"/> : <Wand2 size={10}/>} {t.ai}
                </button>
             </div>
             <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe details..." className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm text-black placeholder-gray-400" />
          </div>
          <button onClick={handleList} className={`w-full text-white font-bold py-3 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 ${postType === 'sell' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : postType === 'rent' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
            <CheckCircle size={18}/> {t.post}
          </button>
        </div>
      ) : (
         /* ... Browse Listings Code kept same ... */
        <div className="space-y-4">
           {/* Filter Chips */}
           <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              <button 
                onClick={() => setViewFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${viewFilter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {t.filterAll}
              </button>
              <button 
                onClick={() => setViewFilter('sell')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${viewFilter === 'sell' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {t.filterOffers}
              </button>
               <button 
                onClick={() => setViewFilter('buy')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${viewFilter === 'buy' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {t.filterRequests}
              </button>
              <button 
                onClick={() => setViewFilter('rent')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${viewFilter === 'rent' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                {t.filterRentals}
              </button>
           </div>

           {filteredListings.length === 0 ? (
               <div className="text-center py-10 text-gray-400">
                   <Filter size={40} className="mx-auto mb-2 opacity-20"/>
                   <p>No listings found.</p>
               </div>
           ) : (
               filteredListings.map((item) => (
                 <div key={item.id} className={`bg-white p-4 rounded-2xl shadow-sm border animate-fade-in ${item.type === 'buy' ? 'border-l-4 border-l-blue-500 border-gray-100' : item.type === 'rent' ? 'border-l-4 border-l-purple-500 border-gray-100' : 'border-l-4 border-l-emerald-500 border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`p-1.5 rounded-full ${item.type === 'buy' ? 'bg-blue-100 text-blue-600' : item.type === 'rent' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                             {item.type === 'buy' ? <ShoppingBag size={14}/> : item.type === 'rent' ? <Tractor size={14}/> : <Tag size={14}/>}
                          </span>
                          <div>
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded mb-0.5 inline-block ${item.type === 'buy' ? 'bg-blue-50 text-blue-600' : item.type === 'rent' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {item.type === 'buy' ? t.filterRequests : item.type === 'rent' ? t.filterRentals : t.filterOffers}
                             </span>
                             <h4 className="text-lg font-bold text-gray-900 leading-tight">{item.crop}</h4>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">{item.price}</span>
                           {/* Indicator for extra details */}
                           {item.type === 'sell' && (item.seedType || item.harvestDate) && (
                               <span className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
                                   <Sprout size={10} /> Verified Crop
                               </span>
                           )}
                           {item.type === 'rent' && (item.equipmentBrand || item.equipmentPower) && (
                               <span className="text-[10px] text-purple-600 flex items-center gap-1 mt-1">
                                   <Hammer size={10} /> Specs Added
                               </span>
                           )}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{item.description}</p>
                    <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><Scale size={12}/> {item.quantity}</div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded"><MapPin size={12}/> {item.location}</div>
                        <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                            <UserCircle size={12}/> 
                            <span className="font-semibold">{item.type === 'buy' ? 'Buyer:' : item.type === 'rent' ? 'Owner:' : 'Seller:'}</span> 
                            {item.seller}
                        </div>
                    </div>
                    <button 
                      onClick={() => setSelectedProfile(item)}
                      className={`w-full py-2 border font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm ${item.type === 'buy' ? 'border-blue-600 text-blue-700 hover:bg-blue-50' : item.type === 'rent' ? 'border-purple-600 text-purple-700 hover:bg-purple-50' : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'}`}
                    >
                         {t.viewProfile} <ChevronRight size={16}/>
                    </button>
                 </div>
               ))
           )}
           <div className="text-center text-xs text-gray-400 mt-4">{t.showing} {filteredListings.length}</div>
        </div>
      )}

      {/* 1. Profile Summary Modal */}
      {selectedProfile && (
         <div 
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedProfile(null)}
         >
             <div 
                className="bg-white rounded-3xl p-0 max-w-xs w-full shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
             >
                {/* Profile Header */}
                <div className={`h-24 relative ${selectedProfile.type === 'buy' ? 'bg-blue-600' : selectedProfile.type === 'rent' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                    <button 
                        onClick={() => setSelectedProfile(null)}
                        className="absolute top-2 right-2 bg-white/20 hover:bg-white/30 text-white p-1.5 rounded-full"
                    >
                        <X size={18}/>
                    </button>
                    <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                         <div className="bg-white p-1.5 rounded-full">
                             <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${selectedProfile.type === 'buy' ? 'bg-blue-500' : selectedProfile.type === 'rent' ? 'bg-purple-500' : 'bg-emerald-500'}`}>
                                 {selectedProfile.seller.charAt(0)}
                             </div>
                         </div>
                    </div>
                </div>

                {/* Profile Body */}
                <div className="pt-12 pb-6 px-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900">{selectedProfile.seller}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
                        {selectedProfile.type === 'buy' ? t.buyerProfile : selectedProfile.type === 'rent' ? t.renterProfile : t.sellerProfile}
                    </p>

                    {/* Badges */}
                    <div className="flex justify-center gap-2 mb-5">
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold">
                            <Star size={10} className="fill-amber-500 text-amber-500"/> {t.rating}: {stats.rating} <span className="text-amber-600/70 ml-0.5">({stats.reviews} {t.reviews})</span>
                        </span>
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold">
                            <ShieldCheck size={10}/> {t.verified}
                        </span>
                    </div>
                    
                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-left bg-gray-50 p-3 rounded-xl mb-5">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{t.loc}</p>
                            <p className="text-xs font-medium text-gray-800 flex items-center gap-1">
                                <MapPin size={10} /> {selectedProfile.location}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{t.memberSince}</p>
                            <p className="text-xs font-medium text-gray-800 flex items-center gap-1">
                                <Calendar size={10} /> {stats.memberYear} <span className="text-gray-400 ml-1">({memberDuration} yr)</span>
                            </p>
                        </div>
                    </div>

                    {/* Context of Listing */}
                    <div className="text-left border-t border-gray-100 pt-4 mb-6">
                        <p className="text-xs text-gray-500 mb-1">{selectedProfile.type === 'buy' ? 'Requesting:' : selectedProfile.type === 'rent' ? 'Offering Rent:' : 'Selling:'}</p>
                        <p className="font-bold text-gray-800 text-sm">{selectedProfile.crop} - {selectedProfile.quantity}</p>
                         <p className={`text-xs font-bold ${selectedProfile.type === 'rent' ? 'text-purple-600' : 'text-emerald-600'}`}>{selectedProfile.price}</p>
                         
                         {/* Extended Details if Available */}
                         {(selectedProfile.seedType || selectedProfile.fertilizer || selectedProfile.harvestDate) && (
                             <div className="mt-3 bg-emerald-50 p-2 rounded-lg text-xs space-y-1.5">
                                {selectedProfile.seedType && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-1"><Sprout size={10}/> {t.seedType}:</span>
                                        <span className="font-medium text-emerald-800">{selectedProfile.seedType}</span>
                                    </div>
                                )}
                                {selectedProfile.fertilizer && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-1"><Droplets size={10}/> {t.fertilizer}:</span>
                                        <span className="font-medium text-emerald-800">{selectedProfile.fertilizer}</span>
                                    </div>
                                )}
                                {selectedProfile.harvestDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-1"><Clock size={10}/> {t.harvestDate}:</span>
                                        <span className="font-medium text-emerald-800">
                                            {new Date(selectedProfile.harvestDate).toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                )}
                             </div>
                         )}

                         {/* Equipment Details */}
                         {(selectedProfile.equipmentBrand || selectedProfile.equipmentPower) && (
                             <div className="mt-3 bg-purple-50 p-2 rounded-lg text-xs space-y-1.5">
                                {selectedProfile.equipmentBrand && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-1"><Tractor size={10}/> {t.brand}:</span>
                                        <span className="font-medium text-purple-800">{selectedProfile.equipmentBrand}</span>
                                    </div>
                                )}
                                {selectedProfile.equipmentPower && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 flex items-center gap-1"><Battery size={10}/> {t.power}:</span>
                                        <span className="font-medium text-purple-800">{selectedProfile.equipmentPower}</span>
                                    </div>
                                )}
                             </div>
                         )}
                    </div>

                    <button 
                      onClick={() => {
                          const itemToContact = selectedProfile;
                          setSelectedProfile(null);
                          // Small delay for transition smoothness
                          setTimeout(() => setContactConfirmItem(itemToContact), 200);
                      }}
                      className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${selectedProfile.type === 'buy' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : selectedProfile.type === 'rent' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                    >
                        <Phone size={18}/> {t.contact}
                    </button>
                </div>
             </div>
         </div>
      )}

      {/* 2. Contact Confirmation Modal (Existing) */}
      {contactConfirmItem && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setContactConfirmItem(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">{t.confirmContact}</h3>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              {t.contactPrompt} <span className="font-bold text-emerald-800 block mt-1 text-base">{contactConfirmItem.seller}</span>
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setContactConfirmItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-colors text-sm"
              >
                {t.btnNo}
              </button>
              <button 
                onClick={() => {
                  // In a real app, this would trigger a phone call or chat
                  alert(`Initiating contact with ${contactConfirmItem.seller}...`); 
                  setContactConfirmItem(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Phone size={16} /> {t.btnYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
