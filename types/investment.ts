export type Category = 'All Plans' | 'VIP' | 'Platinum' | 'Gold' | 'Silver' | 'Bronze';

export interface InvestmentPlan {
  id: string;
  name: string;
  category: Category;
  durationDays: number;
  roiPercentage: number;
  amount: number;
  dailyEarnings: number;
  totalReturn: number;
  iconType: 'lightning' | 'shield' | 'badge' | 'crown' | 'gem';
  featured?: boolean;
  totalInvestors: number;
  description: string;
}

export interface ActiveInvestment {
  id: string;
  planId: string;
  planName: string;
  investedAmount: number;
  dailyReturn: number;
  totalReturn: number;
  totalDays: number;
  daysCompleted: number;
  startDate: string;
  lastClaimDate?: string;
  status: 'active' | 'completed';
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  customerPhoto?: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'investment' | 'roi_credit' | 'referral_bonus';

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
  paymentMethod?: string;
  referenceId: string;
}

export interface UserStats {
  walletBalance: number;
  totalJoins: number;
  totalEarned: number;
  totalPayout: number;
  activeInvestmentsCount: number;
  unclaimedRoi: number;
  referralCode: string;
  level: string;
  userName: string;
  userInitials: string;
  isVip: boolean;
  loginUid?: string;
  email?: string;
  mobile?: string;
}

export interface ReferralMember {
  id: string;
  name: string;
  phone: string;
  tier: 1 | 2 | 3;
  joinDate: string;
  investedTotal: number;
  commissionEarned: number;
}

export interface Customer {
  id: string; // e.g. CUST-882910
  name: string;
  mobile: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  // KYC Details
  panNumber: string;
  panImage?: string;
  aadhaarNumber: string;
  aadhaarImage?: string;
  photo?: string;
  // Bank Details
  bankHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  // Meta
  createdDate: string;
  kycStatus: 'verified' | 'pending';
}
