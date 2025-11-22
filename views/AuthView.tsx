
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User, Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { Sprout, Loader2, ArrowRight, Phone, Lock, User as UserIcon, MapPin, Eye, EyeOff } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
  language: Language;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, language }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: ''
  });

  const t = TRANSLATIONS[language].auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const user = await authService.login(formData.email, formData.password);
        onLogin(user);
      } else if (mode === 'signup') {
        const user = await authService.signup(formData.name, formData.email, formData.password, formData.location);
        onLogin(user);
      } else if (mode === 'forgot') {
        await authService.resetPassword(formData.email);
        setSuccessMsg('Reset link sent to your email/mobile.');
        setLoading(false);
        return;
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      if (mode !== 'forgot') setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="mb-8 text-center">
        <div className="bg-emerald-600 p-4 rounded-2xl inline-block mb-4 shadow-lg shadow-emerald-200">
          <Sprout size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-emerald-900 mb-2">KisanSmart</h1>
        <p className="text-emerald-600 font-medium">AI Farmer Assistant</p>
      </div>

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl shadow-emerald-100 border border-emerald-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {mode === 'login' ? t.loginTitle : mode === 'signup' ? t.signupTitle : t.resetTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{t.name}</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black placeholder-gray-400"
                    placeholder="Rajesh Kumar"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black placeholder-gray-400"
                    placeholder="Punjab, India"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{t.email}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black placeholder-gray-400"
                placeholder="Email or Mobile"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black placeholder-gray-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mode === 'login' && (
                <div className="text-right mt-2">
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-emerald-600 font-semibold hover:underline">
                    {t.forgot}
                  </button>
                </div>
              )}
            </div>
          )}

          {error && <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg text-center">{error}</div>}
          {successMsg && <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg text-center">{successMsg}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                {mode === 'login' ? t.btnLogin : mode === 'signup' ? t.btnSignup : t.btnReset}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-100 pt-6">
          {mode === 'login' ? (
            <p className="text-gray-600 text-sm">
              {t.noAccount} <button onClick={() => setMode('signup')} className="text-emerald-700 font-bold hover:underline">{t.btnSignup}</button>
            </p>
          ) : mode === 'signup' ? (
            <p className="text-gray-600 text-sm">
              {t.hasAccount} <button onClick={() => setMode('login')} className="text-emerald-700 font-bold hover:underline">{t.btnLogin}</button>
            </p>
          ) : (
            <button onClick={() => setMode('login')} className="text-emerald-700 font-bold text-sm hover:underline">{t.back}</button>
          )}
        </div>
      </div>
    </div>
  );
};
