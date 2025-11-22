
import React, { useState } from 'react';
import { generateFastAdvice } from '../services/geminiService';
import { ResponseCard } from '../components/ResponseCard';
import { CloudRain, Thermometer, Droplets, Sprout, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';

interface WeatherViewProps {
  language: Language;
}

export const WeatherView: React.FC<WeatherViewProps> = ({ language }) => {
  const [inputs, setInputs] = useState({
    temp: '',
    humidity: '',
    rainfall: 'Normal',
    crop: ''
  });
  const [errors, setErrors] = useState<{temp?: string, humidity?: string, crop?: string}>({});
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  
  const t = TRANSLATIONS[language].weather;

  const validate = () => {
    const newErrors: {temp?: string, humidity?: string, crop?: string} = {};
    let isValid = true;

    const tempVal = parseFloat(inputs.temp);
    if (!inputs.temp || isNaN(tempVal)) {
      newErrors.temp = "Required";
      isValid = false;
    } else if (tempVal < -10 || tempVal > 60) {
      newErrors.temp = "Range: -10°C to 60°C";
      isValid = false;
    }

    const humVal = parseFloat(inputs.humidity);
    if (!inputs.humidity || isNaN(humVal)) {
      newErrors.humidity = "Required";
      isValid = false;
    } else if (humVal < 0 || humVal > 100) {
      newErrors.humidity = "Range: 0% to 100%";
      isValid = false;
    }

    if (!inputs.crop.trim()) {
      newErrors.crop = "Crop name is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setAdvice(null);

    const prompt = `
      WEATHER-BASED FARMING SUGGESTIONS:
      - Temperature: ${inputs.temp}°C
      - Humidity: ${inputs.humidity}%
      - Rainfall: ${inputs.rainfall}
      - Crop: ${inputs.crop || 'General'}
      
      Follow the specific rules:
      - If temp > 32°C warn about heat stress.
      - If temp < 18°C warn about slow growth.
      - If humidity > 80% suggest reduced nitrogen.
      - If rainfall low suggest irrigation.
    `;

    try {
      const res = await generateFastAdvice(prompt, language);
      setAdvice(res);
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

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 space-y-5 mb-6">
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              <div className="flex items-center gap-1"><Thermometer size={14}/> {t.temp} (°C)</div>
            </label>
            <input
              type="number"
              value={inputs.temp}
              onChange={e => {
                setInputs({...inputs, temp: e.target.value});
                if (errors.temp) setErrors({...errors, temp: undefined});
              }}
              className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-black placeholder-gray-400 ${errors.temp ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              placeholder="30"
            />
            {errors.temp && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.temp}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              <div className="flex items-center gap-1"><Droplets size={14}/> {t.humidity} (%)</div>
            </label>
            <input
              type="number"
              value={inputs.humidity}
              onChange={e => {
                setInputs({...inputs, humidity: e.target.value});
                if (errors.humidity) setErrors({...errors, humidity: undefined});
              }}
              className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-black placeholder-gray-400 ${errors.humidity ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              placeholder="65"
            />
            {errors.humidity && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.humidity}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            <div className="flex items-center gap-1"><CloudRain size={14}/> {t.rain}</div>
          </label>
          <select
            value={inputs.rainfall}
            onChange={e => setInputs({...inputs, rainfall: e.target.value})}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-black"
          >
            <option value="Low">{t.rainOpts.low}</option>
            <option value="Normal">{t.rainOpts.normal}</option>
            <option value="High">{t.rainOpts.high}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            <div className="flex items-center gap-1"><Sprout size={14}/> {t.crop}</div>
          </label>
          <input
            type="text"
            value={inputs.crop}
            onChange={e => {
              setInputs({...inputs, crop: e.target.value});
              if (errors.crop) setErrors({...errors, crop: undefined});
            }}
            className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-black placeholder-gray-400 ${errors.crop ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
          />
          {errors.crop && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.crop}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-emerald-200 shadow-lg flex justify-center"
        >
          {loading ? <Loader2 className="animate-spin" /> : t.btn}
        </button>
      </form>

      {advice && <ResponseCard rawText={advice} language={language} />}
    </div>
  );
};
