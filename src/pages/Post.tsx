import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/hooks/useAuth';
import { motion } from 'motion/react';
import { ImagePlus, Send, X, AlertCircle, Info } from 'lucide-react';

interface CategoryField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'tel' | 'date' | 'number' | 'textarea' | 'select';
  required: boolean;
}

interface CategoryConfig {
  id: string;
  name: string;
  fields: CategoryField[];
}

export default function Post() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = query(collection(db, 'categories'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoryConfig[];
      setCategories(data);
      if (data.length > 0 && !category) {
        setCategory(data[0].name);
      }
    });
    return () => unsubscribe();
  }, []);

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => blob ? resolve(blob) : reject(), 'image/jpeg', 0.6);
        };
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setMessage(null);

    try {
      let imageData = '';
      if (image) {
        const compressedBlob = await compressImage(image);
        imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(compressedBlob);
          reader.onloadend = () => resolve(reader.result as string);
        });
      }

      const postData = {
        title,
        description,
        category,
        authorId: user.uid,
        authorEmail: user.email,
        status: 'pending',
        isAdminPost: false,
        createdAt: serverTimestamp(),
        imageUrl: imageData,
        ...dynamicValues
      };

      await addDoc(collection(db, 'posts'), postData);
      setMessage({ type: 'success', text: 'আপনার তথ্য জমা হয়েছে এবং অনুমোদনের অপেক্ষায় আছে।' });
      setTitle(''); setDescription(''); setPhone(''); setImage(null); setImagePreview(null); setDynamicValues({});
    } catch (error) {
      setMessage({ type: 'error', text: 'কিছু ভুল হয়েছে।' });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryConfig = categories.find(c => c.name === category);

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center space-x-2">
        <Info className="text-[#15803d]" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">তথ্য দিন</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase">ক্যাটাগরি</label>
          <select value={category} onChange={(e) => { setCategory(e.target.value); setDynamicValues({}); }} className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#15803d]">
            {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400">শিরোনাম</label>
          <input required type="text" placeholder="পোস্টের শিরোনাম..." className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="space-y-4">
          {selectedCategoryConfig?.fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <label className="text-xs font-bold text-gray-400">{field.label} {field.required && '*'}</label>
              {field.type === 'textarea' ? (
                <textarea required={field.required} placeholder={field.placeholder} className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4" value={dynamicValues[field.label] || ''} onChange={(e) => setDynamicValues({ ...dynamicValues, [field.label]: e.target.value })} rows={3} />
              ) : (
                <input required={field.required} type={field.type} placeholder={field.placeholder} className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4" value={dynamicValues[field.label] || ''} onChange={(e) => setDynamicValues({ ...dynamicValues, [field.label]: e.target.value })} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400">বিস্তারিত (ঐচ্ছিক)</label>
          <textarea rows={4} className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <button disabled={submitting} type="submit" className="w-full bg-[#15803d] text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50">তথ্য সাবমিট করুন</button>
      </form>
    </div>
  );
}
