
import React, { useState } from 'react';
import {
  Building2, Calculator, Users, Database, Globe,
  Ship, Sparkles, Utensils, ArrowRight, Plus, Edit2, Trash2, HelpCircle
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { ValueService, ValueServiceCategory } from '../types';

interface ValueServicesProps {
  services: ValueService[];
  isAdmin: boolean;
  onServiceClick?: (serviceId: string) => void;
  onAdd?: () => void;
  onEdit?: (service: ValueService) => void;
  onDelete?: (serviceIds: string) => void;
}

const CATEGORIES: ValueServiceCategory[] = ['加值商務', '數位升級', '心靈成長', '其他'];

const ValueServices: React.FC<ValueServicesProps> = ({
  services,
  isAdmin,
  onServiceClick,
  onAdd,
  onEdit,
  onDelete
}) => {
  const [activeCategory, setActiveCategory] = useState<ValueServiceCategory | 'All'>('All');

  const filteredServices = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory);

  const handleServiceClick = (service: ValueService) => {
    // Priority 1: Open external link if available
    if (service.link) {
      window.open(service.link, '_blank');
      return;
    }

    // Priority 2: Call parent handler (e.g., for opening modals)
    if (onServiceClick) {
      onServiceClick(service.id);
    } else {
      // Fallback
      alert(`您選擇了「${service.title}」服務。\n\n系統將為您聯繫相關窗口，請留意通知！`);
    }
  };

  // Helper to render icon dynamically
  const renderIcon = (name: string, size = 20) => {
    const IconComponent = (Icons as any)[name];
    if (IconComponent) return <IconComponent size={size} />;
    return <HelpCircle size={size} />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-800 text-lg">加值服務專區</h3>
            {isAdmin && onAdd && (
              <button
                onClick={onAdd}
                className="bg-brand-100 text-brand-600 p-1 rounded-full hover:bg-brand-200 transition-colors"
                title="新增加值服務"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
          <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-bold">Value Added</span>
        </div>
        <p className="text-xs text-gray-500">道騰生態系，為您連結無限可能。</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-gray-50">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeCategory === 'All'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat
                ? 'bg-slate-800 text-white shadow-md'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service Grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {filteredServices.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-400 text-sm">
            暫無服務項目
          </div>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id} className="relative group">
              <button
                onClick={() => handleServiceClick(service)}
                className="w-full flex flex-col items-start p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all bg-white text-left relative overflow-hidden h-full"
              >
                <div className={`p-2 rounded-lg ${service.bg} ${service.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
                  {renderIcon(service.iconName)}
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-0.5">{service.title}</h4>
                <p className="text-[10px] text-gray-400 leading-tight">{service.desc}</p>

                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                  <ArrowRight size={14} className="text-gray-300" />
                </div>
              </button>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-200 shadow-sm bg-white rounded-lg p-0.5 border border-gray-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit?.(service); }}
                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete?.(service.id); }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Note */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 rounded-lg p-3 text-[10px] text-gray-500 flex items-start gap-2">
          <div className="w-1 h-1 rounded-full bg-brand-400 mt-1.5 shrink-0"></div>
          <p>如需以上服務，點擊項目後將由專人為您對接相關資源與報價。</p>
        </div>
      </div>
    </div>
  );
};

export default ValueServices;
