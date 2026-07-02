import React, { useState } from "react";
import { PipelineDeal, PipelineStage } from "../types";
import { CheckCircle2, AlertCircle, XCircle, RotateCcw, Trash2, Edit, Save, ArrowRight, Kanban, List } from "lucide-react";

interface PipelineViewProps {
  deals: PipelineDeal[];
  onUpdateStage: (dealId: string, newStage: PipelineStage) => void;
  onUpdateNotes: (dealId: string, notes: string) => void;
  onDeleteDeal: (dealId: string) => void;
  onEditDeal: (deal: PipelineDeal) => void;
}

export const PipelineView: React.FC<PipelineViewProps> = ({
  deals,
  onUpdateStage,
  onUpdateNotes,
  onDeleteDeal,
  onEditDeal
}) => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>("");

  const handleStartEditNotes = (deal: PipelineDeal) => {
    setEditingNotesId(deal.id);
    setTempNotes(deal.notes || "");
  };

  const handleSaveNotes = (id: string) => {
    onUpdateNotes(id, tempNotes);
    setEditingNotesId(null);
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case "PASS":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-lg text-[9px] font-black uppercase">PASS</span>;
      case "PAUSE":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded-lg text-[9px] font-black uppercase">PAUSE</span>;
      case "HOLD":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-lg text-[9px] font-black uppercase">HOLD</span>;
      case "KILL":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-[9px] font-black uppercase">KILL</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-[9px] font-black uppercase">INCOMPLETE</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-800">M&A Acquisition Pipeline</h2>
          <p className="text-slate-500 text-xs">Verify metrics, record progress, and advance deals from screening to close.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start border border-slate-200/50">
          <button 
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "kanban" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Kanban className="w-4 h-4" /> Board (Kanban)
          </button>
          <button 
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === "table" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <List className="w-4 h-4" /> Table View
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        /* Kanban Board View */
        <div className="flex gap-4 items-start overflow-x-auto pb-4 w-full">
          {Object.values(PipelineStage).map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            return (
              <div key={stage} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 min-w-[260px] flex-1 shrink-0 space-y-3">
                <div className="flex items-center justify-between border-b pb-2 text-slate-700">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-600 truncate">{stage}</h4>
                  <span className="px-2 py-0.5 bg-slate-200 rounded-full text-[10px] font-black text-slate-500">
                    {stageDeals.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-6 text-[10px] text-slate-400 font-medium italic border border-dashed border-slate-200 rounded-xl bg-white/40">
                      Empty column
                    </div>
                  ) : (
                    stageDeals.map(deal => (
                      <div key={deal.id} className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm space-y-2.5 hover:border-indigo-300 transition-all">
                        {/* Title & Verdict */}
                        <div className="flex items-start justify-between gap-1.5">
                          <h5 className="text-[11px] font-bold text-slate-700 tracking-tight leading-tight line-clamp-2">{deal.businessName}</h5>
                          {getVerdictBadge(deal.verdict)}
                        </div>

                        {/* Numeric Financial Indicators */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 bg-slate-50/60 p-2 rounded-xl border border-slate-100 text-[9px] font-semibold text-slate-500">
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400">AGD SDE</span>
                            <span className="text-slate-800 font-bold">${Math.round(deal.adjustedSDE / 1000)}k</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400">MULTIPLE</span>
                            <span className="text-slate-800 font-bold">{deal.purchaseMultiple.toFixed(2)}x</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400">OFCF</span>
                            <span className="text-teal-600 font-extrabold">${Math.round(deal.baseOFCF / 1000)}k/y</span>
                          </div>
                          <div>
                            <span className="block text-[8px] font-bold text-slate-400">DSCR</span>
                            <span className="text-slate-800 font-bold">{deal.closeDayDSCR ? `${deal.closeDayDSCR.toFixed(2)}x` : "N/A"}</span>
                          </div>
                        </div>

                        {/* Note area */}
                        {editingNotesId === deal.id ? (
                          <div className="space-y-1">
                            <textarea
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              className="w-full text-[10px] border border-blue-300 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              rows={2}
                            />
                            <div className="flex justify-end gap-1">
                              <button 
                                onClick={() => setEditingNotesId(null)} 
                                className="px-2 py-0.5 text-[8px] bg-slate-100 font-bold text-slate-500 rounded-md"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleSaveNotes(deal.id)} 
                                className="px-2 py-0.5 text-[8px] bg-indigo-600 font-bold text-white rounded-md flex items-center gap-0.5"
                              >
                                <Save className="w-2 h-2" /> Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => handleStartEditNotes(deal)}
                            className="bg-slate-50 p-1.5 rounded text-[9px] text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 transition-colors cursor-pointer italic line-clamp-2"
                          >
                            {deal.notes || "Click to add log details..."}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[10px]">
                          <select
                            value={deal.stage}
                            onChange={(e) => onUpdateStage(deal.id, e.target.value as PipelineStage)}
                            className="text-[9px] font-bold border rounded p-1 bg-white text-slate-600 max-w-[120px]"
                          >
                            {Object.values(PipelineStage).map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          <div className="flex gap-2 shrink-0">
                            <button
                              onClick={() => onEditDeal(deal)}
                              title="Edit deal structure & recalulate"
                              className="text-slate-400 hover:text-indigo-600 p-1 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteDeal(deal.id)}
                              title="Delete Deal"
                              className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
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
          })}
        </div>
      ) : (
        /* Table / List View */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-3">Deal Details</th>
                <th className="px-6 py-3">Calculated SDE</th>
                <th className="px-6 py-3">Asking / Stack</th>
                <th className="px-6 py-3">Closing DSCR</th>
                <th className="px-6 py-3">OFCF</th>
                <th className="px-6 py-3">Stage</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-xs text-slate-400 italic">No deals tracked. Go to "Intake" to analyze.</td>
                </tr>
              ) : (
                deals.map(deal => (
                  <tr key={deal.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-700">{deal.businessName}</span>
                        {getVerdictBadge(deal.verdict)}
                      </div>
                      <p className="text-[10px] text-slate-400 text-medium">{deal.dealInput.businessType} • {deal.dealInput.industry || "General"}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600">${deal.adjustedSDE.toLocaleString()}</td>
                    <td className="px-6 py-4 space-y-0.5">
                      <span className="font-bold text-slate-700">${deal.askingPrice.toLocaleString()}</span>
                      <span className="block text-[9px] text-slate-400">Multiple: {deal.purchaseMultiple.toFixed(2)}x</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-600">{deal.closeDayDSCR ? `${deal.closeDayDSCR.toFixed(2)}x` : "N/A"}</td>
                    <td className="px-6 py-4 font-extrabold text-teal-600">${deal.baseOFCF.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <select
                        value={deal.stage}
                        onChange={(e) => onUpdateStage(deal.id, e.target.value as PipelineStage)}
                        className="text-[10px] font-bold border rounded p-1.5 bg-white text-slate-600"
                      >
                        {Object.values(PipelineStage).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => onEditDeal(deal)}
                          title="Screener Engine"
                          className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteDeal(deal.id)}
                          title="Delete"
                          className="text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
