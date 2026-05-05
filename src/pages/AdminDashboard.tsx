import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Trash2, Edit2, Phone, ExternalLink, Shield, Plus, Settings, Layers } from 'lucide-react';

interface PostData {
  id: string;
  title: string;
  description: string;
  category: string;
  phone?: string;
  imageUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  authorEmail: string;
  [key: string]: any;
}

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [posts, setPosts] = useState<PostData[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<PostData | null>(null);

  // Category States
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [catFields, setCatFields] = useState<CategoryField[]>([]);

  useEffect(() => {
    const qPosts = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PostData[];
      setPosts(data);
      setLoading(false);
    });

    const qCats = query(collection(db, 'categories'));
    const unsubscribeCats = onSnapshot(qCats, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoryConfig[];
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
        isAdminPost,
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      alert("Error updating status.");
    }
  };

  const renderPostMeta = (post: any) => {
    const standardKeys = ['id', 'title', 'description', 'category', 'imageUrl', 'createdAt', 'status', 'authorEmail', 'authorId', 'isAdminPost', 'updatedAt'];
    const dynamicFields = Object.keys(post)
      .filter(key => !standardKeys.includes(key))
      .map(key => ({ label: key, value: post[key] }));

    if (dynamicFields.length === 0) return post.phone ? <p className="text-[10px] mt-2">📞 ফোন: {post.phone}</p> : null;

    return (
      <div className="text-[10px] space-y-1 bg-gray-50 p-2 rounded-lg mt-2">
        {dynamicFields.map((field, idx) => (
          <p key={idx} className="capitalize">
            <span className="font-bold text-gray-500">{field.label}:</span> {field.value}
          </p>
        ))}
      </div>
    );
  };

  const deletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, 'posts', postId));
    }
  };

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

  const updateField = (id: string, updates: Partial<CategoryField>) => {
    setCatFields(catFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const saveCategory = async () => {
    if (!newCatName || catFields.length === 0) {
      alert("Please enter category name and at least one field");
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
        alert("Category updated successfully!");
      } else {
        await addDoc(collection(db, 'categories'), {
          ...catData,
          createdAt: serverTimestamp()
        });
        alert("Category added successfully!");
      }
      handleCloseCategoryModal();
    } catch (error) {
      alert("Failed to save category.");
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
    if (confirm("Delete this category?")) {
      await deleteDoc(doc(db, 'categories', id));
    }
  };

  const filteredPosts = posts.filter(p => p.status === filter);

  return (
    <div className="p-4 space-y-6 pb-20">
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

      {activeTab === 'posts' ? (
        <div className="space-y-6">
          <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
            {(['pending', 'approved', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`flex-1 py-3 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest ${
                  filter === s ? 'bg-[#15803d] text-white shadow-md' : 'text-gray-400'
                }`}
              >
                {s === 'pending' ? 'অপেক্ষমান' : s === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15803d]"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100 italic text-gray-400">
                এই তালিকায় কোনো পোস্ট নেই।
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden"
                  >
                    {post.imageUrl && (
                      <img src={post.imageUrl} className="w-full h-40 object-cover" alt="Post" referrerPolicy="no-referrer" />
                    )}
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#15803d] tracking-widest">
                            {post.category}
                          </span>
                          <h3 className="font-bold text-gray-900 leading-tight">{post.title}</h3>
                          <p className="text-xs text-gray-500 mt-1">{post.authorEmail}</p>
                          {renderPostMeta(post)}
                        </div>
                        <div className="flex space-x-2">
                           <button onClick={() => deletePost(post.id)} className="p-2 text-red-500 bg-red-50 rounded-lg">
                              <Trash2 size={16} />
                           </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2">{post.description}</p>
                      
                      <div className="flex items-center space-x-2 pt-2">
                         {filter === 'pending' && (
                           <>
                             <button 
                               onClick={() => updateStatus(post.id, 'approved', false)}
                               className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-bold flex flex-col items-center justify-center text-[8px] shadow-lg shadow-green-500/20"
                             >
                               <Check size={14} />
                               <span>DIRECTORY</span>
                             </button>
                             <button 
                               onClick={() => updateStatus(post.id, 'approved', true)}
                               className="flex-1 bg-blue-500 text-white py-2.5 rounded-xl font-bold flex flex-col items-center justify-center text-[8px] shadow-lg shadow-blue-500/20"
                             >
                               <Shield size={14} />
                               <span>HOME FEED</span>
                             </button>
                             <button 
                               onClick={() => updateStatus(post.id, 'rejected')}
                               className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold flex items-center justify-center"
                             >
                               <X size={16} />
                             </button>
                           </>
                         )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      ) : (
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
                   <button 
                     onClick={() => handleEditCategory(cat)}
                     className="p-2 text-gray-400 hover:text-[#15803d] transition-colors"
                   >
                     <Edit2 size={18} />
                   </button>
                   <button 
                     onClick={() => deleteCategory(cat.id)}
                     className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                   >
                     <Trash2 size={18} />
                   </button>
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      <AnimatePresence>
        {isAddingCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
             <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="flex items-center justify-between sticky top-0 bg-white pb-2 z-10">
                   <h3 className="text-xl font-bold text-gray-900">
                     {editingCategoryId ? 'ক্যাটাগরি এডিট' : 'নতুন ক্যাটাগরি তৈরি'}
                   </h3>
                   <button onClick={handleCloseCategoryModal} className="p-2 hover:bg-gray-100 rounded-full">
                     <X size={20} />
                   </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">ক্যাটাগরির নাম</label>
                    <input 
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                    />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-700">ফিল্ডস</h4>
                      <button onClick={addField} className="text-[#15803d] text-[10px] font-bold flex items-center space-x-1">
                        <Plus size={14} /> <span>যোগ করুন</span>
                      </button>
                    </div>
                    <div className="space-y-4">
                      {catFields.map((field) => (
                        <div key={field.id} className="bg-gray-50 p-4 rounded-2xl relative border border-gray-100">
                          <button onClick={() => removeField(field.id)} className="absolute top-2 right-2 text-red-500"><Trash2 size={14} /></button>
                          <div className="grid grid-cols-2 gap-3">
                            <input placeholder="ফিল্ড লেবেল" className="bg-white border rounded-lg py-2 px-3 text-sm" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} />
                            <input placeholder="প্লেসহোল্ডার" className="bg-white border rounded-lg py-2 px-3 text-sm" value={field.placeholder} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} />
                            <select className="bg-white border rounded-lg py-2 px-3 text-sm" value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value as any })}>
                              <option value="text">Text</option>
                              <option value="tel">Phone</option>
                              <option value="date">Date</option>
                              <option value="textarea">TextArea</option>
                            </select>
                            <label className="flex items-center space-x-2 text-[10px] font-bold">
                              <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} />
                              <span>বধ্যতামূলক</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={saveCategory} className="w-full bg-[#15803d] text-white py-4 rounded-2xl font-bold shadow-lg mt-6">সেভ করুন</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
