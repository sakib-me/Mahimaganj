import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Trash2, Edit2, Shield } from 'lucide-react';

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

  const updateStatus = async (postId: string, status: 'approved' | 'rejected', isAdminPost: boolean = false) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { 
        status, 
        isAdminPost: isAdminPost, // Home feed approval
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Error updating status.");
    }
  };

  const renderPostMeta = (post: any) => {
    if (post.category === 'রক্তদাতা') {
      return (
        <div className="text-[10px] space-y-1 bg-gray-50 p-2 rounded-lg mt-2 font-bangla">
          <p>🩸 গ্রুপ: <span className="font-bold text-red-600">{post.bloodGroup}</span></p>
          <p>📍 ঠিকানা: {post.address}</p>
          <p>📅 শেষ দান: {post.lastDonation}</p>
        </div>
      );
    }
    if (post.category === 'ডাক্তার') {
      return (
        <div className="text-[10px] space-y-1 bg-gray-50 p-2 rounded-lg mt-2 font-bangla">
          <p>💼 পদবী: {post.designation}</p>
          <p>📍 ঠিকানা: {post.address}</p>
          <p>⏰ সময়: {post.time}</p>
        </div>
      );
    }
    if (post.category === 'ক্রয়-বিক্রয়') {
      return (
        <div className="text-[10px] space-y-1 bg-gray-50 p-2 rounded-lg mt-2 font-bangla">
          <p>💰 দাম: {post.price}</p>
          <p>🏷️ কন্ডিশন: {post.condition}</p>
          <p>📍 এলাকা: {post.location}</p>
        </div>
      );
    }
    return post.phone ? <p className="text-[10px] mt-2">📞 ফোন: {post.phone}</p> : null;
  };
  
  // ... (বাকি কোড Edit Modal এবং Delete Logic একই আছে)
