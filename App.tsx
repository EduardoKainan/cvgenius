
import React, { useState, useRef, useCallback } from 'react';
import { 
  Mic, Camera, Type as TextIcon, FileText, ArrowRight, ArrowLeft, 
  Download, Image as ImageIcon, Sparkles, RefreshCw, Trash2, Plus, 
  LayoutTemplate, Check, AlertCircle, X, DownloadCloud, File, FileImage
} from 'lucide-react';
import { AppState, ResumeData, TemplateType } from './types';
import { extractResumeData, improveResumeText, processProfessionalPhoto } from './services/geminiService';
import TemplateRenderer from './components/TemplateRenderer';
import StepIndicator from './components/StepIndicator';

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

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentStep: 1,
    resumeData: INITIAL_RESUME,
    template: 'modern',
    isProcessing: false,
    processingMessage: ''
  });

  const [inputMode, setInputMode] = useState<'text' | 'image' | 'audio'>('text');
  const [inputText, setInputText] = useState('');
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const resumeRef = useRef<HTMLDivElement>(null);

  const setProcessing = (processing: boolean, message: string = '') => {
    setState(prev => ({ ...prev, isProcessing: processing, processingMessage: message }));
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleManualInput = async () => {
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
          const data = await extractResumeData({ 
            audio: base64Audio, 
            audioMimeType: 'audio/webm' 
          });
          
          setState(prev => ({ 
            ...prev, 
            resumeData: { ...prev.resumeData, ...data }, 
            currentStep: 2 
          }));
        } catch (error) {
          console.error("Erro ao processar áudio:", error);
          alert("Não conseguimos processar o áudio. Tente falar de forma mais clara ou use a entrada de texto.");
        } finally {
          setProcessing(false);
        }
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleImproveText = async () => {
    setProcessing(true, "Aprimorando seu conteúdo com linguagem profissional...");
    try {
      const improved = await improveResumeText(state.resumeData, state.resumeData.tone);
      setState(prev => ({ ...prev, resumeData: improved }));
    } finally {
      setProcessing(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        setProcessing(true, "Criando seu retrato profissional com IA...");
        const result = await processProfessionalPhoto(reader.result as string);
        setState(prev => ({ 
          ...prev, 
          resumeData: { ...prev.resumeData, photoUrl: result } 
        }));
        setProcessing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportAsImage = async () => {
    const html2canvas = (await import('https://esm.sh/html2canvas')).default;
    const element = document.getElementById('final-resume');
    if (element) {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const link = document.createElement('a');
      link.download = `curriculo-${state.resumeData.fullName.replace(/\s+/g, '-') || 'cv'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const exportAsDocx = () => {
    const { fullName, jobTitle, summary, experiences, education, contact, skills } = state.resumeData;
    
    // Create a robust HTML structure that Word interprets well
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${fullName}</title></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h1 style="font-size: 24px; color: #333; margin-bottom: 5px;">${fullName}</h1>
        <p style="font-size: 16px; font-weight: bold; color: #666; margin-top: 0;">${jobTitle}</p>
        <p style="font-size: 12px; color: #555;">${contact.email} • ${contact.phone} • ${contact.location}</p>
        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
        
        <h2 style="font-size: 18px; color: #1e40af; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 20px;">RESUMO</h2>
        <p style="text-align: justify;">${summary}</p>
        
        <h2 style="font-size: 18px; color: #1e40af; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 20px;">EXPERIÊNCIA</h2>
        ${experiences.map(exp => `
          <div style="margin-bottom: 15px;">
            <h3 style="font-size: 16px; margin: 0; color: #333;">${exp.position}</h3>
            <p style="font-size: 14px; color: #555; margin: 2px 0;"><strong>${exp.company}</strong> | ${exp.period}</p>
            <p style="font-size: 14px; margin-top: 5px;">${exp.description}</p>
          </div>
        `).join('')}

        <h2 style="font-size: 18px; color: #1e40af; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 20px;">EDUCAÇÃO</h2>
        ${education.map(edu => `
           <div style="margin-bottom: 10px;">
             <p style="margin: 0; font-weight: bold;">${edu.degree}</p>
             <p style="margin: 0; font-size: 14px; color: #555;">${edu.institution} - ${edu.year}</p>
           </div>
        `).join('')}
        
         <h2 style="font-size: 18px; color: #1e40af; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 20px;">HABILIDADES</h2>
         <p>${skills.join(', ')}</p>
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `curriculo-${fullName.replace(/\s+/g, '-') || 'cv'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="border-b bg-white px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <Sparkles size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">CVGenius<span className="text-blue-600">.</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">IA Powered Architect</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6">
        <StepIndicator currentStep={state.currentStep} />

        {state.isProcessing && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{state.processingMessage}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Nossa inteligência artificial está transformando seus dados em um currículo de alto impacto.</p>
            </div>
          </div>
        )}

        {/* STEP 1: INPUT */}
        {state.currentStep === 1 && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center">
              <h2 className="text-3xl font-black text-slate-900 mb-2">Como você quer começar?</h2>
              <p className="text-slate-500">Capture seus dados da forma que for mais fácil.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'text', icon: <TextIcon size={24} />, label: "Texto / Colar", desc: "Digite ou cole seu currículo antigo" },
                { id: 'image', icon: <Camera size={24} />, label: "Foto / Scanner", desc: "Tire uma foto do seu CV atual" },
                { id: 'audio', icon: <Mic size={24} />, label: "Áudio / Voz", desc: "Conte sua trajetória profissional" }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setInputMode(mode.id as any)}
                  className={`
                    p-6 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3
                    ${inputMode === mode.id ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100' : 'border-slate-100 bg-white hover:border-slate-200'}
                  `}
                >
                  <div className={`${inputMode === mode.id ? 'text-blue-600' : 'text-slate-400'}`}>
                    {mode.icon}
                  </div>
                  <h4 className="font-bold text-slate-800">{mode.label}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{mode.desc}</p>
                </button>
              ))}
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm min-h-[300px] flex flex-col">
              {inputMode === 'text' && (
                <>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ex: Sou Desenvolvedor Fullstack com 5 anos de experiência em React e Node. Trabalhei na empresa X de 2019 a 2022..."
                    className="flex-1 w-full p-4 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-600 outline-none resize-none min-h-[200px]"
                  />
                  <button 
                    onClick={handleManualInput}
                    disabled={!inputText.trim()}
                    className="mt-6 bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Gerar Currículo <ArrowRight size={20} />
                  </button>
                </>
              )}

              {inputMode === 'image' && (
                <div className="flex flex-col items-center justify-center flex-1 py-10">
                  {inputImage ? (
                    <div className="relative group max-w-sm">
                      <img src={inputImage} className="rounded-xl shadow-lg border border-slate-200" alt="Upload" />
                      <button 
                        onClick={() => setInputImage(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={processImage}
                        className="mt-6 w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                        Analisar Imagem <Sparkles size={20} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full max-w-md border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-12 cursor-pointer hover:bg-slate-50 transition-colors">
                      <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-4">
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-slate-900 font-bold mb-1">Upload de Foto</p>
                      <p className="text-slate-400 text-sm text-center">Arraste uma foto do seu currículo ou clique para selecionar</p>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              )}

              {inputMode === 'audio' && (
                <div className="flex flex-col items-center justify-center flex-1 py-10">
                  <div className={`
                    w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 mb-6
                    ${isRecording ? 'bg-red-100 text-red-600 animate-pulse scale-110 shadow-xl shadow-red-100' : 'bg-blue-50 text-blue-600'}
                  `}>
                    <Mic size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">
                    {isRecording ? "Estamos ouvindo..." : "Pronto para gravar"}
                  </h3>
                  <p className="text-slate-500 text-center max-w-xs mb-8">
                    {isRecording 
                      ? "Fale sobre sua experiência, formação e principais habilidades." 
                      : "Clique no botão abaixo e conte-nos sua trajetória profissional."}
                  </p>
                  
                  <button 
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`
                      px-8 py-4 rounded-2xl font-bold flex items-center gap-3 transition-all
                      ${isRecording ? 'bg-red-600 text-white' : 'bg-slate-900 text-white hover:bg-black'}
                    `}
                  >
                    {isRecording ? (
                      <><div className="w-3 h-3 bg-white rounded-full animate-ping" /> Parar Gravação</>
                    ) : (
                      <><Mic size={20} /> Iniciar Gravação</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: EDIT */}
        {state.currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Refine seus dados</h2>
                <button 
                  onClick={handleImproveText}
                  className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Sparkles size={16} /> Melhorar com IA
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6 overflow-y-auto max-h-[70vh] shadow-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Nome Completo</label>
                  <input 
                    className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-blue-600"
                    value={state.resumeData.fullName}
                    onChange={(e) => setState({ ...state, resumeData: { ...state.resumeData, fullName: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cargo Desejado</label>
                  <input 
                    className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-blue-600"
                    value={state.resumeData.jobTitle}
                    onChange={(e) => setState({ ...state, resumeData: { ...state.resumeData, jobTitle: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Resumo</label>
                  <textarea 
                    className="w-full p-3 bg-slate-50 rounded-lg border-none focus:ring-2 focus:ring-blue-600 min-h-[100px]"
                    value={state.resumeData.summary}
                    onChange={(e) => setState({ ...state, resumeData: { ...state.resumeData, summary: e.target.value } })}
                  />
                </div>

                <div className="pt-4 border-t">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                    Experiências
                    <button className="text-blue-600 bg-blue-50 p-1.5 rounded-lg"><Plus size={16}/></button>
                  </h3>
                  {state.resumeData.experiences.map((exp, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl mb-4 relative">
                      <input 
                        className="bg-transparent font-bold w-full mb-1 border-none focus:ring-0 p-0"
                        value={exp.position}
                        onChange={(e) => {
                          const newExps = [...state.resumeData.experiences];
                          newExps[idx].position = e.target.value;
                          setState({ ...state, resumeData: { ...state.resumeData, experiences: newExps } });
                        }}
                      />
                      <input 
                        className="bg-transparent text-sm text-slate-500 w-full mb-3 border-none focus:ring-0 p-0"
                        value={exp.company}
                        onChange={(e) => {
                          const newExps = [...state.resumeData.experiences];
                          newExps[idx].company = e.target.value;
                          setState({ ...state, resumeData: { ...state.resumeData, experiences: newExps } });
                        }}
                      />
                      <textarea 
                        className="bg-transparent text-xs w-full border-none focus:ring-0 p-0 resize-none"
                        value={exp.description}
                        rows={3}
                        onChange={(e) => {
                          const newExps = [...state.resumeData.experiences];
                          newExps[idx].description = e.target.value;
                          setState({ ...state, resumeData: { ...state.resumeData, experiences: newExps } });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setState({ ...state, currentStep: 1 })} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  <ArrowLeft size={20} /> Voltar
                </button>
                <button onClick={() => setState({ ...state, currentStep: 3 })} className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  Próximo <ArrowRight size={20} />
                </button>
              </div>
            </div>

            <div className="sticky top-24 h-fit hidden lg:block">
              <div className="mb-4 flex items-center gap-2">
                <LayoutTemplate size={18} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preview em Tempo Real</span>
              </div>
              <div className="resume-shadow transform scale-[0.7] origin-top rounded-lg overflow-hidden border">
                <TemplateRenderer data={state.resumeData} template={state.template} containerId="preview-mini" />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PHOTO */}
        {state.currentStep === 3 && (
          <div className="max-w-4xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Sua Foto Profissional</h2>
            <p className="text-slate-500 mb-10">A IA irá remover o fundo e ajustar a iluminação automaticamente.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <h4 className="font-bold text-slate-800 mb-4">Upload da Foto</h4>
                <div className="w-full aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 mb-6 overflow-hidden">
                  {state.resumeData.photoUrl ? (
                    <img src={state.resumeData.photoUrl} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                  ) : (
                    <div className="text-slate-300">
                      <Camera size={48} />
                    </div>
                  )}
                </div>
                <label className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold cursor-pointer hover:bg-black transition-all">
                  Selecionar Foto
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>

              <div className="flex flex-col justify-center gap-6">
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-3 text-blue-600">
                    <Check size={20} />
                    <h5 className="font-bold">Remoção de Fundo</h5>
                  </div>
                  <p className="text-xs text-blue-800/70">Nossa IA detecta o plano de fundo e o substitui por um tom neutro adequado para recrutadores.</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-3 text-blue-600">
                    <Check size={20} />
                    <h5 className="font-bold">Corte Inteligente</h5>
                  </div>
                  <p className="text-xs text-blue-800/70">Ajustamos o enquadramento focando no rosto para garantir máxima visibilidade.</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-3 text-blue-600">
                    <Check size={20} />
                    <h5 className="font-bold">Iluminação Estúdio</h5>
                  </div>
                  <p className="text-xs text-blue-800/70">A IA corrige sombras e brilhos indesejados criando um visual de estúdio profissional.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 w-full mt-12 max-w-sm">
              <button onClick={() => setState({ ...state, currentStep: 2 })} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-xl font-bold">Voltar</button>
              <button onClick={() => setState({ ...state, currentStep: 4 })} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold">Gerar CV Final</button>
            </div>
          </div>
        )}

        {/* STEP 4: EXPORT */}
        {state.currentStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <LayoutTemplate size={20} className="text-blue-600" /> Escolha o Template
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { id: 'classic', label: 'Clássico', desc: 'Sério e tradicional' },
                    { id: 'modern', label: 'Moderno', desc: 'Minimalista e elegante' },
                    { id: 'creative', label: 'Criativo', desc: 'Ousado e vibrante' }
                  ].map(tmpl => (
                    <button
                      key={tmpl.id}
                      onClick={() => setState({ ...state, template: tmpl.id as TemplateType })}
                      className={`
                        p-4 rounded-2xl border-2 text-left transition-all
                        ${state.template === tmpl.id ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 hover:border-slate-200'}
                      `}
                    >
                      <div className="font-bold text-slate-800">{tmpl.label}</div>
                      <div className="text-xs text-slate-500">{tmpl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-3xl text-white space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <DownloadCloud size={20} /> Exportar Arquivo
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={exportAsImage}
                    className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all"
                  >
                    <FileImage size={24} className="text-blue-400" />
                    <span className="text-[10px] uppercase tracking-wide">PNG</span>
                  </button>
                  
                  <button 
                    onClick={() => window.print()}
                    className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all"
                  >
                    <File size={24} className="text-red-400" />
                    <span className="text-[10px] uppercase tracking-wide">PDF</span>
                  </button>

                  <button 
                    onClick={exportAsDocx}
                    className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-bold flex flex-col items-center justify-center gap-2 transition-all"
                  >
                    <FileText size={24} className="text-blue-600" />
                    <span className="text-[10px] uppercase tracking-wide">DOCX</span>
                  </button>
                </div>
                
                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  Para PDF de alta qualidade, selecione "Salvar como PDF" na janela de impressão.
                </p>
              </div>

              <button 
                onClick={() => setState({ ...state, currentStep: 1, resumeData: INITIAL_RESUME })}
                className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw size={18} /> Criar um Novo
              </button>
            </div>

            <div className="lg:col-span-8">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resultado Final</span>
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold uppercase">Otimizado para ATS</span>
              </div>
              <div className="resume-shadow overflow-hidden rounded-xl bg-white">
                <TemplateRenderer data={state.resumeData} template={state.template} containerId="final-resume" />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-10 px-6 border-t bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Sparkles size={16} />
            <span className="text-sm font-bold">Powered by Gemini AI Engine</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Dicas de Carreira</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Modelos</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacidade</a>
          </div>
          <p className="text-xs text-slate-400">© 2024 CVGenius. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
