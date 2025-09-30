'use client'

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Package {
  id: number;
  name: string;
  months: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const standardFeatures = ['Access to all quizzes', 'Practice tests', 'Progress tracking', 'Mobile access'];
const extendedFeatures = [...standardFeatures, 'Extended access'];
const premiumFeatures = [...standardFeatures, 'Priority support', 'Exam simulator'];

export default function Subscribe() {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: packages, isLoading, error } = useQuery<Package[]>({
    queryKey: ['/api/packages'],
  });

  const handleSubscribe = () => {
    const plan = packages?.find(p => p.id === selectedPlanId);
    if (!plan) return;

    // TODO: Integrate with Stripe once API keys are provided
    toast({
      title: "Subscription Coming Soon",
      description: `Selected ${plan.name} for $${plan.price}. Payment processing will be available once Stripe is configured.`,
    });
  };

  const getFeatures = (months: number) => {
    if (months === 1) return standardFeatures;
    if (months >= 12) return premiumFeatures;
    return extendedFeatures;
  };

  const getDurationText = (months: number) => {
    if (months === 1) return 'month';
    if (months === 12) return 'year';
    return `${months} months`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  if (error || !packages || packages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Unable to load subscription plans</p>
          <p className="text-blue-200 mt-2">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 
            className="text-4xl font-bold text-white mb-4"
            data-testid="heading-subscribe"
          >
            Subscribe to Access This Quiz
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Choose the perfect plan for your ATPL exam preparation journey
          </p>
        </div>

        <div className={cn(
          "grid gap-8 max-w-5xl mx-auto",
          packages.length === 1 ? "md:grid-cols-1 max-w-md" : 
          packages.length === 2 ? "md:grid-cols-2" : 
          "md:grid-cols-3"
        )}>
          {packages.map((pkg, index) => {
            const isPopular = packages.length >= 3 && index === 1;
            const features = getFeatures(pkg.months);
            const durationText = getDurationText(pkg.months);
            
            return (
              <Card 
                key={pkg.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-300 hover:scale-105",
                  selectedPlanId === pkg.id 
                    ? "ring-2 ring-blue-400 bg-white/10 backdrop-blur-sm border-blue-400/50" 
                    : "bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10",
                  isPopular && "ring-2 ring-yellow-400 border-yellow-400/50"
                )}
                onClick={() => setSelectedPlanId(pkg.id)}
                data-testid={`plan-card-${pkg.id}`}
              >
                {isPopular && (
                  <Badge 
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-semibold px-3 py-1"
                    data-testid="badge-popular"
                  >
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-white text-xl mb-2">
                    {pkg.name}
                  </CardTitle>
                  <div className="text-white">
                    <span className="text-4xl font-bold">${pkg.price}</span>
                    <span className="text-blue-200 ml-1">/{durationText}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {features.map((feature, featureIndex) => (
                      <li 
                        key={featureIndex} 
                        className="flex items-center text-blue-100"
                        data-testid={`feature-${pkg.id}-${featureIndex}`}
                      >
                        <Check className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4">
                    <div className={cn(
                      "w-4 h-4 rounded-full border-2 mx-auto transition-colors",
                      selectedPlanId === pkg.id 
                        ? "bg-blue-400 border-blue-400" 
                        : "border-white/40"
                    )} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={handleSubscribe}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold min-w-[200px]"
            data-testid="button-subscribe"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Subscribe
          </Button>
          
          <div className="mt-6 text-blue-200 text-sm">
            <p>✅ Cancel anytime • ✅ 30-day money-back guarantee • ✅ Secure payment</p>
          </div>
        </div>
      </div>
    </div>
  );
}