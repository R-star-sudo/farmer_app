
import React, { useState, useRef } from 'react';
import { generateDiagnosis, analyzeSoil } from '../services/geminiService';
import { ResponseCard } from '../components/ResponseCard';
import { Camera, Loader2, X, Pickaxe } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';

interface DiagnosisViewProps {
  language: Language;
}

export const DiagnosisView: React.FC<DiagnosisViewProps> = ({ language }) => {
  const [image, setImage] = useState<string | null>(null);
  const [cropName, setCropName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null); // Validation error
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = TRANSLATIONS[language].diagnosis;
  const common = TRANSLATIONS[language].common;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null); // Reset previous result
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (type: 'disease' | 'weed' | 'soil') => {
    if (!image) return;
    
    if (type === 'disease' && cropName.length > 0 && cropName.trim().length === 0) {
        setError("Please enter a valid crop name or leave blank");
        return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      let response;
      if (type === 'soil') {
          response = await analyzeSoil(image, language);
      } else {
          const prompt = type === 'disease' 
            ? `Identify the disease for this crop: ${cropName || 'Unknown'}. Look for symptoms in the image.` 
            : `Identify this weed and tell me how to remove it.`;
          response = await generateDiagnosis(prompt, image, language);
      }
      setResult(response);
    } catch (err) {
      console.error(err);
      setResult("Error processing image. Please try again.");
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

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 mb-6">
        {/* Image Preview / Upload Area */}
        <div 
          className={`relative w-full h-64 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${
            image ? 'border-emerald-500 bg-gray-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
          onClick={() => !image && fileInputRef.current?.click()}
        >
          {image ? (
            <>
              <img src={image} alt="Preview" className="w-full h-full object-contain rounded-xl" />
              <button 
                onClick={(e) => { e.stopPropagation(); setImage(null); setResult(null); setCropName(''); setError(null); }}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 shadow-sm"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <div className="text-center p-6">
              <Camera size={48} className="mx-auto text-emerald-400 mb-2" />
              <p className="text-gray-500 font-medium">{t.tap}</p>
              <p className="text-xs text-gray-400 mt-1">{t.clear}</p>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
        </div>

        {/* Inputs */}
        {image && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.inputCrop}</label>
              <input 
                type="text"
                value={cropName}
                onChange={(e) => {
                    setCropName(e.target.value);
                    setError(null);
                }}
                placeholder="e.g. Wheat, Tomato"
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black placeholder-gray-400 ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
              />
               {error && <p className="text-red-500 text-[10px] mt-1 font-medium">{error}</p>}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleAnalyze('disease')}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1 bg-red-50 text-red-700 p-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors border border-red-100"
              >
                {loading ? <Loader2 className="animate-spin" /> : t.btnDisease}
              </button>
              <button 
                onClick={() => handleAnalyze('weed')}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1 bg-amber-50 text-amber-700 p-2 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors border border-amber-100"
              >
                {loading ? <Loader2 className="animate-spin" /> : t.btnWeed}
              </button>
              <button 
                onClick={() => handleAnalyze('soil')}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-1 bg-brown-50 text-orange-800 p-2 rounded-xl text-xs font-bold hover:bg-orange-100 transition-colors border border-orange-200 bg-orange-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Pickaxe size={16}/> {t.btnSoil}</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div id="results-section">
          <ResponseCard rawText={result} language={language} />
          
          <button 
            onClick={() => { setImage(null); setResult(null); setCropName(''); setError(null); }}
            className="w-full py-3 text-emerald-600 font-medium bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50"
          >
            {t.newDiag}
          </button>
        </div>
      )}
    </div>
  );
};
