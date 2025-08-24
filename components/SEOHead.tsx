import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

// Page-specific SEO data mapping
const pagesSEOData: Record<string, SEOHeadProps> = {
  '/': {
    title: 'ATPL Exam Preparation - 14 EASA ATPL Subjects | Eatpl.in',
    description: 'Master all 14 EASA ATPL subjects with 10,000+ practice questions. Comprehensive airline transport pilot license exam preparation with real exam conditions and detailed explanations.',
    keywords: 'ATPL exam, airline transport pilot license, EASA ATPL, aviation training, pilot exam preparation, flight training'
  },
  '/subjects/': {
    title: 'ATPL Subjects - Choose Your Training Module | Eatpl.in',
    description: 'Select from 14 comprehensive ATPL subject modules including Radio Navigation, Instruments, Performance, Meteorology, and more. Start your pilot training journey.',
    keywords: 'ATPL subjects, flight training modules, aviation subjects, pilot training'
  },
  '/radio-navigation/': {
    title: 'Radio Navigation ATPL Training | Eatpl.in',
    description: 'Master Radio Navigation for your ATPL exam with comprehensive question banks from Oxford, Keith Williams, and Indigo. Practice with real exam questions.',
    keywords: 'radio navigation, ATPL radio navigation, aviation navigation, VHF, ADF, GPS navigation'
  },
  '/chapterwise-questions-oxford/': {
    title: 'Oxford Radio Navigation Chapters - ATPL Questions | Eatpl.in',
    description: 'Practice Radio Navigation chapters including Radio Waves, Propagation, Modulation, Antennae, Doppler, and VDF with Oxford question bank.',
    keywords: 'oxford radio navigation, radio waves, propagation, modulation, antennae, doppler, VDF'
  },
  '/radio-waves/': {
    title: 'Radio Waves ATPL Questions & Practice Test | Eatpl.in',
    description: 'Practice Radio Waves questions for ATPL exam. Comprehensive MCQ test with detailed explanations and real exam conditions.',
    keywords: 'radio waves, electromagnetic waves, frequency, wavelength, ATPL radio waves'
  },
  '/question-bank': {
    title: 'ATPL Question Bank - 10,000+ Practice Questions | Eatpl.in',
    description: 'Access comprehensive ATPL question bank with over 10,000 questions covering all 14 EASA subjects. Practice with real exam conditions.',
    keywords: 'ATPL question bank, aviation questions, pilot exam questions, EASA questions'
  },
  '/airline-interviews': {
    title: 'Airline Interview Preparation & Simulator Training | Eatpl.in',
    description: 'Prepare for airline interviews with technical knowledge, simulator assessments, behavioral interviews, and company-specific training.',
    keywords: 'airline interview, pilot interview, simulator training, airline assessment'
  }
};

export function SEOHead({ title, description, keywords, image, url, type = 'website' }: SEOHeadProps) {
  const [location] = useLocation();
  
  // Get page-specific SEO data or use provided props
  const pageSEO = pagesSEOData[location] || {};
  const finalTitle = title || pageSEO.title || 'ATPL Exam Preparation | Eatpl.in';
  const finalDescription = description || pageSEO.description || 'Master EASA ATPL subjects with comprehensive practice questions and real exam conditions.';
  const finalKeywords = keywords || pageSEO.keywords || 'ATPL, aviation training, pilot exam';
  const finalImage = image || pageSEO.image || 'https://eatpl.in/og-image.jpg';
  const finalUrl = url || `https://eatpl.in${location}`;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };
    
    // Update link tags
    const updateLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      
      element.setAttribute('href', href);
    };

    // Basic meta tags
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('robots', 'index, follow');
    
    // Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('og:url', finalUrl, true);
    updateMetaTag('og:site_name', 'Eatpl.in', true);
    
    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', finalTitle, true);
    updateMetaTag('twitter:description', finalDescription, true);
    updateMetaTag('twitter:image', finalImage, true);
    updateMetaTag('twitter:url', finalUrl, true);
    
    // Canonical URL
    updateLinkTag('canonical', finalUrl);
    
  }, [finalTitle, finalDescription, finalKeywords, finalImage, finalUrl, type]);

  return null;
}

// Structured Data Component
export function StructuredData() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Base organization data
    const organizationData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Eatpl.in",
      "url": "https://eatpl.in",
      "description": "Comprehensive ATPL exam preparation platform with 10,000+ practice questions covering all 14 EASA subjects",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "url": "https://eatpl.in"
      }
    };
    
    let structuredData = organizationData;
    
    // Page-specific structured data
    if (location === '/') {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Eatpl.in",
        "url": "https://eatpl.in",
        "description": "ATPL Exam Preparation Platform with 14 EASA Subjects",
        "publisher": organizationData,
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://eatpl.in/subjects/?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      } as any;
    } else if (location.includes('radio-waves') || location.includes('test')) {
      structuredData = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "Radio Waves ATPL Practice Test",
        "description": "Comprehensive Radio Waves practice questions for ATPL exam preparation",
        "provider": organizationData,
        "courseMode": "online",
        "educationalLevel": "Professional",
        "teaches": "Radio wave principles, electromagnetic theory, frequency and wavelength concepts for aviation"
      } as any;
    }
    
    // Add structured data to head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
  }, [location]);
  
  return null;
}