
import React, { useState, useEffect } from 'react';
import { X, Megaphone, Calendar, AlertCircle, Info, PartyPopper, Check, Link as LinkIcon, FileText, Trash2 } from 'lucide-react';
import { Announcement } from '../types';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Announcement) => void;
  onDelete?: (id: string) => void;
  initialData?: Announcement | null;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<Announcement['type']>('info');
  const [details, setDetails] = useState('');
  const [link, setLink] = useState('');

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title);
      setDate(initialData.date);
      setType(initialData.type);
      setDetails(initialData.details || '');
      setLink(initialData.link || '');
    } else if (isOpen) {
      setTitle('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('info');
      setDetails('');
      setLink('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAnnouncement: Announcement = {
      id: initialData ? initialData.id : Date.now().toString(),
      title,
      date,
      type,
      details: details.trim(),
      link: link.trim()
    };

    onSave(newAnnouncement);
    onClose();
  };

  const handleDeleteClick = () => {
    if (initialData && onDelete) {
      if (window.confirm('確定要刪除此公告嗎？此動作無法復原。')) {
        onDelete(initialData.id);
      }
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90%]">
        {/* Header */}
        <div className="bg-brand-600 p-4 text-white flex justify-between items-center shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Megaphone size={20} /> {initialData ? '編輯公告' : '發布新公告'}
          </h3>
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">公告標題 <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：11月份消防演習通知"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">活動/發布日期 <span className="text-red-500">*</span></label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <input 
                type="date" 
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">公告類型</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('alert')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  type === 'alert' 
                    ? 'bg-red-50 border-red-500 text-red-600' 
                    : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
              >
                <AlertCircle size={20} className="mb-1" />
                <span className="text-xs font-bold">重要通知</span>
              </button>

              <button
                type="button"
                onClick={() => setType('info')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  type === 'info' 
                    ? 'bg-blue-50 border-blue-500 text-blue-600' 
                    : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
              >
                <Info size={20} className="mb-1" />
                <span className="text-xs font-bold">一般資訊</span>
              </button>

              <button
                type="button"
                onClick={() => setType('event')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  type === 'event' 
                    ? 'bg-purple-50 border-purple-500 text-purple-600' 
                    : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                }`}
              >
                <PartyPopper size={20} className="mb-1" />
                <span className="text-xs font-bold">活動快訊</span>
              </button>
            </div>
          </div>

          {/* Details (New) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FileText size={14}/> 活動詳情/內容
            </label>
            <textarea 
              rows={4}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="請輸入詳細內容、活動流程或注意事項..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none"
            />
          </div>

          {/* Link (New) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <LinkIcon size={14}/> 報名或相關連結
            </label>
            <input 
              type="url" 
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex gap-3 border-t border-gray-100 mt-2">
             {initialData && onDelete && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="px-4 py-2 text-red-500 font-medium hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex items-center justify-center"
                  title="刪除公告"
                >
                  <Trash2 size={20} />
                </button>
             )}
             <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} /> {initialData ? '儲存更新' : '發布'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;
