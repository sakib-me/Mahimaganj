import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Trash2, Edit2, Phone, ExternalLink } from 'lucide-react';

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

export default function AdminDashboard() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<PostData | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
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

  const updateStatus = async (postId: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'posts', postId), { 
        status, 
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Status আপডেট করতে সমস্যা হয়েছে। এডমিন পারমিশন চেক করুন।");
    }
  };

  const deletePost = async (postId: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই পোস্টটি ডিলিট করতে চান?')) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const updatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      await updateDoc(doc(db, 'posts', editingPost.id), {
        title: editingPost.title,
        description: editingPost.description,
        category: editingPost.category,
        phone: editingPost.phone,
        updatedAt: serverTimestamp()
      });
      setEditingPost(null);
      alert("পোস্ট সফলভাবে আপডেট করা হয়েছে!");
    } catch (error) {
      console.error("Error updating post:", error);
      alert("পোস্ট আপডেট করা সম্ভব হয়নি।");
    }
  };

  const filteredPosts = posts.filter(p => p.status === filter);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Edit Modal */}
      <AnimatePresence>
        {editingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">এডিট পোস্ট</h3>
                  <button onClick={() => setEditingPost(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={updatePost} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">ক্যাটাগরি</label>
                    <select 
                      value={editingPost.category}
                      onChange={(e) => setEditingPost({...editingPost, category: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                    >
                      <option value="News">খবর</option>
                      <option value="Event">অনুষ্ঠান</option>
                      <option value="Announcement">ঘোষণা</option>
                      <option value="Question">প্রশ্ন/সহযোগিতা</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">শিরোনাম</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">বিস্তারিত</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d] resize-none"
                      value={editingPost.description}
                      onChange={(e) => setEditingPost({...editingPost, description: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase ml-1">ফোন নম্বর</label>
                    <input 
                      required
                      type="tel" 
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                      value={editingPost.phone}
                      onChange={(e) => setEditingPost({...editingPost, phone: e.target.value})}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#15803d] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#15803d]/30 active:scale-95 transition-all"
                  >
                    সেভ করুন
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm sticky top-0 z-40">
        {(['pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all uppercase tracking-widest ${
              filter === s ? 'bg-[#15803d] text-white shadow-md' : 'text-gray-400'
            }`}
          >
            {s === 'pending' ? 'অপেক্ষমান' : s === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
          </button>
        ))}
      </div>

      {/* Posts List */}
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
                    <div className="flex-1 mr-2">
                      <span className="text-[10px] font-black uppercase text-[#15803d] tracking-widest">
                        {post.category}
                      </span>
                      <h3 className="font-bold text-gray-900 leading-tight">{post.title}</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">{post.authorEmail}</p>
                    </div>
                    <div className="flex space-x-1">
                       <button onClick={() => setEditingPost(post)} className="p-2 text-[#15803d] bg-[#15803d]/10 rounded-lg">
                          <Edit2 size={16} />
                       </button>
                       <button onClick={() => deletePost(post.id)} className="p-2 text-red-500 bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2">{post.description}</p>
                  
                  <div className="flex items-center space-x-2 pt-2">
                     <a href={`tel:${post.phone}`} className="p-2.5 bg-gray-50 text-gray-600 rounded-xl">
                       <Phone size={18} />
                     </a>
                     
                     {filter === 'pending' && (
                       <>
                         <button 
                           onClick={() => updateStatus(post.id, 'approved')}
                           className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1 shadow-lg shadow-green-500/20"
                         >
                           <Check size={18} />
                           <span>অনুমোদন</span>
                         </button>
                         <button 
                           onClick={() => updateStatus(post.id, 'rejected')}
                           className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1"
                         >
                           <X size={18} />
                           <span>প্রত্যাখ্যান</span>
                         </button>
                       </>
                     )}
                     {filter === 'approved' && (
                       <button 
                         onClick={() => updateStatus(post.id, 'rejected')}
                         className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl font-bold"
                       >
                         প্রত্যাখ্যান করুন
                       </button>
                     )}
                     {filter === 'rejected' && (
                       <button 
                         onClick={() => updateStatus(post.id, 'approved')}
                         className="flex-1 bg-green-50 text-green-600 py-2.5 rounded-xl font-bold"
                       >
                         অনুমোদন দিন
                       </button>
                     )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
