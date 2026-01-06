
import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface Zone {
  id: string;
  name: string;
  color: string;
  path: string;
  image: string;
}

const ZONES: Zone[] = [
  { 
    id: 'meeting-a', 
    name: '會議室 A (Meeting A)', 
    color: '#fbbf24', 
    path: 'M50,50 L250,50 L250,150 L50,150 Z',
    image: 'https://picsum.photos/600/400?random=10'
  },
  { 
    id: 'hot-desk', 
    name: '開放辦公區 (Hot Desk)', 
    color: '#60a5fa', 
    path: 'M260,50 L550,50 L550,250 L260,250 Z',
    image: 'https://picsum.photos/600/400?random=11'
  },
  { 
    id: 'pantry', 
    name: '茶水間 (Pantry)', 
    color: '#34d399', 
    path: 'M50,160 L250,160 L250,350 L50,350 Z',
    image: 'https://picsum.photos/600/400?random=12'
  },
  { 
    id: 'private', 
    name: '獨立辦公室 (Private)', 
    color: '#a78bfa', 
    path: 'M260,260 L550,260 L550,350 L260,350 Z',
    image: 'https://picsum.photos/600/400?random=13'
  }
];

const FloorPlan: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 overflow-hidden border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-slate-800">互動平面圖 (Interactive Map)</h3>
        <span className="text-xs text-slate-400">點擊區域查看詳情</span>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-video bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
        <svg viewBox="0 0 600 400" className="w-full h-full cursor-pointer">
            {/* Background */}
            <rect x="0" y="0" width="600" height="400" fill="#f8fafc" />
            
            {/* Zones */}
            {ZONES.map((zone) => (
                <g 
                    key={zone.id} 
                    onClick={() => setSelectedZone(zone)}
                    className="transition-opacity hover:opacity-80"
                >
                    <path 
                        d={zone.path} 
                        fill={zone.color} 
                        fillOpacity="0.2" 
                        stroke={zone.color} 
                        strokeWidth="2"
                    />
                    {/* Label centered roughly */}
                    <text 
                        x={getCenter(zone.path).x} 
                        y={getCenter(zone.path).y} 
                        textAnchor="middle" 
                        fill={zone.color}
                        className="font-bold text-sm pointer-events-none"
                        style={{textShadow: '0px 1px 2px rgba(255,255,255,0.8)'}}
                    >
                        {zone.name.split(' ')[0]}
                    </text>
                </g>
            ))}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 flex gap-2 text-[10px] bg-white/80 p-1 rounded backdrop-blur-sm">
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-yellow-400 mr-1"></span>會議</div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-400 mr-1"></span>座位</div>
            <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>茶水</div>
        </div>
      </div>

      {/* Modal / Popup for Selected Zone */}
      {selectedZone && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                <div className="relative h-48">
                    <img src={selectedZone.image} alt={selectedZone.name} className="w-full h-full object-cover" />
                    <button 
                        onClick={() => setSelectedZone(null)}
                        className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h3 className="text-white font-bold text-lg">{selectedZone.name}</h3>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    <p className="text-sm text-slate-600">
                        點擊下方按鈕預約或查看詳細設備清單。
                    </p>
                    <button className="w-full py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600">
                        查看可用時段
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

// Helper to find approximate center of path for text label
function getCenter(pathData: string) {
    // Very naive implementation for this demo, usually we parse path
    // For M50,50 L250,50 L250,150 L50,150 Z -> Center is roughly 150, 100
    const numbers = pathData.match(/\d+/g)?.map(Number) || [];
    if(numbers.length < 4) return {x:0, y:0};
    const xs = numbers.filter((_, i) => i % 2 === 0);
    const ys = numbers.filter((_, i) => i % 2 !== 0);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
}

export default FloorPlan;
