'use client';

import React, { useState } from 'react';
import {
  Settings,
  Building,
  FileText,
  User,
  Save,
  RotateCcw,
  CheckCircle2,
  Database,
  Lock,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/context/data-context';
import { useAuth } from '@/context/auth-context';

export default function SettingsPage() {
  const { settings, updateSettings, resetToSampleData } = useData();
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'company' | 'invoice' | 'profile' | 'system'>('company');

  // Company Form State
  const [companyName, setCompanyName] = useState(settings.company_name);
  const [email, setEmail] = useState(settings.email);
  const [phone, setPhone] = useState(settings.phone);
  const [address, setAddress] = useState(settings.address);
  const [gstNumber, setGstNumber] = useState(settings.gst_number || '');
  const [website, setWebsite] = useState(settings.website);

  // Invoice Form State
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoice_prefix);
  const [defaultTax, setDefaultTax] = useState(settings.default_tax?.toString() || '18');
  const [paymentTerms, setPaymentTerms] = useState(settings.payment_terms);
  const [bankDetails, setBankDetails] = useState(settings.bank_details);
  const [upiId, setUpiId] = useState(settings.upi_id);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || 'Salih');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'salih@xyvex.agency');
  const [password, setPassword] = useState('');

  const [savedMessage, setSavedMessage] = useState('');

  const triggerSaveNotification = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      company_name: companyName,
      email,
      phone,
      address,
      gst_number: gstNumber,
      website,
    });
    triggerSaveNotification('Company settings saved successfully');
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      invoice_prefix: invoicePrefix,
      default_tax: Number(defaultTax) || 0,
      payment_terms: paymentTerms,
      bank_details: bankDetails,
      upi_id: upiId,
    });
    triggerSaveNotification('Invoice and banking settings saved');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: profileName,
      email: profileEmail,
    });
    triggerSaveNotification('Profile updated successfully');
  };

  const handleResetData = () => {
    if (confirm('Reset application data to initial XYVEX agency sample records?')) {
      resetToSampleData();
      triggerSaveNotification('Data restored to XYVEX seed demo values');
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header (Section 61) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              Configuration & Agency Profile
            </span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
              System Settings
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Configure company branding, GST, invoice numbering rules, and banking coordinates.
            </p>
          </div>

          {savedMessage && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs animate-fade">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{savedMessage}</span>
            </div>
          )}
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('company')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs rounded-md font-medium transition ${
              activeTab === 'company'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Company</span>
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs rounded-md font-medium transition ${
              activeTab === 'invoice'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Invoice & Bank</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs rounded-md font-medium transition ${
              activeTab === 'profile'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Security</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs rounded-md font-medium transition ${
              activeTab === 'system'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database & Demo</span>
          </button>
        </div>

        {/* Tab 1: Company Profile */}
        {activeTab === 'company' && (
          <form onSubmit={handleSaveCompany} className="glass-panel p-6 space-y-4 text-xs">
            <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
              Corporate Branding & Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Official Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">GST / Tax Identification Number</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="32AABCS1429B1Z8"
                  className="glass-input font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-300 mb-1 font-medium">Registered Office Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button type="submit" className="glass-button-primary py-2 px-5">
                <Save className="w-3.5 h-3.5" />
                <span>Save Company Info</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Invoice & Bank */}
        {activeTab === 'invoice' && (
          <form onSubmit={handleSaveInvoice} className="glass-panel p-6 space-y-4 text-xs">
            <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
              Invoice Defaults & Banking Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  placeholder="XYV-2026-"
                  className="glass-input font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Default Tax Rate (GST %)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={defaultTax}
                  onChange={(e) => setDefaultTax(e.target.value)}
                  className="glass-input font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Default UPI ID</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="xyvex@okaxis"
                  className="glass-input font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-300 mb-1 font-medium">Bank Account Coordinates</label>
                <textarea
                  rows={2}
                  value={bankDetails}
                  onChange={(e) => setBankDetails(e.target.value)}
                  className="glass-input font-mono resize-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-zinc-300 mb-1 font-medium">Standard Payment Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="glass-input resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button type="submit" className="glass-button-primary py-2 px-5">
                <Save className="w-3.5 h-3.5" />
                <span>Save Invoice Config</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="glass-panel p-6 space-y-4 text-xs">
            <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold mb-2">
              User Profile & Credentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Administrator Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">Change Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty to keep unchanged"
                  className="glass-input"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1 font-medium">System Role</label>
                <input
                  type="text"
                  disabled
                  value="Founder & Super Admin"
                  className="glass-input opacity-70 cursor-not-allowed bg-zinc-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button type="submit" className="glass-button-primary py-2 px-5">
                <Save className="w-3.5 h-3.5" />
                <span>Update Profile</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: System & Database */}
        {activeTab === 'system' && (
          <div className="glass-panel p-6 space-y-5 text-xs">
            <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              Database Sync & Demo Data
            </h2>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Supabase PostgreSQL Connection</span>
                  <span className="text-[11px] text-zinc-400">
                    Endpoint: https://kzcbkfrbddnhbjcsneno.supabase.co
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Online & Configured
                </span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Database schema is fully generated under <code className="text-zinc-200 bg-white/10 px-1 py-0.5 rounded font-mono">supabase/schema.sql</code> including RLS policies, indexing, and automatic revenue calculation views.
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-semibold text-white block">Reset to Realistic Agency Sample Data</span>
                <span className="text-zinc-400 text-[11px]">
                  Restores ABC Company, XYZ Business, Nova Clinic, and Naadan Foodstuff with realistic agency campaigns.
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetData}
                className="glass-button-secondary py-2 px-4 text-zinc-300 hover:text-white shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Sample Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
