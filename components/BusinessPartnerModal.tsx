
import React, { useState, useEffect, useRef } from 'react';
import { X, Briefcase, Globe, Image as ImageIcon, Upload, Check, Loader2, Cloud, Trash2, Star } from 'lucide-react';
import { BusinessPartner } from '../types';
import { BUSINESS_PARTNER_CATEGORIES } from '../constants';
import { uploadToCloud } from '../services/uploadService';

interface BusinessPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (partner: BusinessPartner) => void;
  initialData?: BusinessPartner | null;
}

const BusinessPartnerModal: React.FC<BusinessPartnerModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(BUSINESS_PARTNER_CATEGORIES[0].label);
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [logoColor, setLogoColor] = useState('');
  // DM Images state
  const [dmImages, setDmImages] = useState<string[]>([]);

  const [isUploading, setIsUploading] = useState(false);
  const [isDmUploading, setIsDmUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dmInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setWebsite(initialData.website || '');
      setLogoPreview(initialData.logoUrl || '');
      setLogoColor(initialData.logoColor);
      setDmImages(initialData.images || []);
    } else if (isOpen) {
      setName('');
      setCategory(BUSINESS_PARTNER_CATEGORIES[0].label);
      setDescription('');
      setWebsite('');
      setLogoPreview('');
      setDmImages([]);
      // Generate a random color for new entries
      const colors = ['bg-blue-500', 'bg-pink-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
      setLogoColor(colors[Math.floor(Math.random() * colors.length)]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setIsUploading(true);
      try {
        const url = await uploadToCloud(file);
        setLogoPreview(url);
      } catch (error) {
        alert("上傳失敗：請檢查網路連線。");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDmImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setIsDmUploading(true);

      try {
        const uploadPromises = files.map(file => uploadToCloud(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        setDmImages(prev => [...prev, ...uploadedUrls]);
      } catch (error) {
        alert("部分圖片上傳失敗，請檢查網路。");
      } finally {
        setIsDmUploading(false);
        if (dmInputRef.current) dmInputRef.current.value = '';
      }
    }
  };

  const removeDmImage = (index: number) => {
    setDmImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPartner: BusinessPartner = {
      id: initialData ? initialData.id : Date.now().toString(),
      name,
      category,
      description,
      website: website.trim(),
      logoColor: logoColor,
      logoUrl: logoPreview,
      images: dmImages,
    };

    onSave(newPartner);
    onClose();
  };

  const anyUploading = isUploading || isDmUploading;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90%]">
        {/* Header */}
        <div className="bg-brand-600 p-4 text-white flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Briefcase size={20} /> {initialData ? '編輯夥伴資訊' : '新增商務夥伴'}
          </h3>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

          {/* Logo Upload */}
          <div className="flex justify-center mb-2">
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative group transition-all ${
                logoPreview ? 'border-gray-300' :
                (logoColor && name) ? `${logoColor} border-transparent` : 'border-gray-300 bg-gray-50'
              } ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {isUploading ? (
                <Loader2 className="animate-spin text-brand-600" size={24} />
              ) : logoPreview ? (
                <>
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Cloud size={20} className="text-white" />
                  </div>
                </>
              ) : (
                <>
                  {(logoColor && name) ? (
                     <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                        {name.charAt(0)}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload size={20} className="text-white" />
                        </div>
                     </div>
                  ) : (
                     <div className="text-center text-gray-400">
                        <ImageIcon size={24} className="mx-auto mb-1" />
                        <span className="text-[10px]">上傳 Logo</span>
                     </div>
                  )}
                </>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoChange}
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Helper Text */}
          <div className="text-center -mt-2">
             <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full flex items-center justify-center gap-1 inline-flex">
               <Cloud size={10} /> 圖片將自動上傳至雲端
             </span>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公司/品牌名稱 <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：雲端數位科技"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">服務類別 <span className="text-red-500">*</span></label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white"
            >
               {BUSINESS_PARTNER_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.label}>{cat.label}</option>
               ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">服務/公司簡介</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="請簡述提供的服務內容..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">官網連結</label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input
                type="url"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          {/* DM / 活動圖片 Upload */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <ImageIcon size={16} /> 活動 DM / 宣傳圖片
              </label>
              {isDmUploading && <span className="text-xs text-brand-600 flex items-center gap-1 animate-pulse"><Cloud size={12}/> 上傳中...</span>}
            </div>

            {/* Uploaded DM Images Grid */}
            {dmImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {dmImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200 hover:border-gray-300 transition-all"
                  >
                    <img src={img} alt={`DM ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeDmImage(idx)}
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* Add More Button */}
                <button
                  type="button"
                  disabled={isDmUploading}
                  onClick={() => dmInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-brand-400 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {isDmUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
                  <span className="text-[10px] mt-1">新增</span>
                </button>
              </div>
            )}

            {/* Initial Upload Box */}
            {dmImages.length === 0 && (
              <div
                onClick={() => !isDmUploading && dmInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 hover:border-brand-400 cursor-pointer h-24 flex items-center justify-center flex-col text-gray-400 transition-colors ${isDmUploading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {isDmUploading ? (
                  <Loader2 size={24} className="animate-spin mb-1 text-brand-500" />
                ) : (
                  <Cloud size={24} className="mb-1" />
                )}
                <span className="text-xs">{isDmUploading ? '圖片上傳中...' : '點擊上傳活動 DM 圖片 (可多張)'}</span>
              </div>
            )}

            <input
              type="file"
              ref={dmInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleDmImageChange}
              disabled={isDmUploading}
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3 border-t border-gray-100 mt-2">
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
              {anyUploading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
              {anyUploading ? '上傳中...' : '確認上架'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BusinessPartnerModal;
