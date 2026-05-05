import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, setDoc, addDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Trash2, Edit2, Phone, ExternalLink, Shield, Plus, Settings, Layers, List } from 'lucide-react';

interface PostData {
  id: string;
  title: string;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  imageUrl?: string;
  phone?: string;
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
  const [editingPost, setEditingPost] = useState<any>(null);

  // Category States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [catFields, setCatFields] = useState<CategoryField[]>([]);

  useEffect(() => {
    // Listen for Posts
    const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PostData[];
      setPosts(data);
      setLoading(false);
    });

    // Listen for Categories
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

  // Post Actions
  const updateStatus = async (postId: string, status: 'approved' | 'rejected', isAdminPost: boolean = false) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { 
        status, 
        isAdminPost,
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status.");
    }
  };

  const deletePost = async (postId: string) => {
    if (confirm("Are you sure? This will delete the post forever.")) {
      await deleteDoc(doc(db, 'posts', postId));
    }
  };

  // Category Actions
  const addField = () => {
    const newField: CategoryField = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      placeholder: '',
      type: 'text',
      required: true
    };
    setCatFields([...catFields, newField]);
  };

  const removeField = (id: string) => {
    setCatFields(catFields.filter(f => f.id !== id));
  };

  const saveCategory = async () => {
    if (!newCatName || catFields.length === 0) {
      alert("দয়াকরে ক্যাটাগরির নাম এবং অন্তত একটি ফিল্ড দিন।");
      return;
    }

    try {
      const catData = {
        name: newCatName,
        fields: catFields,
        updatedAt: serverTimestamp()
      };

      if (editingCategoryId) {
        await updateDoc(doc(db, 'categories', editingCategoryId), catData);
        alert("ক্যাটাগরি আপডেট হয়েছে!");
      } else {
        await addDoc(collection(db, 'categories'), { ...catData, createdAt: serverTimestamp() });
        alert("নতুন ক্যাটাগরি তৈরি হয়েছে!");
      }
      handleCloseCategoryModal();
    } catch (error) {
      console.error("Error saving category:", error);
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

  const deleteCategory = async (id: string) => {
    if (confirm("এই ক্যাটাগরিটি ডিলিট করতে চান? এটি ডিলিট করলে ইউজাররা ঐ ক্যাটাগরিতে আর পোস্ট করতে পারবে না।")) {
      await deleteDoc(doc(db, 'categories', id));
    }
  };

  const filteredPosts = posts.filter(p => p.status === filter);

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-[#15803d] rounded-xl text-white">
          <Shield size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">এডমিন প্যানেল</h2>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm sticky top-2 z-50">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'posts' ? 'bg-[#15803d] text-white shadow-md' : 'text-gray-400'
          }`}
        >
          <Layers size={16} />
          <span>পোস্ট ম্যানেজমেন্ট</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'categories' ? 'bg-[#15803d] text-white shadow-md' : 'text-gray-400'
          }`}
        >
          <Settings size={16} />
          <span>ক্যাটাগরি ম্যানেজমেন্ট</span>
        </button>
      </div>

      {/* Category Management UI */}
      {activeTab === 'categories' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-800">ক্যাটাগরি তালিকা</h3>
            <button 
              onClick={() => setIsAddingCategory(true)}
              className="bg-[#15803d] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>নতুন ক্যাটাগরি</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {categories.map(cat => (
               <div key={cat.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                 <div>
                   <h4 className="font-bold text-gray-900">{cat.name}</h4>
                   <p className="text-[10px] text-gray-400 mt-1">ফিল্ড সংখ্যা: {cat.fields.length}</p>
                 </div>
                 <div className="flex space-x-2">
                   <button onClick={() => handleEditCategory(cat)} className="p-2 text-[#15803d] bg-[#15803d]/10 rounded-lg">
                      <Edit2 size={16} />
                   </button>
                   <button onClick={() => deleteCategory(cat.id)} className="p-2 text-red-500 bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                   </button>
                 </div>
               </div>
             ))}
          </div>
        </div>
      ) : (
        /* Post Management UI */
        <div className="space-y-4">
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            {(['pending', 'approved', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex-1 py-3 text-[10px] font-bold rounded-xl transition-all uppercase ${
                  filter === s ? 'bg-[#15803d] text-white shadow-md' : 'text-gray-400'
                }`}
              >
                {s === 'pending' ? 'অপেক্ষমান' : s === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
              </button>
            ))}
          </div>

          {loading ? <div className="text-center py-10">Loading...</div> : (
            filteredPosts.map(post => (
              <div key={post.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#15803d]">{post.category}</span>
                    <h3 className="font-bold text-gray-900">{post.title}</h3>
                  </div>
                  <button onClick={() => deletePost(post.id)} className="text-red-400"><Trash2 size={16} /></button>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{post.description}</p>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => updateStatus(post.id, 'approved', false)}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-[10px] font-bold"
                  >Approve (Directory)</button>
                  <button 
                    onClick={() => updateStatus(post.id, 'approved', true)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-xl text-[10px] font-bold"
                  >Approve (Home)</button>
                  <button 
                    onClick={() => updateStatus(post.id, 'rejected')}
                    className="p-2 bg-gray-100 rounded-xl"><X size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Category Modal */}
      <AnimatePresence>
        {isAddingCategory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold">{editingCategoryId ? 'ক্যাটাগরি এডিট' : 'নতুন ক্যাটাগরি তৈরি'}</h3>
                <button onClick={handleCloseCategoryModal}><X size={20} /></button>
              </div>
              
              <div className="space-y-4">
                <input 
                  type="text" placeholder="ক্যাটাগরির নাম..." className="w-full bg-gray-50 p-4 rounded-xl border" 
                  value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                />
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <span className="text-sm font-bold">ফিল্ডস যোগ করুন</span>
                  <button onClick={addField} className="text-[#15803d]"><Plus /></button>
                </div>
                {catFields.map(field => (
                  <div key={field.id} className="p-4 border rounded-2xl relative space-y-2">
                    <button onClick={() => removeField(field.id)} className="absolute top-2 right-2 text-red-400"><Trash2 size={14}/></button>
                    <input 
                      type="text" placeholder="ফিল্ডের নাম..." className="w-full text-xs p-2 border rounded-lg"
                      value={field.label} onChange={(e) => setCatFields(catFields.map(f => f.id === field.id ? {...f, label: e.target.value} : f))}
                    />
                    <select 
                      className="w-full text-xs p-2 border rounded-lg"
                      value={field.type} onChange={(e) => setCatFields(catFields.map(f => f.id === field.id ? {...f, type: e.target.value as any} : f))}
                    >
                      <option value="text">Text</option>
                      <option value="tel">Phone</option>
                      <option value="date">Date</option>
                      <option value="number">Number</option>
                      <option value="textarea">Description</option>
                    </select>
                  </div>
                ))}
              </div>
              <button onClick={saveCategory} className="w-full bg-[#15803d] text-white py-4 rounded-2xl font-bold mt-6 shadow-lg">Save Category</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
