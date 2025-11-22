
import React, { useState } from 'react';
import { calculateFertilizer } from '../services/geminiService';
import { ResponseCard } from '../components/ResponseCard';
import { FlaskConical, Sprout, Ruler, Calendar, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';

interface FertilizerViewProps {
  language: Language;
}

export const FertilizerView: React.FC<FertilizerViewProps> = ({ language }) => {
  const t = TRANSLATIONS[language].fertilizer;
  const [crop, setCrop] = useState('');
  const [landSize, setLandSize] = useState('');
  const [days, setDays] = useState('');
  const [errors, setErrors] = useState<{crop?: string, landSize?: string, days?: string}>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!crop.trim()) {
        newErrors.crop = "Required";
        isValid = false;
    }

    const sizeVal = parseFloat(landSize);
    if (!landSize || isNaN(sizeVal) || sizeVal <= 0) {
        newErrors.landSize = "Enter valid size > 0";
        isValid = false;
    } else if (sizeVal > 500) {
        newErrors.landSize = "Max 500 Acres";
        isValid = false;
    }

    const daysVal = parseFloat(days);
    if (days && (isNaN(daysVal) || daysVal < 0)) {
        newErrors.days = "Cannot be negative";
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const response = await calculateFertilizer(crop, landSize, days, language);
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

      <form onSubmit={handleCalculate} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 space-y-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
            <Sprout size={14} /> {t.title.split(' ')[0]} {/* Crop */}
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

        <div className="grid grid-cols-2 gap-4">
            <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                <Ruler size={14} /> {t.landSize}
            </label>
            <input 
                type="number" 
                value={landSize}
                onChange={e => {
                    setLandSize(e.target.value);
                    if(errors.landSize) setErrors({...errors, landSize: undefined});
                }}
                placeholder="e.g. 2"
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-black placeholder-gray-400 ${errors.landSize ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.landSize && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.landSize}</p>}
            </div>

            <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-1">
                <Calendar size={14} /> {t.cropAge}
            </label>
            <input 
                type="number" 
                value={days}
                onChange={e => {
                    setDays(e.target.value);
                    if(errors.days) setErrors({...errors, days: undefined});
                }}
                placeholder="e.g. 30"
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-black placeholder-gray-400 ${errors.days ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            />
            {errors.days && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.days}</p>}
            </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-emerald-200 shadow-lg flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><FlaskConical size={18} /> {t.btnCalculate}</>}
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
