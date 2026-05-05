import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Phone, ExternalLink } from 'lucide-react';

interface PostData {
  id: string;
  title: string;
  category: string;
  description: string;
  status: string;
  imageUrl?: string;
  [key: string]: any;
}

export default function Directory() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<PostData[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qCats = query(collection(db, 'categories'));
    const unsubscribeCats = onSnapshot(qCats, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setCategories(data);
    });

    const q = query(collection(db, 'posts'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PostData[];
      setPosts(data);
      setLoading(false);
    });

    return () => { unsubscribe(); unsubscribeCats(); };
  }, []);

  useEffect(() => {
    let result = posts;
    if (activeCategory !== 'all') result = result.filter(p => p.category === activeCategory);
    if (searchQuery) result = result.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredPosts(result);
  }, [activeCategory, searchQuery, posts]);

  const renderPostMeta = (post: any) => {
    const standardKeys = ['id', 'title', 'description', 'category', 'imageUrl', 'createdAt', 'status', 'authorEmail', 'authorId', 'isAdminPost', 'updatedAt'];
    const dynamicFields = Object.keys(post)
      .filter(key => !standardKeys.includes(key))
      .map(key => ({ label: key, value: post[key] }));

    return (
      <div className="text-[10px] space-y-1 bg-gray-50 p-2 rounded-lg mt-2">
        {dynamicFields.length > 0 ? dynamicFields.map((field, idx) => (
          <p key={idx}><span className="font-bold text-gray-500">{field.label}:</span> {field.value}</p>
        )) : post.phone && <p>📞 ফোন: {post.phone}</p>}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input type="text" placeholder="খুঁজুন..." className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#15803d]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="flex overflow-x-auto space-x-3 pb-4 scrollbar-hide">
        <button onClick={() => setActiveCategory('all')} className={`flex-none px-6 py-3 rounded-2xl font-bold text-xs ${activeCategory === 'all' ? 'bg-[#15803d] text-white shadow-lg' : 'bg-white text-gray-400'}`}>সব</button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.name)} className={`flex-none px-6 py-3 rounded-2xl font-bold text-xs ${activeCategory === cat.name ? 'bg-[#15803d] text-white shadow-lg' : 'bg-white text-gray-400'}`}>{cat.name}</button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15803d]"></div></div> : filteredPosts.length === 0 ? <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100 italic text-gray-400">কোনো তথ্য পাওয়া যায়নি।</div> : (
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post) => (
              <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={post.id} className="bg-white p-5 rounded-3xl border border-gray-100 space-y-4">
                <div>
                  <span className="text-[10px] uppercase text-[#15803d] font-black">{post.category}</span>
                  <h3 className="text-lg font-bold text-gray-900">{post.title}</h3>
                  {renderPostMeta(post)}
                </div>
                <p className="text-xs text-gray-600 line-clamp-3">{post.description}</p>
                {post.imageUrl && <div className="rounded-2xl overflow-hidden h-40"><img src={post.imageUrl} className="w-full h-full object-cover" alt="Post" /></div>}
                <div className="flex space-x-2">
                  {post.phone && <a href={`tel:${post.phone}`} className="flex-1 bg-[#15803d] text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2">কল করুন</a>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
