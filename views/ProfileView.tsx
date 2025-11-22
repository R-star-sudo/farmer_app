
import React from 'react';
import { User, Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';
import { UserCircle, MapPin, Mail, LogOut, Edit2, Shield } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  language: Language;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, language }) => {
  const t = TRANSLATIONS[language].profile;

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-100 p-3 rounded-full">
          <UserCircle size={32} className="text-emerald-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-emerald-900">{t.title}</h1>
          <p className="text-emerald-600 text-sm">{user.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">{t.details}</h3>
          <button className="text-emerald-600 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
            <Edit2 size={12} /> {t.edit}
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
               <UserCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Name</p>
              <p className="font-medium text-gray-800">{user.name}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
             <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
               <Mail size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Email / Contact</p>
              <p className="font-medium text-gray-800">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
             <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
               <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">{t.location}</p>
              <p className="font-medium text-gray-800">{user.location || 'Not set'}</p>
            </div>
          </div>
          
           <div className="flex items-start gap-4">
             <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
               <Shield size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Account Type</p>
              <p className="font-medium text-gray-800">Farmer (Basic)</p>
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors border border-red-100 flex items-center justify-center gap-2"
      >
        <LogOut size={18} />
        {t.logout}
      </button>
    </div>
  );
};
