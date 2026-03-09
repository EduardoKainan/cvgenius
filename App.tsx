
import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import ResumeBuilder from './components/ResumeBuilder';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'builder'>('landing');

  const handleStart = () => {
    setView('builder');
  };

  const handleBack = () => {
    setView('landing');
  };

  return (
    <>
      {view === 'landing' ? (
        <LandingPage onStart={handleStart} />
      ) : (
        <ResumeBuilder onBack={handleBack} />
      )}
    </>
  );
};

export default App;
