import { Link, useLocation } from 'wouter';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { href: '/question-bank', label: 'Question Bank' },
  { href: '/airline-interviews', label: 'Airline Interviews & Sim Prep' },
  { href: '/atpl-viva', label: 'ATPL Viva' },
  { href: '/classes', label: 'Classes' },
  { href: '/aptitude-test', label: 'Aptitude Test' },
  { href: '/airbus-320', label: 'Airbus 320' },
  { href: '/syllabus', label: 'Syllabus' },
  { href: '/pilot-resume', label: 'Pilot Resume' },
];

export function Header() {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="flex items-center">
              <h1 className="text-xl xl:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-700 bg-clip-text text-transparent">
                <Plane className="inline-block mr-1 xl:mr-2 text-blue-700" size={20} />
                Eatpl.in
              </h1>
            </div>
          </Link>

          {/* Navigation Menu - Always visible */}
          <nav className="flex space-x-1 xl:space-x-3">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium whitespace-nowrap",
                    location === item.href && "text-purple-600 dark:text-purple-400"
                  )}
                  data-testid={`nav-${item.href.slice(1)}`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Theme Toggle and Auth */}
          <div className="flex items-center space-x-2 xl:space-x-4 ml-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {(user as any)?.profileImageUrl && (
                  <img
                    src={(user as any).profileImageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                    data-testid="img-profile"
                  />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-username">
                  {(user as any)?.firstName || (user as any)?.email}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  data-testid="button-logout"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleLogin}
                className="bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-lg transition-all duration-300 font-medium"
                data-testid="button-signin"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
