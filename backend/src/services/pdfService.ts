import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { IAssignment, IGeneratedPaper } from '../types';

export const generatePdf = (paper: IGeneratedPaper, assignment: IAssignment, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(res);

  // School Header
  doc.font('Times-Bold').fontSize(16).text('Delhi Public School, Sector-4, Bokaro', { align: 'center' });
  doc.fontSize(12).text(`Subject: ${assignment.subject}`, { align: 'center' });
  doc.font('Times-Roman').fontSize(10).text('Class: 5th', { align: 'center' });
  doc.moveDown();

  // Time & Marks
  doc.fontSize(10);
  doc.text('Time Allowed: 45 minutes', 50, doc.y, { continued: true });
  doc.text(`Maximum Marks: ${paper.totalMarks}`, { align: 'right' });
  doc.moveDown();

  doc.font('Times-Italic').text('All questions are compulsory unless stated otherwise.', { align: 'center' });
  doc.moveDown();

  // Student Info lines
  doc.font('Times-Roman');
  doc.text('Name: ________________________________', 50);
  doc.moveDown(0.5);
  doc.text('Roll Number: ___________', 50);
  doc.moveDown(0.5);
  doc.text('Class: 5th Section: ___________', 50);
  doc.moveDown();

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  // Sections
  paper.sections.forEach((section, index) => {
    const sectionLetter = String.fromCharCode(65 + index);
    
    doc.font('Times-Bold').fontSize(12).text(`Section ${sectionLetter}`, { align: 'center' });
    doc.fontSize(10).text(section.instruction || section.questionType);
    doc.font('Times-Italic').text(`Attempt all questions. Each question carries ${section.questions[0]?.marks || 0} marks`);
    doc.moveDown();

    section.questions.forEach((q) => {
      doc.font('Times-Bold').text(`${q.questionNumber}. `, { continued: true });
      doc.font('Times-Roman').text(q.text, { continued: true });
      doc.text(` [${q.marks}]`, { align: 'right' });
      
      if (q.options && q.options.length > 0) {
        doc.moveDown(0.5);
        q.options.forEach((opt, optIdx) => {
          doc.text(`  (${String.fromCharCode(97 + optIdx)}) ${opt}`, { continued: optIdx % 2 === 0 });
        });
      }
      doc.moveDown();
    });
    doc.moveDown();
  });

  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();
  doc.font('Times-Bold').text('End of Question Paper', { align: 'center' });

  // Add new page for Answer Key if needed
  if (paper.answerKey && paper.answerKey.length > 0) {
    doc.addPage();
    doc.font('Times-Bold').fontSize(14).text('Answer Key', { align: 'center' });
    doc.moveDown();
    doc.font('Times-Roman').fontSize(10);
    paper.answerKey.forEach(key => {
      doc.text(`${key.questionNumber}. ${key.answer}`);
      doc.moveDown(0.5);
    });
  }

  doc.end();
  return doc;
};
