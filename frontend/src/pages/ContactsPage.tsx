import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, UserPlus, Phone, MoreVertical,
  UserCheck, Clock, UserX, Shield,
} from "lucide-react";
import UnsupportedFeatureBanner from "@/components/UnsupportedFeatureBanner";

// NOTE: The backend has no contacts/connections table or routes at all.
// This page intentionally stays on mock data — see integration audit.

type Tab = "all" | "pending" | "blocked";

const CONTACTS = [
  { id: "1", name: "Arjun Mehta", username: "arjun_m", status: "online", verified: true, tab: "all" },
  { id: "2", name: "Priya Sharma", username: "priya_s", status: "offline", verified: true, tab: "all" },
  { id: "3", name: "Rahul Verma", username: "rahul_v", status: "busy", verified: false, tab: "all" },
  { id: "4", name: "Sneha Patel", username: "sneha_p", status: "online", verified: true, tab: "all" },
  { id: "5", name: "Vikram Singh", username: "vikram_s", status: "offline", verified: false, tab: "pending" },
  { id: "6", name: "Kavya Nair", username: "kavya_n", status: "online", verified: true, tab: "pending" },
  { id: "7", name: "Spam Account", username: "spam123", status: "offline", verified: false, tab: "blocked" },
];

const STATUS_DOT: Record<string, string> = {
  online: "bg-[#22C55E]",
  offline: "bg-[#334155]",
  busy: "bg-[#EF4444]",
};

const ContactsPage = () => {
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");

  const filtered = CONTACTS.filter(
    (c) =>
      c.tab === tab &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <UnsupportedFeatureBanner message="Contacts aren't supported by the current backend (no contacts table/routes) — showing sample data." />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Contacts</h2>
          <p className="text-[#94A3B8] text-sm mt-1">
            Manage your connections
          </p>
        </div>
        <button className="flex items-center gap-2 bg-[#06B6D4] hover:bg-[#06B6D4]/90 text-[#020617] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <UserPlus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#1E293B]/60 border border-[#334155]/60 rounded-xl pl-11 pr-4 py-3 text-[#F8FAFC] text-sm placeholder-[#334155] outline-none focus:border-[#06B6D4]/60 transition-colors"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0F172A] border border-[#334155]/60 rounded-xl p-1 w-fit">
        {(["all", "pending", "blocked"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t
                ? "bg-[#06B6D4] text-[#020617]"
                : "text-[#94A3B8] hover:text-[#F8FAFC]"
            }`}
          >
            {t === "all" ? "All Contacts" : t === "pending" ? "Pending" : "Blocked"}
          </button>
        ))}
      </div>

      {/* Contacts list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-[#94A3B8]">
            No contacts found
          </div>
        ) : (
          filtered.map((contact, i) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-[#1E293B]/60 backdrop-blur border border-[#334155]/60 rounded-2xl p-4 flex items-center gap-3 hover:border-[#334155] transition-colors group"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-[#0F172A] border border-[#334155] flex items-center justify-center">
                  <span className="text-[#94A3B8] text-sm font-bold">
                    {contact.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#1E293B] ${STATUS_DOT[contact.status]}`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[#F8FAFC] text-sm font-medium truncate">
                    {contact.name}
                  </p>
                  {contact.verified && (
                    <Shield className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
                  )}
                </div>
                <p className="text-[#94A3B8] text-xs">@{contact.username}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {tab === "all" && (
                  <button className="w-8 h-8 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors">
                    <Phone className="w-3.5 h-3.5" />
                  </button>
                )}
                {tab === "pending" && (
                  <button className="w-8 h-8 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4] hover:bg-[#06B6D4]/20 transition-colors">
                    <UserCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                {tab === "blocked" && (
                  <button className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] hover:bg-[#F59E0B]/20 transition-colors">
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                )}
                <button className="w-8 h-8 rounded-lg bg-[#334155]/40 flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ContactsPage;