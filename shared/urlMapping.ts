// URL mapping configuration for SEO-friendly URLs

export const subjectUrlMapping = {
  'RADIO NAVIGATION': '/radio-navigation/',
  'INSTRUMENTS': '/instruments/',
  'PERFORMANCE': '/performance/',
  'METEOROLOGY': '/meteorology/',
  'TECHNICAL': '/technical/',
  'NAVIGATION': '/navigation/',
  'ATPL QUESTION BANK': '/atpl-question-bank/',
  'INDIGO QUESTION BANK (6000) JAA QB': '/indigo-question-bank/',
  'KEITH WILLIAMS': '/keith-williams/',
  'OX*O*D ALL SUBJECTS': '/oxford-all-subjects/',
  'REGULATIONS': '/regulations/',
  'AIRCRAFT SPECIFIC': '/aircraft-specific/',
  'MASS AND BALANCE': '/mass-and-balance/',
  'PREVIOUS ATTEMPT DGCA PAPERS': '/dgca-papers/',
  'AIRLINE WRITTEN EXAM PREVIOUS ATTEMPT': '/airline-exam-papers/',
  'AIRBUS 320': '/airbus-320/'
};

export const radioNavOptionsMapping = {
  'CHAPTERWISE QUESTIONS O#F#RD': '/chapterwise-questions-oxford/',
  'KIETH RADIO QB': '/keith-radio-qb/',
  'INDIGO RADIO NAV': '/indigo-radio-nav/'
};

export const chapterMapping = {
  'RADIO WAVES': '/radio-waves/',
  'PROPAGATION': '/propagation/',
  'MODULATION': '/modulation/',
  'ANTENNAE': '/antennae/',
  'DOPPLER': '/doppler/',
  'VDF': '/vdf/'
};

// Reverse mapping for finding components by URL
export const urlToComponentMapping = {
  '/subjects/': 'Subjects',
  '/radio-navigation/': 'RadioNavigation',
  '/chapterwise-questions-oxford/': 'ChapterwiseQuestions',
  '/radio-waves/': 'RadioWavesTest',
  '/keith-radio-qb/': 'NotFound', // Placeholder for future implementation
  '/indigo-radio-nav/': 'NotFound', // Placeholder for future implementation
  '/propagation/': 'NotFound', // Placeholder for future implementation
  '/modulation/': 'NotFound', // Placeholder for future implementation
  '/antennae/': 'NotFound', // Placeholder for future implementation
  '/doppler/': 'NotFound', // Placeholder for future implementation
  '/vdf/': 'NotFound', // Placeholder for future implementation
  // Add more mappings as needed
};

// Helper functions
export const getSubjectUrl = (subjectName: string): string => {
  return subjectUrlMapping[subjectName as keyof typeof subjectUrlMapping] || '/subjects/';
};

export const getRadioNavOptionUrl = (optionName: string): string => {
  return radioNavOptionsMapping[optionName as keyof typeof radioNavOptionsMapping] || '/radio-navigation/';
};

export const getChapterUrl = (chapterName: string): string => {
  return chapterMapping[chapterName as keyof typeof chapterMapping] || '/chapterwise-questions-oxford/';
};