// components/OfficeEditModal.tsx

import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Upload, Image as ImageIcon, Video, Star, Trash2, Building2, Cloud, Loader2 } from 'lucide-react';
import { OfficeType } from '../types';
import { uploadToCloud, uploadVideoToCloud } from '../services/uploadService';

interface OfficeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: OfficeType) => void;
  initialData: OfficeType;
}

const OfficeEditModal: React.FC<OfficeEditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [description, setDescription] = useState('');

  // Media State
  const [images, setImages] = useState<string[]>([]);
  const [coverIndex, setCoverIndex] = useState<number>(0);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setDescription(initialData.description);
      setImages(initialData.images || [initialData.imageUrl]);
      // Load multi-video, fallback to single
      if (initialData.videoUrls && initialData.videoUrls.length > 0) {
        setVideoPreviews(initialData.videoUrls);
      } else if (initialData.videoUrl) {
        setVideoPreviews([initialData.videoUrl]);
      } else {
        setVideoPreviews([]);
      }
      const idx = initialData.images?.indexOf(initialData.imageUrl);
      setCoverIndex(idx !== undefined && idx >= 0 ? idx : 0);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const remainingSlots = 6 - images.length;

      if (files.length > remainingSlots) {
        alert(`最多只能上傳 6 張照片。`);
        files.splice(remainingSlots);
      }

      if (files.length === 0) return;

      setIsUploading(true);
      try {
        const uploadPromises = files.map(file => uploadToCloud(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        setImages(prev => [...prev, ...uploadedUrls]);
      } catch (error) {
        alert("圖片上傳失敗，請檢查網路。");
      } finally {
        setIsUploading(false);
        if (imageInputRef.current) imageInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    if (index === coverIndex) setCoverIndex(0);
    else if (index < coverIndex) setCoverIndex(coverIndex - 1);
  };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setIsVideoUploading(true);

      try {
        const uploadPromises = files.map(file => uploadVideoToCloud(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        setVideoPreviews(prev => [...prev, ...uploadedUrls]);
      } catch (error) {
        alert("部分影片上傳失敗，請檢查網路。");
      } finally {
        setIsVideoUploading(false);
        if (videoInputRef.current) videoInputRef.current.value = '';
      }
    }
  };

  const removeVideo = (index: number) => {
    setVideoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0) {
      alert("請至少保留一張照片。");
      return;
    }

    const updatedOffice: OfficeType = {
      ...initialData,
      description,
      imageUrl: images[coverIndex],
      images: images,
      videoUrl: videoPreviews[0] || '',
      videoUrls: videoPreviews,
    };

    onSave(updatedOffice);
    onClose();
  };

  const anyUploading = isUploading || isVideoUploading;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90%]">
        {/* Header */}
        <div className="bg-brand-600 p-4 text-white flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Building2 size={20} /> 編輯：{initialData.title}
          </h3>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">

          {/* Read-only Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">空間類型名稱 (不可修改)</label>
            <input
              type="text"
              disabled
              value={initialData.title}
              className="w-full p-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">詳細介紹/行銷文案</label>
            <textarea
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="請輸入詳細的空間介紹..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            />
          </div>

          <hr className="border-gray-100" />

          {/* Image Upload Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} /> 空間照片 (最多6張) <span className="text-red-500">*</span>
              </label>
              {isUploading && <span className="text-xs text-brand-600 flex items-center gap-1 animate-pulse"><Cloud size={12}/> 上傳雲端中...</span>}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 transition-all ${
                      coverIndex === idx ? 'border-brand-500 ring-2 ring-brand-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCoverIndex(idx)}
                  >
                    <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />

                    {coverIndex === idx && (
                      <div className="absolute top-1 left-1 bg-brand-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-sm font-bold flex items-center gap-0.5">
                        <Star size={8} fill="currentColor" /> 封面
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {images.length < 6 && (
                   <button
                     type="button"
                     disabled={isUploading}
                     onClick={() => imageInputRef.current?.click()}
                     className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-brand-400 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
                   >
                      {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                      <span className="text-xs mt-1">新增</span>
                   </button>
                )}
              </div>
            )}

            {images.length === 0 && (
              <div
                onClick={() => !isUploading && imageInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 cursor-pointer h-24 flex items-center justify-center flex-col text-gray-400 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
              >
                 {isUploading ? <Loader2 size={24} className="animate-spin mb-2 text-brand-600" /> : <Cloud size={24} className="mb-2" />}
                 <span className="text-xs">{isUploading ? '圖片上傳中...' : '點擊上傳圖片 (自動轉為網路連結)'}</span>
              </div>
            )}

            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={isUploading}
            />
          </div>

          {/* Multi-Video Upload */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Video size={16} /> 導覽影片 (選填，可多支)
              </label>
              {isVideoUploading && <span className="text-xs text-brand-600 flex items-center gap-1 animate-pulse"><Cloud size={12}/> 影片上傳中...</span>}
            </div>

            {/* Uploaded Video List */}
            {videoPreviews.length > 0 && (
              <div className="space-y-2 mb-3">
                {videoPreviews.map((url, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 bg-black/5">
                    <video src={url} controls className="w-full max-h-32 object-contain" />
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      影片 {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Video Button */}
            <div
              onClick={() => !isVideoUploading && videoInputRef.current?.click()}
              className={`border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 cursor-pointer h-20 flex items-center justify-center ${isVideoUploading ? 'opacity-50 cursor-wait' : ''}`}
            >
              <input
                type="file"
                ref={videoInputRef}
                className="hidden"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
                disabled={isVideoUploading}
              />
              {isVideoUploading ? (
                <div className="text-gray-400 flex flex-col items-center">
                  <Loader2 size={20} className="mb-1 animate-spin text-brand-500" />
                  <span className="text-xs">影片上傳中...</span>
                </div>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Upload size={20} className="mb-1" />
                  <span className="text-xs">{videoPreviews.length === 0 ? '點擊上傳影片' : '點擊追加更多影片'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex gap-3">
             <button
              type="button"
              onClick={onClose}
              disabled={anyUploading}
              className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={anyUploading}
              className="flex-1 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              <Check size={18} /> {anyUploading ? '上傳中...' : '儲存變更'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default OfficeEditModal;
