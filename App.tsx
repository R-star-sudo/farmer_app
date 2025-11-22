
import React, { useState, useEffect } from 'react';
import { AppView, Language, User } from './types';
import { Navbar } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { DiagnosisView } from './views/DiagnosisView';
import { WeatherView } from './views/WeatherView';
import { FinanceView } from './views/FinanceView';
import { ChatAdvisorView } from './views/ChatAdvisorView';
import { MarketplaceView } from './views/MarketplaceView';
import { CommunityView } from './views/CommunityView';
import { AuthView } from './views/AuthView';
import { ProfileView } from './views/ProfileView';
import { CropCalendarView } from './views/CropCalendarView';
import { FertilizerView } from './views/FertilizerView';
import { authService } from './services/authService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [language, setLanguage] = useState<Language>('en');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ensureUser = async () => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        } else {
           // Auto-login mock user
           const defaultUser = await authService.ensureDefaultUser();
           setUser(defaultUser);
        }
        setIsLoading(false);
    };
    ensureUser();
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentView(AppView.DASHBOARD);
  };

  // Loading state while checking auth
  if (isLoading) return <div className="min-h-screen bg-white"></div>;

  // Main App Logic
  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <DashboardView onChangeView={setCurrentView} language={language} setLanguage={setLanguage} user={user!} />;
      case AppView.DIAGNOSIS:
        return <DiagnosisView language={language} />;
      case AppView.WEATHER:
        return <WeatherView language={language} />;
      case AppView.FINANCE:
        return <FinanceView language={language} />;
      case AppView.CHAT:
        return <ChatAdvisorView language={language} />;
      case AppView.MARKETPLACE:
        return <MarketplaceView language={language} />;
      case AppView.CHOUPAL:
        return <CommunityView language={language} />;
      case AppView.CALENDAR:
        return <CropCalendarView language={language} />;
      case AppView.FERTILIZER:
        return <FertilizerView language={language} />;
      case AppView.PROFILE:
        return <ProfileView user={user!} onLogout={handleLogout} language={language} />;
      default:
        return <DashboardView onChangeView={setCurrentView} language={language} setLanguage={setLanguage} user={user!} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
       {/* Modern Phone Frame - Dynamic Island Style */}
       <div className="relative w-full h-full max-h-[95vh] max-w-[380px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden flex flex-col">
            
            {/* Dynamic Island Notch */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-gray-800 ml-16"></div> {/* Camera lens hint */}
            </div>

            {/* Side Buttons */}
            <div className="absolute top-24 -left-[10px] w-[2px] h-8 bg-gray-700 rounded-l-md"></div> {/* Silent */}
            <div className="absolute top-36 -left-[10px] w-[2px] h-14 bg-gray-700 rounded-l-md"></div> {/* Vol Up */}
            <div className="absolute top-52 -left-[10px] w-[2px] h-14 bg-gray-700 rounded-l-md"></div> {/* Vol Down */}
            <div className="absolute top-40 -right-[10px] w-[2px] h-20 bg-gray-700 rounded-r-md"></div> {/* Power */}

            {/* Screen Content */}
            <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar bg-emerald-50/50 text-gray-900 font-sans selection:bg-emerald-200">
              {renderView()}
              {currentView !== AppView.PROFILE && (
                  <Navbar currentView={currentView} onChangeView={setCurrentView} language={language} />
              )}
            </div>
       </div>
    </div>
  );
};

export default App;
