'use client';

import React, { useState } from 'react';
import { Customer } from '@/types/investment';
import {
  Search,
  UserPlus,
  ShieldCheck,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Eye,
  X,
  FileText,
  User,
  Calendar,
  Layers,
} from 'lucide-react';
import FloatingInput from '@/components/ui/FloatingInput';

interface CustomerListContentProps {
  customers: Customer[];
  onOpenAddCustomer: () => void;
  onDeleteCustomer?: (id: string) => void;
}

export default function CustomerListContent({
  customers,
  onOpenAddCustomer,
  onDeleteCustomer,
}: CustomerListContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Filter customers by name, id, mobile, state, pan
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.panNumber.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Row with "+ Add Customer" Button */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Customer Directory
          </h3>
          <span className="text-xs text-slate-400">
            Total Customers: {customers.length} Registered
          </span>
        </div>

        <button
          onClick={onOpenAddCustomer}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>+ New Customer</span>
        </button>
      </div>

      {/* 1. Search Bar with Floating Animated Label */}
      <div className="pt-1">
        <FloatingInput
          label="Search by Name, ID (CUST-), Mobile, or PAN..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-500" />}
          inputClassName="font-medium text-black text-xs sm:text-sm"
          rightElement={
            searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold p-1"
                title="Clear search"
              >
                ✕
              </button>
            ) : null
          }
        />
      </div>

      {/* 2. Customers List */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h5 className="text-xs sm:text-sm font-bold text-slate-700">No Customers Found</h5>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or register a new customer using the button above
            </p>
            <button
              onClick={onOpenAddCustomer}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Customer Now</span>
            </button>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-3 group"
            >
              {/* Left: Customer Photo + Name + ID + Mobile */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Customer Photo */}
                <div className="relative shrink-0">
                  {customer.photo ? (
                    <img
                      src={customer.photo}
                      alt={customer.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-center font-black text-emerald-700 text-sm shadow-xs">
                      {customer.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                    <ShieldCheck className="w-2.5 h-2.5" />
                  </div>
                </div>

                {/* Name, ID, Location */}
                <div className="truncate">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                      {customer.name}
                    </h4>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                      {customer.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 truncate">
                    <span className="flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{customer.mobile}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{customer.district}, {customer.state}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: View Profile Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSelectedCustomer(customer)}
                  className="bg-slate-900 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  title="View full customer profile"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. Customer Full Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Close Button */}
            <button
              onClick={() => setSelectedCustomer(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              {selectedCustomer.photo ? (
                <img
                  src={selectedCustomer.photo}
                  alt={selectedCustomer.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center border-2 border-emerald-500">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div>
                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                  {selectedCustomer.id}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  {selectedCustomer.name}
                </h3>
                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" />
                  <span>+91 {selectedCustomer.mobile}</span>
                </span>
              </div>
            </div>

            {/* Address Details */}
            <div className="py-3 border-b border-slate-100 space-y-1.5 text-xs">
              <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">
                Address & Location
              </span>
              <p className="text-slate-800 font-medium leading-relaxed">
                {selectedCustomer.address}
              </p>
              <p className="text-slate-500">
                {selectedCustomer.district}, {selectedCustomer.state} - {selectedCustomer.pincode}
              </p>
            </div>

            {/* KYC Documents */}
            <div className="py-3 border-b border-slate-100 space-y-2 text-xs">
              <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">
                KYC Verification Documents
              </span>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">PAN Card</span>
                  <span className="font-mono font-bold text-slate-900 text-xs uppercase block">
                    {selectedCustomer.panNumber}
                  </span>
                  {selectedCustomer.panImage && (
                    <img
                      src={selectedCustomer.panImage}
                      alt="PAN"
                      className="mt-1.5 w-full h-14 object-cover rounded border border-slate-200"
                    />
                  )}
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Aadhaar Card</span>
                  <span className="font-mono font-bold text-slate-900 text-xs block">
                    {selectedCustomer.aadhaarNumber}
                  </span>
                  {selectedCustomer.aadhaarImage && (
                    <img
                      src={selectedCustomer.aadhaarImage}
                      alt="Aadhaar"
                      className="mt-1.5 w-full h-14 object-cover rounded border border-slate-200"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="py-3 space-y-2 text-xs">
              <span className="font-extrabold text-slate-400 uppercase text-[10px] tracking-wider block">
                Bank Settlement Account
              </span>

              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Account Holder:</span>
                  <span className="font-bold text-slate-900">{selectedCustomer.bankHolderName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bank Name:</span>
                  <span className="font-bold text-slate-900">{selectedCustomer.bankName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Account No:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedCustomer.accountNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">IFSC Code:</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedCustomer.ifscCode}</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
