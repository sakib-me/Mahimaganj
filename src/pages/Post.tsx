import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { useAuth } from '@/src/hooks/useAuth';
import { motion } from 'motion/react';
import { Camera, Send, X } from 'lucide-react';

export default function Post() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('খবর');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Dynamic Fields State
  const [bloodGroup, setBloodGroup] = useState('');
  const [address, setAddress] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  const [location, setLocation] = useState('');
  const [designation, setDesignation] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('New');

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
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas to Blob conversion failed'));
            },
            'image/jpeg',
            0.7 // quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'image must be less than 5MB' });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage({ type: 'error', text: 'দয়া করে লগইন করুন।' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      let imageData = '';
      if (image) {
        const compressedBlob = await compressImage(image);
        imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(compressedBlob);
        });
      }

      const postData: any = {
        title,
        description,
        category,
        authorId: user.uid,
        authorEmail: user.email,
        status: 'pending',
        isAdminPost: false,
        createdAt: serverTimestamp(),
        imageUrl: imageData,
      };

      if (category === 'রক্তদাতা') {
        postData.bloodGroup = bloodGroup;
        postData.contact = phone;
        postData.address = address;
        postData.lastDonation = lastDonation;
      } else if (category === 'হারানো বিজ্ঞপ্তি') {
        postData.location = location;
        postData.phone = phone;
      } else if (category === 'ডাক্তার') {
        postData.designation = designation;
        postData.address = address;
        postData.phone = phone;
        postData.time = time;
      } else if (category === 'ক্রয়/বিক্রয়') {
        postData.price = price;
        postData.condition = condition;
        postData.location = location;
        postData.phone = phone;
      } else {
        postData.phone = phone;
      }

      await addDoc(collection(db, 'posts'), postData);

      setMessage({ type: 'success', text: 'আপনার তথ্য জমা দেওয়া হয়েছে এবং অনুমোদনের অপেক্ষায় আছে।' });
      setTitle('');
      setDescription('');
      setPhone('');
      setImage(null);
      setImagePreview(null);
      setBloodGroup('');
      setAddress('');
      setLastDonation('');
      setLocation('');
      setDesignation('');
      setTime('');
      setPrice('');
    } catch (error) {
      console.error("Error submitting post:", error);
      setMessage({ type: 'error', text: 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।' });
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { value: 'খবর', label: 'খবর / নিউজ' },
    { value: 'ডাক্তার', label: 'ডাক্তার' },
    { value: 'রক্তদাতা', label: 'রক্তদাতা' },
    { value: 'ইলেক্ট্রিশিয়ান', label: 'ইলেক্ট্রিশিয়ান' },
    { value: 'বিভিন্ন সার্ভিস', label: 'বিভিন্ন সার্ভিস' },
    { value: 'হারানো বিজ্ঞপ্তি', label: 'হারানো বিজ্ঞপ্তি' },
    { value: 'ক্রয়/বিক্রয়', label: 'ক্রয়/বিক্রয়' },
    { value: 'অন্যান্য', label: 'অন্যান্য' },
  ];

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-8 bg-[#15803d] rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-800">তথ্য দিন</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">ক্যাটাগরি</label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">শিরোনাম</label>
          <input 
            required
            type="text" 
            placeholder={category === 'ক্রয়/বিক্রয়' ? "পণ্যের নাম..." : "পোস্টের শিরোনাম..."}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Dynamic Fields */}
        {category === 'রক্তদাতা' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">রক্তের গ্রুপ</label>
              <select 
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
              >
                <option value="">সিলেক্ট করুন</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">শেষ দান</label>
              <input 
                type="date" 
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                value={lastDonation}
                onChange={(e) => setLastDonation(e.target.value)}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">বর্তমান ঠিকানা</label>
              <input 
                type="text" 
                placeholder="আপনার ঠিকানা..."
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        )}

        {category === 'ডাক্তার' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">পদবী/বিশেষজ্ঞ</label>
              <input 
                type="text" 
                placeholder="যেমন: মেডিসিন বিশেষজ্ঞ..."
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">চেম্বারের ঠিকানা</label>
              <input 
                type="text" 
                placeholder="চেম্বারের বিস্তারিত ঠিকানা..."
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">ভিজিটিং সময়</label>
              <input 
                type="text" 
                placeholder="যেমন: বিকাল ৪টা - রাত ৮টা..."
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        )}

        {category === 'ক্রয়/বিক্রয়' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 col-span-2">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">দাম</label>
              <input 
                type="text" 
                placeholder="পণ্যের দাম..."
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">কন্ডিশন</label>
              <select 
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
              >
                <option value="New">নতুন</option>
                <option value="Used">পুরাতন</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">এলাকা</label>
              <input 
                type="text" 
                placeholder="আপনার এলাকা..."
                className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        )}

        {category === 'হারানো বিজ্ঞপ্তি' && (
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">নিখোঁজ হওয়ার স্থান</label>
            <input 
              type="text" 
              placeholder="কোথা থেকে নিখোঁজ হয়েছে..."
              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">বিস্তারিত</label>
          <textarea 
            required
            rows={4}
            placeholder={category === 'রক্তদাতা' ? "অতিরিক্ত তথ্য (ঐচ্ছিক)..." : "বিস্তারিত বর্ণনা লিখুন..."}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d] resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">ফোন নম্বর / যোগাযোগ (ঐচ্ছিক)</label>
          <input 
            type="tel" 
            placeholder="যোগাযোগের নম্বর..."
            className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-[#15803d]"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase ml-1">ছবি (ঐচ্ছিক)</label>
          <div className="flex items-center space-x-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-xl w-32 h-32 flex flex-col items-center justify-center transition-colors">
              <Camera className="text-gray-400 mb-2" size={32} />
              <span className="text-[10px] font-bold text-gray-500 uppercase">ছবি যোগ করুন</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            
            {imagePreview && (
              <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-[#15803d]">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => { setImage(null); setImagePreview(null); }}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            className={`p-4 rounded-xl text-sm font-medium ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <button
          disabled={submitting}
          type="submit"
          className="w-full bg-[#15803d] text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-[#15803d]/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          {submitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send size={20} />
              <span>তথ্য পাবলিশ করুন</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
