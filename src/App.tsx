/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider } from './hooks/useAuth';
import LandmarkHeader from './components/LandmarkHeader';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Directory from './pages/Directory';
import Post from './pages/Post';
import Profile from './pages/Profile';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'directory':
        return <Directory />;
      case 'post':
        return <Post />;
      case 'profile':
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-[#15803d] selection:text-white">
        <LandmarkHeader />
        
        <main className="flex-1 overflow-y-auto max-w-lg mx-auto w-full">
          {renderContent()}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </AuthProvider>
  );
}
