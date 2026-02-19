
export interface Experience {
  company: string;
  position: string;
  period: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface ResumeData {
  fullName: string;
  jobTitle: string;
  summary: string;
  experiences: Experience[];
  education: Education[];
  skills: string[];
  contact: {
    email: string;
    phone: string;
    linkedin?: string;
    location: string;
  };
  photoUrl?: string;
  tone: 'formal' | 'modern';
  length: 'short' | 'full';
}

export type TemplateType = 'classic' | 'modern' | 'creative' | 'minimalist' | 'executive' | 'tech';

export interface AppState {
  currentStep: number;
  resumeData: ResumeData;
  template: TemplateType;
  isProcessing: boolean;
  processingMessage: string;
}
