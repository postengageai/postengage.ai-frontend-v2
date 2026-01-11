import { useState } from 'react';
import { PaymentsApi } from '@/lib/api/payments';
import { CreateOrderResponse } from '@/lib/types/payment';
import { useToast } from '@/hooks/use-toast';
import { useCreditsStore } from '@/lib/credits/store';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: unknown) => void;
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: RazorpayOptions) => any;
  }
}

export function useRazorpay() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { actions: creditActions } = useCreditsStore();

  const loadScript = () => {
    return new Promise(resolve => {
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
        throw new Error('Razorpay SDK failed to load');
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
        handler: async () => {
          try {
            toast({
              title: 'Success',
              description:
                'Payment successful! Credits have been added to your account.',
            });

            // Refresh credits balance and transactions
            // fetch them with delay of 5s
            setTimeout(() => {
              creditActions.fetchBalance();
              creditActions.fetchTransactions();
            }, 5000);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Payment verification failed:', error);
            toast({
              variant: 'destructive',
              title: 'Verification Failed',
              description:
                'Payment verification failed. Please contact support.',
            });
          }
        },
        theme: {
          color: '#5888fc',
        },
      };

      const rzp1 = new window.Razorpay(options);

      rzp1.open();
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
