
import { Branch, BranchId, Equipment, FoodSpot, Announcement, LocationSpace, BusinessPartner, OfficeType, MemberProfile } from './types';
import { Printer, Wifi, Projector, KeyRound, Coffee, MonitorPlay } from 'lucide-react';

export const BRANCHES: Branch[] = [
  {
    id: BranchId.MINQUAN,
    name: '民權館 (Minquan)',
    address: '高雄市新興區民權一路251號27樓',
    mrt: '信義國小站 3號出口',
    image: 'https://picsum.photos/800/600?random=1'
  },
  {
    id: BranchId.SIWEI,
    name: '四維館 (Siwei)',
    address: '高雄市苓雅區四維三路6號',
    mrt: '三多商圈站 6號出口',
    image: 'https://picsum.photos/800/600?random=2'
  },
  {
    id: BranchId.YANCHENG,
    name: '鹽埕館 (Yancheng)',
    address: '高雄市鹽埕區大勇路11號3樓',
    mrt: '鹽埕埔站 2號出口',
    image: 'https://picsum.photos/800/600?random=3'
  },
  {
    id: BranchId.MINLUN,
    name: '明倫館 (Minlun)',
    address: '高雄市鼓山區明倫路59號',
    mrt: '巨蛋站 1號出口',
    image: 'https://picsum.photos/800/600?random=4'
  }
];

export const SPACE_AMENITIES = [
  { id: 'wifi', label: 'Wi-Fi', iconName: 'Wifi' },
  { id: 'projector', label: '投影機', iconName: 'Projector' },
  { id: 'tv', label: '電視螢幕', iconName: 'Tv' },
  { id: 'whiteboard', label: '白板', iconName: 'Presentation' },
  { id: 'mic', label: '麥克風', iconName: 'Mic' },
  { id: 'speaker', label: '音響', iconName: 'Speaker' },
  { id: 'ac', label: '空調', iconName: 'Wind' },
  { id: 'power', label: '插座', iconName: 'Zap' },
  { id: 'coffee', label: '茶水', iconName: 'Coffee' },
];

export const WIKI_CATEGORIES = [
  { id: 'floorplan', label: '教室樓層平面圖', iconName: 'Map' },
  { id: 'equipment', label: '設備使用', iconName: 'Monitor' },
  { id: 'transport', label: '交通＆停車資訊', iconName: 'Car' },
  { id: 'wifi', label: 'Wi-Fi連線', iconName: 'Wifi' },
  { id: 'access', label: '門禁進出', iconName: 'KeyRound' },
  { id: 'other', label: '一般其他', iconName: 'HelpCircle' },
];

// Helper to create initial images array
const getImages = (url: string) => [url, 'https://picsum.photos/400/300?random=99', 'https://picsum.photos/400/300?random=98'];

export const INITIAL_OFFICE_TYPES: OfficeType[] = [
  {
    id: 'soho',
    title: 'SOHO (自由座)',
    description: '靈活彈性的開放式辦公座位，適合自由工作者、數位遊牧民族。享受無限暢飲的咖啡茶水與高速網路。',
    imageUrl: 'https://picsum.photos/600/400?random=101',
    images: ['https://picsum.photos/600/400?random=101'],
    features: ['wifi', 'coffee', 'ac']
  },
  {
    id: 'private-1',
    title: '個人辦公室',
    description: '專屬隱私空間，配備人體工學桌椅。適合需要專注工作環境的專業人士。',
    imageUrl: 'https://picsum.photos/600/400?random=102',
    images: ['https://picsum.photos/600/400?random=102'],
    features: ['wifi', 'key', 'ac']
  },
  {
    id: 'office-small',
    title: '2-6人 辦公室',
    description: '小型團隊的最佳起點。獨立隔間，隔音良好，包含辦公家具與文件櫃。',
    imageUrl: 'https://picsum.photos/600/400?random=103',
    images: ['https://picsum.photos/600/400?random=103'],
    features: ['wifi', 'whiteboard', 'ac']
  },
  {
    id: 'office-medium',
    title: '7-15人 辦公室',
    description: '中型企業或擴編團隊的理想選擇。寬敞舒適，可客製化配置。',
    imageUrl: 'https://picsum.photos/600/400?random=104',
    images: ['https://picsum.photos/600/400?random=104'],
    features: ['wifi', 'projector', 'ac']
  },
  {
    id: 'office-large',
    title: '15人以上 辦公室',
    description: '企業總部級規格。擁有獨立主管室與會議空間，展現企業氣派。',
    imageUrl: 'https://picsum.photos/600/400?random=105',
    images: ['https://picsum.photos/600/400?random=105'],
    features: ['wifi', 'mic', 'ac', 'tv']
  }
];

export const INITIAL_SPACES: LocationSpace[] = [
  // --- Minquan ---
  { id: 'mq-20a', branchId: BranchId.MINQUAN, name: '20A 會議室', description: '適合中型會議，配備高清投影。', capacity: '10-12人', imageUrl: 'https://picsum.photos/400/300?random=10', images: getImages('https://picsum.photos/400/300?random=10'), features: ['wifi', 'projector', 'whiteboard', 'ac', 'power'] },
  { id: 'mq-20b', branchId: BranchId.MINQUAN, name: '20B 會議室', description: '小型討論空間，隱私性佳。', capacity: '4-6人', imageUrl: 'https://picsum.photos/400/300?random=11', images: getImages('https://picsum.photos/400/300?random=11'), features: ['wifi', 'tv', 'whiteboard', 'power'] },
  { id: 'mq-2101', branchId: BranchId.MINQUAN, name: '2101 會議室', description: '高樓層景觀會議室。', capacity: '8人', imageUrl: 'https://picsum.photos/400/300?random=12', images: getImages('https://picsum.photos/400/300?random=12'), features: ['wifi', 'projector', 'ac', 'power', 'coffee'] },
  { id: 'mq-2121', branchId: BranchId.MINQUAN, name: '2121 會議室', description: '標準商務會議配置。', capacity: '8人', imageUrl: 'https://picsum.photos/400/300?random=13', images: getImages('https://picsum.photos/400/300?random=13'), features: ['wifi', 'tv', 'whiteboard'] },
  { id: 'mq-21f-multi', branchId: BranchId.MINQUAN, name: '21F 多功能空間', description: '開放式活動場地，適合講座。', capacity: '30-40人', imageUrl: 'https://picsum.photos/400/300?random=14', images: getImages('https://picsum.photos/400/300?random=14'), features: ['wifi', 'projector', 'mic', 'speaker', 'ac', 'power'] },
  { id: 'mq-21f-meet', branchId: BranchId.MINQUAN, name: '21F 會議室', description: '獨立安靜的會議空間。', capacity: '6人', imageUrl: 'https://picsum.photos/400/300?random=15', images: getImages('https://picsum.photos/400/300?random=15'), features: ['wifi', 'whiteboard'] },
  { id: 'mq-27f-meet', branchId: BranchId.MINQUAN, name: '27F 會議室', description: '頂樓景觀，尊榮接待首選。', capacity: '10人', imageUrl: 'https://picsum.photos/400/300?random=16', images: getImages('https://picsum.photos/400/300?random=16'), features: ['wifi', 'tv', 'coffee', 'ac'] },
  { id: 'mq-27f-div', branchId: BranchId.MINQUAN, name: '27F 多元空間', description: '彈性隔間，可作教育訓練。', capacity: '20人', imageUrl: 'https://picsum.photos/400/300?random=17', images: getImages('https://picsum.photos/400/300?random=17'), features: ['wifi', 'projector', 'whiteboard'] },
  { id: 'mq-28f-f1', branchId: BranchId.MINQUAN, name: '28F F1 教室', description: '專業培訓教室配置。', capacity: '50人', imageUrl: 'https://picsum.photos/400/300?random=18', images: getImages('https://picsum.photos/400/300?random=18'), features: ['wifi', 'projector', 'mic', 'speaker', 'whiteboard'] },

  // --- Siwei ---
  { id: 'sw-12f', branchId: BranchId.SIWEI, name: '12F 會議室', description: '四維館核心會議空間，交通便利。', capacity: '12人', imageUrl: 'https://picsum.photos/400/300?random=19', images: getImages('https://picsum.photos/400/300?random=19'), features: ['wifi', 'projector', 'whiteboard', 'power'] },

  // --- Yancheng ---
  { id: 'yc-2f', branchId: BranchId.YANCHENG, name: '2F 會議室', description: '駁二特區旁的商務據點。', capacity: '8人', imageUrl: 'https://picsum.photos/400/300?random=20', images: getImages('https://picsum.photos/400/300?random=20'), features: ['wifi', 'tv'] },
  { id: 'yc-4f', branchId: BranchId.YANCHENG, name: '4F 多元場地', description: '寬敞空間，適合文創活動或大型會議。', capacity: '40人', imageUrl: 'https://picsum.photos/400/300?random=21', images: getImages('https://picsum.photos/400/300?random=21'), features: ['wifi', 'projector', 'mic', 'speaker', 'ac'] },

  // --- Minlun ---
  { id: 'ml-3f-a', branchId: BranchId.MINLUN, name: '3F 會議室 A', description: '溫馨舒適的小型會議空間，適合商務洽談。', capacity: '6-8人', imageUrl: 'https://picsum.photos/400/300?random=30', images: getImages('https://picsum.photos/400/300?random=30'), features: ['wifi', 'tv', 'whiteboard', 'coffee'] },
  { id: 'ml-3f-hall', branchId: BranchId.MINLUN, name: '3F 多功能展演廳', description: '寬敞無柱空間，適合舉辦講座、發表會或工作坊。', capacity: '50-80人', imageUrl: 'https://picsum.photos/400/300?random=31', images: getImages('https://picsum.photos/400/300?random=31'), features: ['wifi', 'projector', 'mic', 'speaker', 'ac', 'power'] },
];

export const EQUIPMENTS: Equipment[] = [
  {
    id: 'printer-setup',
    title: '影印機設定 (Printer)',
    category: 'equipment',
    iconName: 'Printer',
    description: 'Fuji Xerox C5570 驅動安裝與操作。',
    contentType: 'guide',
    instructions: [
      '連接 Wi-Fi: DAOTENG_5G',
      '下載驅動程式 (掃描機身 QR Code)',
      '新增印表機：輸入 IP 192.168.1.200',
      '輸入個人部門識別碼 (PIN Code)'
    ]
  },
  {
    id: 'wifi-connect',
    title: 'Wi-Fi 連線 (Network)',
    category: 'wifi',
    iconName: 'Wifi',
    description: '各區域無線網路名稱與密碼。',
    contentType: 'guide',
    instructions: [
      '開放區 SSID: DAOTENG_GUEST (密碼: daoteng888)',
      '固定座位區 SSID: DAOTENG_MEMBER (密碼: 請洽櫃台)',
      '會議室 SSID: DAOTENG_MEETING'
    ]
  },
  {
    id: 'projector-hdmi',
    title: '投影機投放 (Projector)',
    category: 'equipment',
    iconName: 'Projector',
    description: '會議室無線/有線投影教學。',
    contentType: 'guide',
    instructions: [
      '使用 HDMI 線連接電腦與牆面插座',
      '若使用 AirPlay，請將電視切換至 Input 2',
      '遙控器位於白板下方收納盒'
    ]
  },
  {
    id: 'door-access',
    title: '門禁進出 (Access)',
    category: 'access',
    iconName: 'KeyRound',
    description: 'APP 開門與緊急密碼。',
    contentType: 'guide',
    instructions: [
      '開啟道騰 APP 首頁點擊「開門」',
      '若藍牙失效，請輸入當日臨時密碼 (每日 09:00 更新於公告)',
      '最後離開者請務必確認大門上鎖'
    ]
  },
  {
    id: 'coffee-machine',
    title: '咖啡機使用 (Pantry)',
    category: 'equipment',
    iconName: 'Coffee',
    description: '義式咖啡機操作與清潔。',
    contentType: 'guide',
    instructions: [
      '確認水箱水位充足',
      '放入咖啡豆 (禁止使用調味豆)',
      '按下對應按鈕 (美式/拿鐵)',
      '使用完畢請清理殘渣盒'
    ]
  },
  {
    id: 'printer-jam',
    title: '卡紙排除教學 (Video)',
    category: 'equipment',
    iconName: 'MonitorPlay',
    description: '遇到卡紙時的標準處理流程。',
    contentType: 'video',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Demo video
    uploadDate: '2023-10-26'
  },
  {
    id: 'floor-plan-mq',
    title: '民權館逃生/平面圖',
    category: 'floorplan',
    iconName: 'Map',
    description: '27F 逃生路線與空間配置圖。',
    contentType: 'image',
    mediaUrl: 'https://picsum.photos/800/600?random=100', 
    uploadDate: '2023-09-01'
  },
  {
    id: 'parking-info',
    title: '周邊特約停車場',
    category: 'transport',
    iconName: 'Car',
    description: '民權館、四維館周邊停車資訊。',
    contentType: 'guide',
    instructions: [
      '民權停車場：每小時 30 元，步行 2 分鐘',
      '四維立體停車場：每小時 40 元，步行 5 分鐘',
      '機車請停放於大樓後方指定區域'
    ]
  }
];

export const FOOD_MAP: FoodSpot[] = [
  { id: '1', name: '興隆居', type: '傳統早餐', distance: '200m', priceLevel: 1 },
  { id: '2', name: '老江紅茶牛奶', type: '飲品/點心', distance: '350m', priceLevel: 1 },
  { id: '3', name: '碳佐麻里', type: '燒肉精品', distance: '1.2km', priceLevel: 3 },
  { id: '4', name: '丹丹漢堡', type: '速食', distance: '500m', priceLevel: 1 },
];

export const ANNOUNCEMENTS: Announcement[] = [
  { 
    id: '1', 
    title: '10/25 民權館停電通知', 
    date: '2023-10-25', 
    type: 'alert',
    details: '因台電進行線路維護工程，民權館將於上午 09:00 至 11:00 暫停供電。請提早儲存檔案並將電腦關機。'
  },
  { 
    id: '2', 
    title: '新進駐夥伴歡迎會', 
    date: '2025-10-22', 
    type: 'event',
    details: '歡迎本月新加入的 5 組團隊！現場備有輕食與飲料，歡迎大家來交流認識。',
    link: 'https://forms.google.com/example'
  },
  { 
    id: '3', 
    title: '11月份會議室點數發放', 
    date: '2023-10-28', 
    type: 'info',
    details: '11月份的會議室點數已匯入各公司帳戶，請至會員系統查詢。' 
  },
];

export const BUSINESS_PARTNER_CATEGORIES = [
  { id: 'digital', label: '數位科技', color: 'bg-blue-50 text-blue-600' },
  { id: 'business', label: '商務服務', color: 'bg-indigo-50 text-indigo-600' },
  { id: 'spiritual', label: '心靈提升', color: 'bg-rose-50 text-rose-600' },
  { id: 'lifestyle', label: '生活娛樂', color: 'bg-orange-50 text-orange-600' },
  { id: 'other', label: '其他', color: 'bg-gray-50 text-gray-600' }
];

export const BUSINESS_PARTNERS: BusinessPartner[] = [
  {
    id: '1',
    name: '雲端數位科技',
    category: '數位科技',
    description: '專注於 AWS 架構與 APP 開發解決方案。',
    website: 'https://example.com',
    logoColor: 'bg-blue-500'
  },
  {
    id: '2',
    name: '品味行銷設計',
    category: '商務服務',
    description: '提供 CIS 企業識別與平面設計服務。',
    website: 'https://example.com',
    logoColor: 'bg-pink-500'
  },
  {
    id: '3',
    name: '理財通事務所',
    category: '商務服務',
    description: '新創公司設立、記帳與稅務諮詢。',
    website: 'https://example.com',
    logoColor: 'bg-green-500'
  },
  {
    id: '4',
    name: '極速法務團隊',
    category: '商務服務',
    description: '商務合約審閱與智慧財產權佈局。',
    website: 'https://example.com',
    logoColor: 'bg-purple-500'
  },
  {
    id: '5',
    name: '靜心瑜珈工坊',
    category: '心靈提升',
    description: '提供企業包班瑜珈課程與冥想引導。',
    website: 'https://example.com',
    logoColor: 'bg-teal-500'
  }
];

export const RULES = [
  '開放區域請輕聲細語，通話請至電話亭 (Phone Booth)。',
  '離開座位超過 30 分鐘，請將個人物品帶離桌面。',
  '冰箱每週五下午 17:00 清空，請標示個人物品。',
  '最後一位離開者，請協助關閉公共區域燈光與冷氣。'
];

export const INITIAL_MEMBERS: MemberProfile[] = [
  {
    id: 'daoteng-demo',
    name: '道騰示範會員',
    password: 'app5286',
    pettyCashBalance: 3500,
    meetingPointsTotal: 120,
    meetingPointsUsed: 40,
    contractDate: '2024/12/31'
  },
  {
    id: 'cloud-tech',
    name: '雲端數位科技',
    password: 'cloud',
    pettyCashBalance: 10000,
    meetingPointsTotal: 200,
    meetingPointsUsed: 150,
    contractDate: '2025/06/30'
  }
];
