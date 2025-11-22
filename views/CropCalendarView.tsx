
import React, { useState } from 'react';
import { generateCropCalendar } from '../services/geminiService';
import { ResponseCard } from '../components/ResponseCard';
import { Calendar, Sprout, Clock, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';

interface CropCalendarViewProps {
  language: Language;
}

export const CropCalendarView: React.FC<CropCalendarViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language].calendar;
  const [crop, setCrop] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<{crop?: string, date?: string}>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const validate = () => {
      const newErrors: typeof errors = {};
      let isValid = true;
      if (!crop.trim()) {
          newErrors.crop = "Required";
          isValid = false;
      }
      if (!date) {
          newErrors.date = "Required";
          isValid = false;
      }
      setErrors(newErrors);
      return isValid;
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await generateCropCalendar(crop, date, language);
      setResult(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 pt-14 px-4 max-w-md mx-auto min-h-screen">
      <header className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-900">{t.title}</h2>
        <p className="text-emerald-600 text-sm">{t.subtitle}</p>
      </header>

      <form onSubmit={handleGenerate} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 space-y-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
            <Sprout size={14} /> {t.crop}
          </label>
          <input 
            type="text" 
            value={crop}
            onChange={e => {
                setCrop(e.target.value);
                if(errors.crop) setErrors({...errors, crop: undefined});
            }}
            placeholder="e.g. Wheat"
            className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-black placeholder-gray-400 ${errors.crop ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
          />
          {errors.crop && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.crop}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
            <Clock size={14} /> {t.sowingDate}
          </label>
          <input 
            type="date" 
            value={date}
            onChange={e => {
                setDate(e.target.value);
                if(errors.date) setErrors({...errors, date: undefined});
            }}
            className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-black ${errors.date ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
          />
          {errors.date && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.date}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-emerald-200 shadow-lg flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Calendar size={18} /> {t.btnGenerate}</>}
        </button>
      </form>

      {result && (
        <div className="animate-fade-in">
           <ResponseCard rawText={result} language={language} />
        </div>
      )}
    </div>
  );
};
