import { Link, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import PaymentPage from './PaymentPage';

export default function Subscribe() {
  const link = useLocation();
  const [, setLocation] = useLocation();
  const auth = useAuth();
  const { isAuthenticated, user, isLoading: authLoading } = auth;
  const [paymentProcessLoading, setPaymentProcessLoading] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('sixmonth');
  const { toast } = useToast();

  const {data: subcriptions = [], isLoading: subscriptionLoading} = useQuery<any>({
    queryKey: ['/api/subscriptions'],
  });

  const { data: subscriptionPlans = [], isLoading: planLoading } = useQuery<any>({
    queryKey: ['/api/admin/subscriptionsPlan'],
  });

  useEffect(() => {
    if (subscriptionPlans.length > 0) {
      setSelectedPlanId(subscriptionPlans[0].id);
      setSelectedPlan(subscriptionPlans[0]);
    }
  }, [subscriptionPlans]);

  const paymentSuccess = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data };
      return await apiRequest('POST', '/api/payment/success', payload);
    },
    onSuccess: () => {
      toast({
        title: "Payment Successful. Thank you for subscribing!",
        // description: `Selected ${data.name} for $${data.price}. Payment processing will be available once Stripe is configured.`,
      });
    }, 
    onError: () => {
      toast({
        title: "Error",
        description: "Payment failed.",
        variant: "destructive",
      });
    }
  });

  const handlePaymentResponse = (res: any) => {
    if (res.razorpay_payment_id && res.razorpay_order_id && res.razorpay_signature) {
      paymentSuccess.mutate({
        ...res,
        planDuration: selectedPlan.name,
        months: selectedPlan.months,
        planAmount: selectedPlan.price,
        isActive: true
      })
    }
    setPaymentProcessLoading(false);
  }

  const handleSubscribe = () => {
    setPaymentProcessLoading(true);
  };

  const handleLogin = () => {
    setLocation("/sign-in");
  };

  if (planLoading || subscriptionLoading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-96 mx-auto mb-6" />
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(16)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if(isAuthenticated && subcriptions.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1
              className="text-4xl font-bold text-white mb-4"
              
              data-testid="heading-subscribe"
            >
              You already have an active subscription plan
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">   
              Your current plan is valid until {new Date(subcriptions[0].plan_expire_at).toLocaleDateString()}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800">
      {paymentProcessLoading &&
        <PaymentPage
          user={user}
          plan={selectedPlan.plan}
          price={selectedPlan.price}
          paymentProcessLoading={paymentProcessLoading}
          onClose={() => setPaymentProcessLoading(false)}
          handlePaymentResponse={handlePaymentResponse}
        />
      }

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
          {subscriptionPlans.map((plan: any) => (
            <Card
              key={plan.id}
              className={cn(
                "relative cursor-pointer transition-all duration-300 hover:scale-105",
                selectedPlan === plan.id
                  ? "ring-2 ring-blue-400 bg-white/10 backdrop-blur-sm border-blue-400/50"
                  : "bg-white/5 backdrop-blur-sm border-white/20 hover:bg-white/10",
                plan.popular && "ring-2 ring-yellow-400 border-yellow-400/50"
              )}
              onClick={() => {
                setSelectedPlanId(plan.id);
                setSelectedPlan(plan);
              }}
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
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-blue-200 ml-1">{plan.duration}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.split(",").map((feature: string, index: any) => (
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
                    selectedPlanId === plan.id
                      ? "bg-blue-400 border-blue-400"
                      : "border-white/40"
                  )} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          {
            isAuthenticated ?
              <Button
                onClick={handleSubscribe}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold min-w-[200px]"
                data-testid="button-subscribe"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Subscribe
              </Button>
              : <Button
                onClick={handleLogin}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold min-w-[200px]"
                data-testid="button-subscribe"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Sign in to Subscribe
              </Button>
          }
        </div>
      </div>
    </div>
  );
}
