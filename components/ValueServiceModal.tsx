import React, { useState, useEffect } from 'react';
import { X, Save, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ValueService, ValueServiceCategory } from '../types';

interface ValueServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (service: Omit<ValueService, 'id'>) => Promise<void>;
    initialData?: ValueService;
}

// Predefined Icon Choices (Names from Lucide)
const ICON_CHOICES = [
    'Building2', 'Calculator', 'Users', 'Database', 'Globe',
    'Ship', 'Sparkles', 'Utensils', 'Briefcase', 'Heart',
    'Star', 'Zap', 'Gift', 'Award', 'Bookmark', 'Settings',
    'Coffee', 'Monitor', 'Smartphone', 'Cloud'
];

// Predefined Color Themes (Tailwind classes for text and bg)
const COLOR_THEMES = [
    { label: 'Blue', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Purple', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Rose', color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Orange', color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Green', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Indigo', color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const ValueServiceModal: React.FC<ValueServiceModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<ValueServiceCategory>('加值商務');
    const [desc, setDesc] = useState('');
    const [link, setLink] = useState('');
    const [iconName, setIconName] = useState('Building2');
    const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load initial data for editing
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setCategory(initialData.category);
            setDesc(initialData.desc);
            setLink(initialData.link || '');
            setIconName(initialData.iconName);

            const theme = COLOR_THEMES.find(t => t.color === initialData.color && t.bg === initialData.bg);
            if (theme) setSelectedTheme(theme);
        } else {
            // Reset defaults
            setTitle('');
            setCategory('加值商務');
            setDesc('');
            setLink('');
            setIconName('Building2');
            setSelectedTheme(COLOR_THEMES[0]);
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !desc) {
            alert('請填寫完整資訊');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave({
                title,
                category,
                desc,
                link: link || undefined,
                iconName,
                color: selectedTheme.color,
                bg: selectedTheme.bg
            });
            onClose();
        } catch (error) {
            console.error('Save failed:', error);
            alert('儲存失敗，請稍後再試。');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Helper to render icon dynamically
    const renderIcon = (name: string, size = 20) => {
        const IconComponent = (Icons as any)[name];
        if (IconComponent) return <IconComponent size={size} />;
        return <Icons.HelpCircle size={size} />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-lg text-gray-800">
                        {initialData ? '編輯加值服務' : '新增加值服務'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* General Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">服務標題</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="例如：虛擬辦公室"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">分類</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value as ValueServiceCategory)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                >
                                    <option value="加值商務">加值商務</option>
                                    <option value="數位升級">數位升級</option>
                                    <option value="心靈成長">心靈成長</option>
                                    <option value="其他">其他</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">連結 (選填)</label>
                                <input
                                    type="text"
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    placeholder="https://..."
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">簡短描述</label>
                            <input
                                type="text"
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                placeholder="例如：工商登記、借址營登"
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">選擇圖示</label>
                        <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                            {ICON_CHOICES.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setIconName(icon)}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${iconName === icon
                                            ? 'bg-brand-500 text-white shadow-md scale-105'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    {renderIcon(icon)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Theme Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">配色主題</label>
                        <div className="flex gap-3 flex-wrap">
                            {COLOR_THEMES.map((theme) => (
                                <button
                                    key={theme.label}
                                    type="button"
                                    onClick={() => setSelectedTheme(theme)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${selectedTheme.label === theme.label
                                            ? 'border-brand-500 bg-brand-50 shadow-sm'
                                            : 'border-transparent hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-md ${theme.bg} ${theme.color} flex items-center justify-center`}>
                                        <div className="w-2 h-2 bg-current rounded-full" />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600">{theme.label}</span>
                                    {selectedTheme.label === theme.label && <Check size={14} className="text-brand-600" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
                        disabled={isSubmitting}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-bold shadow-md disabled:opacity-50 transition-all"
                    >
                        <Save size={18} />
                        {isSubmitting ? '儲存中...' : '確認儲存'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ValueServiceModal;
