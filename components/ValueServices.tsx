
import React, { useState } from 'react';
import { 
  Building2, Calculator, Users, Database, Globe, 
  Ship, Sparkles, Utensils, ArrowRight 
} from 'lucide-react';

type ServiceCategory = 'All' | '加值商務' | '數位升級' | '心靈成長' | '其他';

interface ValueService {
  id: string;
  title: string;
  category: ServiceCategory;
  icon: React.ElementType;
  color: string;
  bg: string;
  desc: string;
  link?: string; // Optional external link
}

const SERVICES: ValueService[] = [
  // 加值商務
  { 
    id: 'virtual-office', 
    title: '虛擬辦公室', 
    category: '加值商務', 
    icon: Building2, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    desc: '工商登記、借址營登',
    link: 'https://daoteng-international-smart-virtue-office-759903762116.us-west1.run.app'
  },
  { 
    id: 'accountant', 
    title: '會計師服務', 
    category: '加值商務', 
    icon: Calculator, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    desc: '稅務申報、記帳服務'
  },
  { 
    id: 'consulting', 
    title: '顧問諮詢', 
    category: '加值商務', 
    icon: Users, 
    color: 'text-blue-600', 
    bg: 'bg-blue-50',
    desc: '法律、營運顧問媒合'
  },
  // 數位升級
  { 
    id: 'erp-crm', 
    title: 'ERP/CRM', 
    category: '數位升級', 
    icon: Database, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50',
    desc: '企業資源規劃系統',
    link: 'https://deltra.org/'
  },
  { 
    id: 'web-seo', 
    title: '官網/SEO', 
    category: '數位升級', 
    icon: Globe, 
    color: 'text-purple-600', 
    bg: 'bg-purple-50',
    desc: '網站建置與流量優化'
  },
  // 心靈成長
  { 
    id: 'yacht', 
    title: '娛樂遊艇', 
    category: '心靈成長', 
    icon: Ship, 
    color: 'text-rose-600', 
    bg: 'bg-rose-50',
    desc: '私人包船、海上派對',
    link: 'https://www.daoteng.org/cruise'
  },
  { 
    id: 'spiritual', 
    title: '心靈課程', 
    category: '心靈成長', 
    icon: Sparkles, 
    color: 'text-rose-600', 
    bg: 'bg-rose-50',
    desc: '冥想、身心靈平衡'
  },
  // 其他
  { 
    id: 'meal', 
    title: '代訂餐飲', 
    category: '其他', 
    icon: Utensils, 
    color: 'text-orange-600', 
    bg: 'bg-orange-50',
    desc: '會議便當、下午茶'
  }
];

const CATEGORIES: ServiceCategory[] = ['All', '加值商務', '數位升級', '心靈成長'];

interface ValueServicesProps {
  onServiceClick?: (serviceId: string) => void;
}

const ValueServices: React.FC<ValueServicesProps> = ({ onServiceClick }) => {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('All');

  const filteredServices = activeCategory === 'All' 
    ? SERVICES 
    : SERVICES.filter(s => s.category === activeCategory);

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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-gray-800 text-lg">加值服務專區</h3>
          <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-1 rounded-full font-bold">Value Added</span>
        </div>
        <p className="text-xs text-gray-500">道騰生態系，為您連結無限可能。</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-gray-50">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
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
        {filteredServices.map((service) => (
          <button
            key={service.id}
            onClick={() => handleServiceClick(service)}
            className="flex flex-col items-start p-3 rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all group bg-white text-left relative overflow-hidden"
          >
            <div className={`p-2 rounded-lg ${service.bg} ${service.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>
              <service.icon size={20} />
            </div>
            <h4 className="font-bold text-gray-800 text-sm mb-0.5">{service.title}</h4>
            <p className="text-[10px] text-gray-400 leading-tight">{service.desc}</p>
            
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
               <ArrowRight size={14} className="text-gray-300" />
            </div>
          </button>
        ))}
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
