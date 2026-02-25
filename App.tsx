
import React, { useState, useRef, useEffect } from 'react';
import {
  Home, MapPin, BookOpen, UserCircle,
  Search, ChevronRight, Map, Printer,
  Wifi, Coffee, ShieldCheck, Mail, Users,
  Plus, PlayCircle, Image as ImageIcon, FileText, Trash2,
  ChevronDown, ChevronUp, ExternalLink, CalendarX, MonitorPlay, X,
  Projector, Tv, Presentation, Mic, Speaker, Wind, Zap, Star,
  Car, Monitor, HelpCircle, KeyRound, Wrench, Coins, Utensils,
  ChefHat, Sandwich, Calculator, Package, Inbox, Send,
  Edit2, Briefcase, Globe, Database, Building2, FileSignature, Laptop, ArrowRight,
  LogOut, Lock, Settings, Shield, Upload, Check, Download, UploadCloud, FileJson,
  Ship, GraduationCap, Tent, Sparkles, Clock, History, CreditCard, Calendar,
  Video
} from 'lucide-react';
import { BRANCHES, EQUIPMENTS, ANNOUNCEMENTS, INITIAL_SPACES, SPACE_AMENITIES, WIKI_CATEGORIES, BUSINESS_PARTNERS, BUSINESS_PARTNER_CATEGORIES, INITIAL_OFFICE_TYPES, INITIAL_MEMBERS, RULES, INITIAL_VALUE_SERVICES } from './constants';
import { BranchId, Equipment, Announcement, LocationSpace, WikiCategory, BusinessPartner, OfficeType, AppDataBackup, MemberProfile } from './types';
import * as Types from './types';
import ValueServices from './components/ValueServices';
import Assistant from './components/Assistant';
import WikiUploadModal from './components/WikiUploadModal';
import AnnouncementModal from './components/AnnouncementModal';
import SpaceManageModal from './components/SpaceManageModal';
import BusinessPartnerModal from './components/BusinessPartnerModal';
import OfficeEditModal from './components/OfficeEditModal';
import MemberManageModal from './components/MemberManageModal';
import ValueServiceModal from './components/ValueServiceModal'; // New Import
import { subscribeToCollection, addItem, updateItem, deleteItem } from './lib/firebaseClient';
import { seedFirestore, seedValueServices } from './lib/seed';
import { db, auth } from './firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';

import LoginModal from './components/LoginModal';
import { doc, getDoc } from 'firebase/firestore';
import { UserRole } from './types';

// Icon mapper for detail view
const iconMap: any = {
  Wifi, Projector, Tv, Presentation, Mic, Speaker, Wind, Zap, Coffee,
  Map, Monitor, Car, KeyRound, HelpCircle, Printer
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Types.Tab>('home');
  const [selectedBranch, setSelectedBranch] = useState<Types.BranchId>(BranchId.MINQUAN);
  const [branches, setBranches] = useState<any[]>(BRANCHES);

  // -- Member Data State --
  const [members, setMembers] = useState<MemberProfile[]>(INITIAL_MEMBERS);
  const [currentUser, setCurrentUser] = useState<MemberProfile | null>(null);

  // -- Auth State --
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMemberManageModalOpen, setIsMemberManageModalOpen] = useState(false);

  // -- Member Auth State (Restored) --
  const [isMemberLoggedIn, setIsMemberLoggedIn] = useState(false);
  const [memberAccountInput, setMemberAccountInput] = useState('');
  const [memberPasswordInput, setMemberPasswordInput] = useState('');

  // -- Wiki State --
  const [wikiItems, setWikiItems] = useState<Equipment[]>(EQUIPMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeWikiCategory, setActiveWikiCategory] = useState<WikiCategory | 'all'>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingWikiItem, setEditingWikiItem] = useState<Equipment | null>(null);

  // -- Announcement State --
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  // -- Location Spaces State --
  const [locationSpaces, setLocationSpaces] = useState<LocationSpace[]>(INITIAL_SPACES);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<LocationSpace | null>(null); // For viewing details
  const [activeSpaceImage, setActiveSpaceImage] = useState<string>(''); // For gallery viewing in detail modal

  // -- Business Partner State --
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>(BUSINESS_PARTNERS);
  const [activePartnerCategory, setActivePartnerCategory] = useState<string>('All');
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<BusinessPartner | null>(null);

  // -- Office Types State --
  const [officeTypes, setOfficeTypes] = useState<OfficeType[]>(INITIAL_OFFICE_TYPES);
  const [showOfficeSelector, setShowOfficeSelector] = useState(false);
  const [selectedOfficeType, setSelectedOfficeType] = useState<OfficeType | null>(null); // For detail view
  const [isOfficeEditModalOpen, setIsOfficeEditModalOpen] = useState(false);
  const [editingOfficeType, setEditingOfficeType] = useState<OfficeType | null>(null);
  const [activeOfficeImage, setActiveOfficeImage] = useState<string>(''); // For gallery

  // -- Service State --
  const [valueServices, setValueServices] = useState<Types.ValueService[]>([]); // New State
  const [isValueServiceModalOpen, setIsValueServiceModalOpen] = useState(false);
  const [editingValueService, setEditingValueService] = useState<Types.ValueService | null>(null);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);

  // -- Backup & Restore Refs --
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // -- Firebase Sync --
  useEffect(() => {
    const unsubWiki = subscribeToCollection('wikiItems', setWikiItems);
    const unsubAnn = subscribeToCollection('announcements', setAnnouncements);
    const unsubSpaces = subscribeToCollection('spaces', setLocationSpaces);
    const unsubPartners = subscribeToCollection('partners', setBusinessPartners);
    const unsubOffice = subscribeToCollection('officeTypes', setOfficeTypes);
    const unsubMembers = subscribeToCollection('members', setMembers);
    const unsubBranches = subscribeToCollection('branches', setBranches);
    const unsubValueServices = subscribeToCollection('valueServices', setValueServices); // Sync

    return () => {
      unsubWiki();
      unsubAnn();
      unsubSpaces();
      unsubPartners();
      unsubOffice();
      unsubMembers();
      unsubBranches();
      unsubValueServices();
    };
  }, []);

  // -- Auth State Sync --
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch User Role from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;

            // Check if role is authorized (Admin, Finance, or Operator)
            // Note: In Meeting Room app, 'OPERATOR' maps to UserRole.OPERATIONS
            if (role === 'ADMIN' || role === 'FINANCE' || role === 'OPERATOR') {
              setIsAdmin(true);
              setCurrentUser({
                id: user.uid,
                name: userData.displayName || user.email?.split('@')[0] || 'Admin',
                password: '',
                pettyCashBalance: 0,
                meetingPointsTotal: 0,
                meetingPointsUsed: 0,
                contractDate: 'N/A'
              });
              setActiveTab('home');
            } else {
              // Not an admin role
              setIsAdmin(false);
              alert('您的帳號無權限存取此系統 (Access Denied)。');
              await signOut(auth);
            }
          } else {
            // User login valid but no profile in DB -> Deny
            setIsAdmin(false);
            console.warn('User logged in but no Firestore profile found.');
            alert('找不到使用者資料，請聯繫管理員。');
            await signOut(auth);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setCurrentUser(null);
      }
    });

    return () => unsub();
  }, [members]);

  // Auto-seed if empty

  // Auto-seed if empty
  useEffect(() => {
    if (wikiItems.length === 0 && announcements.length === 0) {
      seedFirestore();
    }

    // Seed Value Services if empty
    if (valueServices.length === 0) {
      seedValueServices();
    }
  }, [wikiItems.length, announcements.length, valueServices.length]);

  // -- Auth Actions --

  const handleLogout = async () => {
    await signOut(auth);
    alert("已成功登出。");
  };

  const handleAdminToggle = () => {
    if (isAdmin) {
      if (window.confirm("確定要登出管理者模式嗎？")) {
        handleLogout();
      }
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Helper to ensure admin is active before actions (double check)
  const requireAdmin = () => {
    if (isAdmin) return true;
    alert("此操作需要管理者權限，請點擊右上角齒輪登入。");
    return false;
  };

  // -- Data Management Actions --

  // -- Member Authentication --
  const handleMemberLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(
      (m) =>
        (m.id === memberAccountInput || m.name === memberAccountInput) &&
        m.password === memberPasswordInput
    );

    if (member) {
      setIsMemberLoggedIn(true);
      setCurrentUser(member);
      setMemberAccountInput('');
      setMemberPasswordInput('');
      setActiveTab('home');
    } else {
      alert('帳號或密碼錯誤');
    }
  };

  const handleBackup = () => {
    const backupData: AppDataBackup = {
      version: '1.1',
      timestamp: new Date().toISOString(),
      wikiItems,
      announcements,
      locationSpaces,
      businessPartners,
      officeTypes,
      members
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `daoteng_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.version || !json.timestamp) throw new Error('無效的備份檔案格式');

        if (window.confirm(`確定要還原資料嗎？\n備份時間：${new Date(json.timestamp).toLocaleString()}\n注意：目前的資料將被覆蓋。`)) {
          if (json.wikiItems) setWikiItems(json.wikiItems);
          if (json.announcements) setAnnouncements(json.announcements);
          if (json.locationSpaces) setLocationSpaces(json.locationSpaces);
          if (json.businessPartners) setBusinessPartners(json.businessPartners);
          if (json.officeTypes) setOfficeTypes(json.officeTypes);
          if (json.members) setMembers(json.members);
          alert('資料還原成功！');
        }
      } catch (error) {
        console.error(error);
        alert('還原失敗：檔案格式錯誤或損毀。');
      } finally {
        if (backupFileInputRef.current) backupFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // -- Member Management --
  const handleSaveMembers = async (updatedMembers: MemberProfile[]) => {
    for (const m of updatedMembers) {
      await addItem('members', m);
    }
  };

  // -- Content Actions --
  const handleAddWikiItem = async (newItem: Equipment) => {
    await addItem('wikiItems', newItem);
    setEditingWikiItem(null); // Clear editing state after save
  };

  const handleEditWikiItem = (item: Equipment, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    setEditingWikiItem(item);
    setIsUploadModalOpen(true);
  };

  const handleDeleteWikiItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    if (window.confirm('確定要刪除此百科項目嗎？此動作無法復原。')) {
      await deleteItem('wikiItems', id);
    }
  };

  const handleSaveAnnouncement = async (item: Announcement) => {
    await addItem('announcements', item);
    setEditingAnnouncement(null);
  };

  const handleEditAnnouncement = (ann: Announcement, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    setEditingAnnouncement(ann);
    setIsAnnouncementModalOpen(true);
  };

  const handleDeleteAnnouncement = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    if (window.confirm('確定要刪除此公告嗎？此動作無法復原。')) {
      await deleteItem('announcements', id);
    }
  };

  // Specific handler for modal (no event, pre-confirmed)
  const handleModalDeleteAnnouncement = async (id: string) => {
    await deleteItem('announcements', id);
    setIsAnnouncementModalOpen(false);
  };

  const handleClearExpired = async () => {
    if (!requireAdmin()) return;
    const today = new Date().toISOString().split('T')[0];
    const expired = announcements.filter(a => a.date < today);
    if (expired.length === 0) {
      alert('目前沒有已過期的公告。');
      return;
    }
    if (window.confirm(`確定要清除 ${expired.length} 則已過期的公告嗎？`)) {
      for (const a of expired) {
        await deleteItem('announcements', a.id);
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedAnnouncementId(expandedAnnouncementId === id ? null : id);
  };

  const handleAddSpace = async (newSpace: LocationSpace) => {
    await addItem('spaces', newSpace);
  };

  const handleDeleteSpace = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    if (window.confirm('確定要刪除此空間嗎？此動作無法復原。')) {
      await deleteItem('spaces', id);
    }
  };

  const openSpaceDetail = (space: LocationSpace) => {
    setSelectedSpace(space);
    setActiveSpaceImage(space.imageUrl);
  };

  const handleSavePartner = async (partner: BusinessPartner) => {
    await addItem('partners', partner);
    setEditingPartner(null);
  };

  const handleEditPartner = (partner: BusinessPartner, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    setEditingPartner(partner);
    setIsPartnerModalOpen(true);
  };

  const handleDeletePartner = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    if (window.confirm('確定要下架此合作夥伴嗎？')) {
      await deleteItem('partners', id);
    }
  };

  const handleSaveOfficeType = async (item: OfficeType) => {
    await addItem('officeTypes', item);
    setEditingOfficeType(null);
  };

  const handleEditOfficeType = (item: OfficeType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingOfficeType(item);
    setIsOfficeEditModalOpen(true);
  };

  const handleDeleteOfficeType = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAdmin()) return;
    if (window.confirm('確定要刪除此辦公室類型嗎？此動作無法復原。')) {
      await deleteItem('officeTypes', id);
    }
  };

  const openOfficeDetail = (item: OfficeType) => {
    setSelectedOfficeType(item);
    setActiveOfficeImage(item.imageUrl);
  };

  const handleRepairClick = () => {
    window.open('https://3gltz.share.hsforms.com/2iuXFloH0RIKGzjHtbt8ZHg', '_blank');
  };

  const handleCleaningClick = () => {
    alert('清潔服務預約：\n請洽行政櫃台安排辦公室清潔時段。');
  };

  const handleLaborRightsClick = () => {
    window.open('https://www.daoteng.org/employee-calc', '_blank');
  };

  const handleMealLink = (url: string) => {
    window.open(url, '_blank');
    setIsMealModalOpen(false);
  };

  const handlePackageOption = (type: 'receive' | 'send') => {
    if (type === 'send') {
      window.open('https://share-na2.hsforms.com/2H5NQIAL1T1m36jBDVLTh-g3gltz', '_blank');
    } else {
      alert('系統查詢：目前您沒有待領取的包裹或郵件。');
    }
    setIsPackageModalOpen(false);
  };

  const handleValueServiceClick = (id: string) => {
    if (id === 'meal') {
      setIsMealModalOpen(true);
    } else {
      alert(`您選擇了該服務，系統將通知專人與您聯繫。`);
    }
  };

  const handleSaveValueService = async (service: Partial<Types.ValueService>) => {
    if (editingValueService) {
      // Update
      await updateItem('valueServices', editingValueService.id, service);
    } else {
      // Create
      await addItem('valueServices', service);
    }
    setEditingValueService(null);
  };

  const handleEditValueService = (service: Types.ValueService) => {
    setEditingValueService(service);
    setIsValueServiceModalOpen(true);
  };

  const handleDeleteValueService = async (id: string) => {
    if (window.confirm('確定要刪除此服務嗎？')) {
      await deleteItem('valueServices', id);
    }
  };

  // -- Views --

  const renderHome = () => (
    <div className="space-y-6 pb-24">
      {/* Hero Section */}
      <div className="relative h-64 bg-brand-900 rounded-b-3xl overflow-hidden shadow-lg shrink-0">
        <div className="absolute inset-0 opacity-60">
          <img
            src={BRANCHES.find(b => b.id === selectedBranch)?.image || 'https://picsum.photos/800/600'}
            alt="Coworking"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-900/90 to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-brand-200 text-sm font-medium mb-1">
            {currentUser ? `Hi, ${currentUser.name}` : 'Welcome back,'}
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">道騰國際共享空間</h1>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {branches.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBranch(b.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm transition-colors ${selectedBranch === b.id
                  ? 'bg-white text-brand-900 border-white'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
              >
                {b.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-4 grid grid-cols-4 gap-2">
          {[
            { label: '找課程', icon: Search, action: () => window.open('https://bloooming.org/find-a-course/', '_blank') },
            { label: '企業內訓', icon: Presentation, action: () => window.open('https://bloooming.org/corporate-training/', '_blank') },
            { label: '企業團建', icon: Tent, action: () => window.open('https://bloooming.org/team-building-site/', '_blank') },
            { label: '心靈探索', icon: Sparkles, action: () => window.open('https://bloooming.org/singing-bowl-course/', '_blank') },
          ].map((item, i) => (
            <button key={i} onClick={item.action} className="flex flex-col items-center gap-2 p-2 hover:bg-brand-50 rounded-lg transition-colors">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                <item.icon size={20} />
              </div>
              <span className="text-xs text-gray-600 font-medium whitespace-nowrap scale-90">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Announcements */}
      <div className="px-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Mail size={18} className="text-brand-500" /> 最新公告
          </h2>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={handleClearExpired}
                className="text-xs bg-red-50 text-red-500 px-2 py-1 rounded-md font-medium hover:bg-red-100 flex items-center gap-1 border border-red-100"
                title="清除過期"
              >
                <CalendarX size={12} /> 清除
              </button>
              <button
                onClick={() => {
                  setEditingAnnouncement(null);
                  setIsAnnouncementModalOpen(true);
                }}
                className="text-xs bg-brand-100 text-brand-700 px-2 py-1 rounded-md font-bold hover:bg-brand-200 flex items-center gap-1"
              >
                <Plus size={12} /> 發布
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {announcements.map(ann => {
            const isExpired = ann.date < new Date().toISOString().split('T')[0];
            const isExpanded = expandedAnnouncementId === ann.id;
            const dateObj = new Date(ann.date);
            const month = dateObj.getMonth() + 1;
            const day = dateObj.getDate();

            return (
              <div
                key={ann.id}
                onClick={() => toggleExpand(ann.id)}
                className={`bg-white border rounded-xl p-3 shadow-sm transition-all cursor-pointer relative overflow-hidden group ${isExpired ? 'border-gray-200 bg-gray-50 opacity-70' : 'border-gray-100 hover:border-brand-300'
                  }`}
              >
                {/* Expired Label */}
                {isExpired && (
                  <div className="absolute top-0 right-0 bg-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-bl-lg font-medium z-10">
                    已結束
                  </div>
                )}

                <div className="flex gap-3">
                  <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg shrink-0 border ${isExpired ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-brand-50 border-brand-100 text-brand-600'
                    }`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {month}月
                    </span>
                    <span className="text-lg font-bold leading-none">{day}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ann.type === 'alert' ? 'bg-red-100 text-red-600' :
                        ann.type === 'event' ? 'bg-purple-100 text-purple-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                        {ann.type === 'alert' ? '緊急' : ann.type === 'event' ? '活動' : '資訊'}
                      </span>
                      <h4 className={`font-bold text-sm truncate ${isExpired ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                        {ann.title}
                      </h4>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        {ann.details ? (
                          <>
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {isExpanded ? '收合詳情' : '點擊查看詳情'}
                          </>
                        ) : (
                          <span>無詳細內容</span>
                        )}
                      </div>

                      {/* Admin Actions */}
                      {isAdmin && (
                        <div className="flex gap-2 shrink-0 z-20 relative">
                          <button
                            onClick={(e) => handleEditAnnouncement(ann, e)}
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                            title="編輯"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteAnnouncement(ann.id, e)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="刪除"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && ann.details && (
                  <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex items-start gap-2">
                      <FileText size={14} className="text-gray-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{ann.details}</p>
                    </div>
                    {ann.link && (
                      <a
                        href={ann.link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-brand-600 text-sm font-medium mt-3 hover:underline pl-6"
                      >
                        <ExternalLink size={14} /> 點擊前往報名/相關頁面
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {announcements.length === 0 && (
            <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg text-sm border border-dashed border-gray-200">
              目前沒有公告
            </div>
          )}
        </div>
      </div>

      {/* Value Added Services */}
      <div className="px-6">
        <ValueServices
          services={valueServices}
          isAdmin={isAdmin}
          onServiceClick={handleValueServiceClick}
          onAdd={() => {
            setEditingValueService(null);
            setIsValueServiceModalOpen(true);
          }}
          onEdit={handleEditValueService}
          onDelete={handleDeleteValueService}
        />

        {/* Modals */}
        <ValueServiceModal
          isOpen={isValueServiceModalOpen}
          onClose={() => setIsValueServiceModalOpen(false)}
          onSave={handleSaveValueService}
          initialData={editingValueService || undefined}
        />
      </div>
    </div>
  );

  const renderLocations = () => {
    const spaces = locationSpaces.filter(s => s.branchId === selectedBranch);

    return (
      <div className="pb-24 pt-4 px-4 space-y-6">
        {/* Branch Selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {branches.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBranch(b.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedBranch === b.id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-200'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        {/* Branch Info Card */}
        {branches.map(b => b.id === selectedBranch && (
          <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
              <img src={b.image} alt={b.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{b.name}</h3>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <MapPin size={12} /> {b.address}
              </p>
              <p className="text-xs text-brand-600 mt-1 font-medium bg-brand-50 inline-block px-2 py-0.5 rounded">
                {b.mrt}
              </p>
            </div>
          </div>
        ))}

        {/* Office Types Section */}
        {selectedBranch !== BranchId.MINLUN && (
          <>
            <div className="flex justify-between items-center mt-6 mb-2">
              <h3 className="font-bold text-gray-800 text-lg">辦公室類型</h3>
              <button
                onClick={() => setShowOfficeSelector(true)}
                className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1"
              >
                查看全部 <ChevronRight size={14} />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
              {officeTypes.slice(0, 3).map(type => (
                <div
                  key={type.id}
                  onClick={() => openOfficeDetail(type)}
                  className="shrink-0 w-64 bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all relative group"
                >
                  <div className="h-32 bg-gray-100 relative">
                    <img src={type.imageUrl} alt={type.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                      <span className="text-white font-bold text-sm">{type.title}</span>
                    </div>
                    {/* Admin Delete Button */}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteOfficeType(type.id, e)}
                        className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full shadow-md z-20 hover:bg-red-600 transition-colors"
                        title="刪除"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 line-clamp-2">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Meeting Rooms / Spaces Header */}
        <div className="flex justify-between items-center mt-6 mb-4">
          <h3 className="font-bold text-gray-800 text-lg">會議室與空間</h3>
          {isAdmin && (
            <button
              onClick={() => setIsSpaceModalOpen(true)}
              className="bg-brand-600 text-white p-2 rounded-lg shadow-sm hover:bg-brand-700 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Plus size={14} /> 新增
            </button>
          )}
        </div>

        {/* Spaces List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spaces.map(space => (
            <div
              key={space.id}
              onClick={() => openSpaceDetail(space)}
              className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer relative"
            >
              <div className="h-40 bg-gray-100 relative">
                <img src={space.imageUrl} alt={space.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm z-10">
                  {space.capacity}
                </div>
                {/* Admin Delete Button - Increased z-index to be above video overlays */}
                {isAdmin && (
                  <button
                    onClick={(e) => handleDeleteSpace(space.id, e)}
                    className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full shadow-md z-20 hover:bg-red-600 transition-colors"
                    title="刪除空間"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                {/* Play Icon Overlay if video exists */}
                {((space.videoUrls && space.videoUrls.length > 0) || space.videoUrl) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors z-0">
                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                      <PlayCircle size={20} fill="currentColor" className="opacity-90" />
                    </div>
                    {(space.videoUrls?.length || 0) > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {space.videoUrls!.length} 支影片
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h4 className="font-bold text-gray-800 mb-1">{space.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3">{space.description}</p>
                <div className="flex flex-wrap gap-1">
                  {space.features?.slice(0, 4).map((fid, idx) => {
                    const amenity = SPACE_AMENITIES.find(a => a.id === fid);
                    const Icon = amenity ? iconMap[amenity.iconName] : Check;
                    return (
                      <span key={idx} className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">
                        <Icon size={10} /> {amenity?.label}
                      </span>
                    );
                  })}
                  {space.features && space.features.length > 4 && (
                    <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-medium">
                      +{space.features.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {spaces.length === 0 && (
            <div className="col-span-full py-10 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              此據點尚未建立空間資料
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWiki = () => {
    const filteredItems = wikiItems.filter(item => {
      const matchesSearch = item.title.includes(searchTerm) || item.description.includes(searchTerm);
      const matchesCategory = activeWikiCategory === 'all' || item.category === activeWikiCategory;
      return matchesSearch && matchesCategory;
    });

    return (
      <div className="pb-24 pt-4 px-4 h-full flex flex-col">
        {/* Search Header */}
        <div className="sticky top-0 bg-gray-50 z-10 pb-4 space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜尋設備說明、Wifi..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm shadow-sm"
              />
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingWikiItem(null);
                  setIsUploadModalOpen(true);
                }}
                className="bg-brand-600 text-white p-2.5 rounded-xl shadow-sm hover:bg-brand-700 transition-colors"
              >
                <Upload size={20} />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveWikiCategory('all')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${activeWikiCategory === 'all'
                ? 'bg-gray-800 text-white border-gray-800'
                : 'bg-white text-gray-500 border-gray-200'
                }`}
            >
              全部
            </button>
            {WIKI_CATEGORIES.map(cat => {
              const Icon = iconMap[cat.iconName] || HelpCircle;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveWikiCategory(cat.id as WikiCategory)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-colors ${activeWikiCategory === cat.id
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-500 border-gray-200'
                    }`}
                >
                  <Icon size={12} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filteredItems.map(item => {
            const Icon = iconMap[item.iconName] || FileText;
            return (
              <div key={item.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                {/* Admin Delete Button - High Z-Index */}
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-2 z-20">
                    <button
                      onClick={(e) => handleEditWikiItem(item, e)}
                      className="p-2 bg-white rounded-full text-gray-400 hover:text-brand-600 border border-gray-100 shadow-sm transition-all"
                      title="編輯"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteWikiItem(item.id, e)}
                      className="p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-100 shadow-sm transition-all"
                      title="刪除"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    (item.mediaUrls?.length || (item.contentType === 'video' && item.mediaUrl)) ? 'bg-red-50 text-red-500' :
                    (item.imageUrls?.length || (item.contentType === 'image' && item.mediaUrl)) ? 'bg-purple-50 text-purple-500' :
                      'bg-brand-50 text-brand-600'
                    }`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-800 mb-1">{item.title}</h4>
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                        {WIKI_CATEGORIES.find(c => c.id === item.category)?.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{item.description}</p>

                    {/* 操作步驟 — show if instructions exist */}
                    {item.instructions && item.instructions.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1 mb-2">
                        {item.instructions.slice(0, 3).map((inst, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-brand-400 font-mono">{i + 1}.</span>
                            <span>{inst}</span>
                          </div>
                        ))}
                        {item.instructions.length > 3 && (
                          <div className="text-center text-gray-400 pt-1">... 點擊查看完整步驟</div>
                        )}
                      </div>
                    )}

                    {/* 圖片 — show if imageUrls exist, or legacy image contentType */}
                    {(() => {
                      const allImages = item.imageUrls && item.imageUrls.length > 0
                        ? item.imageUrls
                        : (item.contentType === 'image' && item.mediaUrl ? [item.mediaUrl] : []);
                      if (allImages.length === 0) return null;
                      return (
                        <div className="mt-2 mb-2">
                          <div className="flex items-center gap-1 mb-1.5">
                            <ImageIcon size={12} className="text-purple-400" />
                            <span className="text-[10px] font-bold text-purple-400">圖片說明</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {allImages.map((url, imgIdx) => (
                              <div key={imgIdx} className="rounded-lg overflow-hidden aspect-square bg-black/5">
                                <img src={url} alt={`${item.title} ${imgIdx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* 影片 — show if mediaUrls exist, or legacy video contentType */}
                    {(() => {
                      const allVideos = item.mediaUrls && item.mediaUrls.length > 0
                        ? item.mediaUrls
                        : (item.contentType === 'video' && item.mediaUrl ? [item.mediaUrl] : []);
                      if (allVideos.length === 0) return null;
                      return (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-1">
                            <Video size={12} className="text-red-400" />
                            <span className="text-[10px] font-bold text-red-400">教學影片</span>
                          </div>
                          {allVideos.map((url, vIdx) => (
                            <div key={vIdx} className="rounded-lg overflow-hidden relative aspect-video bg-black/5">
                              <video src={url} controls className="w-full h-full object-contain" />
                              {allVideos.length > 1 && (
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  影片 {vIdx + 1}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Search size={40} className="mb-2 opacity-20" />
              <p>找不到相關內容</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderBusiness = () => {
    // Filter partners based on active category
    const filteredPartners = businessPartners.filter(p =>
      activePartnerCategory === 'All' || p.category === activePartnerCategory
    );

    return (
      <div className="pb-24 pt-4 px-4 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">商務夥伴</h1>
            <p className="text-sm text-gray-500">道騰生態系，連結您的事業資源。</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditingPartner(null); setIsPartnerModalOpen(true); }}
              className="bg-brand-600 text-white p-2 rounded-lg shadow-sm hover:bg-brand-700 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <Plus size={14} /> 新增夥伴
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActivePartnerCategory('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${activePartnerCategory === 'All'
              ? 'bg-gray-800 text-white border-gray-800'
              : 'bg-white text-gray-500 border-gray-200'
              }`}
          >
            全部
          </button>
          {BUSINESS_PARTNER_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActivePartnerCategory(cat.label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${activePartnerCategory === cat.label
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-500 border-gray-200'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredPartners.map(partner => (
            <div key={partner.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex gap-4 group hover:border-brand-200 transition-all relative">
              <div className={`w-16 h-16 rounded-xl shrink-0 flex items-center justify-center overflow-hidden ${partner.logoUrl ? 'bg-white border border-gray-100' : partner.logoColor + ' text-white'}`}>
                {partner.logoUrl ? (
                  <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold">{partner.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col h-full">
                  <div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold mb-1 inline-block ${BUSINESS_PARTNER_CATEGORIES.find(c => c.label === partner.category)?.color || 'bg-brand-50 text-brand-600'
                      }`}>
                      {partner.category}
                    </span>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{partner.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{partner.description}</p>
                  </div>

                  {/* DM / 活動圖片 */}
                  {partner.images && partner.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 mb-2">
                      {partner.images.map((img, imgIdx) => (
                        <img
                          key={imgIdx}
                          src={img}
                          alt={`${partner.name} DM ${imgIdx + 1}`}
                          className="w-20 h-20 rounded-lg object-cover shrink-0 border border-gray-100 shadow-sm hover:shadow-md hover:scale-105 transition-all cursor-pointer"
                          onClick={() => window.open(img, '_blank')}
                        />
                      ))}
                    </div>
                  )}

                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-auto flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-brand-600 transition-colors self-start"
                    >
                      <Globe size={12} /> 訪問官網
                    </a>
                  )}
                </div>
              </div>

              {/* Admin Controls - Visible and elevated */}
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-2 z-20">
                  <button
                    onClick={(e) => handleEditPartner(partner, e)}
                    className="p-2 text-gray-500 hover:text-brand-600 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDeletePartner(partner.id, e)}
                    className="p-2 text-white hover:text-white bg-red-500 border border-red-500 rounded-full shadow-sm hover:shadow-md transition-all hover:bg-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {filteredPartners.length === 0 && (
            <div className="py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              此分類下沒有合作夥伴資訊
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderServices = () => {
    if (!isMemberLoggedIn) {
      return (
        <div className="flex flex-col items-center justify-center min-h-full p-6 bg-gray-50 pb-24">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">會員登入</h2>
            <p className="text-center text-gray-500 mb-6 text-sm">請輸入您的專屬密碼以存取會員服務</p>

            <form onSubmit={handleMemberLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Client ID / Name</label>
                <input
                  type="text"
                  value={memberAccountInput}
                  onChange={(e) => setMemberAccountInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="請輸入公司名稱或 ID"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Password</label>
                <input
                  type="password"
                  value={memberPasswordInput}
                  onChange={(e) => setMemberPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-gray-50 focus:bg-white"
                  placeholder="請輸入會員密碼"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
              >
                登入 <ArrowRight size={18} />
              </button>
            </form>
          </div>

          <div className="mt-8 flex items-center gap-2 text-gray-400 text-sm">
            <ShieldCheck size={14} />
            <button onClick={handleAdminToggle} className="hover:text-gray-600 underline">
              {isAdmin ? '管理者已登入，點我登出' : '管理者登入'}
            </button>
          </div>
        </div>
      );
    }

    let displayContractDate = currentUser?.contractDate || 'N/A';

    if (currentUser?.id === 'admin') {
      displayContractDate = '系統總覽';
    }

    return (
      <div className="pb-24 pt-4 px-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-10 -mt-10 opacity-50"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center font-bold text-xl shadow-inner">
                  {currentUser?.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{currentUser?.name}</h2>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <ShieldCheck size={12} className="text-green-500" /> {currentUser?.id === 'admin' ? '系統管理員' : '合約會員'}
                  </p>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-lg">
                <LogOut size={18} />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
              <span>{currentUser?.id === 'admin' ? '統計範圍: 所有會員' : `合約到期日: ${displayContractDate}`}</span>
              {isAdmin && <span className="text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded">管理者模式</span>}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={18} className="text-brand-500" /> 會員服務
          </h3>
          <div className="grid grid-cols-2 gap-3">

            {/* Petty Cash Button (Placeholder) */}
            <button onClick={() => alert('此功能將連結至外部財務系統，敬請期待。')} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left group">
              <Coins size={24} className="text-yellow-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-700">零用金</h4>
              <p className="text-xs text-gray-400 mt-1">餘額與明細查詢</p>
            </button>

            {/* Meeting Points Button (Placeholder) */}
            <button onClick={() => alert('此功能將連結至會議室預約系統，敬請期待。')} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left group">
              <Clock size={24} className="text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-700">會議時數</h4>
              <p className="text-xs text-gray-400 mt-1">查詢與預約</p>
            </button>

            <button onClick={handleRepairClick} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left group">
              <Wrench size={24} className="text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-700">設備報修</h4>
              <p className="text-xs text-gray-400 mt-1">立即回報問題</p>
            </button>

            <button onClick={handleCleaningClick} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left group">
              <Sparkles size={24} className="text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-700">清潔預約</h4>
              <p className="text-xs text-gray-400 mt-1">辦公室清潔</p>
            </button>

            <button onClick={() => setIsMealModalOpen(true)} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left group">
              <Utensils size={24} className="text-green-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-700">代訂餐點</h4>
              <p className="text-xs text-gray-400 mt-1">便當/午茶/外燴</p>
            </button>

            <button onClick={() => setIsPackageModalOpen(true)} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left group">
              <Package size={24} className="text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-700">包裹收發</h4>
              <p className="text-xs text-gray-400 mt-1">郵件與快遞</p>
            </button>

            <button onClick={handleLaborRightsClick} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-brand-200 transition-all text-left group">
              <Calculator size={24} className="text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-gray-700">特休試算</h4>
              <p className="text-xs text-gray-400 mt-1">勞基法小幫手</p>
            </button>
          </div>
        </div>

        {/* Admin Zone */}
        {isAdmin && (
          <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Shield size={20} className="text-yellow-400" />
              <h3 className="font-bold text-lg">管理者專區</h3>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setIsMemberManageModalOpen(true)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-between px-4 transition-colors border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-blue-300" />
                  <span className="font-medium">會員資料庫管理</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleBackup}
                  className="py-3 bg-white/10 hover:bg-white/20 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-white/10"
                >
                  <Download size={20} className="text-green-300" />
                  <span className="text-xs font-medium">備份資料</span>
                </button>

                <button
                  onClick={() => backupFileInputRef.current?.click()}
                  className="py-3 bg-white/10 hover:bg-white/20 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors border border-white/10"
                >
                  <UploadCloud size={20} className="text-orange-300" />
                  <span className="text-xs font-medium">還原備份</span>
                </button>
                {/* Hidden input for restore */}
                <input
                  type="file"
                  ref={backupFileInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={handleRestore}
                />
              </div>
            </div>
          </div>
        )}

        {/* Version Info */}
        <div className="text-center py-6">
          <p className="text-[10px] text-gray-300">App Version 1.2.0 (Build 20231027)</p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-full flex flex-col">



      {/* Package Services Modal */}
      {isPackageModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-green-600 p-4 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Package size={20} /> 包裹收/寄服務
              </h3>
              <button onClick={() => setIsPackageModalOpen(false)} className="hover:bg-green-700 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 gap-4">
              <button
                onClick={() => handlePackageOption('receive')}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-green-50 hover:border-green-200 transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-200 group-hover:scale-110 transition-all">
                  <Inbox size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800 text-lg">包裹收件</h4>
                  <p className="text-xs text-gray-500">查詢待領郵件/包裹</p>
                </div>
              </button>

              <button
                onClick={() => handlePackageOption('send')}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-blue-200 group-hover:scale-110 transition-all">
                  <Send size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800 text-lg">包裹寄件</h4>
                  <p className="text-xs text-gray-500">填寫寄件申請單</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Ordering Modal */}
      {isMealModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-orange-500 p-4 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Utensils size={20} /> 代訂餐點服務
              </h3>
              <button onClick={() => setIsMealModalOpen(false)} className="hover:bg-orange-600 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 gap-4">
              <button
                onClick={() => handleMealLink('https://www.daoteng.org/meal-calc')}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group"
              >
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-orange-200 group-hover:scale-110 transition-all">
                  <Utensils size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800 text-lg">便當</h4>
                  <p className="text-xs text-gray-500">每日精選、會議便當</p>
                </div>
              </button>

              <button
                onClick={() => handleMealLink('https://share.hsforms.com/1CQSr-MtdQEyOKC7j0lAQng3gltz')}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group"
              >
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-yellow-200 group-hover:scale-110 transition-all">
                  <Coffee size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800 text-lg">精緻午茶點心</h4>
                  <p className="text-xs text-gray-500">蛋糕、咖啡、茶飲</p>
                </div>
              </button>

              <button
                onClick={() => handleMealLink('https://share.hsforms.com/1-LOg7KsDQnCAGprXyU2F5A3gltz')}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-200 group-hover:scale-110 transition-all">
                  <Sandwich size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800 text-lg">西式餐盒</h4>
                  <p className="text-xs text-gray-500">輕食、三明治、沙拉</p>
                </div>
              </button>

              <button
                onClick={() => handleMealLink('https://share.hsforms.com/1K-IzGwa2QRmzw6N0BdLa-w3gltz')}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-all group"
              >
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0 group-hover:bg-purple-200 group-hover:scale-110 transition-all">
                  <ChefHat size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800 text-lg">午晚餐精緻Buffet</h4>
                  <p className="text-xs text-gray-500">外燴服務、活動餐點</p>
                </div>
              </button>
            </div>
            <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100">
              點擊選項後將開啟訂購頁面。
            </div>
          </div>
        </div>
      )}

      {/* Office Type Selector Modal (New) */}
      {showOfficeSelector && (
        <div className="absolute inset-0 z-40 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm shrink-0 border-b border-gray-100">
            <button
              onClick={() => setShowOfficeSelector(false)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowRight className="rotate-180" size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">選擇辦公室類型</h2>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {officeTypes.map(type => (
              <div
                key={type.id}
                onClick={() => openOfficeDetail(type)}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:border-brand-300 hover:shadow-md transition-all group relative"
              >
                <div className="relative h-40">
                  <img src={type.imageUrl} alt={type.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-white font-bold text-lg">{type.title}</h3>
                  </div>

                  {/* Admin Edit Button */}
                  {isAdmin && (
                    <button
                      onClick={(e) => handleEditOfficeType(type, e)}
                      className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-brand-600 shadow-sm z-20 hover:bg-white"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                  {/* Admin Delete Button */}
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDeleteOfficeType(type.id, e)}
                      className="absolute top-2 left-2 bg-red-500 text-white p-2 rounded-full shadow-md z-20 hover:bg-red-600 transition-colors"
                      title="刪除"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{type.description}</p>
                  <div className="mt-3 flex gap-2">
                    {type.features?.slice(0, 3).map((fid, idx) => (
                      <span key={idx} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {SPACE_AMENITIES.find(a => a.id === fid)?.label || fid}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Office Detail View Overlay */}
      {selectedOfficeType && (
        <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
          {/* Sticky Header with Gallery */}
          <div className="relative h-72 shrink-0 bg-black">
            <button
              onClick={() => setSelectedOfficeType(null)}
              className="absolute top-4 left-4 z-20 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm"
            >
              <ChevronDown size={24} className="rotate-90" />
            </button>

            {(selectedOfficeType.videoUrls || (selectedOfficeType.videoUrl ? [selectedOfficeType.videoUrl] : [])).some(v => activeOfficeImage === v) ? (
              <video src={activeOfficeImage} controls autoPlay className="w-full h-full object-contain" />
            ) : (
              <img src={activeOfficeImage} alt="Detail" className="w-full h-full object-cover" />
            )}

            {/* Gallery Thumbs */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto no-scrollbar z-10">
              {(selectedOfficeType.videoUrls && selectedOfficeType.videoUrls.length > 0
                ? selectedOfficeType.videoUrls
                : (selectedOfficeType.videoUrl ? [selectedOfficeType.videoUrl] : [])
              ).map((vUrl, vIdx) => (
                <button
                  key={`video-${vIdx}`}
                  onClick={() => setActiveOfficeImage(vUrl)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 relative ${activeOfficeImage === vUrl ? 'border-brand-500' : 'border-white/50'
                    }`}
                >
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <PlayCircle size={20} className="text-white" />
                  </div>
                  {(selectedOfficeType.videoUrls?.length || 0) > 1 && (
                    <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[8px] px-1 rounded font-bold">
                      {vIdx + 1}
                    </div>
                  )}
                </button>
              ))}
              {selectedOfficeType.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveOfficeImage(img)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${activeOfficeImage === img ? 'border-brand-500' : 'border-white/50'
                    }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedOfficeType.title}</h2>

            <div className="prose prose-sm text-gray-600 mb-8 whitespace-pre-wrap">
              {selectedOfficeType.description}
            </div>

            {selectedOfficeType.features && selectedOfficeType.features.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Star size={18} className="text-brand-500" /> 包含設備
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedOfficeType.features.map(fid => {
                    const amenity = SPACE_AMENITIES.find(a => a.id === fid);
                    const Icon = amenity ? iconMap[amenity.iconName] : Check;
                    return (
                      <div key={fid} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg">
                        <Icon size={16} className="text-gray-400" />
                        <span>{amenity?.label || fid}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          <div className="p-4 border-t border-gray-100 bg-white safe-area-bottom">
            <button
              onClick={() => window.open('https://daoteng.org/contact', '_blank')}
              className="w-full bg-brand-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
            >
              <Mail size={20} /> 預約參觀 / 詢價
            </button>
          </div>
        </div>
      )}

      {/* Reusable Announcement Modal (Shared for Create & Edit) */}
      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        onSave={handleSaveAnnouncement}
        onDelete={handleModalDeleteAnnouncement}
        initialData={editingAnnouncement}
      />

      {/* Wiki Upload Modal */}
      <WikiUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSave={handleAddWikiItem}
        initialData={editingWikiItem}
      />

      {/* Space Manage Modal */}
      <SpaceManageModal
        isOpen={isSpaceModalOpen}
        onClose={() => setIsSpaceModalOpen(false)}
        onSave={handleAddSpace}
        branchId={selectedBranch}
      />

      {/* Business Partner Modal (New) */}
      <BusinessPartnerModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
        onSave={handleSavePartner}
        initialData={editingPartner}
      />

      {/* Office Edit Modal (New) */}
      {isOfficeEditModalOpen && editingOfficeType && (
        <OfficeEditModal
          isOpen={isOfficeEditModalOpen}
          onClose={() => setIsOfficeEditModalOpen(false)}
          onSave={handleSaveOfficeType}
          initialData={editingOfficeType}
        />
      )}

      {/* Member Management Modal (New) */}
      <MemberManageModal
        isOpen={isMemberManageModalOpen}
        onClose={() => setIsMemberManageModalOpen(false)}
        members={members}
        onSave={handleSaveMembers}
      />

      {/* Floating Assistant Button */}
      <Assistant
        branches={branches}
        equipments={wikiItems}
        rules={RULES}
      />

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 py-2 px-6 flex justify-between items-center z-30 pb-safe">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'home' ? 'text-brand-600' : 'text-gray-400'}`}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">首頁</span>
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'locations' ? 'text-brand-600' : 'text-gray-400'}`}
        >
          <MapPin size={24} strokeWidth={activeTab === 'locations' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">據點</span>
        </button>
        <button
          onClick={() => setActiveTab('wiki')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'wiki' ? 'text-brand-600' : 'text-gray-400'}`}
        >
          <BookOpen size={24} strokeWidth={activeTab === 'wiki' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">百科</span>
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'business' ? 'text-brand-600' : 'text-gray-400'}`}
        >
          <Briefcase size={24} strokeWidth={activeTab === 'business' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">商務</span>
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'services' ? 'text-brand-600' : 'text-gray-400'}`}
        >
          <UserCircle size={24} strokeWidth={activeTab === 'services' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">會員</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 pb-24">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'locations' && renderLocations()}
        {activeTab === 'wiki' && renderWiki()}
        {activeTab === 'services' && renderServices()}
        {activeTab === 'business' && renderBusiness()}
      </div>
      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default App;
