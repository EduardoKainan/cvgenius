
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Camera, Type as TextIcon, FileText, ArrowRight, ArrowLeft, 
  Image as ImageIcon, Sparkles, RefreshCw, Trash2, Plus, 
  LayoutTemplate, Check, File, FileImage, User, Lock, ExternalLink
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { AppState, ResumeData, TemplateType, Experience } from '../types';
import { jsPDF } from 'jspdf';
import { extractResumeData, improveResumeText, processProfessionalPhoto } from '../services/geminiService';
import { generateDocx } from '../services/docxService';
import TemplateRenderer from './TemplateRenderer';
import StepIndicator from './StepIndicator';
import { supabase } from '../lib/supabase';

const INITIAL_RESUME: ResumeData = {
  fullName: '',
  jobTitle: '',
  summary: '',
  experiences: [],
  education: [],
  skills: [],
  contact: { email: '', phone: '', location: '' },
  tone: 'modern',
  length: 'full'
};

const ResumeBuilder: React.FC<{ 
  onBack: () => void;
  initialResumeId?: string;
  initialResumeData?: ResumeData;
}> = ({ onBack, initialResumeId, initialResumeData }) => {
  const [state, setState] = useState<AppState>({
    currentStep: initialResumeData ? 2 : 1,
    resumeData: initialResumeData || INITIAL_RESUME,
    template: 'modern',
    isProcessing: false,
    processingMessage: ''
  });

  const [resumeId, setResumeId] = useState<string | undefined>(initialResumeId);
  const [isSaving, setIsSaving] = useState(false);

  const [inputMode, setInputMode] = useState<'text' | 'image' | 'audio'>('text');
  const [inputText, setInputText] = useState('');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Supabase Auth & Payment State
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credits, setCredits] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [exportAction, setExportAction] = useState<'png' | 'pdf' | 'docx' | null>(null);
  const [authAction, setAuthAction] = useState<'export' | 'save' | null>(null);
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Check session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch and subscribe to credits
  useEffect(() => {
    if (!user) return;

    const fetchCredits = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
      
      if (data) setCredits(data.credits);
    };

    fetchCredits();

    // Subscribe to real-time changes on the user's profile
    const channel = supabase
      .channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          console.log('Profile updated!', payload);
          if (payload.new && 'credits' in payload.new) {
            const newCredits = (payload.new as any).credits;
            setCredits(newCredits);
            
            // Auto-close payment modal and trigger export if credits were added
            if (newCredits > 0 && showPaymentModal) {
              setShowPaymentModal(false);
              if (exportAction) {
                executeExport(exportAction);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, showPaymentModal, exportAction]);

  const checkPaymentStatus = async () => {
    if (!user) return;
    setIsCheckingPayment(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
      
      if (data && data.credits > 0) {
        setCredits(data.credits);
        if (showPaymentModal) {
          setShowPaymentModal(false);
          if (exportAction) {
            executeExport(exportAction);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao verificar créditos:", err);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Polling fallback for free tier Supabase (if Realtime is not enabled)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showPaymentModal && user) {
      // Check every 5 seconds while modal is open
      interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showPaymentModal, user, exportAction]);

  const handleAuth = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPassword });
        if (error) throw error;
        if (data.user && !data.session) {
          setAuthError('Conta criada! Verifique seu e-mail para confirmar o cadastro.');
          setAuthLoading(false);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
        if (error) throw error;
      }
      
      setShowAuthModal(false);
      // The useEffect will catch the user change and fetch credits.
      // We need a slight delay to let credits fetch, or we check in the export handler.
      setTimeout(() => {
        if (authAction === 'export') {
          if (credits < 1) {
            setShowPaymentModal(true);
          } else if (exportAction) {
            executeExport(exportAction);
          }
        } else if (authAction === 'save') {
          saveResume();
        }
        setAuthAction(null);
      }, 1000);

    } catch (err: any) {
      setAuthError(err.message || 'Erro na autenticação');
    } finally {
      setAuthLoading(false);
    }
  };

  const setProcessing = (processing: boolean, message: string = '') => {
    setState(prev => ({ ...prev, isProcessing: processing, processingMessage: message }));
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleManualInput = async () => {
    if (!inputText.trim()) return alert("Por favor, insira algum texto.");
    setProcessing(true, "Analisando seus dados com IA...");
    try {
      const data = await extractResumeData({ text: inputText });
      setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, ...data }, currentStep: 2 }));
    } catch (error) {
      console.error(error);
      alert("Houve um erro ao processar. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setInputImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!inputImage) return;
    setProcessing(true, "Extraindo informações da imagem...");
    try {
      const data = await extractResumeData({ image: inputImage });
      setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, ...data }, currentStep: 2 }));
    } catch (error) {
      console.error(error);
      alert("Erro ao processar imagem.");
    } finally {
      setProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setProcessing(true, "A IA está ouvindo e processando seu áudio...");
        try {
          const base64Audio = await blobToBase64(audioBlob);
          const data = await extractResumeData({ audio: base64Audio, audioMimeType: 'audio/webm' });
          setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, ...data }, currentStep: 2 }));
        } catch (error) {
          alert("Não conseguimos processar o áudio.");
        } finally {
          setProcessing(false);
        }
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleImproveText = async () => {
    setProcessing(true, "Aprimorando conteúdo com IA...");
    try {
      const improved = await improveResumeText(state.resumeData, state.resumeData.tone);
      setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, ...improved } }));
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await blobToBase64(file);
      setProcessing(true, "Transformando sua foto em um retrato profissional...");
      try {
        const professionalPhoto = await processProfessionalPhoto(base64);
        setState(prev => ({ 
          ...prev, 
          resumeData: { ...prev.resumeData, photoUrl: professionalPhoto }
        }));
      } catch (error) {
        console.error(error);
        alert("Erro ao processar foto.");
      } finally {
        setProcessing(false);
      }
    }
  };

  const executeExport = async (type: 'png' | 'pdf' | 'docx') => {
    const element = document.getElementById('resume-final-render');
    if (!element || !user) return;
    
    setProcessing(true, `Gerando ${type.toUpperCase()}...`);
    try {
      // Deduct credit in Supabase
      const newCredits = credits - 1;
      await supabase.from('profiles').update({ credits: newCredits }).eq('id', user.id);
      setCredits(newCredits);

      if (type === 'docx') {
        await generateDocx(state.resumeData);
      } else if (type === 'pdf') {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        while (heightLeft > 0) {
          position = position - pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        
        pdf.save(`curriculo-${state.resumeData.fullName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      } else {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const link = document.createElement('a');
        link.download = `curriculo-${state.resumeData.fullName.replace(/\s+/g, '-').toLowerCase()}.${type}`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao exportar. Tente novamente.");
    } finally {
      setProcessing(false);
      setExportAction(null);
    }
  };

  const handleExportClick = (type: 'png' | 'pdf' | 'docx') => {
    if (!isLoggedIn) {
      setExportAction(type);
      setAuthAction('export');
      setShowAuthModal(true);
      return;
    }
    
    if (credits < 1) {
      setExportAction(type);
      setShowPaymentModal(true);
      return;
    }

    executeExport(type);
  };

  const addExperience = () => {
    const newExp: Experience = { company: '', position: '', period: '', description: '' };
    setState(prev => ({
      ...prev,
      resumeData: { ...prev.resumeData, experiences: [...prev.resumeData.experiences, newExp] }
    }));
  };

  const saveResume = async () => {
    if (!user) {
      setAuthAction('save');
      setShowAuthModal(true);
      return;
    }
    setIsSaving(true);
    try {
      const title = state.resumeData.jobTitle 
        ? `${state.resumeData.fullName} - ${state.resumeData.jobTitle}` 
        : state.resumeData.fullName || 'Meu Currículo';
        
      if (resumeId) {
        // Update existing
        const { error } = await supabase
          .from('resumes')
          .update({
            title,
            data: state.resumeData,
            template: state.template
          })
          .eq('id', resumeId);
        if (error) throw error;
        alert('Currículo atualizado com sucesso!');
      } else {
        // Create new
        const { data, error } = await supabase
          .from('resumes')
          .insert({
            user_id: user.id,
            title,
            data: state.resumeData,
            template: state.template
          })
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setResumeId(data.id);
          alert('Currículo salvo com sucesso!');
        }
      }
    } catch (err) {
      console.error('Erro ao salvar currículo:', err);
      alert('Erro ao salvar currículo.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full relative">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">{authMode === 'signup' ? 'Crie sua conta' : 'Acesse sua conta'}</h2>
            <p className="text-slate-500 text-center mb-8">Para baixar seu currículo, precisamos salvar seu progresso.</p>
            
            {authError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">{authError}</div>}

            <div className="space-y-4">
              <input 
                type="email" 
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Seu melhor e-mail" 
                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" 
              />
              <input 
                type="password" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Senha" 
                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 outline-none" 
              />
              <button 
                onClick={handleAuth}
                disabled={authLoading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {authLoading ? 'Aguarde...' : (authMode === 'signup' ? 'Criar Conta e Continuar' : 'Entrar e Continuar')}
              </button>
              
              <button 
                onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                className="w-full text-sm text-slate-500 hover:text-blue-600 transition-colors"
              >
                {authMode === 'signup' ? 'Já tem uma conta? Faça login' : 'Não tem conta? Crie uma agora'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-4xl w-full relative">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Escolha seu Pacote</h2>
              <p className="text-slate-500">Você precisa de créditos para baixar seu currículo em alta resolução.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Plan 1 */}
              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col hover:border-blue-600 transition-colors">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Básico</h3>
                <div className="text-3xl font-black mb-4">1 <span className="text-sm text-slate-500 font-normal">crédito</span></div>
                <ul className="text-sm text-slate-600 space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> 1 Download (PDF/PNG)</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Alta Resolução</li>
                </ul>
                <a 
                  href={`https://www.ggcheckout.com/checkout/v2/itZaVbSR4l4fcbteF9tJ?email=${user?.email || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-100 text-slate-800 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors text-center flex items-center justify-center gap-2"
                >
                  Comprar <ExternalLink size={16} />
                </a>
              </div>

              {/* Plan 2 */}
              <div className="border-2 border-blue-600 rounded-2xl p-6 flex flex-col relative shadow-lg shadow-blue-100">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">MAIS POPULAR</div>
                <h3 className="text-lg font-bold text-blue-900 mb-2">Profissional</h3>
                <div className="text-3xl font-black mb-4">3 <span className="text-sm text-slate-500 font-normal">créditos</span></div>
                <ul className="text-sm text-slate-600 space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> 3 Downloads (PDF/PNG)</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Alta Resolução</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Atualize quando quiser</li>
                </ul>
                <a 
                  href={`#COLOQUE_O_LINK_DO_PLANO_2_AQUI?email=${user?.email || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
                >
                  Comprar <ExternalLink size={16} />
                </a>
              </div>

              {/* Plan 3 */}
              <div className="border border-slate-200 rounded-2xl p-6 flex flex-col hover:border-blue-600 transition-colors">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Premium</h3>
                <div className="text-3xl font-black mb-4">10 <span className="text-sm text-slate-500 font-normal">créditos</span></div>
                <ul className="text-sm text-slate-600 space-y-3 mb-6 flex-1">
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> 10 Downloads (PDF/PNG)</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Alta Resolução</li>
                  <li className="flex items-center gap-2"><Check size={16} className="text-emerald-500"/> Teste vários templates</li>
                </ul>
                <a 
                  href={`#COLOQUE_O_LINK_DO_PLANO_3_AQUI?email=${user?.email || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-100 text-slate-800 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors text-center flex items-center justify-center gap-2"
                >
                  Comprar <ExternalLink size={16} />
                </a>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center gap-4 justify-center max-w-md mx-auto">
              <div className="flex items-center gap-4">
                <RefreshCw size={24} className={`text-blue-600 ${isCheckingPayment ? 'animate-spin' : ''}`} />
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-700">Aguardando Pagamento...</p>
                  <p className="text-xs text-slate-500">Verificando automaticamente a cada 5 segundos.</p>
                </div>
              </div>
              <button 
                onClick={checkPaymentStatus}
                disabled={isCheckingPayment}
                className="w-full py-2 mt-2 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors text-sm disabled:opacity-50"
              >
                {isCheckingPayment ? 'Verificando...' : 'Já paguei, verificar agora'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="text-center mb-12 relative">

        <button 
          onClick={onBack}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          title="Voltar"
        >
          <ArrowLeft size={24} />
        </button>
        
        {isLoggedIn && (
          <button 
            onClick={onBack}
            className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <User size={18} /> Minha Conta
          </button>
        )}

        <div className="flex justify-center mb-4">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-200">
            <Sparkles className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">CVGenius</h1>
        <p className="text-slate-500 mt-2">Arquiteto de Currículos com IA Multimodal</p>
      </header>

      <StepIndicator currentStep={state.currentStep} />

      {state.isProcessing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full">
            <RefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Processando...</h3>
            <p className="text-slate-500">{state.processingMessage}</p>
          </div>
        </div>
      )}

      {/* STEP 1: INPUT */}
      {state.currentStep === 1 && (
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button 
              onClick={() => setInputMode('text')}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${inputMode === 'text' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <TextIcon size={24} />
              <span className="font-bold text-sm">Texto / Bio</span>
            </button>
            <button 
              onClick={() => setInputMode('image')}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${inputMode === 'image' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <ImageIcon size={24} />
              <span className="font-bold text-sm">Scanner (Img)</span>
            </button>
            <button 
              onClick={() => setInputMode('audio')}
              className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${inputMode === 'audio' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white hover:border-slate-200'}`}
            >
              <Mic size={24} />
              <span className="font-bold text-sm">Voz / Áudio</span>
            </button>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            {inputMode === 'text' && (
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700">Cole seu perfil ou histórico</label>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ex: Sou um desenvolvedor com 5 anos de experiência em React, trabalhei na empresa X..."
                  className="w-full h-48 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
                />
                <button onClick={handleManualInput} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  Gerar com IA <ArrowRight size={20} />
                </button>
              </div>
            )}

            {inputMode === 'image' && (
              <div className="space-y-6 text-center">
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 hover:border-blue-400 transition-colors relative">
                  {inputImage ? (
                    <img src={inputImage} className="max-h-64 mx-auto rounded-lg shadow-md" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <Camera size={48} />
                      <p>Envie uma foto do seu currículo atual</p>
                    </div>
                  )}
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
                {inputImage && (
                  <button onClick={processImage} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2">
                    Escanear Imagem <Sparkles size={20} />
                  </button>
                )}
              </div>
            )}

            {inputMode === 'audio' && (
              <div className="text-center py-12">
                <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-8 transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-50 text-blue-600'}`}>
                  <Mic size={48} />
                </div>
                <h3 className="text-xl font-bold mb-2">{isRecording ? "Gravando..." : "Conte sua trajetória profissional"}</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Nossa IA transcreverá seu áudio e estruturará os dados automaticamente.</p>
                {!isRecording ? (
                  <button onClick={startRecording} className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-full font-bold shadow-lg shadow-blue-200">Iniciar Gravação</button>
                ) : (
                  <button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 rounded-full font-bold shadow-lg shadow-red-200">Parar e Processar</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: EDITING */}
      {state.currentStep === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8 max-h-[800px] overflow-y-auto pr-4 scrollbar-thin">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><User size={20} className="text-blue-600" /> Dados Básicos</h3>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  value={state.resumeData.fullName}
                  onChange={(e) => setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, fullName: e.target.value } }))}
                  placeholder="Nome Completo" className="p-3 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-blue-600" 
                />
                <input 
                  value={state.resumeData.jobTitle}
                  onChange={(e) => setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, jobTitle: e.target.value } }))}
                  placeholder="Cargo" className="p-3 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-blue-600" 
                />
              </div>
              <textarea 
                value={state.resumeData.summary}
                onChange={(e) => setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, summary: e.target.value } }))}
                placeholder="Resumo" className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-blue-600 h-24"
              />
              <button onClick={handleImproveText} className="flex items-center gap-2 text-blue-600 text-sm font-bold hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all">
                <Sparkles size={16} /> Melhorar com IA
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2"><FileText size={20} className="text-blue-600" /> Experiência</h3>
                <button onClick={addExperience} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Plus size={20} /></button>
              </div>
              {state.resumeData.experiences.map((exp, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl space-y-3 relative group">
                   <button 
                    onClick={() => {
                      const newExps = [...state.resumeData.experiences];
                      newExps.splice(idx, 1);
                      setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, experiences: newExps } }));
                    }}
                    className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={16} />
                   </button>
                   <div className="grid grid-cols-2 gap-3">
                      <input 
                        value={exp.company}
                        onChange={(e) => {
                          const newExps = [...state.resumeData.experiences];
                          newExps[idx].company = e.target.value;
                          setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, experiences: newExps } }));
                        }}
                        placeholder="Empresa" className="p-2 bg-white rounded border border-slate-200 text-sm" 
                      />
                      <input 
                        value={exp.period}
                        onChange={(e) => {
                          const newExps = [...state.resumeData.experiences];
                          newExps[idx].period = e.target.value;
                          setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, experiences: newExps } }));
                        }}
                        placeholder="Período" className="p-2 bg-white rounded border border-slate-200 text-sm" 
                      />
                   </div>
                   <input 
                      value={exp.position}
                      onChange={(e) => {
                        const newExps = [...state.resumeData.experiences];
                        newExps[idx].position = e.target.value;
                        setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, experiences: newExps } }));
                      }}
                      placeholder="Cargo" className="w-full p-2 bg-white rounded border border-slate-200 text-sm" 
                    />
                   <textarea 
                    value={exp.description}
                    onChange={(e) => {
                      const newExps = [...state.resumeData.experiences];
                      newExps[idx].description = e.target.value;
                      setState(prev => ({ ...prev, resumeData: { ...prev.resumeData, experiences: newExps } }));
                    }}
                    placeholder="Descrição" className="w-full p-2 bg-white rounded border border-slate-200 text-sm h-20"
                   />
                </div>
              ))}
            </div>

            <div className="flex gap-4">
               <button onClick={() => setState(p => ({ ...p, currentStep: 1 }))} className="flex-1 py-4 px-6 border border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                  <ArrowLeft size={20} /> Voltar
               </button>
               <button onClick={() => setState(p => ({ ...p, currentStep: 3 }))} className="flex-1 py-4 px-6 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  Foto Profissional <ArrowRight size={20} />
               </button>
            </div>
          </div>

          <div className="hidden lg:block sticky top-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Preview em Tempo Real</h3>
            <div className="cv-viewport bg-slate-200 rounded-3xl p-8 border border-slate-100 overflow-hidden shadow-inner">
               <div className="cv-scaler">
                <TemplateRenderer data={state.resumeData} template={state.template} containerId="preview-render" />
               </div>
            </div>
          </div>
          
          {/* Mobile Preview Overlay Trigger */}
          <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
             <button onClick={() => setState(p => ({ ...p, currentStep: 4 }))} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-2">
                Ver Resultado <FileText size={20} />
             </button>
          </div>
        </div>
      )}

      {/* STEP 3: PHOTO PROCESSING */}
      {state.currentStep === 3 && (
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
             <h2 className="text-3xl font-bold">Foto Profissional com IA</h2>
             <p className="text-slate-500 max-w-lg mx-auto">Nossa IA pode transformar qualquer selfie em uma foto de estúdio corporativo profissional.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
             <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
                <div className="w-48 h-48 mx-auto bg-slate-50 rounded-full border-4 border-white shadow-lg overflow-hidden flex items-center justify-center mb-8 relative group">
                  {state.resumeData.photoUrl ? (
                    <img src={state.resumeData.photoUrl} className="w-full h-full object-cover" alt="Profile" />
                  ) : (
                    <User size={64} className="text-slate-200" />
                  )}
                  <input type="file" onChange={handleProcessPhoto} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
                <button className="relative overflow-hidden bg-blue-600 text-white font-bold py-4 px-12 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                   Escolher Selfie
                   <input type="file" onChange={handleProcessPhoto} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </button>
                <p className="text-xs text-slate-400 mt-4 italic">A IA removerá o fundo e ajustará a iluminação automaticamente.</p>
             </div>

             <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                   <div className="bg-green-500 p-2 rounded-lg text-white h-fit"><Check size={20} /></div>
                   <div>
                      <h4 className="font-bold text-green-900">IA Studio Ready</h4>
                      <p className="text-sm text-green-700">Fundo removido e substituído por estúdio neutro.</p>
                   </div>
                </div>
                <div className="flex gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                   <div className="bg-blue-500 p-2 rounded-lg text-white h-fit"><Check size={20} /></div>
                   <div>
                      <h4 className="font-bold text-blue-900">Ajuste de Iluminação</h4>
                      <p className="text-sm text-blue-700">Equilíbrio de cores para um look executivo.</p>
                   </div>
                </div>
                <button onClick={() => setState(p => ({ ...p, currentStep: 4 }))} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
                   Finalizar Currículo <ArrowRight size={20} />
                </button>
             </div>
          </div>
        </div>
      )}

      {/* STEP 4: EXPORT */}
      {state.currentStep === 4 && (
        <div className="space-y-8 pb-20">
           <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-full lg:w-80 space-y-6 sticky top-8">
                 <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 space-y-4">
                    <h3 className="font-bold flex items-center gap-2 text-slate-800"><LayoutTemplate size={20} /> Template</h3>
                    <div className="grid grid-cols-2 gap-3">
                       {['classic', 'modern', 'creative', 'minimalist', 'executive', 'tech'].map((t) => (
                         <button 
                          key={t}
                          onClick={() => setState(p => ({ ...p, template: t as TemplateType }))}
                          className={`py-2 px-1 text-[10px] font-black uppercase tracking-tighter rounded-lg border-2 transition-all ${state.template === t ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 hover:border-slate-200 text-slate-400'}`}
                         >
                           {t}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-3">
                    <button onClick={() => handleExportClick('png')} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                       <FileImage size={20} /> Exportar PNG
                    </button>
                    <button onClick={() => handleExportClick('pdf')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg">
                       <File size={20} /> Exportar PDF
                    </button>
                    <button onClick={() => handleExportClick('docx')} className="w-full py-4 bg-blue-100 text-blue-800 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-200 transition-all shadow-lg">
                       <FileText size={20} /> Exportar DOCX
                    </button>
                    <button 
                      onClick={saveResume} 
                      disabled={isSaving}
                      className="w-full py-4 border border-blue-200 text-blue-600 bg-blue-50 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors disabled:opacity-50 mt-4"
                    >
                       <FileText size={20} /> {isSaving ? 'Salvando...' : 'Salvar na Nuvem'}
                    </button>
                 </div>

                 <button onClick={() => setState(p => ({ ...p, currentStep: 2 }))} className="w-full py-4 border border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">
                    Voltar para Edição
                 </button>
              </div>

              <div className="flex-1 w-full bg-slate-200 p-4 lg:p-12 rounded-[2rem] shadow-inner flex justify-center overflow-hidden">
                <div className="cv-viewport">
                  <div className="cv-scaler">
                    <TemplateRenderer data={state.resumeData} template={state.template} containerId="resume-final-render" />
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
