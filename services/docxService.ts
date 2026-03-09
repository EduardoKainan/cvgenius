import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '../types';

export const generateDocx = async (data: ResumeData) => {
  const { fullName, jobTitle, summary, experiences, education, skills, contact } = data;

  const contactInfo = [
    contact.email,
    contact.phone,
    contact.location
  ].filter(Boolean).join(' | ');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: fullName,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: jobTitle,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            text: contactInfo,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          
          // Summary
          ...(summary ? [
            new Paragraph({
              text: "Resumo Profissional",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              text: summary,
            }),
          ] : []),

          // Experience
          ...(experiences.length > 0 ? [
            new Paragraph({
              text: "Experiência Profissional",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),
            ...experiences.flatMap(exp => [
              new Paragraph({
                children: [
                  new TextRun({ text: exp.position, bold: true }),
                  new TextRun({ text: ` - ${exp.company}`, italics: true }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: exp.period, italics: true }),
                ],
                spacing: { after: 100 },
              }),
              new Paragraph({
                text: exp.description,
                spacing: { after: 200 },
              }),
            ]),
          ] : []),

          // Education
          ...(education.length > 0 ? [
            new Paragraph({
              text: "Educação",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),
            ...education.flatMap(edu => [
              new Paragraph({
                children: [
                  new TextRun({ text: edu.degree, bold: true }),
                  new TextRun({ text: ` - ${edu.institution}` }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: edu.year, italics: true }),
                ],
                spacing: { after: 200 },
              }),
            ]),
          ] : []),

          // Skills
          ...(skills.length > 0 ? [
            new Paragraph({
              text: "Habilidades",
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
              text: skills.join(', '),
            }),
          ] : []),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${fullName.replace(/\s+/g, '_')}_Curriculo.docx`);
};
