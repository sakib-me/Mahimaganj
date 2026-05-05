import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Trash2, Edit2, Plus, Settings, Layers, Shield } from 'lucide-react';

interface PostData {
  id: string;
  title: string;
  description: string;
  category: string;
  phone: string;
  imageUrl?: string;
  createdAt: any;
  status: 'pending' | 'approved' | 'rejected';
  authorEmail: string;
}

interface CategoryField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'tel' | 'date' | 'number' | 'textarea';
  required: boolean;
}

interface CategoryConfig {
  id: string;
  name: string;
  fields: CategoryField[];
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [posts, setPosts] = useState<PostData[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);

  // New Category States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [catFields, setCatFields] = useState<CategoryField[]>([]);

  useEffect(() => {
    const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PostData[];
      setPosts(data);
      setLoading(false);
    });

    const qCats = query(collection(db, 'categories'));
    const unsubscribeCats = onSnapshot(qCats, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CategoryConfig[];
      setCategories(data);
    });

    return () => {
      unsubscribePosts();
      unsubscribeCats();
    };
  }, []);

  const updateStatus = async (postId: string, status: 'approved' | 'rejected', isAdminPost: boolean = false) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { 
        status, 
        isAdminPost: isAdminPost,
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditCategory = (cat: CategoryConfig) => {
    setEditingCategoryId(cat.id);
    setNewCatName(cat.name);
    setCatFields(cat.fields);
    setIsAddingCategory(true);
  };

  const handleCloseCategoryModal = () => {
    setIsAddingCategory(false);
    setEditingCategoryId(null);
    setNewCatName('');
    setCatFields([]);
  };

  const saveCategory = async () => {
    if (!newCatName || catFields.length === 0) return alert("নাম এবং অন্তত ১টি ফিল্ড দিন");
    try {
      const catData = { name: newCatName, fields: catFields, updatedAt: serverTimestamp() };
      if (editingCategoryId) {
        await updateDoc(doc(db, 'categories', editingCategoryId), catData);
      } else {
        await addDoc(collection(db, 'categories'), { ...catData, createdAt: serverTimestamp() });
      }
      handleCloseCategoryModal();
    } catch (error) {
      console.error(error);
    }
  };

  const addField = () => {
    setCatFields([...catFields, { id: Math.random().toString(36).substr(2, 9), label: '', placeholder: '', type: 'text', required: true }]);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm sticky top-2 z-[50]">
        <button onClick={() => setActiveTab('posts')} className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-bold rounded-xl ${activeTab === 'posts' ? 'bg-[#15803d] text-white' : 'text-gray-400'}`}>
          <Layers size={18} /> <span>পোস্ট লিস্ট</span>
        </button>
        <button onClick={() => setActiveTab('categories')} className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-bold rounded-xl ${activeTab === 'categories' ? 'bg-[#15803d] text-white' : 'text-gray-400'}`}>
          <Settings size={18} /> <span>ক্যাটাগরি ম্যানেজমেন্ট</span>
        </button>
      </div>

      {activeTab === 'categories' ? (
        <div className="space-y-6">
          <button onClick={() => setIsAddingCategory(true)} className="w-full bg-[#15803d] text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2">
            <Plus size={18} /> <span>নতুন ক্যাটাগরি তৈরি করুন</span>
          </button>
          {categories.map(cat => (
            <div key={cat.id} className="bg-white p-4 rounded-2xl border flex items-center justify-between">
              <div><h4 className="font-bold">{cat.name}</h4><p className="text-[10px] text-gray-400">ফিল্ড: {cat.fields.length}</p></div>
              <div className="flex space-x-2">
                <button onClick={() => handleEditCategory(cat)} className="p-2 bg-gray-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={async () => {if(confirm("Delete?")) await deleteDoc(doc(db, 'categories', cat.id))}} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* পোস্ট লিস্ট রেন্ডার হবে এখানে... (অগের কোড অনুযায়ী) */
        <div className="space-y-4">
           {/* ফিল্টার বাটনগুলো... */}
           {filteredPosts.map(post => (
             <div key={post.id} className="bg-white p-4 rounded-2xl border">
               <h3 className="font-bold">{post.title}</h3>
               <p className="text-xs text-gray-500">{post.category}</p>
               <div className="flex space-x-2 mt-4">
                 <button onClick={() => updateStatus(post.id, 'approved', false)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-[10px]">Approve (Directory)</button>
                 <button onClick={() => updateStatus(post.id, 'approved', true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-[10px]">Approve (Home)</button>
                 <button onClick={() => deleteDoc(doc(db, 'posts', post.id))} className="bg-red-50 text-red-500 p-2 rounded-lg"><Trash2 size={16} /></button>
               </div>
             </div>
           ))}
        </div>
      )}

      {/* ক্যাটাগরি এডিট/অ্যাড মডাল */}
      {isAddingCategory && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">{editingCategoryId ? 'এডিট ক্যাটাগরি' : 'নতুন ক্যাটাগরি'}</h3>
            <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="ক্যাটাগরির নাম" className="w-full border p-3 rounded-xl mb-4" />
            <div className="space-y-4">
              {catFields.map(field => (
                <div key={field.id} className="bg-gray-50 p-4 rounded-xl relative">
                  <button onClick={() => setCatFields(catFields.filter(f => f.id !== field.id))} className="absolute top-2 right-2 text-red-500"><X size={14} /></button>
                  <input placeholder="ফিল্ড লেবেল (যেমন: রক্তের গ্রুপ)" value={field.label} onChange={e => setCatFields(catFields.map(f => f.id === field.id ? {...f, label: e.target.value} : f))} className="w-full border p-2 rounded mb-2 text-sm" />
                </div>
              ))}
            </div>
            <button onClick={addField} className="text-[#15803d] text-xs font-bold mt-4">+ ফিল্ড যোগ করুন</button>
            <button onClick={saveCategory} className="w-full bg-[#15803d] text-white py-4 rounded-2xl font-bold mt-6">সেভ করুন</button>
            <button onClick={handleCloseCategoryModal} className="w-full text-gray-400 mt-2">বন্ধ করুন</button>
          </div>
        </div>
      )}
    </div>
  );
}
