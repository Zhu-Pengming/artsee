// @ts-nocheck
'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { BusinessLayout } from './components/BusinessLayout';
import { HomeView } from './views/HomeView';
import { FeedView } from './views/FeedView';
import { InfoView } from './views/InfoView';
import { SocialView } from './views/SocialView';
import { DiscoverView } from './views/DiscoverView';
import { MeView } from './views/MeView';
import { SearchView } from './views/SearchView';
import { TravelDetailView } from './views/TravelDetailView';
import { WorkplaceView } from './views/business/WorkplaceView';
import { ArtistMarketView } from './views/business/ArtistMarketView';
import { ProjectManagementView } from './views/business/ProjectManagementView';
import { CoBrandView } from './views/business/CoBrandView';
import { BrandCenterView } from './views/business/BrandCenterView';
import { PostDetailView } from './views/PostDetailView';
import { UserProfileView } from './views/UserProfileView';
import { ExhibitionDetailView } from './views/ExhibitionDetailView';
import { InstitutionsView } from './views/InstitutionsView';
import { InstitutionDetailView } from './views/InstitutionDetailView';
import { TopicDetailView } from './views/TopicDetailView';
import { TrendsDetailView } from './views/TrendsDetailView';
import { ResearchReportView } from './views/ResearchReportView';
import { CircleDetailView } from './views/CircleDetailView';
import { ArticleDetailView } from './views/ArticleDetailView';
import { CommunityApplicationView } from './views/CommunityApplicationView';
import { VoiceRoomView } from './views/VoiceRoomView';
import { QuestionDetailView } from './views/QuestionDetailView';
import { CovenantDetailView } from './views/CovenantDetailView';
import { SalonDetailView } from './views/SalonDetailView';
import { CategoryDetailView } from './views/CategoryDetailView';
import { ModuleDetailView } from './views/ModuleDetailView';
import { BusinessDetailView } from './views/BusinessDetailView';
import { DiscoverDetailView } from './views/DiscoverDetailView';
import { ClubView } from './views/ClubView';
import { ComparisonCenterView } from './views/ComparisonCenterView';
import { AIGuideView } from './views/AIGuideView';
import { SalonGuideView } from './views/SalonGuideView';
import { PortfolioDiagnosisView } from './views/PortfolioDiagnosisView';
import { ArtCalculatorView } from './views/ArtCalculatorView';
import { WritingAssistantView } from './views/WritingAssistantView';
import { NotificationsView } from './views/NotificationsView';
import { BookingFlowView } from './views/BookingFlowView';
import { InquiryChatView } from './views/InquiryChatView';
import { RoomDetailView } from './views/RoomDetailView';
import { PaymentSheet } from './components/PaymentSheet';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { UserRole, ChatUser, Post } from './types';
import { MOCK_POSTS } from './data';
import { Institution } from './data/institutions';
import { fetchCommunityPostsForUi } from './services/platformApi';
import { ChatWindow } from './components/ChatSystem';
import { ArrowLeft } from 'lucide-react';

import { AIAssistant } from './components/AIAssistant';
import { AuthDialog } from './components/AuthDialog';
import { useAuth } from './hooks/useAuth';

export default function App() {
  const auth = useAuth();
  const [role, setRole] = useState<UserRole>('consumer');
  const [activeView, setActiveView] = useState('home');
  const [activeBusinessView, setActiveBusinessView] = useState('workplace');
  const [activeChatUser, setActiveChatUser] = useState<ChatUser | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedExhibitionId, setSelectedExhibitionId] = useState<string | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isApplyingCommunity, setIsApplyingCommunity] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [selectedCircle, setSelectedCircle] = useState<any | null>(null);
  const [selectedVoiceRoomCircle, setSelectedVoiceRoomCircle] = useState<any | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [selectedSalonEvent, setSelectedSalonEvent] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [selectedBusinessDetail, setSelectedBusinessDetail] = useState<string | null>(null);
  const [selectedDiscoverDetail, setSelectedDiscoverDetail] = useState<any | null>(null);
  const [selectedSearchQuery, setSelectedSearchQuery] = useState<string | null>(null);
  const [isTravelDetailOpen, setIsTravelDetailOpen] = useState(false);
  const [isCovenantOpen, setIsCovenantOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isAIGuideOpen, setIsAIGuideOpen] = useState(false);
  const [isSalonGuideOpen, setIsSalonGuideOpen] = useState(false);
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isWritingOpen, setIsWritingOpen] = useState(false);
  const [isBookingFlowOpen, setIsBookingFlowOpen] = useState(false);
  const [isRoomDetailOpen, setIsRoomDetailOpen] = useState(false);
  const [isInquiryChatOpen, setIsInquiryChatOpen] = useState(false);
  const [showInquiryChatPopup, setShowInquiryChatPopup] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState('');
  const [paymentInfo, setPaymentInfo] = useState<{ amount: string, title: string, itemTitle: string } | null>(null);
  const [communityPosts, setCommunityPosts] = useState<Post[]>(MOCK_POSTS);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const [viewHistory, setViewHistory] = useState<string[]>(['home']);

  useEffect(() => {
    let alive = true;
    fetchCommunityPostsForUi({ limit: 40 }).then((posts) => {
      if (alive && Array.isArray(posts) && posts.length > 0) {
        setCommunityPosts(posts);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const navigateToView = (view: string) => {
    setSelectedPostId(null);
    setSelectedUserId(null);
    setSelectedExhibitionId(null);
    setSelectedInstitution(null);
    setSelectedTopic(null);
    setSelectedTrend(null);
    setSelectedCircle(null);
    setSelectedVoiceRoomCircle(null);
    setSelectedQuestion(null);
    setSelectedSalonEvent(null);
    setSelectedCategory(null);
    setSelectedModule(null);
    setSelectedBusinessDetail(null);
    setSelectedDiscoverDetail(null);
    setSelectedSearchQuery(null);
    setIsTravelDetailOpen(false);
    setIsCovenantOpen(false);
    setIsComparisonOpen(false);
    setIsAIGuideOpen(false);
    setIsSalonGuideOpen(false);
    setIsDiagnosisOpen(false);
    setIsCalculatorOpen(false);
    setIsWritingOpen(false);
    setIsBookingFlowOpen(false);
    setIsRoomDetailOpen(false);
    setIsInquiryChatOpen(false);
    setShowInquiryChatPopup(false);

    if (view === 'writing-assistant') {
      setIsWritingOpen(true);
    } else if (view === 'ai-guide') {
      setIsAIGuideOpen(true);
    } else if (view === 'portfolio-diagnosis') {
      setIsDiagnosisOpen(true);
    } else if (view === 'voice-room') {
      setSelectedVoiceRoomCircle({ id: 'live', title: '艺术创作实时连线' } as any);
    } else {
      setActiveView(view);
    }
  };

  const isSubView = !!(selectedPostId || selectedUserId || selectedExhibitionId || selectedInstitution || selectedTopic || selectedCircle || selectedVoiceRoomCircle || selectedQuestion || selectedSalonEvent || selectedCategory || selectedModule || selectedBusinessDetail || selectedDiscoverDetail || selectedSearchQuery || isTravelDetailOpen || isCovenantOpen || isComparisonOpen || isAIGuideOpen || isSalonGuideOpen || isDiagnosisOpen || isCalculatorOpen || isWritingOpen || isBookingFlowOpen || isRoomDetailOpen || isInquiryChatOpen);

  const handleBack = () => {
    if (selectedSearchQuery) setSelectedSearchQuery(null);
    else if (isBookingFlowOpen) setIsBookingFlowOpen(false);
    else if (isRoomDetailOpen) setIsRoomDetailOpen(false);
    else if (isInquiryChatOpen) setIsInquiryChatOpen(false);
    else if (isTravelDetailOpen) setIsTravelDetailOpen(false);
    else if (selectedDiscoverDetail) setSelectedDiscoverDetail(null);
    else if (selectedBusinessDetail) setSelectedBusinessDetail(null);
    else if (selectedModule) setSelectedModule(null);
    else if (selectedSalonEvent) setSelectedSalonEvent(null);
    else if (selectedCategory) setSelectedCategory(null);
    else if (selectedQuestion) setSelectedQuestion(null);
    else if (selectedVoiceRoomCircle) setSelectedVoiceRoomCircle(null);
    else if (selectedCircle) setSelectedCircle(null);
    else if (selectedTopic) setSelectedTopic(null);
    else if (selectedTrend) setSelectedTrend(null);
    else if (selectedInstitution) setSelectedInstitution(null);
    else if (selectedExhibitionId) setSelectedExhibitionId(null);
    else if (selectedPostId) setSelectedPostId(null);
    else if (selectedUserId) setSelectedUserId(null);
    else if (isCovenantOpen) setIsCovenantOpen(false);
    else if (isComparisonOpen) setIsComparisonOpen(false);
    else if (isAIGuideOpen) setIsAIGuideOpen(false);
    else if (isSalonGuideOpen) setIsSalonGuideOpen(false);
    else if (isDiagnosisOpen) setIsDiagnosisOpen(false);
    else if (isCalculatorOpen) setIsCalculatorOpen(false);
    else if (isWritingOpen) setIsWritingOpen(false);
    else if (role === 'business') {
      setRole('consumer');
      setActiveView(viewHistory[viewHistory.length - 1] || 'home');
    } else if (viewHistory.length > 1) {
      const newHistory = [...viewHistory];
      newHistory.pop(); // remove current
      const prev = newHistory.pop() || 'home';
      setActiveView(prev);
      setViewHistory([...newHistory, prev]);
    }
  };

  useEffect(() => {
    if (!isSubView && role === 'consumer') {
      setViewHistory(prev => {
        if (prev[prev.length - 1] === activeView) return prev;
        return [...prev, activeView].slice(-10); // Keep last 10
      });
    }
  }, [activeView, isSubView, role]);

  const isSubOrBackable = isSubView || role === 'business' || (role === 'consumer' && viewHistory.length > 1 && activeView !== 'home');

  const currentViewKey = (() => {
    if (selectedVoiceRoomCircle) return `voice-${selectedVoiceRoomCircle.id}`;
    if (selectedUserId) return `user-${selectedUserId}`;
    const post = communityPosts.find(p => p.id === selectedPostId);
    if (post) return `post-${selectedPostId}`;
    if (selectedExhibitionId) return `exh-${selectedExhibitionId}`;
    if (selectedInstitution) return `inst-${selectedInstitution.id}`;
    if (selectedTopic) return `topic-${selectedTopic.id}`;
    if (selectedTrend) return `trend-${selectedTrend}`;
    if (selectedCircle) return `circle-${selectedCircle.id}`;
    if (selectedQuestion) return `q-${selectedQuestion.id}`;
    if (selectedSalonEvent) return `salon-${selectedSalonEvent.id}`;
    if (selectedCategory) return `cat-${selectedCategory.id}`;
    if (selectedModule) return `module-${selectedModule}`;
    if (selectedDiscoverDetail) return `disc-${selectedDiscoverDetail.id || selectedDiscoverDetail.title || 'detail'}`;
    if (selectedSearchQuery) return 'search';
    if (isTravelDetailOpen) return 'travel-detail';
    if (selectedBusinessDetail) return `biz-detail-${selectedBusinessDetail}`;
    if (isCovenantOpen) return 'covenant';
    if (isComparisonOpen) return 'comparison';
    if (isAIGuideOpen) return 'ai-guide';
    if (isSalonGuideOpen) return 'salon-guide';
    if (isDiagnosisOpen) return 'diagnosis';
    if (isCalculatorOpen) return 'calculator';
    if (isWritingOpen) return 'writing';
    if (isBookingFlowOpen) return 'booking-flow';
    if (isInquiryChatOpen) return 'inquiry-chat';
    
    if (role === 'business') return `biz-${activeBusinessView}`;
    return `consumer-${activeView}`;
  })();

  const selectedPost = communityPosts.find(p => p.id === selectedPostId);

  const handleRoleSwitch = () => {
    setRole(prev => (prev === 'consumer' ? 'business' : 'consumer'));
  };

  const scrollMap = useRef<Record<string, number>>({});
  const ongoingScroll = useRef(0);
  const lastViewKey = useRef(currentViewKey);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    const handleScroll = () => {
      ongoingScroll.current = main.scrollTop;
    };
    main.addEventListener('scroll', handleScroll);
    return () => main.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    if (lastViewKey.current !== currentViewKey) {
      // Transition detected
      // 1. Save what was recorded for the OLD key
      scrollMap.current[lastViewKey.current] = ongoingScroll.current;
      
      // 2. Determine if it's a detail view (should reset)
      const isDetailView = currentViewKey.startsWith('user-') || 
                           currentViewKey.startsWith('post-') || 
                           currentViewKey.startsWith('exh-') || 
                           currentViewKey.startsWith('inst-') || 
                           currentViewKey.startsWith('topic-') || 
                           currentViewKey.startsWith('circle-') || 
                           currentViewKey.startsWith('q-') || 
                           currentViewKey.startsWith('salon-') || 
                           currentViewKey.startsWith('cat-') || 
                           currentViewKey.startsWith('module-') || 
                           currentViewKey.startsWith('disc-') || 
                           currentViewKey.startsWith('biz-detail-') || 
                           currentViewKey === 'covenant';

      // 3. Restore or reset for NEW key
      const saved = isDetailView ? 0 : (scrollMap.current[currentViewKey] || 0);
      main.scrollTo({ top: saved, behavior: 'auto' });
      ongoingScroll.current = saved;
      
      lastViewKey.current = currentViewKey;
    }
  }, [currentViewKey]);

  const renderConsumerView = () => {
    if (isApplyingCommunity) {
      return (
        <CommunityApplicationView 
          onBack={() => setIsApplyingCommunity(false)}
        />
      );
    }

    if (selectedArticleId) {
      return (
        <ArticleDetailView 
          articleId={selectedArticleId}
          onBack={() => setSelectedArticleId(null)}
          onAuthorClick={setSelectedUserId}
        />
      );
    }

    if (selectedUserId) {
      return (
          <UserProfileView 
          userId={selectedUserId} 
          posts={communityPosts} 
          onBack={() => setSelectedUserId(null)}
          onNotificationClick={() => navigateToView('notifications')}
          onPostClick={(id) => {
            setSelectedUserId(null);
            setSelectedPostId(id);
          }}
          onPaymentRequest={(info) => setPaymentInfo(info)}
        />
      );
    }

    if (selectedPost) {
      return (
        <PostDetailView 
          post={selectedPost} 
          onBack={() => setSelectedPostId(null)} 
          onAuthorClick={(uid) => {
            setSelectedPostId(null);
            setSelectedUserId(uid);
          }}
          onArticleClick={setSelectedArticleId}
          onCommunityClick={() => setIsApplyingCommunity(true)}
        />
      );
    }

    if (selectedExhibitionId) {
      return (
        <ExhibitionDetailView 
          onBack={() => setSelectedExhibitionId(null)} 
          onPaymentRequest={(info) => setPaymentInfo(info)}
        />
      );
    }

    if (selectedInstitution) {
      return (
        <InstitutionDetailView 
          institution={selectedInstitution} 
          onBack={() => setSelectedInstitution(null)} 
        />
      );
    }

    if (selectedTrend) {
      if (selectedTrend === 'weekly_report') {
        return (
          <ResearchReportView 
            onBack={() => setSelectedTrend(null)} 
          />
        );
      }
      return (
        <TrendsDetailView 
          trend={selectedTrend} 
          onBack={() => setSelectedTrend(null)} 
        />
      );
    }

    if (selectedTopic) {
      return (
        <TopicDetailView 
          topic={selectedTopic} 
          onBack={() => setSelectedTopic(null)} 
          onTrendClick={setSelectedTrend}
          onPostClick={setSelectedPostId}
          onUserClick={setSelectedUserId}
        />
      );
    }

    if (selectedVoiceRoomCircle) {
      return (
        <VoiceRoomView 
          circleTitle={selectedVoiceRoomCircle.title}
          onBack={() => setSelectedVoiceRoomCircle(null)}
        />
      );
    }

    if (selectedCircle) {
      return (
        <CircleDetailView 
          circle={selectedCircle} 
          onBack={() => setSelectedCircle(null)} 
          onOpenChat={(id, name, avatar, type) => setActiveChatUser({ id, name, avatar, type })}
          onEnterRoom={() => setSelectedVoiceRoomCircle(selectedCircle)}
        />
      );
    }

    if (selectedQuestion) {
      return (
        <QuestionDetailView 
          question={selectedQuestion} 
          onBack={() => setSelectedQuestion(null)} 
          onOpenChat={(id, name, avatar, type) => setActiveChatUser({ id, name, avatar, type })}
          onAuthorClick={(uid) => {
            setSelectedQuestion(null);
            setSelectedUserId(uid);
          }}
        />
      );
    }

    if (selectedSalonEvent) {
      return (
        <SalonDetailView 
          event={selectedSalonEvent} 
          onBack={() => setSelectedSalonEvent(null)} 
        />
      );
    }

    if (selectedCategory) {
      return (
        <CategoryDetailView 
          category={selectedCategory} 
          onBack={() => setSelectedCategory(null)} 
          onSalonClick={setSelectedSalonEvent}
        />
      );
    }

    if (isCovenantOpen) {
      return (
        <CovenantDetailView onBack={() => setIsCovenantOpen(false)} />
      );
    }

    if (isComparisonOpen) {
      return (
        <ComparisonCenterView 
          onBack={() => setIsComparisonOpen(false)} 
          onInstitutionClick={setSelectedInstitution}
        />
      );
    }

    if (isAIGuideOpen) {
      return (
        <AIGuideView 
          initialPrompt={aiInitialPrompt}
          onBack={() => setIsAIGuideOpen(false)} 
        />
      );
    }

    if (isSalonGuideOpen) {
      return (
        <SalonGuideView onBack={() => setIsSalonGuideOpen(false)} />
      );
    }

    if (isDiagnosisOpen) {
      return (
        <PortfolioDiagnosisView onBack={() => setIsDiagnosisOpen(false)} />
      );
    }

    if (isCalculatorOpen) {
      return (
        <ArtCalculatorView onBack={() => setIsCalculatorOpen(false)} />
      );
    }

    if (isWritingOpen) {
      return (
        <WritingAssistantView onBack={() => setIsWritingOpen(false)} />
      );
    }

    if (isBookingFlowOpen) {
      return (
        <BookingFlowView 
          onBack={() => setIsBookingFlowOpen(false)} 
          onSuccess={() => {
            alert('预定成功！您可以在 艺术家中心 - 项目管理 中查看详情。');
            setIsBookingFlowOpen(false);
          }}
        />
      );
    }

    if (isInquiryChatOpen) {
      return (
        <InquiryChatView 
          hostName="陈曼工作室 · 设计主理人"
          onBack={() => setIsInquiryChatOpen(false)} 
        />
      );
    }

    if (selectedModule) {
      return (
        <ModuleDetailView 
          moduleId={selectedModule} 
          onUserClick={setSelectedUserId}
        />
      );
    }

    if (selectedDiscoverDetail) {
      return (
        <DiscoverDetailView 
          item={selectedDiscoverDetail} 
          onBack={() => setSelectedDiscoverDetail(null)}
        />
      );
    }

    if (selectedSearchQuery !== null) {
      return (
          <SearchView 
          initialQuery={selectedSearchQuery}
          onBack={() => setSelectedSearchQuery(null)}
          onInstitutionClick={setSelectedInstitution}
          onPostClick={setSelectedPostId}
          onUserClick={setSelectedUserId}
          posts={communityPosts}
        />
      );
    }

    if (isTravelDetailOpen) {
      return <TravelDetailView 
        onBack={() => setIsTravelDetailOpen(false)} 
        onBook={() => {
          setIsBookingFlowOpen(true);
        }}
        onContact={() => {
          if (window.innerWidth >= 768) {
            setShowInquiryChatPopup(true);
          } else {
            setIsInquiryChatOpen(true);
          }
        }}
        onViewRooms={() => setIsRoomDetailOpen(true)}
      />;
    }

    if (isRoomDetailOpen) {
      return <RoomDetailView onBack={() => setIsRoomDetailOpen(false)} />;
    }

    switch (activeView) {
      case 'home':
        return (
          <HomeView 
            onViewChange={navigateToView} 
            onSearchOpen={(query) => setSelectedSearchQuery(query)}
            onAIGuideOpen={(prompt) => {
              setAiInitialPrompt(prompt);
              setIsAIGuideOpen(true);
            }}
            onDiagnosisOpen={() => setIsDiagnosisOpen(true)}
            onCalculatorOpen={() => setIsCalculatorOpen(true)}
            onWritingAssistantOpen={() => setIsWritingOpen(true)}
            onComparisonOpen={() => setIsComparisonOpen(true)}
          />
        );
      case 'feed':
        return (
          <FeedView 
            onChatRequest={setActiveChatUser} 
            onPostClick={setSelectedPostId}
            onUserClick={setSelectedUserId}
            onExhibitionClick={setSelectedExhibitionId}
            onViewChange={navigateToView}
            onComparisonOpen={() => setIsComparisonOpen(true)}
            posts={communityPosts}
          />
        );
      case 'info':
        return <InstitutionsView onInstitutionClick={setSelectedInstitution} onCompareOpen={() => setIsComparisonOpen(true)} />;
      case 'club':
        return (
          <ClubView 
            onSalonClick={setSelectedSalonEvent} 
            onCategoryClick={setSelectedCategory}
            onTravelClick={() => setIsTravelDetailOpen(true)}
          />
        );
      case 'social':
        return (
          <SocialView 
            onChatRequest={setActiveChatUser} 
            onTopicClick={setSelectedTopic}
            onCircleClick={setSelectedCircle}
            onQuestionClick={setSelectedQuestion}
            onSalonClick={setSelectedSalonEvent}
            onCovenantClick={() => setIsCovenantOpen(true)}
          />
        );
      case 'discover':
        return <DiscoverView onDetailClick={setSelectedDiscoverDetail} onPaymentRequest={(info) => setPaymentInfo(info)} />;
      case 'me':
        return (
          <MeView 
            user={auth.user}
            isAuthenticated={auth.isAuthenticated}
            onLogin={() => setIsAuthDialogOpen(true)}
            onSwitchRole={() => setRole('business')} 
            onEditProfile={() => setSelectedUserId('me')}
            onStatClick={(type) => setSelectedModule(type)}
            onReportClick={() => setSelectedModule('report')}
            onPaymentRequest={(info) => setPaymentInfo(info)}
            onMenuClick={(label) => {
              const labelToId: Record<string, string> = {
                '我的收藏与喜欢': 'collections',
                '灵感书签库': 'bookmarks',
                '项目申请记录': 'applications',
                '艺术家隐私保护': 'privacy',
                '支付与钱包安全': 'wallet',
                '平台账户偏好': 'settings'
              };
              setSelectedModule(labelToId[label] || 'settings');
            }}
            onLogout={auth.logout}
            onModuleClick={setSelectedModule}
          />
        );
      case 'notifications':
        return <NotificationsView />;
      default:
        return (
          <HomeView onViewChange={navigateToView} />
        );
    }
  };

  const renderBusinessView = () => {
    if (selectedBusinessDetail) {
      return (
        <BusinessDetailView 
          detailId={selectedBusinessDetail} 
          onBack={() => setSelectedBusinessDetail(null)}
        />
      );
    }

    switch (activeBusinessView) {
      case 'workplace':
        return <WorkplaceView onDetailClick={setSelectedBusinessDetail} />;
      case 'artist-market':
        return <ArtistMarketView onDetailClick={setSelectedBusinessDetail} />;
      case 'projects':
        return <ProjectManagementView onDetailClick={setSelectedBusinessDetail} />;
      case 'co-brand':
        return <CoBrandView onDetailClick={setSelectedBusinessDetail} />;
      case 'brand-center':
        return <BrandCenterView onDetailClick={setSelectedBusinessDetail} />;
      default:
        return <WorkplaceView onDetailClick={setSelectedBusinessDetail} />;
    }
  };

  return (
    <MotionConfig transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 1 }}>
      <div className="relative h-screen">
      {role === 'business' ? (
        <BusinessLayout 
          activeView={activeBusinessView} 
          onViewChange={setActiveBusinessView}
          onSwitchRole={() => setRole('consumer')}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBusinessView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="min-h-full"
            >
              {renderBusinessView()}
            </motion.div>
          </AnimatePresence>
        </BusinessLayout>
      ) : (
        <Layout activeView={activeView} setActiveView={navigateToView} hideNav={isSubView}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + (isSubView ? currentViewKey : '')}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="min-h-full"
            >
              {renderConsumerView()}
            </motion.div>
          </AnimatePresence>
        </Layout>
      )}

      <AnimatePresence>
        {isSubOrBackable && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            onClick={handleBack}
            className="fixed bottom-36 md:bottom-44 right-4 md:right-8 lg:bottom-32 lg:right-12 w-11 h-11 md:w-14 md:h-14 bg-ink text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl border border-white/10 hover:bg-cobalt hover:scale-110 transition-all active:scale-95 group z-[100]"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            <div className="absolute right-full mr-4 px-3 py-1.5 bg-ink text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              返回上一级
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Hide assistant on home page and sub-views to avoid blocking content */}
      {!isSubView && activeView !== 'home' && <AIAssistant />}

      <PaymentSheet 
        isOpen={!!paymentInfo} 
        onClose={() => setPaymentInfo(null)}
        amount={paymentInfo?.amount}
        title={paymentInfo?.title}
        itemTitle={paymentInfo?.itemTitle}
      />

      <AnimatePresence>
        {showInquiryChatPopup && (
          <div className="fixed bottom-32 right-12 z-[110] pointer-events-none flex items-end justify-end">
             <motion.div 
               initial={{ opacity: 0, y: 50, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 50, scale: 0.9 }}
               className="pointer-events-auto"
             >
                <InquiryChatView 
                  hostName="陈曼工作室 · 设计主理人"
                  onBack={() => setShowInquiryChatPopup(false)}
                  isPopup={true}
                />
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeChatUser && (
          <div className="fixed inset-0 z-[110] pointer-events-none flex items-center justify-center">
             <div className="pointer-events-auto">
                <ChatWindow 
                  user={activeChatUser} 
                  onClose={() => setActiveChatUser(null)} 
                />
             </div>
          </div>
        )}
      </AnimatePresence>

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onLogin={auth.login}
        onSignup={auth.signup}
        onDevLogin={auth.devLogin}
      />
      </div>
    </MotionConfig>
  );
}
