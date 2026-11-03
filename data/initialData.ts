import { InvestmentPlan, Transaction, UserStats, ReferralMember, ActiveInvestment, Customer } from '@/types/investment';

export const INITIAL_USER_STATS: UserStats = {
  walletBalance: 0,
  totalJoins: 0,
  totalEarned: 0,
  totalPayout: 0,
  activeInvestmentsCount: 0,
  unclaimedRoi: 0,
  referralCode: '',
  level: 'Basic',
  userName: 'User',
  userInitials: 'U',
  isVip: false,
};

export const INITIAL_PLANS: InvestmentPlan[] = [];

export const INITIAL_ACTIVE_INVESTMENTS: ActiveInvestment[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_REFERRALS: ReferralMember[] = [];

export const ACTIVITY_CHART_DATA: any[] = [];

export const BROWSER_ACTIVITY_DATA: any[] = [];

export const FINANCE_SUMMARY_DATA = {
  annualTaxes: '₹0',
  nextTaxReviewDate: 'N/A',
  averageProductPrice: '₹0',
  satisfactionRate: 100,
  teamAvatars: [],
};

export const INITIAL_CUSTOMERS: Customer[] = [];
