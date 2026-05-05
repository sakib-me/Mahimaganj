import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion } from 'motion/react';
import { Search, Phone, User, Activity, Flame, Zap, HelpCircle, Package } from 'lucide-react';

interface PostData {
  id: string;
  title: string;
  phone: string;
  category: string;
  description: string;
  status: string;
}

const Tool = Activity; 

const CATEGORIES = [
  { id: 'all', label: 'সব', icon: Activity },
  { id: 'ডাক্তার', label: 'ডাক্তার', icon: User },
  { id: 'রক্তদাতা', label: 'রক্তদাতা', icon: Flame },
  { id: 'ইলেক্ট্রিশিয়ান', label: 'ইলেক্ট্রিশিয়ান', icon: Zap },
  { id: 'বিভিন্ন সার্ভিস', label: 'সার্ভিস', icon: Tool },
  { id: 'হারানো বিজ্ঞপ্তি', label: 'হারানো', icon: HelpCircle },
  { id: 'ক্রয়/বিক্রয়', label: 'ক্রয়/বিক্রয়', icon: Package },
];

export default function Directory() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'), 
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PostData[];
      setPosts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = posts;
    const dirCategories = ['ডাক্তার', 'রক্তদাতা', 'ইলেক্ট্রিশিয়ান', 'বিভিন্ন সার্ভিস', 'হারানো বিজ্ঞপ্তি', 'ক্রয়/বিক্রয়'];
    
    if (activeCategory === 'all') {
      result = result.filter(p => dirCategories.includes(p.category));
    } else {
      result = result.filter(p => p.category === activeCategory);
    }

    if (searchQuery) {
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredPosts(result);
  }, [activeCategory, searchQuery, posts]);

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="সার্ভিস খুঁজুন..."
          className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-[#15803d] outline-none shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex overflow-x-auto space-x-3 pb-2 scrollbar-hide -mx-4 px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex flex-col items-center min-w-[70px] space-y-1 py-3 px-2 rounded-2xl transition-all ${
              activeCategory === cat.id 
                ? 'bg-[#15803d] text-white shadow-lg shadow-[#15803d]/20 -translate-y-1' 
                : 'bg-white text-gray-600 border border-gray-100 shadow-sm'
            }`}
          >
            <cat.icon size={20} />
            <span className="text-[10px] font-bold">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15803d]"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">কোনো তথ্য পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={post.id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#15803d] tracking-widest leading-none">
                  {post.category}
                </span>
                <h3 className="font-bold text-gray-900">{post.title}</h3>
                {post.description && (
                   <p className="text-xs text-gray-500 line-clamp-1">{post.description}</p>
                )}
              </div>
              {post.phone && (
                <a 
                  href={`tel:${post.phone}`}
                  className="bg-[#15803d] text-white p-3 rounded-full hover:bg-[#166534] transition-colors shadow-md shadow-[#15803d]/10"
                >
                  <Phone size={20} />
                </a>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
