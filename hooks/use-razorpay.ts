import { useState } from 'react';
import { PaymentsApi } from '@/lib/api/payments';
import { CreateOrderResponse } from '@/lib/types/payment';
import { useToast } from '@/hooks/use-toast';
import { useCreditsStore } from '@/lib/credits/store';

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { actions: creditActions } = useCreditsStore();

  const loadScript = () => {
    return new Promise<boolean>(resolve => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const processPayment = async (packageId: string) => {
    setIsProcessing(true);
    try {
      const isLoaded = await loadScript();
      if (!isLoaded) {
        throw new Error(
          'Payment system failed to load. Please refresh and try again.'
        );
      }

      // 1. Create Order
      const order: CreateOrderResponse = await PaymentsApi.createOrder({
        packageId,
      });

      // 2. Initialize Razorpay
      const options: RazorpayOptions = {
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: 'PostEngageAI',
        description: 'Credits Purchase',
        order_id: order.order_id,
        handler: async (response: RazorpayResponse) => {
          // Show verifying state
          toast({
            title: 'Verifying Payment...',
            description: 'Please wait while we confirm your payment.',
          });

          try {
            // 3. Verify payment with backend BEFORE showing success
            const result = await PaymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Only show success AFTER backend confirms
            toast({
              title: 'Payment Successful!',
              description: `${result.data.credits_added} credits have been added to your account.`,
            });

            // Refresh credits balance and transactions
            creditActions.fetchBalance();
            creditActions.fetchTransactions();
          } catch {
            toast({
              variant: 'destructive',
              title: 'Payment Verification Failed',
              description:
                'Your payment was received but verification failed. Credits will be added shortly. If not, please contact support.',
              duration: 10000,
            });

            // Still try to refresh — webhook might have processed it
            setTimeout(() => {
              creditActions.fetchBalance();
              creditActions.fetchTransactions();
            }, 5000);
          }
        },
        theme: {
          color: '#5888fc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return { processPayment, isProcessing };
}
