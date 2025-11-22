
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants/translations';

interface ResponseCardProps {
  rawText: string;
  language?: Language;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({ rawText, language = 'en' }) => {
  const t = TRANSLATIONS[language].common;

  // Basic parsing of the rigid structure: TITLE:, SUMMARY:, ADDITIONAL ADVICE:
  const parseResponse = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    let title = '';
    let summary: string[] = [];
    let additional: string[] = [];
    
    let currentSection = 'none';

    lines.forEach(line => {
      if (line.startsWith('TITLE:')) {
        title = line.replace('TITLE:', '').trim();
        currentSection = 'title';
      } else if (line.startsWith('SUMMARY:')) {
        currentSection = 'summary';
      } else if (line.startsWith('ADDITIONAL ADVICE:') || line.startsWith('OPTIONAL:')) {
        currentSection = 'additional';
      } else if (line.startsWith('-')) {
        const content = line.substring(1).trim();
        if (currentSection === 'summary') summary.push(content);
        if (currentSection === 'additional') additional.push(content);
      } else {
          // Handle lines that don't start with dash but are part of the content
          if (currentSection === 'summary' && summary.length > 0) {
             summary[summary.length - 1] += " " + line;
          } else if (currentSection === 'additional' && additional.length > 0) {
             additional[additional.length - 1] += " " + line;
          }
      }
    });

    return { title, summary, additional };
  };

  const { title, summary, additional } = parseResponse(rawText);

  // If parsing fails (e.g., simple chat response), fallback to plain text
  if (!title && summary.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 mb-4">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{rawText}</p>
        </div>
      )
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-md border border-emerald-100 mb-6 animate-fade-in">
      {title && (
        <h3 className="text-xl font-bold text-emerald-800 mb-4 pb-2 border-b border-emerald-50">
          {title}
        </h3>
      )}
      
      <div className="mb-4">
        <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">
          {t.insights}
        </h4>
        <ul className="space-y-2">
          {summary.map((point, idx) => (
            <li key={idx} className="flex items-start text-gray-700">
              <span className="mr-2 text-emerald-500 mt-1">•</span>
              <span className="flex-1">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {additional.length > 0 && (
        <div className="mt-4 bg-emerald-50 rounded-xl p-4">
          <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-2">
            {t.tips}
          </h4>
          <ul className="space-y-2">
            {additional.map((point, idx) => (
              <li key={idx} className="flex items-start text-gray-700 text-sm">
                <span className="mr-2 text-emerald-600 mt-1">→</span>
                <span className="flex-1">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
