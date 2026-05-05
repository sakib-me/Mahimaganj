import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export default function Directory() {
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    onSnapshot(query(collection(db, 'categories')), s => setCategories(s.docs.map(d => ({id: d.id, name: d.data().name}))));
    onSnapshot(query(collection(db, 'posts'), where('status', '==', 'approved'), orderBy('createdAt', 'desc')), s => setPosts(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, []);

  const filtered = activeCategory === 'all' ? posts : posts.filter(p => p.category === activeCategory);

  return (
    <div className="p-4 space-y-6">
      <div className="flex overflow-x-auto space-x-2 pb-2">
        <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeCategory === 'all' ? 'bg-[#15803d] text-white' : 'bg-white border'}`}>সব</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.name)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${activeCategory === c.name ? 'bg-[#15803d] text-white' : 'bg-white border'}`}>{c.name}</button>
        ))}
      </div>
      <div className="space-y-4">
        {filtered.map(post => (
          <div key={post.id} className="bg-white p-5 rounded-3xl border shadow-sm">
            <span className="text-[10px] font-black text-[#15803d] uppercase tracking-widest">{post.category}</span>
            <h3 className="text-lg font-bold">{post.title}</h3>
            {/* ডাইনামিক ফিল্ডগুলো দেখার লজিক */}
            <div className="mt-2 space-y-1">
              {Object.keys(post).filter(k => !['id','title','category','status','createdAt','authorId','authorEmail','isAdminPost','imageUrl'].includes(k)).map(k => (
                <p key={k} className="text-[10px]"><span className="font-bold text-gray-500">{k}:</span> {post[k]}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
