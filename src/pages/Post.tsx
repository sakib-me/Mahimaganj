import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/hooks/useAuth';

export default function Post() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'categories')), (s) => {
      const data = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setCategories(data);
      if (data.length > 0) setCategory(data[0].name);
    });
    return () => unsubscribe();
  }, []);

  const selectedCat = categories.find(c => c.name === category);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addDoc(collection(db, 'posts'), {
      title,
      category,
      authorId: user.uid,
      status: 'pending',
      createdAt: serverTimestamp(),
      ...dynamicValues
    });
    alert("সফলভাবে জমা দেওয়া হয়েছে!");
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">তথ্য দিন</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select value={category} onChange={e => {setCategory(e.target.value); setDynamicValues({});}} className="w-full border p-3 rounded-xl">
          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="শিরোনাম" className="w-full border p-3 rounded-xl" />
        {selectedCat?.fields.map((f: any) => (
          <div key={f.id} className="space-y-1">
            <label className="text-xs font-bold text-gray-400">{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} required={f.required} value={dynamicValues[f.label] || ''} onChange={e => setDynamicValues({...dynamicValues, [f.label]: e.target.value})} className="w-full border p-3 rounded-xl" />
          </div>
        ))}
        <button type="submit" className="w-full bg-[#15803d] text-white py-4 rounded-2xl font-bold">সাবমিট করুন</button>
      </form>
    </div>
  );
}
