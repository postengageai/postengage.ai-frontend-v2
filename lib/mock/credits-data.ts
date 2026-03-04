import type {
  CreditBalance,
  CreditTransaction,
  UsageBreakdown,
} from '@/lib/types/credits';

export const mockCreditBalance: CreditBalance = {
  available_credits: 9980,
};

export const mockTransactions: CreditTransaction[] = [
  {
    id: '6961336de8b0b130fb531b3c',
    user_id: '695fdcb16c5b76e715cf51ea',
    transaction_type: 'consumption',
    credit_amount: 4,
    balance_before: 9984,
    balance_after: 9980,
    description: 'Automation Executed: Price Inquiry Automation',
    status: 'completed',
    automation_id: '695fdd576c5b76e715cf5209',
    reference_id: '695fdd576c5b76e715cf520c',
    processed_at: '2026-01-09T16:57:22.925Z',
    created_at: '2026-01-09T16:57:17.477Z',
    updated_at: '2026-01-09T16:57:22.926Z',
  },
  {
    id: '696093fa4acf5babe5db5b26',
    user_id: '695fdcb16c5b76e715cf51ea',
    transaction_type: 'consumption',
    credit_amount: 4,
    balance_before: 9988,
    balance_after: 9984,
    description: 'Rollback: Automation Execution: Price Inquiry Automation',
    status: 'cancelled',
    automation_id: '695fdd576c5b76e715cf5209',
    reference_id: '695fdd576c5b76e715cf520c',
    processed_at: '2026-01-09T05:36:59.935Z',
    created_at: '2026-01-09T05:36:58.298Z',
    updated_at: '2026-01-09T05:36:59.936Z',
  },
  {
    id: '696093fa4acf5babe5db5b27',
    user_id: '695fdcb16c5b76e715cf51ea',
    transaction_type: 'purchase',
    credit_amount: 500,
    balance_before: 9488,
    balance_after: 9988,
    description: 'Credit Package Purchase: Starter Pack',
    status: 'completed',
    credit_package_id: 'pkg_starter_500',
    order_id: 'ord_12345',
    reference_id: 'pay_xyz123',
    processed_at: '2026-01-08T10:30:00.000Z',
    created_at: '2026-01-08T10:29:55.000Z',
    updated_at: '2026-01-08T10:30:00.000Z',
  },
  {
    id: '696093fa4acf5babe5db5b28',
    user_id: '695fdcb16c5b76e715cf51ea',
    transaction_type: 'consumption',
    credit_amount: 2,
    balance_before: 9490,
    balance_after: 9488,
    description: 'Automation Executed: Welcome DM Trigger',
    status: 'completed',
    automation_id: '695fdd576c5b76e715cf5210',
    reference_id: '695fdd576c5b76e715cf5211',
    processed_at: '2026-01-07T14:22:10.000Z',
    created_at: '2026-01-07T14:22:05.000Z',
    updated_at: '2026-01-07T14:22:10.000Z',
  },
  {
    id: '696093fa4acf5babe5db5b29',
    user_id: '695fdcb16c5b76e715cf51ea',
    transaction_type: 'consumption',
    credit_amount: 4,
    balance_before: 9494,
    balance_after: 9490,
    description: 'Automation Executed: Price Inquiry Automation',
    status: 'completed',
    automation_id: '695fdd576c5b76e715cf5209',
    reference_id: '695fdd576c5b76e715cf520d',
    processed_at: '2026-01-06T09:15:30.000Z',
    created_at: '2026-01-06T09:15:25.000Z',
    updated_at: '2026-01-06T09:15:30.000Z',
  },
];

// Generate daily usage data for the last 30 days
const generateDailyData = () => {
  const daily = [];
  const today = new Date();

  // Stable consumption values for 30 days
  const consumptionValues = [
    8, 12, 0, 5, 15, 3, 0, 10, 7, 0, 14, 6, 9, 0, 11, 4, 8, 0, 13, 2, 0, 7, 500,
    10, 5, 0, 12, 8, 6, 4,
  ];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const index = 29 - i;

    daily.push({
      date: date.toISOString().split('T')[0],
      purchases: index === 22 ? 500 : 0,
      consumption: consumptionValues[index] || 0,
      adjustments: 0,
    });
  }

  return daily;
};

const dailyData = generateDailyData();
const totalConsumption = dailyData.reduce((acc, d) => acc + d.consumption, 0);

export const mockUsage: UsageBreakdown = {
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  to: new Date().toISOString(),
  totals: {
    purchases: 500,
    consumption: totalConsumption,
    adjustments: 0,
  },
  daily: dailyData,
  total_transactions: mockTransactions.length,
};
