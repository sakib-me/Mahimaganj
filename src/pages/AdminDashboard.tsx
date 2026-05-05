import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
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
      await updateDoc(doc(db, 'posts', postId), { status, updatedAt: new Date() });
      // In a real app, logic to trigger notification would go here
    } catch (error) {
      console.error("Error updating status:", error);
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

  const filteredPosts = posts.filter(p => p.status === filter);

  return (
    <div className="p-4 space-y-6">
      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
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
                           onClick={() => updateStatus(post.id, 'approved')}
                           className="flex-1 bg-green-500 text-white py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1 shadow-lg shadow-green-500/20"
                         >
                           <Check size={18} />
                           <span>Approve</span>
                         </button>
                         <button 
                           onClick={() => updateStatus(post.id, 'rejected')}
                           className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-1"
                         >
                           <X size={18} />
                           <span>Reject</span>
                         </button>
                       </>
                     )}
                     {filter === 'approved' && (
                       <button 
                         onClick={() => updateStatus(post.id, 'rejected')}
                         className="flex-1 bg-red-100 text-red-600 py-2.5 rounded-xl font-bold"
                       >
                         Reject
                       </button>
                     )}
                     {filter === 'rejected' && (
                       <button 
                         onClick={() => updateStatus(post.id, 'approved')}
                         className="flex-1 bg-green-100 text-green-600 py-2.5 rounded-xl font-bold"
                       >
                         Approve
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
