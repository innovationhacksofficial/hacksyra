"use client";

import { useState } from "react";
import {
  Users, Search, Filter, Download, CheckCircle2, XCircle,
  Mail, ExternalLink, ShieldCheck, UserCheck, AlertCircle,
  Sparkles
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  team: string;
  role: "Lead" | "Member" | "Solo";
  track: string;
  college: string;
  checkedIn: boolean;
  registeredAt: string;
}

const DEMO_PARTICIPANTS: Participant[] = [
  {
    id: "p1",
    name: "Rohan Varma",
    email: "rohan.v@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    team: "NeuralSynthetix",
    role: "Lead",
    track: "Generative AI",
    college: "IIT Bombay",
    checkedIn: true,
    registeredAt: "Oct 12, 2026",
  },
  {
    id: "p2",
    name: "Aaditi Deshmukh",
    email: "aaditi.d@outlook.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    team: "NeuralSynthetix",
    role: "Member",
    track: "Generative AI",
    college: "IIT Bombay",
    checkedIn: true,
    registeredAt: "Oct 12, 2026",
  },
  {
    id: "p3",
    name: "Karan Singhania",
    email: "karan.s@bits-pilani.ac.in",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    team: "ZeroState Labs",
    role: "Lead",
    track: "Systems & Cloud",
    college: "BITS Pilani",
    checkedIn: true,
    registeredAt: "Oct 14, 2026",
  },
  {
    id: "p4",
    name: "Sneha Mukherjee",
    email: "sneha.m@iiit.ac.in",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    team: "ZeroState Labs",
    role: "Member",
    track: "Systems & Cloud",
    college: "IIIT Hyderabad",
    checkedIn: false,
    registeredAt: "Oct 14, 2026",
  },
  {
    id: "p5",
    name: "Tanmay Bhasin",
    email: "tanmay.b@delhiuniv.ac.in",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    team: "Solo Builder",
    role: "Solo",
    track: "Open Innovation",
    college: "Delhi University",
    checkedIn: false,
    registeredAt: "Oct 15, 2026",
  },
  {
    id: "p6",
    name: "Pooja Hegde",
    email: "pooja.h@annauniv.edu",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    team: "AgriVision AI",
    role: "Lead",
    track: "AI for Social Good",
    college: "Anna University, Chennai",
    checkedIn: true,
    registeredAt: "Oct 16, 2026",
  },
];

export default function ParticipantsManagementPage() {
  const [participants, setParticipants] = useState<Participant[]>(DEMO_PARTICIPANTS);
  const [search, setSearch] = useState("");
  const [filterCheckin, setFilterCheckin] = useState<string>("all");

  const toggleCheckIn = (id: string) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, checkedIn: !p.checkedIn } : p))
    );
  };

  const filtered = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.team.toLowerCase().includes(search.toLowerCase()) ||
      p.college.toLowerCase().includes(search.toLowerCase());

    if (filterCheckin === "checked") return matchesSearch && p.checkedIn;
    if (filterCheckin === "pending") return matchesSearch && !p.checkedIn;
    return matchesSearch;
  });

  const checkedInCount = participants.filter((p) => p.checkedIn).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
            Registered Builders &amp; Teams
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Live check-in verification, team rosters, and communication portal.
          </p>
        </div>

        <button
          onClick={() => alert("Downloading participants CSV export...")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-xs transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500" /> Export CSV Roster
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Registered</span>
          <p className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-1">
            {participants.length} Builders
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Checked-In Live</span>
          <p className="text-2xl sm:text-3xl font-display font-black text-emerald-600 mt-1">
            {checkedInCount} / {participants.length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Teams Formed</span>
          <p className="text-2xl sm:text-3xl font-display font-black text-[#1565D8] mt-1">
            3 Teams
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["all", "checked", "pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterCheckin(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterCheckin === tab
                  ? "bg-[#1565D8] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {tab === "all" ? "All Builders" : tab === "checked" ? "Checked In" : "Pending Check-In"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, team, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1565D8] focus:bg-white"
          />
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Participant</th>
                <th className="px-6 py-4">Team &amp; Role</th>
                <th className="px-6 py-4">Track</th>
                <th className="px-6 py-4">Institution</th>
                <th className="px-6 py-4 text-center">Check-In Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{p.name}</span>
                        <span className="text-[11px] text-slate-500">{p.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 block">{p.team}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        p.role === "Lead" ? "bg-blue-50 text-[#1565D8] border border-blue-100" : "bg-slate-100 text-slate-600"
                      }`}>
                        {p.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                      {p.track}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {p.college}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleCheckIn(p.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                        p.checkedIn
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {p.checkedIn ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Checked In
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" /> Mark Check-In
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => alert(`Opening message compose to ${p.name}`)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="Send message"
                    >
                      <Mail className="w-4 h-4" />
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
