
import React from 'react';
import { ResumeData, TemplateType } from '../types';
import { Mail, Phone, MapPin, Linkedin, Globe } from 'lucide-react';

interface Props {
  data: ResumeData;
  template: TemplateType;
  containerId: string;
}

const TemplateRenderer: React.FC<Props> = ({ data, template, containerId }) => {
  const { fullName, jobTitle, summary, experiences, education, skills, contact, photoUrl } = data;

  const renderClassic = () => (
    <div id={containerId} className="bg-white p-12 min-h-[1056px] text-slate-800 leading-relaxed max-w-[800px] mx-auto">
      <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-4xl font-serif font-bold tracking-tight uppercase">{fullName || 'Seu Nome'}</h1>
          <p className="text-xl text-slate-600 mt-1 font-medium">{jobTitle || 'Cargo Desejado'}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
            {contact.email && <span className="flex items-center gap-1"><Mail size={14} /> {contact.email}</span>}
            {contact.phone && <span className="flex items-center gap-1"><Phone size={14} /> {contact.phone}</span>}
            {contact.location && <span className="flex items-center gap-1"><MapPin size={14} /> {contact.location}</span>}
          </div>
        </div>
        {photoUrl && (
          <img src={photoUrl} className="w-32 h-32 rounded object-cover border border-slate-200" alt="Profile" />
        )}
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-bold border-b border-slate-200 mb-3 uppercase tracking-wider">Resumo Profissional</h2>
        <p className="text-sm text-slate-700">{summary}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold border-b border-slate-200 mb-4 uppercase tracking-wider">Experiência Profissional</h2>
        {experiences.map((exp, i) => (
          <div key={i} className="mb-5">
            <div className="flex justify-between font-bold text-slate-800">
              <span>{exp.position}</span>
              <span className="text-slate-500 text-sm">{exp.period}</span>
            </div>
            <div className="italic text-slate-600 mb-1">{exp.company}</div>
            <p className="text-sm text-slate-700">{exp.description}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-2 gap-8">
        <section>
          <h2 className="text-lg font-bold border-b border-slate-200 mb-3 uppercase tracking-wider">Educação</h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="font-bold text-sm">{edu.degree}</div>
              <div className="text-xs text-slate-600">{edu.institution} | {edu.year}</div>
            </div>
          ))}
        </section>
        <section>
          <h2 className="text-lg font-bold border-b border-slate-200 mb-3 uppercase tracking-wider">Habilidades</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded">{skill}</span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  const renderModern = () => (
    <div id={containerId} className="bg-white min-h-[1056px] text-slate-800 flex max-w-[800px] mx-auto overflow-hidden">
      <div className="w-1/3 bg-slate-900 text-slate-100 p-8 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          {photoUrl ? (
            <img src={photoUrl} className="w-32 h-32 rounded-full border-4 border-slate-800 object-cover shadow-lg" alt="Profile" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-4xl font-bold">{fullName?.charAt(0)}</span>
            </div>
          )}
          <div className="text-center">
            <h1 className="text-2xl font-bold leading-tight">{fullName}</h1>
            <p className="text-slate-400 text-sm">{jobTitle}</p>
          </div>
        </div>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Contato</h2>
          <div className="flex flex-col gap-3 text-sm text-slate-300">
             <div className="flex items-center gap-2"><Mail size={14} className="text-slate-500" /> {contact.email}</div>
             <div className="flex items-center gap-2"><Phone size={14} className="text-slate-500" /> {contact.phone}</div>
             <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-500" /> {contact.location}</div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-4">Habilidades</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="text-xs border border-slate-700 px-2 py-1 rounded">{skill}</span>
            ))}
          </div>
        </section>
      </div>

      <div className="flex-1 p-10 bg-slate-50">
        <section className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-1">Perfil</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-1">Experiência</h2>
          {experiences.map((exp, i) => (
            <div key={i} className="mb-6 relative pl-4 border-l-2 border-blue-100">
              <div className="absolute -left-[5px] top-1 w-2 h-2 bg-blue-500 rounded-full" />
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-slate-900">{exp.position}</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase">{exp.period}</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">{exp.company}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-1">Educação</h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-4">
              <h3 className="font-bold text-slate-800 text-sm">{edu.degree}</h3>
              <p className="text-xs text-slate-500">{edu.institution} | {edu.year}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );

  const renderCreative = () => (
    <div id={containerId} className="bg-white p-12 min-h-[1056px] text-slate-800 max-w-[800px] mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 -z-0" />
      
      <header className="relative z-10 mb-12 flex items-center gap-8">
        {photoUrl && <img src={photoUrl} className="w-32 h-32 rounded-2xl rotate-3 shadow-xl object-cover" alt="Profile" />}
        <div>
          <h1 className="text-5xl font-black text-indigo-900 leading-none">{fullName}</h1>
          <p className="text-xl text-indigo-500 font-medium mt-2">{jobTitle}</p>
          <div className="flex gap-4 mt-4 text-xs font-bold text-indigo-300">
            <span>{contact.email}</span>
            <span>•</span>
            <span>{contact.location}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-10 relative z-10">
        <div className="col-span-8">
          <section className="mb-10">
            <h2 className="text-2xl font-black text-indigo-900 mb-4 inline-block border-b-4 border-indigo-200">Sobre Mim</h2>
            <p className="text-slate-600">{summary}</p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-indigo-900 mb-6 inline-block border-b-4 border-indigo-200">Trajetória</h2>
            {experiences.map((exp, i) => (
              <div key={i} className="mb-8 group">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{exp.position}</h3>
                  <span className="text-xs font-bold bg-indigo-50 text-indigo-500 px-3 py-1 rounded-full">{exp.period}</span>
                </div>
                <p className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">{exp.company}</p>
                <p className="text-sm text-slate-600">{exp.description}</p>
              </div>
            ))}
          </section>
        </div>

        <div className="col-span-4 flex flex-col gap-10">
          <section>
            <h2 className="text-xl font-black text-indigo-900 mb-4">Skills</h2>
            <div className="flex flex-col gap-2">
              {skills.map((skill, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">{skill}</span>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-indigo-900 mb-4">Educação</h2>
            {education.map((edu, i) => (
              <div key={i} className="mb-4">
                <div className="text-sm font-bold text-indigo-600">{edu.degree}</div>
                <div className="text-xs text-slate-500">{edu.institution}</div>
                <div className="text-xs font-bold text-indigo-200 mt-1">{edu.year}</div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );

  switch (template) {
    case 'modern': return renderModern();
    case 'creative': return renderCreative();
    case 'classic': default: return renderClassic();
  }
};

export default TemplateRenderer;
