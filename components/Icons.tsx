import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

const IconWrapper: React.FC<IconProps & { children: React.ReactNode }> = ({ 
  size = 24, 
  className = '', 
  color = 'currentColor', 
  children 
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

// Core UI Icons
export const ChevronDown: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="m6 9 6 6 6-6" />
  </IconWrapper>
);

export const ChevronLeft: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="m15 18-6-6 6-6" />
  </IconWrapper>
);

export const ChevronRight: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="m9 18 6-6-6-6" />
  </IconWrapper>
);

export const ChevronUp: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="m18 15-6-6-6 6" />
  </IconWrapper>
);

export const X: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </IconWrapper>
);

export const Check: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M20 6 9 17l-5-5" />
  </IconWrapper>
);

export const Circle: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
  </IconWrapper>
);

export const Search: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </IconWrapper>
);

export const MoreHorizontal: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </IconWrapper>
);

export const ArrowLeft: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </IconWrapper>
);

export const ArrowRight: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </IconWrapper>
);

export const Dot: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12.1" cy="12.1" r="1" />
  </IconWrapper>
);

export const PanelLeft: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <path d="M9 3v18" />
  </IconWrapper>
);

export const GripVertical: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="19" r="1" />
  </IconWrapper>
);

// Theme Icons
export const Moon: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </IconWrapper>
);

export const Sun: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </IconWrapper>
);

// Aviation & Core App Icons
export const Plane: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4s-2 1-3.5 2.5L11 10l-8.2-1.8c-.5-.1-.9.1-1.1.5-.2.4-.1.9.3 1.2L9 12.5l-2.4 2.4L5 14l-1.5 1.5 3 1L8 19l1.5-1.5L9 16l2.4-2.4L18.5 21c.3.4.8.5 1.2.3.4-.2.6-.6.5-1.1Z" />
  </IconWrapper>
);

export const Rocket: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </IconWrapper>
);

export const Database: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5v14a9 3 0 0 0 18 0V5" />
    <path d="M3 12a9 3 0 0 0 18 0" />
  </IconWrapper>
);

export const Clock: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </IconWrapper>
);

export const Play: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <polygon points="5,3 19,12 5,21" />
  </IconWrapper>
);

export const Trophy: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </IconWrapper>
);

export const Flag: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
    <line x1="4" x2="4" y1="22" y2="3" />
  </IconWrapper>
);

// Business & Feature Icons
export const BarChart3: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </IconWrapper>
);

export const CheckCircle: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="M9 11l3 3L22 4" />
  </IconWrapper>
);

export const XCircle: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </IconWrapper>
);

export const MessageSquare: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </IconWrapper>
);

export const FileText: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </IconWrapper>
);

export const ThumbsUp: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M7 10v12" />
    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </IconWrapper>
);

export const ThumbsDown: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M17 14V2" />
    <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z" />
  </IconWrapper>
);

export const Send: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </IconWrapper>
);

export const MessageCircle: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </IconWrapper>
);

export const Users: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </IconWrapper>
);

export const BookOpen: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </IconWrapper>
);

export const Award: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="8" r="6" />
    <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-2.682-2.015-2.682 2.015a.5.5 0 0 1-.81-.47l1.515-8.526" />
  </IconWrapper>
);

export const Target: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </IconWrapper>
);

export const Monitor: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <rect width="20" height="14" x="2" y="3" rx="2" />
    <line x1="8" x2="16" y1="21" y2="21" />
    <line x1="12" x2="12" y1="17" y2="21" />
  </IconWrapper>
);

export const Settings: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </IconWrapper>
);

export const Zap: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
  </IconWrapper>
);

export const RotateCcw: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </IconWrapper>
);

export const Brain: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
    <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
    <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
    <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
    <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
    <path d="M6 18a4 4 0 0 1-1.967-.516" />
    <path d="M19.967 17.484A4 4 0 0 1 18 18" />
  </IconWrapper>
);

export const TrendingUp: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <polyline points="22,7 13.5,15.5 8.5,10.5 2,17" />
    <polyline points="16,7 22,7 22,13" />
  </IconWrapper>
);

export const Calendar: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </IconWrapper>
);

export const Video: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" />
    <rect x="2" y="6" width="14" height="12" rx="2" />
  </IconWrapper>
);

export const Star: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </IconWrapper>
);

export const Loader2: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </IconWrapper>
);

export const AlertCircle: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" x2="12" y1="8" y2="12" />
    <line x1="12" x2="12.01" y1="16" y2="16" />
  </IconWrapper>
);

export const Download: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7,10 12,15 17,10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </IconWrapper>
);

export const Eye: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </IconWrapper>
);

export const Edit: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </IconWrapper>
);

export const Smartphone: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
    <path d="M12 18h.01" />
  </IconWrapper>
);

export const GraduationCap: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
    <path d="M22 10v6" />
    <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
  </IconWrapper>
);

export const UserCheck: React.FC<IconProps> = (props) => (
  <IconWrapper {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16,11 18,13 22,9" />
  </IconWrapper>
);

// Export all icons as a single object for easy importing
export const Icons = {
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X, Check, Circle, Search,
  MoreHorizontal, ArrowLeft, ArrowRight, Dot, PanelLeft, GripVertical,
  Moon, Sun, Plane, Rocket, Database, Clock, Play, Trophy, Flag,
  BarChart3, CheckCircle, XCircle, MessageSquare, FileText, ThumbsUp, ThumbsDown,
  Send, MessageCircle, Users, BookOpen, Award, Target, Monitor, Settings,
  Zap, RotateCcw, Brain, TrendingUp, Calendar, Video, Star, Loader2,
  AlertCircle, Download, Eye, Edit, Smartphone, GraduationCap, UserCheck
};

export default Icons;