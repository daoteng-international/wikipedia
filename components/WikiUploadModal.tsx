
import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Video, Image as ImageIcon, Trash2, Check, Cloud, Loader2, Star } from 'lucide-react';
import { Equipment } from '../types';
import { WIKI_CATEGORIES } from '../constants';
import { uploadToCloud, uploadVideoToCloud } from '../services/uploadService';

interface WikiUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Equipment) => void;
  initialData?: Equipment | null;
}

const WikiUploadModal: React.FC<WikiUploadModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Equipment['category']>('other');
  const [description, setDescription] = useState('');

  // Guide State
  const [instructions, setInstructions] = useState<string[]>(['']);

  // Multi-image State
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Multi-video State
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Effect to reset or load data when modal opens/changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTitle(initialData.title);
        setCategory(initialData.category);
        setDescription(initialData.description);
        setInstructions(initialData.instructions && initialData.instructions.length > 0 ? initialData.instructions : ['']);

        // Load images: new imageUrls first, fallback to legacy mediaUrl (if it was image type)
        if (initialData.imageUrls && initialData.imageUrls.length > 0) {
          setImageUrls(initialData.imageUrls);
        } else if (initialData.contentType === 'image' && initialData.mediaUrl) {
          setImageUrls([initialData.mediaUrl]);
        } else {
          setImageUrls([]);
        }

        // Load videos: new mediaUrls first, fallback to legacy mediaUrl (if it was video type)
        if (initialData.mediaUrls && initialData.mediaUrls.length > 0) {
          setVideoUrls(initialData.mediaUrls);
        } else if (initialData.contentType === 'video' && initialData.mediaUrl) {
          setVideoUrls([initialData.mediaUrl]);
        } else {
          setVideoUrls([]);
        }
      } else {
        // Reset for new item
        setTitle('');
        setCategory('other');
        setDescription('');
        setInstructions(['']);
        setImageUrls([]);
        setVideoUrls([]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // === Image Handlers ===
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setIsImageUploading(true);
      try {
        const uploadPromises = files.map(file => uploadToCloud(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        setImageUrls(prev => [...prev, ...uploadedUrls]);
      } catch (error) {
        alert("部分圖片上傳失敗，請檢查網路。");
      } finally {
        setIsImageUploading(false);
        if (imageInputRef.current) imageInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  // === Video Handlers ===
  const handleVideoFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setIsVideoUploading(true);
      try {
        const uploadPromises = files.map(file => uploadVideoToCloud(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        setVideoUrls(prev => [...prev, ...uploadedUrls]);
      } catch (error) {
        alert("部分影片上傳失敗，請檢查網路。");
      } finally {
        setIsVideoUploading(false);
        if (videoInputRef.current) videoInputRef.current.value = '';
      }
    }
  };

  const removeVideo = (index: number) => {
    setVideoUrls(prev => prev.filter((_, i) => i !== index));
  };

  // === Instruction Handlers ===
  const handleAddInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleRemoveInstruction = (index: number) => {
    const newInstructions = instructions.filter((_, i) => i !== index);
    setInstructions(newInstructions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const filteredInstructions = instructions.filter(i => i.trim() !== '');

    // Determine iconName based on what content exists
    const hasVideos = videoUrls.length > 0;
    const hasImages = imageUrls.length > 0;
    const hasGuide = filteredInstructions.length > 0;
    let iconName = 'FileText';
    if (hasVideos) iconName = 'MonitorPlay';
    else if (hasImages) iconName = 'Image';

    const newItem: Equipment = {
      id: initialData ? initialData.id : Date.now().toString(),
      title,
      category,
      description,
      iconName,
      uploadDate: new Date().toISOString().split('T')[0],
      instructions: filteredInstructions,
      imageUrls: imageUrls,
      mediaUrls: videoUrls,
      // Legacy backward compat
      mediaUrl: videoUrls[0] || imageUrls[0] || '',
      contentType: hasVideos ? 'video' : hasImages ? 'image' : 'guide',
    };

    onSave(newItem);

    // Reset form
    setTitle('');
    setDescription('');
    setInstructions(['']);
    setImageUrls([]);
    setVideoUrls([]);
    onClose();
  };

  const anyUploading = isImageUploading || isVideoUploading;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90%]">
        {/* Header */}
        <div className="bg-brand-600 p-4 text-white flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Upload size={20} /> {initialData ? '編輯百科內容' : '新增百科內容'}
          </h3>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">標題 <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：印表機卡紙排除"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分類</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
              >
                {WIKI_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">簡短描述</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="說明此內容的用途..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <hr className="border-gray-100" />

          {/* ===== 操作步驟 Section ===== */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <FileText size={16} className="text-brand-600" /> 操作步驟 (選填)
              </label>
              <button type="button" onClick={handleAddInstruction} className="text-xs text-brand-600 font-bold hover:underline">
                + 新增步驟
              </button>
            </div>
            {instructions.map((inst, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="flex items-center justify-center w-6 h-8 text-gray-400 font-mono text-sm">{idx + 1}.</span>
                <input
                  type="text"
                  value={inst}
                  onChange={e => handleInstructionChange(idx, e.target.value)}
                  placeholder="輸入步驟說明..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                />
                {instructions.length > 1 && (
                  <button type="button" onClick={() => handleRemoveInstruction(idx)} className="text-gray-400 hover:text-red-500 p-2">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <hr className="border-gray-100" />

          {/* ===== 圖片 Section (Multi-Image) ===== */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} className="text-purple-500" /> 圖片說明 (選填，可多張)
              </label>
              {isImageUploading && <span className="text-xs text-brand-600 flex items-center gap-1 animate-pulse"><Cloud size={12}/> 上傳雲端中...</span>}
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {imageUrls.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <img src={img} alt={`圖片 ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Add More Button */}
                <button
                  type="button"
                  disabled={isImageUploading}
                  onClick={() => imageInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-brand-400 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {isImageUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                  <span className="text-[10px] mt-1">新增</span>
                </button>
              </div>
            )}

            {imageUrls.length === 0 && (
              <div
                onClick={() => !isImageUploading && imageInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 hover:border-brand-400 cursor-pointer h-24 flex items-center justify-center flex-col text-gray-400 transition-colors ${isImageUploading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isImageUploading ? (
                  <Loader2 size={24} className="animate-spin mb-1 text-brand-500" />
                ) : (
                  <Cloud size={24} className="mb-1" />
                )}
                <span className="text-xs">{isImageUploading ? '圖片上傳中...' : '點擊上傳圖片 (可多張，自動上傳雲端)'}</span>
              </div>
            )}

            <input
              type="file"
              ref={imageInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              disabled={isImageUploading}
            />
          </div>

          <hr className="border-gray-100" />

          {/* ===== 影片 Section (Multi-Video) ===== */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <Video size={16} className="text-red-500" /> 教學影片 (選填，可多支)
              </label>
              {isVideoUploading && <span className="text-xs text-brand-600 flex items-center gap-1 animate-pulse"><Cloud size={12}/> 影片上傳中...</span>}
            </div>

            {/* Video List */}
            {videoUrls.length > 0 && (
              <div className="space-y-2 mb-3">
                {videoUrls.map((url, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 bg-black/5">
                    <video src={url} controls className="w-full max-h-40 object-contain" />
                    <button
                      type="button"
                      onClick={() => removeVideo(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition-colors"
                      title="移除此影片"
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
              className={`border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 hover:border-brand-400 cursor-pointer h-20 flex items-center justify-center transition-colors ${isVideoUploading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isVideoUploading ? (
                <div className="text-gray-400 flex flex-col items-center">
                  <Loader2 size={20} className="mb-1 animate-spin text-brand-500" />
                  <span className="text-xs">影片上傳中...</span>
                </div>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Upload size={20} className="mb-1" />
                  <span className="text-xs">{videoUrls.length === 0 ? '點擊上傳影片 (自動上傳雲端)' : '點擊追加更多影片'}</span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={videoInputRef}
              className="hidden"
              accept="video/*"
              multiple
              onChange={handleVideoFilesChange}
              disabled={isVideoUploading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={anyUploading}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={anyUploading}
            className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
          >
            {anyUploading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {anyUploading ? '上傳中...' : '儲存發布'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WikiUploadModal;
