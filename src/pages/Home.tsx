import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion } from 'motion/react';
import { Calendar, Tag } from 'lucide-react';

interface PostData {
  id: string;
  title: string;
  description: string;
  category: string;
  phone: string;
  imageUrl?: string;
  createdAt: any;
  status: string;
}

export default function Home() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only show approved posts in the main feed
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PostData[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#15803d]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 p-4">
      <h2 className="text-xl font-bold text-gray-800 border-l-4 border-[#15803d] pl-3">সর্বশেষ খবর</h2>
      
      {posts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">এখনও কোনো পোস্ট নেই।</p>
        </div>
      ) : (
        posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {post.imageUrl && (
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-48 object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="p-4">
              <div className="flex items-center space-x-2 text-xs text-[#15803d] font-medium mb-2">
                <Tag size={12} />
                <span>{post.category}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                {post.description}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>
                    {post.createdAt?.toDate()?.toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <a 
                  href={`tel:${post.phone}`}
                  className="bg-[#15803d] text-white px-3 py-1.5 rounded-full font-medium inline-flex items-center shadow-sm"
                >
                  যোগাযোগ করুন
                </a>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
