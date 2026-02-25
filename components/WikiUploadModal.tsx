
import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Video, Image as ImageIcon, Plus, Trash2, Check, Cloud, Loader2 } from 'lucide-react';
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
  const [contentType, setContentType] = useState<'guide' | 'video' | 'image'>(initialData?.contentType || 'guide');
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState<Equipment['category']>(initialData?.category || 'other');
  const [description, setDescription] = useState(initialData?.description || '');

  // Guide State
  const [instructions, setInstructions] = useState<string[]>(initialData?.instructions && initialData.instructions.length > 0 ? initialData.instructions : ['']);

  // Media State — single image OR multiple videos
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>(initialData?.mediaUrl || '');
  // Multi-video state
  const [videoUrls, setVideoUrls] = useState<string[]>(() => {
    if (initialData?.mediaUrls && initialData.mediaUrls.length > 0) return initialData.mediaUrls;
    if (initialData?.contentType === 'video' && initialData?.mediaUrl) return [initialData.mediaUrl];
    return [];
  });

  // Effect to reset or load data when modal opens/changes
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setContentType(initialData.contentType);
        setTitle(initialData.title);
        setCategory(initialData.category);
        setDescription(initialData.description);
        setInstructions(initialData.instructions && initialData.instructions.length > 0 ? initialData.instructions : ['']);
        setMediaPreview(initialData.mediaUrl || '');
        // Load multi-video, fallback to single
        if (initialData.mediaUrls && initialData.mediaUrls.length > 0) {
          setVideoUrls(initialData.mediaUrls);
        } else if (initialData.contentType === 'video' && initialData.mediaUrl) {
          setVideoUrls([initialData.mediaUrl]);
        } else {
          setVideoUrls([]);
        }
      } else {
        // Reset for new item
        setContentType('guide');
        setTitle('');
        setCategory('other');
        setDescription('');
        setInstructions(['']);
        setMediaPreview('');
        setVideoUrls([]);
      }
      setMediaFile(null);
    }
  }, [isOpen, initialData]);


  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle image file (single image, same as before)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);

      if (contentType === 'image') {
        setIsUploading(true);
        try {
          const url = await uploadToCloud(file);
          setMediaPreview(url);
        } catch (error) {
          alert("圖片上傳失敗，將使用本地預覽。");
          const reader = new FileReader();
          reader.onloadend = () => { if (reader.result) setMediaPreview(reader.result as string); };
          reader.readAsDataURL(file);
        } finally {
          setIsUploading(false);
        }
      }
    }
  };

  // Handle video files (multiple)
  const handleVideoFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setIsUploading(true);

      try {
        const uploadPromises = files.map(file => uploadVideoToCloud(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        setVideoUrls(prev => [...prev, ...uploadedUrls]);
      } catch (error) {
        alert("部分影片上傳失敗，請檢查網路。");
      } finally {
        setIsUploading(false);
        if (videoInputRef.current) videoInputRef.current.value = '';
      }
    }
  };

  const removeVideo = (index: number) => {
    setVideoUrls(prev => prev.filter((_, i) => i !== index));
  };

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

    const newItem: Equipment = {
      id: initialData ? initialData.id : Date.now().toString(),
      title,
      category,
      description,
      contentType,
      iconName: contentType === 'video' ? 'MonitorPlay' : contentType === 'image' ? 'Image' : 'FileText',
      uploadDate: new Date().toISOString().split('T')[0],
      instructions: contentType === 'guide' ? instructions.filter(i => i.trim() !== '') : [],
      // For video: use mediaUrls array; for image: use mediaUrl single
      mediaUrl: contentType === 'video' ? (videoUrls[0] || '') : mediaPreview,
      mediaUrls: contentType === 'video' ? videoUrls : undefined,
    };

    onSave(newItem);

    // Reset form
    setTitle('');
    setDescription('');
    setInstructions(['']);
    setMediaFile(null);
    setMediaPreview('');
    setVideoUrls([]);
    onClose();
  };

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

        {/* Content Type Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {[
            { id: 'guide', label: '圖文步驟', icon: FileText },
            { id: 'video', label: '影片教學', icon: Video },
            { id: 'image', label: '圖片說明', icon: ImageIcon },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setContentType(type.id as any)}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${contentType === type.id
                ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <type.icon size={16} />
              {type.label}
            </button>
          ))}
        </div>

        {/* Scrollable Form */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">標題</label>
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
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

          {/* Dynamic Content Fields */}
          {contentType === 'guide' ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">操作步驟</label>
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
          ) : contentType === 'video' ? (
            /* ===== Multi-Video Upload Section ===== */
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">上傳影片 (可多支)</label>
                {isUploading && <span className="text-xs text-brand-600 flex items-center gap-1 animate-pulse"><Cloud size={12}/> 上傳雲端中...</span>}
              </div>

              {/* Video List */}
              {videoUrls.length > 0 && (
                <div className="space-y-2">
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
                onClick={() => !isUploading && videoInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 hover:border-brand-400 transition-colors cursor-pointer ${isUploading ? 'cursor-wait opacity-60' : ''}`}
              >
                <input
                  type="file"
                  ref={videoInputRef}
                  className="hidden"
                  accept="video/*"
                  multiple
                  onChange={handleVideoFilesChange}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="text-gray-400">
                    <Loader2 size={36} className="mx-auto mb-2 animate-spin text-brand-500" />
                    <p className="text-sm font-medium">影片上傳中...</p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Video size={36} className="mx-auto mb-2" />
                    <p className="text-sm font-medium">
                      {videoUrls.length === 0 ? '點擊上傳影片' : '點擊追加更多影片'}
                    </p>
                    <p className="text-xs mt-1">支援 MP4, WebM，可一次選取多個檔案</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ===== Single Image Upload (unchanged) ===== */
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                上傳圖片
              </label>

              <div
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-brand-400 transition-colors cursor-pointer relative overflow-hidden group ${isUploading ? 'cursor-wait opacity-60' : ''}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />

                {mediaPreview ? (
                  <div className="relative z-10">
                    <img src={mediaPreview} alt="Preview" className="max-h-48 mx-auto rounded shadow-sm object-contain" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isUploading) fileInputRef.current?.click();
                      }}
                      className="mt-3 px-4 py-2 bg-white border border-brand-200 text-brand-600 rounded-lg text-sm font-bold shadow-sm hover:bg-brand-50 transition-all z-20 relative pointer-events-auto"
                    >
                      {isUploading ? '正在上傳至雲端...' : '更換檔案'}
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    {isUploading ? (
                      <Loader2 size={48} className="mx-auto mb-2 animate-spin text-brand-500" />
                    ) : (
                      <Cloud size={48} className="mx-auto mb-2" />
                    )}
                    <p className="text-sm font-medium">
                      {isUploading ? '上傳中...' : '點擊此處上傳檔案'}
                    </p>
                    <p className="text-xs mt-1">
                      {isUploading ? '請稍候' : '自動轉為雲端連結 (JPG, PNG)'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-6 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
          >
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            {isUploading ? '上傳中...' : '儲存發布'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WikiUploadModal;
