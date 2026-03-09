
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ResumeBuilder from './components/ResumeBuilder';
import Dashboard from './components/Dashboard';
import { supabase } from './lib/supabase';
import { ResumeData } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'builder' | 'dashboard'>('landing');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editResumeId, setEditResumeId] = useState<string | undefined>(undefined);
  const [editResumeData, setEditResumeData] = useState<ResumeData | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user && view === 'landing') {
        setView('dashboard');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && view === 'landing') {
        setView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [view]);

  const handleStart = () => {
    setEditResumeId(undefined);
    setEditResumeData(undefined);
    setView('builder');
  };

  const handleLogin = () => {
    setView('dashboard');
  };

  const handleEditResume = (id: string, data: ResumeData) => {
    setEditResumeId(id);
    setEditResumeData(data);
    setView('builder');
  };

  const handleBack = () => {
    if (user) {
      setView('dashboard');
    } else {
      setView('landing');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <>
      {view === 'landing' && <LandingPage onStart={handleStart} onLogin={handleLogin} />}
      {view === 'dashboard' && <Dashboard onNewResume={handleStart} onEditResume={handleEditResume} />}
      {view === 'builder' && <ResumeBuilder onBack={handleBack} initialResumeId={editResumeId} initialResumeData={editResumeData} />}
    </>
  );
};

export default App;
