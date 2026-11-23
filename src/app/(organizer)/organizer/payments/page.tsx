"use client";

import { useState } from "react";
import {
  CreditCard, DollarSign, Download, ArrowUpRight, CheckCircle2,
  Clock, AlertCircle, ExternalLink, ShieldCheck, Filter, Search
} from "lucide-react";

const TRANSACTIONS = [
  { id: "TXN-98421", event: "India AI Innovation Challenge 2026", user: "Rohan Varma", date: "Oct 18, 2026 · 14:32", tier: "Team Ticket (4 Builders)", amount: "₹1,996", status: "success" },
  { id: "TXN-98420", event: "India AI Innovation Challenge 2026", user: "Aaditi Deshmukh", date: "Oct 18, 2026 · 12:15", tier: "Solo Hacker Pass", amount: "₹499", status: "success" },
  { id: "TXN-98419", event: "Web3 Builders Summit", user: "Karan Singhania", date: "Oct 17, 2026 · 18:40", tier: "VIP Early Bird", amount: "₹3,999", status: "success" },
  { id: "TXN-98418", event: "India AI Innovation Challenge 2026", user: "Sneha Mukherjee", date: "Oct 17, 2026 · 11:20", tier: "Solo Hacker Pass", amount: "₹499", status: "success" },
  { id: "TXN-98417", event: "FinTech Disrupt 2026", user: "Vikram Singhal", date: "Oct 16, 2026 · 16:05", tier: "In-Person Developer Pass", amount: "₹999", status: "success" },
];

export default function PaymentsPage() {
  const [search, setSearch] = useState("");

  const filtered = TRANSACTIONS.filter((t) =>
    t.user.toLowerCase().includes(search.toLowerCase()) ||
    t.event.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            Ticketing &amp; Financial Payouts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track ticket revenues, escrow prize distributions, and automated bank settlements.
          </p>
        </div>

        <button
          onClick={() => alert("Downloading financial report CSV...")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" /> Export Tax Invoices (CSV)
        </button>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Ticket Sales</span>
          <p className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-1">
            ₹20,95,800
          </p>
          <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">+24.5% this month</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Prize Escrow Locked</span>
          <p className="text-2xl sm:text-3xl font-display font-black text-[#1565D8] mt-1">
            ₹10,00,000
          </p>
          <span className="text-xs text-slate-500 mt-1 inline-block">100% Guaranteed Payout</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Settled to Bank</span>
          <p className="text-2xl sm:text-3xl font-display font-black text-emerald-600 mt-1">
            ₹19,74,200
          </p>
          <span className="text-xs text-slate-500 mt-1 inline-block">HDFC Bank ··· 4018</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Platform & Gateway Fees</span>
          <p className="text-2xl sm:text-3xl font-display font-black text-slate-700 mt-1">
            ₹58,600
          </p>
          <span className="text-xs text-slate-500 mt-1 inline-block">Razorpay standard 2%</span>
        </div>
      </div>

      {/* Gateway Status Box */}
      <div className="bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30 border border-blue-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1565D8] text-white flex items-center justify-center shadow-sm flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Razorpay Payment Gateway Connected</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Live &amp; Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Merchant Account: <strong className="text-slate-700">Innovation Hacks Pvt Ltd (MID_ih_live_8492)</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => alert("Opening payment gateway configuration modal...")}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 self-start sm:self-auto"
        >
          Configure Webhooks
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base">
              Recent Ticket Transactions
            </h3>
            <p className="text-xs text-slate-500">Live feed of participant payments across all active events.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, event, TXN ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] focus:bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Event Name</th>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Ticket Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-xs text-[#1565D8]">
                    {t.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 text-xs max-w-[200px] truncate">
                    {t.event}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900 text-xs block">{t.user}</span>
                    <span className="text-[11px] text-slate-400">{t.date}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {t.tier}
                  </td>
                  <td className="px-6 py-4 font-display font-bold text-slate-900 text-sm">
                    {t.amount}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      <CheckCircle2 size={11} /> Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => alert(`Downloading GST invoice for ${t.id}`)}
                      className="text-xs text-[#1565D8] font-semibold hover:underline"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
