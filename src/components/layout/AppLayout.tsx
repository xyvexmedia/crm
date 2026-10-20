'use client';

import React, { useState, ReactNode } from 'react';
import { Header } from './Header';
import { CommandMenu } from '@/components/command-menu';
import { AddClientModal } from '@/components/modals/AddClientModal';
import { AddPaymentModal } from '@/components/modals/AddPaymentModal';
import { AddExpenseModal } from '@/components/modals/AddExpenseModal';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col relative selection:bg-[#e11d48]/30 selection:text-white">
      {/* Neo-Fintech Pill Header */}
      <Header
        onOpenSearch={() => setSearchOpen(true)}
      />

      {/* Main Full-Width Immersive Canvas */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1440px] w-full mx-auto animate-fade">
        {children}
      </main>

      <footer className="py-6 px-6 border-t border-white/[0.04] text-center text-xs text-zinc-600">
        <p>© {new Date().getFullYear()} XYVEX Creative Agency • Finance & Operations OS</p>
      </footer>

      {/* Global Command Palette */}
      <CommandMenu
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenAddClient={() => setAddClientOpen(true)}
        onOpenAddPayment={() => setAddPaymentOpen(true)}
        onOpenAddExpense={() => setAddExpenseOpen(true)}
      />

      {/* Quick Action Modals */}
      <AddClientModal
        isOpen={addClientOpen}
        onClose={() => setAddClientOpen(false)}
      />

      <AddPaymentModal
        isOpen={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
      />

      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
      />
    </div>
  );
};
