
// Fixed: Added missing React import to resolve 'Cannot find namespace React' error
import React from 'react';
import { ResumeData, TemplateType } from '../types';
import { Mail, Phone, MapPin } from 'lucide-react';

interface Props {
  data: ResumeData;
  template: TemplateType;
  containerId: string;
}

const TemplateRenderer: React.FC<Props> = ({ data, template, containerId }) => {
  const { fullName, jobTitle, summary, experiences, education, skills, contact, photoUrl } = data;

  // Largura fixa de 800px é fundamental para o export e para a escala responsiva funcionar
  const containerClass = "bg-white min-h-[1056px] w-[800px] shadow-2xl mx-auto overflow-hidden text-left";

  const renderClassic = () => (
    <div id={containerId} className={`${containerClass} p-12 text-slate-800 leading-relaxed`}>
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
    <div id={containerId} className={`${containerClass} flex`}>
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
        <section className="mb-10 text-left">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-1">Perfil</h2>
          <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
        </section>
        <section className="mb-10 text-left">
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
        <section className="text-left">
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
    <div id={containerId} className={`${containerClass} p-12 relative`}>
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
          <section className="mb-10 text-left">
            <h2 className="text-2xl font-black text-indigo-900 mb-4 inline-block border-b-4 border-indigo-200">Sobre Mim</h2>
            <p className="text-slate-600">{summary}</p>
          </section>
          <section className="text-left">
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
        <div className="col-span-4 flex flex-col gap-10 text-left">
          <section>
            <h2 className="text-xl font-black text-indigo-900 mb-4">Skills</h2>
            <div className="flex flex-col gap-2">
              {skills.map((skill, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">{skill}</span>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${60 + (i * 5) % 40}%` }} />
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

  const renderMinimalist = () => (
    <div id={containerId} className={`${containerClass} p-16 font-light`}>
      <header className="text-center border-b border-slate-200 pb-10 mb-10">
        <h1 className="text-4xl tracking-[0.2em] uppercase mb-3">{fullName}</h1>
        <p className="text-sm tracking-widest text-slate-500 uppercase mb-6">{jobTitle}</p>
        <div className="flex justify-center gap-6 text-xs text-slate-400">
           {contact.email && <span>{contact.email}</span>}
           {contact.phone && <span>{contact.phone}</span>}
           {contact.location && <span>{contact.location}</span>}
        </div>
      </header>
      <section className="mb-10 text-center max-w-lg mx-auto">
        <p className="leading-relaxed text-slate-600">{summary}</p>
      </section>
      <div className="grid grid-cols-1 gap-12 text-left">
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-center mb-8 text-slate-400">Experiência</h2>
          {experiences.map((exp, i) => (
            <div key={i} className="mb-8 grid grid-cols-4 gap-4">
               <div className="col-span-1 text-right">
                  <span className="text-xs font-bold block">{exp.period}</span>
               </div>
               <div className="col-span-3 border-l border-slate-100 pl-6">
                  <h3 className="font-medium text-lg mb-1">{exp.position}</h3>
                  <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">{exp.company}</div>
                  <p className="text-sm text-slate-600">{exp.description}</p>
               </div>
            </div>
          ))}
        </section>
        <section>
             <h2 className="text-xs font-bold uppercase tracking-widest text-center mb-8 text-slate-400">Skills & Educação</h2>
             <div className="flex flex-wrap justify-center gap-3 mb-8">
                {skills.map((skill, i) => (
                   <span key={i} className="border rounded-full px-4 py-1 text-xs">{skill}</span>
                ))}
             </div>
             <div className="grid grid-cols-2 gap-4 text-center">
                {education.map((edu, i) => (
                   <div key={i}>
                      <div className="font-medium">{edu.degree}</div>
                      <div className="text-xs text-slate-500">{edu.institution}</div>
                   </div>
                ))}
             </div>
        </section>
      </div>
    </div>
  );

  const renderExecutive = () => (
    <div id={containerId} className={`${containerClass}`}>
       <header className="bg-slate-800 text-white p-12 text-left">
          <div className="flex justify-between items-end">
             <div>
                <h1 className="text-4xl font-serif font-bold mb-2">{fullName}</h1>
                <p className="text-blue-200 font-medium tracking-wide uppercase text-sm">{jobTitle}</p>
             </div>
             <div className="text-right text-sm text-slate-300 leading-relaxed">
                <div>{contact.email}</div>
                <div>{contact.phone}</div>
                <div>{contact.location}</div>
             </div>
          </div>
       </header>
       <div className="p-12 grid grid-cols-3 gap-10">
          <div className="col-span-2 text-left">
             <section className="mb-8">
                <h2 className="font-serif font-bold text-xl text-slate-800 mb-4 border-b-2 border-slate-800 pb-2">Perfil</h2>
                <p className="text-slate-600 leading-relaxed">{summary}</p>
             </section>
             <section>
                <h2 className="font-serif font-bold text-xl text-slate-800 mb-6 border-b-2 border-slate-800 pb-2">Experiência</h2>
                {experiences.map((exp, i) => (
                   <div key={i} className="mb-6">
                      <div className="flex justify-between items-baseline mb-1">
                         <h3 className="font-bold text-lg">{exp.position}</h3>
                         <span className="text-sm font-bold text-slate-500">{exp.period}</span>
                      </div>
                      <div className="text-blue-800 font-medium text-sm mb-2">{exp.company}</div>
                      <p className="text-slate-600 text-sm">{exp.description}</p>
                   </div>
                ))}
             </section>
          </div>
          <div className="col-span-1 bg-slate-50 p-6 rounded-lg h-fit text-left">
              <section className="mb-8">
                 <h2 className="font-bold uppercase tracking-wider text-sm mb-4 text-slate-800">Educação</h2>
                 {education.map((edu, i) => (
                    <div key={i} className="mb-4">
                       <div className="font-bold text-sm">{edu.degree}</div>
                       <div className="text-xs text-slate-500">{edu.institution}</div>
                       <div className="text-xs text-slate-400">{edu.year}</div>
                    </div>
                 ))}
              </section>
              <section>
                 <h2 className="font-bold uppercase tracking-wider text-sm mb-4 text-slate-800">Competências</h2>
                 <div className="flex flex-col gap-2">
                    {skills.map((skill, i) => (
                       <span key={i} className="text-sm border-b border-slate-200 pb-1">{skill}</span>
                    ))}
                 </div>
              </section>
          </div>
       </div>
    </div>
  );

  const renderTech = () => (
     <div id={containerId} className={`${containerClass} bg-slate-900 text-slate-300 font-mono p-10`}>
        <header className="border-b border-green-500/30 pb-8 mb-8 flex justify-between items-start text-left">
           <div>
              <h1 className="text-4xl font-bold text-green-400 mb-2">{`{ ${fullName} }`}</h1>
              <p className="text-xl text-white">{`> ${jobTitle}`}</p>
           </div>
           <div className="text-right text-xs text-green-500/80">
              <div>{contact.email}</div>
              <div>{contact.location}</div>
              <div>{contact.phone}</div>
           </div>
        </header>
        <div className="grid grid-cols-12 gap-8 text-left">
           <div className="col-span-8">
              <section className="mb-8">
                 <h2 className="text-green-400 font-bold mb-4">/* RESUMO */</h2>
                 <p className="text-sm leading-relaxed text-slate-400">{summary}</p>
              </section>
              <section>
                 <h2 className="text-green-400 font-bold mb-6">/* EXPERIÊNCIA */</h2>
                 {experiences.map((exp, i) => (
                    <div key={i} className="mb-8 border-l-2 border-slate-700 pl-4 relative">
                       <div className="absolute -left-[9px] top-0 w-4 h-4 bg-slate-900 border-2 border-green-500 rounded-full"></div>
                       <div className="flex justify-between items-center mb-1">
                          <h3 className="text-white font-bold">{exp.position}</h3>
                          <span className="text-xs text-green-500">{exp.period}</span>
                       </div>
                       <div className="text-sm text-slate-500 mb-2">@ {exp.company}</div>
                       <p className="text-sm text-slate-400">{exp.description}</p>
                    </div>
                 ))}
              </section>
           </div>
           <div className="col-span-4">
              <section className="mb-8">
                 <h2 className="text-green-400 font-bold mb-4">/* SKILLS */</h2>
                 <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                       <span key={i} className="bg-slate-800 text-green-300 text-xs px-2 py-1 rounded border border-slate-700">{skill}</span>
                    ))}
                 </div>
              </section>
              <section>
                 <h2 className="text-green-400 font-bold mb-4">/* EDUCAÇÃO */</h2>
                  {education.map((edu, i) => (
                    <div key={i} className="mb-4">
                       <div className="text-white text-sm">{edu.degree}</div>
                       <div className="text-xs text-slate-500">{edu.institution}</div>
                       <div className="text-xs text-slate-600">{edu.year}</div>
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
    case 'minimalist': return renderMinimalist();
    case 'executive': return renderExecutive();
    case 'tech': return renderTech();
    case 'classic': default: return renderClassic();
  }
};

export default TemplateRenderer;
