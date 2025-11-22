
import React, { useState } from 'react';
import { generateFastAdvice } from '../services/geminiService';
import { ResponseCard } from '../components/ResponseCard';
import { TrendingUp, TrendingDown, PieChart, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';

interface FinanceViewProps {
  language: Language;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ language }) => {
  const [financials, setFinancials] = useState({
    income: '',
    expense: '',
    trend: 'stable' as 'profit' | 'stable' | 'loss'
  });
  const [errors, setErrors] = useState<{income?: string, expense?: string}>({});
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const t = TRANSLATIONS[language].finance;

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;
    
    if (!financials.income) {
        newErrors.income = "Required";
        isValid = false;
    } else if (parseFloat(financials.income) < 0) {
        newErrors.income = "Must be positive";
        isValid = false;
    }

    if (!financials.expense) {
        newErrors.expense = "Required";
        isValid = false;
    } else if (parseFloat(financials.expense) < 0) {
        newErrors.expense = "Must be positive";
        isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleAnalyze = async () => {
    if (!validate()) return;
    
    setLoading(true);
    setAdvice(null);

    const prompt = `
      MONEY MANAGEMENT ADVICE:
      - Monthly/Seasonal Income: ₹${financials.income}
      - Expenses: ₹${financials.expense}
      - Farmer says trend is: ${financials.trend}
      
      Provide a financial health summary, spending tips, and cost-saving ideas for a small Indian farmer.
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

  const getTrendLabel = (key: 'profit' | 'stable' | 'loss') => {
      return t.trends[key];
  };

  return (
    <div className="pb-20 pt-14 px-4 max-w-md mx-auto min-h-screen">
       <header className="mb-6">
        <h2 className="text-2xl font-bold text-emerald-900">{t.title}</h2>
        <p className="text-emerald-600 text-sm">{t.subtitle}</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 space-y-6 mb-6">
        
        <div className="flex gap-4">
            <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">{t.income} (₹)</label>
                <div className="relative">
                    <TrendingUp className="absolute left-3 top-3 text-green-500" size={18} />
                    <input 
                        type="number" 
                        placeholder="20000"
                        value={financials.income}
                        onChange={e => {
                            setFinancials({...financials, income: e.target.value});
                            if(errors.income) setErrors({...errors, income: undefined});
                        }}
                        className={`w-full pl-10 p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-green-500 outline-none text-black placeholder-gray-400 ${errors.income ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    />
                </div>
                {errors.income && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.income}</p>}
            </div>
            <div className="flex-1">
                <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">{t.expense} (₹)</label>
                <div className="relative">
                    <TrendingDown className="absolute left-3 top-3 text-red-500" size={18} />
                    <input 
                        type="number" 
                        placeholder="12000"
                        value={financials.expense}
                        onChange={e => {
                            setFinancials({...financials, expense: e.target.value});
                            if(errors.expense) setErrors({...errors, expense: undefined});
                        }}
                        className={`w-full pl-10 p-3 bg-gray-50 rounded-xl border focus:ring-2 focus:ring-red-500 outline-none text-black placeholder-gray-400 ${errors.expense ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    />
                </div>
                {errors.expense && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.expense}</p>}
            </div>
        </div>

        <div>
            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase">{t.trend}</label>
            <div className="flex gap-2">
                {(['profit', 'stable', 'loss'] as const).map((key) => (
                    <button
                        key={key}
                        onClick={() => setFinancials({...financials, trend: key})}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize border ${
                            financials.trend === key 
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-800' 
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                    >
                        {getTrendLabel(key)}
                    </button>
                ))}
            </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl hover:bg-emerald-900 transition-colors flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={20}/> : <><PieChart size={20}/> {t.btn}</>}
        </button>

      </div>

      {advice && <ResponseCard rawText={advice} language={language} />}
    </div>
  );
};
