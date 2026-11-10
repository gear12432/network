export type Category =
  | 'All Plans'
  | 'Starter'
  | 'Basic'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Premium'
  | 'Growth'
  | 'Long-Term'
  | 'Elite'
  | 'VIP'
  | 'Bronze';

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
  iconUrl?: string;
  iconEmoji?: string;
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
  customerAddress?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankHolderName?: string;
  loginUid?: string;
  purchasedAt?: string;
  claimed?: boolean;
  withdrawalStatus?: 'Pending' | 'Approved' | 'Rejected' | string;
  withdrawalId?: string;
  vipLevel?: number;
  vipCommissionRate?: number;
  dailyCommission?: number;
  totalCommissionEarned?: number;
  lastAccrualDate?: string;
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
  utrNumber?: string;
  transactionId?: string;
  paidTo?: string;
  paidBy?: string;
  debitedFrom?: string;
  creditedTo?: string;
  senderName?: string;
  receiverName?: string;
  bankName?: string;
  accountNumber?: string;
  imageUrl?: string;
  dateTime?: string;
  note?: string;
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
  photoUrl?: string;
  vipLevel?: number;
  totalCustomerInvested?: number;
  dailyCommissionRate?: number;
  totalDailyCommission?: number;
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

export interface AppSettings {
  appLogo: string;
  appName: string;
  appShortName: string;
  companyName: string;
  localArea: string;
  cityDistrict: string;
  state: string;
  pinCode: string;
  country: string;
  email: string;
  cin: string;
  registrarName: string;
  updatedAt?: string;
}

export interface VipBonus {
  id: string;
  vipLevel: number;
  minInvestAmount: number;
  bonusAmount: number;
  category: 'week' | 'month' | 'vipLevelOffer';
  validityDate: string;
  createdAt?: string;
  durationDays?: number; // e.g., 7 for Weekly, 30 for Monthly
  claimedBy?: string[]; // Array of User IDs who claimed it
  userProgress?: Record<
    string,
    {
      unlockedAt?: string;
      expiresAt?: string;
      claimedAt?: string;
    }
  >;
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  appLogo: '',
  appName: 'Network Join Pro',
  appShortName: 'NJP',
  companyName: 'Network Join Pro India Private Limited',
  localArea: 'Gomti Nagar',
  cityDistrict: 'Lucknow',
  state: 'Uttar Pradesh',
  pinCode: '226010',
  country: 'India',
  email: 'support@networkjoinpro.in',
  cin: 'U74999UP2026PTC136667',
  registrarName: 'A.K. Sharma',
};

