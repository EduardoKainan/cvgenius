import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, Plus, LogOut, Clock, Edit } from 'lucide-react';
import { ResumeData } from '../types';

interface DashboardProps {
  onNewResume: () => void;
  onEditResume: (id: string, data: ResumeData) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNewResume, onEditResume }) => {
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch credits
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', session.user.id)
          .single();
        
        if (profile) setCredits(profile.credits);

        // Fetch resumes
        const { data: resumesData } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false });
        
        if (resumesData) setResumes(resumesData);
      }
      setLoading(false);
    };

    fetchUserAndData();
  }, []);

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
      
      // Fetch user again to update state
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Fetch credits
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', session.user.id)
          .single();
        
        if (profile) setCredits(profile.credits);

        // Fetch resumes
        const { data: resumesData } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false });
        
        if (resumesData) setResumes(resumesData);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro na autenticação');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">{authMode === 'signup' ? 'Crie sua conta' : 'Acesse sua conta'}</h2>
          <p className="text-slate-500 text-center mb-8">Para acessar seus currículos e créditos.</p>
          
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
              {authLoading ? 'Aguarde...' : (authMode === 'signup' ? 'Criar Conta' : 'Entrar')}
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
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-xl">
            <FileText className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight">Minha Conta</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
            <span className="text-sm text-slate-500">Créditos:</span>
            <span className="font-bold text-blue-600">{credits}</span>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors">
            <LogOut size={20} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meus Currículos</h1>
            <p className="text-slate-500">Gerencie e edite seus currículos salvos.</p>
          </div>
          <button 
            onClick={onNewResume}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200 transition-all"
          >
            <Plus size={20} /> Novo Currículo
          </button>
        </div>

        {resumes.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={32} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum currículo encontrado</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Você ainda não salvou nenhum currículo. Crie seu primeiro currículo agora mesmo.</p>
            <button 
              onClick={onNewResume}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-colors"
            >
              Criar Meu Primeiro Currículo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-200 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider">
                    {resume.template}
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-1 truncate" title={resume.title}>{resume.title}</h3>
                <p className="text-sm text-slate-500 mb-6 flex items-center gap-1">
                  <Clock size={14} /> Atualizado em {new Date(resume.updated_at).toLocaleDateString('pt-BR')}
                </p>
                <button 
                  onClick={() => onEditResume(resume.id, resume.data)}
                  className="w-full py-2.5 bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                >
                  <Edit size={18} /> Editar Currículo
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
