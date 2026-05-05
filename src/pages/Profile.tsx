import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/src/lib/firebase';
import { useAuth } from '@/src/hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Settings, Bell, Shield, ArrowRight } from 'lucide-react';
import AdminDashboard from './AdminDashboard';

export default function Profile() {
  const { user, isAdmin, loading } = useAuth();
  const [showAdmin, setShowAdmin] = useState(false);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setShowAdmin(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        alert('ধন্যবাদ! আপনি এখন থেকে নোটিফিকেশন পাবেন।');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15803d]"></div>
      </div>
    );
  }

  if (showAdmin && isAdmin) {
    return (
      <div className="pb-20">
        <button 
          onClick={() => setShowAdmin(false)}
          className="m-4 text-xs font-bold text-[#15803d] flex items-center space-x-1"
        >
          <ArrowRight className="rotate-180" size={14} />
          <span>প্রোফাইলে ফিরে যান</span>
        </button>
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 pb-24">
      {!user ? (
        <div className="flex flex-col items-center justify-center space-y-6 pt-10">
          <div className="w-24 h-24 bg-[#15803d]/10 rounded-full flex items-center justify-center">
            <LogIn className="text-[#15803d] w-10 h-10" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">লগইন করুন</h2>
            <p className="text-gray-500 max-w-[250px]">
              আপনার Google অ্যাকাউন্ট ব্যবহার করে মহিমাগঞ্জ হাবে লগইন করুন।
            </p>
          </div>
          <button
            onClick={login}
            className="flex items-center space-x-3 bg-white border border-gray-200 px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow font-bold text-gray-700"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>Google দিয়ে লগইন করুন</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
              alt={user.displayName || 'User'} 
              className="w-20 h-20 rounded-2xl object-cover border-2 border-[#15803d]"
            />
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{user.displayName}</h2>
              <p className="text-xs text-gray-400 font-medium">{user.email}</p>
              {isAdmin && (
                <span className="inline-block px-2 py-0.5 bg-[#15803d] text-white text-[10px] font-black uppercase rounded-md mt-2">
                  Admin
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={requestNotificationPermission}
              className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Bell size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900">নোটিফিকেশন অনুমতি</h4>
                  <p className="text-[10px] text-gray-400">খবর ও ঘোষণা পান</p>
                </div>
              </div>
              <ArrowRight className="text-gray-300" size={18} />
            </button>

            {isAdmin && (
              <button 
                onClick={() => setShowAdmin(true)}
                className="flex items-center justify-between p-5 bg-[#15803d]/5 rounded-2xl border border-[#15803d]/20 shadow-sm active:scale-[0.98] transition-all"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[#15803d] text-white rounded-xl">
                    <Shield size={20} />
                  </div>
                  <div className="text-left text-[#15803d]">
                    <h4 className="font-bold">এডমিন ড্যাশবোর্ড</h4>
                    <p className="text-[10px] opacity-70">পোস্ট ম্যানেজমেন্ট</p>
                  </div>
                </div>
                <ArrowRight className="text-[#15803d]" size={18} />
              </button>
            )}

            <button 
              className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-50 text-gray-600 rounded-xl">
                  <Settings size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-900">সেটিংস</h4>
                  <p className="text-[10px] text-gray-400">অ্যাপ সেটআপ</p>
                </div>
              </div>
              <ArrowRight className="text-gray-300" size={18} />
            </button>

            <button 
              onClick={logout}
              className="flex items-center justify-between p-5 bg-red-50 rounded-2xl border border-red-100 shadow-sm active:scale-[0.98] transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                  <LogOut size={20} />
                </div>
                <div className="text-left text-red-600">
                  <h4 className="font-bold uppercase tracking-wide">লগআউট</h4>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
