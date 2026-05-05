import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion } from 'motion/react';
import { Search, Phone, User, Activity, Truck, Zap, Shield, Flame } from 'lucide-react';

interface ServiceData {
  id: string;
  name: string;
  phone: string;
  category: string;
  description?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'সব', icon: Activity },
  { id: 'doctor', label: 'ডাক্তার', icon: User },
  { id: 'ambulance', label: 'অ্যাম্বুলেন্স', icon: Truck },
  { id: 'blood', label: 'রক্তাদাতা', icon: Flame },
  { id: 'electrician', label: 'ইলেকট্রিশিয়ান', icon: Zap },
  { id: 'police', label: 'পুলিশ লাইন', icon: Shield },
  { id: 'fire', label: 'ফায়ার সার্ভিস', icon: Flame },
];

export default function Directory() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceData[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceData[];
      setServices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = services;
    if (activeCategory !== 'all') {
      result = result.filter(s => s.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchQuery) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredServices(result);
  }, [activeCategory, searchQuery, services]);

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="সার্ভিস খুঁজুন..."
          className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-[#15803d] focus:border-transparent outline-none shadow-sm"
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
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">কোনো সার্ভিস পাওয়া যায়নি।</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={service.id}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#15803d] tracking-widest leading-none">
                  {service.category}
                </span>
                <h3 className="font-bold text-gray-900">{service.name}</h3>
                {service.description && (
                   <p className="text-xs text-gray-500">{service.description}</p>
                )}
              </div>
              <a 
                href={`tel:${service.phone}`}
                className="bg-[#15803d] text-white p-3 rounded-full hover:bg-[#166534] transition-colors shadow-md shadow-[#15803d]/10"
              >
                <Phone size={20} />
              </a>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
