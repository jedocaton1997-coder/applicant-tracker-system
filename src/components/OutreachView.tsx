import React, { useState } from "react";
import { OutreachContact, OutreachType, OutreachStatus } from "../types";
import { Plus, Search, Calendar, Phone, Mail, Building, Trash2, ShieldCheck, Play, ArrowRight, NotebookPen } from "lucide-react";

interface OutreachViewProps {
  contacts: OutreachContact[];
  onAddContact: (contact: OutreachContact) => void;
  onUpdateContactStatus: (id: string, status: OutreachStatus) => void;
  onDeleteContact: (id: string) => void;
  onStartScreener: (businessName: string) => void;
}

export const OutreachView: React.FC<OutreachViewProps> = ({
  contacts,
  onAddContact,
  onUpdateContactStatus,
  onDeleteContact,
  onStartScreener
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Form states
  const [name, setName] = useState("");
  const [firm, setFirm] = useState("");
  const [type, setType] = useState<OutreachType>(OutreachType.BROKER);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    onAddContact({
      id: `outreach-${Date.now()}`,
      name,
      firm,
      type,
      email,
      phone,
      lastContactDate: new Date().toISOString().split('T')[0],
      status: OutreachStatus.COLD,
      notes
    });

    // Reset Form
    setName("");
    setFirm("");
    setType(OutreachType.BROKER);
    setEmail("");
    setPhone("");
    setNotes("");
    setShowAddForm(false);
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.firm?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.notes?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "ALL" || contact.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800">Broker & Outbound Outreach Hub</h2>
          <p className="text-slate-500 text-xs">Execute directowner acquisition campaigns, organize intermediaries, and convert warm leads.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 self-start shrink-0"
        >
          <Plus className="w-4 h-4" /> Log Outreach Contact
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-4 max-w-2xl">
          <h3 className="font-bold text-indigo-800 text-xs uppercase tracking-widest pl-1">New Outreach Target Contact Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contact Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Brad Sterling"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Firm / Company Name</label>
              <input
                type="text"
                value={firm}
                onChange={(e) => setFirm(e.target.value)}
                placeholder="e.g. Transworld Business Advisors"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Outreach Sourcing Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OutreachType)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-700 font-medium"
              >
                {Object.values(OutreachType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Direct Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="brad@transworld.com"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Direct Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(512) 555-0105"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-700 font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Initial Engagement Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Inquired about manufacturing or service businesses under $1.5M..."
              rows={3}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded-lg text-slate-700 font-medium"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
            >
              Add Contact log
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search outreach contacts or brokers..."
            className="w-full bg-transparent text-xs text-slate-700 font-medium focus:outline-none"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterType === "ALL" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:text-slate-700"
            }`}
          >
            All Channels
          </button>
          {Object.values(OutreachType).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                filterType === t ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Master Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredContacts.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white border border-slate-200 border-dashed rounded-3xl text-sm text-slate-400 italic">
            No outreach matching filters. Start logging new leads above!
          </div>
        ) : (
          filteredContacts.map(contact => (
            <div key={contact.id} className="bg-white border border-slate-200 rounded-2xl p-4.5 shadow-sm space-y-4 hover:border-indigo-200 transition-all flex flex-col justify-between">
              
              <div className="space-y-2">
                {/* Header Information */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-slate-700">{contact.name}</h4>
                    {contact.firm && <p className="text-[10px] text-slate-400 font-semibold">{contact.firm}</p>}
                  </div>
                  <span className="px-2 py-0.5 text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 rounded">
                    {contact.type}
                  </span>
                </div>

                {/* Status Selector Dropdown */}
                <div>
                  <select
                    value={contact.status}
                    onChange={(e) => onUpdateContactStatus(contact.id, e.target.value as OutreachStatus)}
                    className="text-[10px] font-bold border rounded p-1.5 bg-slate-50 text-slate-600 w-full"
                  >
                    {Object.values(OutreachStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Engagement Notes */}
                <p className="bg-slate-50 p-2.5 rounded-xl text-[10px] text-slate-500 border border-slate-100/50 leading-relaxed italic line-clamp-3">
                  "{contact.notes || "No engagement logs recorded."}"
                </p>
              </div>

              {/* Action and Links Footer */}
              <div className="space-y-3.5 pt-3 border-t border-slate-50">
                <div className="space-y-1 text-[9px] text-slate-400">
                  {contact.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last touch: {contact.lastContactDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1">
                  <button
                    onClick={() => onStartScreener(contact.firm || contact.name)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[9px] py-2 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-all uppercase tracking-wider"
                  >
                    <Play className="w-2.5 h-2.5 fill-white text-white" /> Screen Lead
                  </button>
                  <button
                    onClick={() => onDeleteContact(contact.id)}
                    className="p-2 border border-slate-200 hover:border-rose-200 text-slate-400 hover:text-rose-500 rounded-lg transition-colors shrink-0"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};
