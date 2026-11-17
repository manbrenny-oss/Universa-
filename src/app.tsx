import { useEffect, useState, useCallback } from 'react';
import { Clapperboard, Loader2, Coins } from 'lucide-react';
import AuthScreen from '@/components/AuthScreen';
import BottomNav, { type TabId } from '@/components/BottomNav';
import HomePage from '@/pages/HomePage';
import SwapPage from '@/pages/SwapPage';
import CreatePage from '@/pages/CreatePage';
import LivePage from '@/pages/LivePage';
import ChatPage from '@/pages/ChatPage';
import WalletPage from '@/pages/WalletPage';
import ProfilePage from '@/pages/ProfilePage';
import { supabase } from '@/lib/supabase';

export default function App() {
  const [session, setSession] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [coins, setCoins] = useState<number | null>(null);
  const [tab, setTab] = useState<TabId>('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data.session);
      if (data.session?.user?.email) setUserEmail(data.session.user.email);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(!!s);
      if (s?.user?.email) setUserEmail(s.user.email);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadCoins = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('credits').eq('id', user.id).maybeSingle();
    if (data) setCoins(data.credits);
  }, []);

  useEffect(() => {
    if (session) void loadCoins();
  }, [session, loadCoins]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setTab('home');
  };

  if (session === null) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (session === false) {
    return <AuthScreen onSignedIn={() => setSession(true)} />;
  }

  const pages: Record<TabId, React.ReactNode> = {
    home: <HomePage onOpenCreate={() => setTab('create')} />,
    swap: <SwapPage onOpenCreate={() => setTab('create')} />,
    create: <CreatePage onCreditsChanged={setCoins} />,
    live: <LivePage />,
    chat: <ChatPage />,
    wallet: <WalletPage coins={coins} onPurchaseComplete={setCoins} />,
    profile: (
      <ProfilePage
        email={userEmail}
        coins={coins}
        onSignOut={signOut}
        onOpenCreate={() => setTab('create')}
      />
    ),
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gold-600/10 rounded-full blur-3xl pointer-events-none" />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#0A0A0A]/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-700 to-gold-500 flex items-center justify-center shadow-md shadow-gold-500/30">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <div className="leading-none">
              <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-purple-300 via-gold-300 to-gold-400 bg-clip-text text-transparent">
                UNIVERSA
              </span>
              <p className="text-[10px] text-zinc-500 mt-0.5 hidden sm:block">Your Whole World In One App</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5">
            <Coins className="w-4 h-4 text-gold-400" />
            <span className="text-sm font-semibold">{coins ?? '…'}</span>
            <span className="text-xs text-zinc-400 hidden sm:inline">coins</span>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 py-8 pb-28">{pages[tab]}</main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
