
import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight, Star, FileText, Zap, Shield, CheckCheck, X } from 'lucide-react';
import TemplateRenderer from './TemplateRenderer';
import { ResumeData } from '../types';

interface LandingPageProps {
  onStart: () => void;
  onLogin: () => void;
}

const MOCK_RESUME: ResumeData = {
  fullName: 'Alexandre Silva',
  jobTitle: 'Desenvolvedor Full Stack',
  summary: 'Especialista em criar soluções web escaláveis com 5 anos de experiência em React, Node.js e arquitetura em nuvem. Foco em performance e experiência do usuário. Apaixonado por código limpo e metodologias ágeis, com histórico comprovado de entrega de projetos complexos no prazo.',
  contact: {
    email: 'alexandre.silva@email.com',
    phone: '(11) 98765-4321',
    location: 'São Paulo, SP',
    linkedin: 'linkedin.com/in/alexandresilva'
  },
  experiences: [
    {
      company: 'Tech Solutions SA',
      position: 'Engenheiro de Software Sênior',
      period: '2020 - Presente',
      description: 'Liderou a migração de um monólito legado para uma arquitetura de microsserviços utilizando Node.js e Docker, reduzindo o tempo de carregamento em 40% e os custos de infraestrutura em 25%. Mentoria de desenvolvedores juniores e implementação de CI/CD.'
    },
    {
      company: 'InovaWeb',
      position: 'Desenvolvedor Front-end Pleno',
      period: '2018 - 2020',
      description: 'Desenvolvimento de interfaces responsivas e acessíveis utilizando React, Redux e Tailwind CSS. Aumento de 30% na conversão de usuários após o redesign do fluxo de checkout. Integração com APIs RESTful e GraphQL.'
    },
    {
      company: 'Agência Digital X',
      position: 'Desenvolvedor Web Júnior',
      period: '2016 - 2018',
      description: 'Criação de landing pages e e-commerces usando WordPress e JavaScript puro. Otimização de SEO e performance web.'
    }
  ],
  education: [
    {
      institution: 'Universidade de São Paulo (USP)',
      degree: 'Bacharelado em Ciência da Computação',
      year: '2014 - 2018'
    },
    {
      institution: 'Tech Academy',
      degree: 'Bootcamp Arquitetura Cloud (AWS)',
      year: '2019'
    }
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'UI/UX', 'GraphQL', 'CI/CD', 'Jest', 'PostgreSQL'],
  tone: 'modern',
  length: 'full'
};

const templatesList = [
  { id: 'modern', name: 'Moderno', desc: 'Ideal para startups e empresas de tecnologia.', color: 'bg-blue-500' },
  { id: 'classic', name: 'Clássico', desc: 'O padrão ouro para áreas tradicionais e corporativas.', color: 'bg-slate-800' },
  { id: 'creative', name: 'Criativo', desc: 'Destaque-se em vagas de design, marketing e publicidade.', color: 'bg-purple-500' },
  { id: 'minimalist', name: 'Minimalista', desc: 'Foco total no conteúdo com design limpo e direto.', color: 'bg-emerald-500' },
  { id: 'executive', name: 'Executivo', desc: 'Para cargos de liderança, gerência e diretoria.', color: 'bg-amber-600' },
  { id: 'tech', name: 'Tech', desc: 'Visual escuro inspirado em editores de código.', color: 'bg-indigo-500' },
];

const testimonials = [
  {
    id: 1,
    name: "João P.",
    time: "10:42",
    message: "Consegui minha primeira entrevista em meses! O modelo executivo ficou perfeito para a minha área. Valeu cada centavo do plano básico! 🙏",
    avatar: "https://picsum.photos/seed/joao/100/100"
  },
  {
    id: 2,
    name: "Mariana S.",
    time: "14:15",
    message: "Gente, a IA reescreveu minhas experiências de um jeito que eu pareço a CEO da empresa kkkk brincadeiras à parte, ficou muito profissional. Recomendo!",
    avatar: "https://picsum.photos/seed/mariana/100/100"
  },
  {
    id: 3,
    name: "Carlos E.",
    time: "09:30",
    message: "Usei a função de foto profissional e tirou o fundo do meu quarto bagunçado perfeitamente. O currículo ficou com cara de gringo. 🚀",
    avatar: "https://picsum.photos/seed/carlos/100/100"
  },
  {
    id: 4,
    name: "Ana C.",
    time: "16:20",
    message: "Comprei o pacote de 10 currículos porque tô atirando pra todo lado. Já tive retorno de 3 empresas essa semana. O sistema ATS leu tudo direitinho!",
    avatar: "https://picsum.photos/seed/ana/100/100"
  },
  {
    id: 5,
    name: "Rafael T.",
    time: "11:05",
    message: "Eu não sabia o que colocar no resumo, gravei um áudio de 2 minutos falando da minha vida e a IA montou um texto impecável. Assustador de bom.",
    avatar: "https://picsum.photos/seed/rafael/100/100"
  },
  {
    id: 6,
    name: "Beatriz L.",
    time: "18:50",
    message: "Muito fácil de usar. Fiz pelo celular mesmo enquanto voltava do trabalho no ônibus. Cheguei em casa e já mandei o PDF pra vaga. 😍",
    avatar: "https://picsum.photos/seed/beatriz/100/100"
  }
];

const ScaledPreview: React.FC<{ templateId: string, maxScale?: number }> = ({ templateId, maxScale }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState(1123);

  React.useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        let newScale = containerWidth / 794;
        if (maxScale && newScale > maxScale) {
          newScale = maxScale;
        }
        setScale(newScale);
        
        // Use a small timeout to let the content render and get its actual height
        setTimeout(() => {
          if (contentRef.current) {
            const contentHeight = Math.max(contentRef.current.offsetHeight, 1123);
            setHeight(contentHeight * newScale);
          }
        }, 50);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [templateId, maxScale]);

  return (
    <div ref={containerRef} className="w-full relative overflow-hidden rounded-sm shadow-md flex justify-center" style={{ height: `${height}px` }}>
      <div 
        ref={contentRef}
        className="absolute top-0 origin-top pointer-events-none" 
        style={{ transform: `scale(${scale})`, width: '794px' }}
      >
        <TemplateRenderer data={MOCK_RESUME} template={templateId as any} containerId={`mock-${templateId}`} />
      </div>
    </div>
  );
};

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
            <Sparkles className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight">CVGenius</span>
        </div>
        <button 
          onClick={onLogin}
          className="px-6 py-2.5 rounded-full font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Entrar
        </button>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 pt-4 pb-24 lg:pt-8 lg:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-6 border border-blue-100">
          <Star size={16} className="fill-blue-700" />
          <span>Mais de 10.000 currículos gerados</span>
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-10 max-w-4xl mx-auto leading-[1.1]">
          Crie seu Currículo Profissional em <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Minutos com IA</span>
        </h1>

        {/* VSL Video */}
        <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 mb-10">
          {/* @ts-ignore */}
          <wistia-player media-id="tkdrqypnx7" aspect="1.7777777777777777"></wistia-player>
        </div>

        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Aumente suas chances de contratação com um currículo otimizado, moderno e aprovado por recrutadores. Teste grátis agora mesmo.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={onStart}
            className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            Criar Currículo Grátis <ArrowRight size={20} />
          </button>
          <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 transition-all">
            Ver Modelos
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-white py-24 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold">IA que escreve por você</h3>
              <p className="text-slate-500 leading-relaxed">
                Não sabe o que escrever? Nossa inteligência artificial cria descrições de impacto para suas experiências e resumo.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-bold">Modelos Premium</h3>
              <p className="text-slate-500 leading-relaxed">
                Templates modernos, minimalistas e executivos desenhados para passar pelos sistemas de triagem automática (ATS).
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold">Análise de Foto</h3>
              <p className="text-slate-500 leading-relaxed">
                Transforme sua selfie em uma foto profissional de estúdio automaticamente com nossa tecnologia de edição.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Modelos que Impressionam</h2>
            <p className="text-slate-500 text-lg">Escolha entre 6 designs otimizados para sistemas de triagem (ATS) e recrutadores.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {templatesList.map((tpl) => (
              <div key={tpl.id} className="group cursor-pointer" onClick={() => setPreviewTemplate(tpl.id)}>
                <div className="bg-slate-50 p-6 rounded-3xl mb-4 border border-slate-100 group-hover:border-blue-200 group-hover:shadow-xl group-hover:shadow-blue-100 transition-all duration-300">
                  <div className="transform group-hover:-translate-y-2 transition-transform duration-300 border border-slate-200/50 w-full">
                    <ScaledPreview templateId={tpl.id} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${tpl.color}`}></span>
                  {tpl.name}
                </h3>
                <p className="text-slate-500 text-sm">{tpl.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <button onClick={onStart} className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 transition-all inline-flex items-center gap-2 shadow-xl shadow-slate-200">
              Testar Modelos Agora <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">O que dizem nossos usuários</h2>
            <p className="text-slate-500 text-lg">Histórias reais de quem transformou o currículo com a nossa IA.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-[#E5DDD5] p-4 rounded-3xl shadow-sm relative overflow-hidden flex flex-col justify-end min-h-[160px]">
                {/* Background Pattern (Optional subtle overlay) */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
                
                <div className="flex gap-3 relative z-10">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" 
                    referrerPolicy="no-referrer" 
                  />
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm relative flex-1">
                    {/* Tail */}
                    <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
                    
                    <p className="text-[#075E54] font-bold text-xs mb-1">{testimonial.name}</p>
                    <p className="text-slate-800 text-sm leading-relaxed">{testimonial.message}</p>
                    
                    <div className="flex justify-end items-center gap-1 mt-1">
                      <span className="text-slate-400 text-[10px]">{testimonial.time}</span>
                      <CheckCheck size={14} className="text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Planos Acessíveis para sua Carreira</h2>
          <p className="text-slate-500 text-lg">Comece grátis e pague apenas quando estiver pronto para baixar.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Básico</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-sm font-semibold text-slate-500">R$</span>
              <span className="text-5xl font-extrabold text-slate-900">5</span>
              <span className="text-sm font-semibold text-slate-500">,00</span>
            </div>
            <p className="text-slate-500 mb-8 text-sm">Para quem precisa de um currículo rápido e eficiente.</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-700">
                <Check size={18} className="text-green-500 flex-shrink-0" />
                <span>1 Currículo Profissional</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check size={18} className="text-green-500 flex-shrink-0" />
                <span>Exportação em PDF e PNG</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check size={18} className="text-green-500 flex-shrink-0" />
                <span>Acesso a todos os modelos</span>
              </li>
            </ul>
            <button onClick={onStart} className="w-full py-4 rounded-xl border-2 border-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors">
              Começar Agora
            </button>
          </div>

          {/* Pro Plan - Highlighted */}
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-900 shadow-2xl transform md:-translate-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">MAIS POPULAR</div>
            <h3 className="text-xl font-bold text-white mb-2">Profissional</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-sm font-semibold text-slate-400">R$</span>
              <span className="text-5xl font-extrabold text-white">9</span>
              <span className="text-sm font-semibold text-slate-400">,90</span>
            </div>
            <p className="text-slate-400 mb-8 text-sm">Ideal para quem está aplicando para diferentes vagas.</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-white">
                <div className="bg-blue-600 rounded-full p-0.5"><Check size={14} className="text-white flex-shrink-0" /></div>
                <span>4 Currículos Diferentes</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="bg-blue-600 rounded-full p-0.5"><Check size={14} className="text-white flex-shrink-0" /></div>
                <span>IA Geradora de Conteúdo</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="bg-blue-600 rounded-full p-0.5"><Check size={14} className="text-white flex-shrink-0" /></div>
                <span>Edição de Foto com IA</span>
              </li>
              <li className="flex items-center gap-3 text-white">
                <div className="bg-blue-600 rounded-full p-0.5"><Check size={14} className="text-white flex-shrink-0" /></div>
                <span>Sem marca d'água</span>
              </li>
            </ul>
            <button onClick={onStart} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50">
              Escolher Plano
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Premium</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-sm font-semibold text-slate-500">R$</span>
              <span className="text-5xl font-extrabold text-slate-900">19</span>
              <span className="text-sm font-semibold text-slate-500">,90</span>
            </div>
            <p className="text-slate-500 mb-8 text-sm">Pacote completo para recolocação profissional.</p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-700">
                <Check size={18} className="text-green-500 flex-shrink-0" />
                <span>10 Currículos Personalizados</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check size={18} className="text-green-500 flex-shrink-0" />
                <span>Prioridade no Suporte</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check size={18} className="text-green-500 flex-shrink-0" />
                <span>Dicas de Otimização ATS</span>
              </li>
            </ul>
            <button onClick={onStart} className="w-full py-4 rounded-xl border-2 border-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-colors">
              Começar Agora
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12 border-t border-slate-200 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} CVGenius. Todos os direitos reservados.</p>
      </footer>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-slate-100 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 lg:p-6 bg-white border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">
                {templatesList.find(t => t.id === previewTemplate)?.name}
              </h3>
              <button 
                onClick={() => setPreviewTemplate(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 lg:p-8 flex justify-center bg-slate-200">
              <div className="w-full max-w-[794px]">
                <ScaledPreview templateId={previewTemplate} maxScale={1} />
              </div>
            </div>

            <div className="p-4 lg:p-6 bg-white border-t border-slate-200 flex justify-end">
              <button 
                onClick={onStart}
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                Usar este modelo <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
