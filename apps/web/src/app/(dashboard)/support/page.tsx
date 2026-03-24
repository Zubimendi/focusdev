"use client";

import React from "react";
import { toast } from "sonner";

const tickets = [
  { id: "#FD-8821", status: "Resolved", title: "API Authentication Failure in VS Code", updateAt: "2 hours ago", color: "secondary" },
  { id: "#FD-8904", status: "In Progress", title: "Data sync lag between mobile and desktop", updateAt: "15 mins ago", color: "tertiary" },
  { id: "#FD-8762", status: "Closed", title: "Billing question regarding annual plan", updateAt: "3 days ago", color: "outline", opacity: true },
];

export default function SupportPage() {
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Ticket submitted! A specialist will respond within 24 hours.");
  };

  return (
    <main className="flex-1 p-8 md:p-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="mb-20 text-center lg:text-left relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 -translate-y-1/2 translate-x-1/2"></div>
        <h1 className="text-6xl md:text-7xl font-black text-on-surface tracking-tighter mb-8 leading-none">
          How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">help?</span>
        </h1>
        <p className="text-on-surface-variant text-xl max-w-2xl mb-12 font-medium opacity-80 leading-relaxed">
          Access our extensive knowledge base, join the developer community, or reach out to our team for personalized assistance.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-3xl group scale-100 hover:scale-[1.01] transition-all">
          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-primary text-2xl group-focus-within:animate-pulse" >search</span>
          <input 
            className="w-full pl-14 pr-6 py-6 bg-surface-container-low border border-outline-variant/10 rounded-2xl text-on-surface placeholder:text-outline-variant text-xl shadow-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
            placeholder="Search for help articles, shortcuts, or documentation..." 
            type="text"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-40">
            <kbd className="font-mono px-2.5 py-1 bg-surface-container-high text-xs rounded-lg border border-outline-variant/30 text-outline">CMD</kbd>
            <kbd className="font-mono px-2.5 py-1 bg-surface-container-high text-xs rounded-lg border border-outline-variant/30 text-outline">K</kbd>
          </div>
        </div>
      </section>

      {/* Quick Links Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
        {[
          { icon: "quiz", label: "FAQ", sub: "Instant answers", color: "primary" },
          { icon: "groups", label: "Discord", sub: "5k+ Users", color: "secondary" },
          { icon: "bug_report", label: "Report Bug", sub: "Found a glitch?", color: "error" },
          { icon: "payments", label: "Sales", sub: "Team plans", color: "tertiary" }
        ].map((item) => (
          <a key={item.label} className="group p-8 bg-surface-container-low rounded-2xl hover:bg-surface-container-high transition-all duration-500 border border-outline-variant/5 flex flex-col items-center text-center hover:translate-y-[-8px] shadow-lg shadow-black/10" href="#">
            <div className={`w-14 h-14 rounded-xl bg-${item.color}/10 flex items-center justify-center text-${item.color} mb-6 group-hover:scale-110 group-hover:bg-${item.color}/20 transition-all shadow-inner`}>
              <span className="material-symbols-outlined text-3xl" >{item.icon}</span>
            </div>
            <span className="font-black text-on-surface text-lg tracking-tight mb-2 uppercase">{item.label}</span>
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-60">{item.sub}</span>
          </a>
        ))}
      </section>

      {/* Asymmetric Support Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 pb-20">
        {/* Left: Recent Tickets */}
        <div className="lg:col-span-12 xl:col-span-7">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black tracking-tighter">Recent Tickets</h2>
            <button className="text-primary font-black uppercase text-xs tracking-widest hover:underline decoration-2 underline-offset-4">View All History</button>
          </div>
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className={`bg-surface-container-low p-6 rounded-2xl border-l-[6px] border-${ticket.color} flex items-center justify-between group cursor-pointer hover:bg-surface-container-high transition-all shadow-xl hover:translate-x-1 ${ticket.opacity ? 'opacity-60' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest font-black opacity-40">{ticket.id}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] bg-${ticket.color}/10 text-${ticket.color} font-black uppercase tracking-widest border border-${ticket.color}/20 shadow-sm`}>{ticket.status}</span>
                  </div>
                  <h3 className="text-xl font-bold text-on-surface leading-snug group-hover:text-primary transition-colors">{ticket.title}</h3>
                  <p className="text-sm text-on-surface-variant mt-2 font-medium opacity-60 italic">Updated {ticket.updateAt}</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-4xl group-hover:translate-x-1 transition-transform" >chevron_right</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-12 xl:col-span-5">
          <div className="bg-surface-container-low/60 backdrop-blur-2xl p-10 rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative overflow-hidden border border-outline-variant/10">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -z-10"></div>
            <h2 className="text-3xl font-black tracking-tighter mb-4">Still need help?</h2>
            <p className="text-on-surface-variant font-medium mb-10 opacity-80">Send us a message and we&apos;ll get back to you within 24 hours.</p>
            <form onSubmit={handleSubmitTicket} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-outline-variant opacity-60">Subject</label>
                <input className="w-full px-5 py-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium" placeholder="Brief summary of the issue" type="text" required/>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-outline-variant opacity-60">Category</label>
                <select className="w-full px-5 py-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none font-bold">
                  <option>Technical Issue</option>
                  <option>Billing & Subscription</option>
                  <option>Feature Request</option>
                  <option>Account Access</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-outline-variant opacity-60">Description</label>
                <textarea className="w-full px-5 py-4 bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none font-medium min-h-[120px]" placeholder="Explain what happened..." required></textarea>
              </div>
              <button 
                className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-on-primary font-black uppercase tracking-[0.1em] rounded-xl hover:shadow-[0_20px_40px_rgba(128,131,255,0.3)] transition-all active:scale-95 shadow-xl"
                type="submit"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
