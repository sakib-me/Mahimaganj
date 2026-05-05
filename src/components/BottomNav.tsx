import { Home, BookOpen, PlusSquare, User } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'হোম', icon: Home },
    { id: 'directory', label: 'ডিরেক্টরি', icon: BookOpen },
    { id: 'post', label: 'পোস্ট', icon: PlusSquare },
    { id: 'profile', label: 'প্রোফাইল', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full transition-colors",
                isActive ? "text-[#15803d]" : "text-gray-500"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-current/10")} />
              <span className="text-xs font-medium mt-1">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-1 bg-[#15803d] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
