'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: '1 Month Plan',
    price: 100,
    duration: 'month',
    features: ['Access to all quizzes', 'Practice tests', 'Progress tracking', 'Mobile access']
  },
  {
    id: 'sixmonth',
    name: '6 Month Plan', 
    price: 400,
    duration: '6 months',
    features: ['Access to all quizzes', 'Practice tests', 'Progress tracking', 'Mobile access', 'Extended access'],
    popular: true
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 700,
    duration: 'year',
    features: ['Access to all quizzes', 'Practice tests', 'Progress tracking', 'Mobile access', 'Priority support', 'Exam simulator']
  }
];

export default function Subscribe() {
  const [selectedPlan, setSelectedPlan] = useState<string>('sixmonth');
  const { toast } = useToast();

  const handleSubscribe = () => {
    const plan = subscriptionPlans.find(p => p.id === selectedPlan);
    if (!plan) return;

    // TODO: Integrate with Stripe once API keys are provided
    toast({
      title: "Subscription Coming Soon",
      description: `Selected ${plan.name} for $${plan.price}. Payment processing will be available once Stripe is configured.`,
    });
  };

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

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 hover:scale-105",
                selectedPlan === plan.id 
                  ? "ring-2 ring-blue-400 bg-white/10 backdrop-blur-sm border-blue-400/50" 
                  : "bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10",
                plan.popular && "ring-2 ring-yellow-400 border-yellow-400/50"
              )}
              onClick={() => setSelectedPlan(plan.id)}
              data-testid={`plan-card-${plan.id}`}
            >
              {plan.popular && (
                <Badge 
                  className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-black font-semibold px-3 py-1"
                  data-testid="badge-popular"
                >
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-white text-xl mb-2">
                  {plan.name}
                </CardTitle>
                <div className="text-white">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-blue-200 ml-1">/{plan.duration}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li 
                      key={index} 
                      className="flex items-center text-blue-100"
                      data-testid={`feature-${plan.id}-${index}`}
                    >
                      <Check className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 mx-auto transition-colors",
                    selectedPlan === plan.id 
                      ? "bg-blue-400 border-blue-400" 
                      : "border-white/40"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))}
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