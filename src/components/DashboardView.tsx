import React from "react";
import { PipelineDeal, PipelineStage, OutreachContact } from "../types";
import { TrendingUp, DollarSign, Activity, FileCheck, PhoneCall, ArrowUpRight, BarChart3, Building } from "lucide-react";

interface DashboardViewProps {
  deals: PipelineDeal[];
  outreach: OutreachContact[];
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ deals, outreach, onNavigate }) => {
  // Aggregate Metrics
  const activeDeals = deals.filter(d => d.stage !== PipelineStage.DEAD);
  const totalSDE = activeDeals.reduce((sum, d) => sum + d.adjustedSDE, 0);
  const averageSDE = activeDeals.length ? Math.round(totalSDE / activeDeals.length) : 0;
  
  // Avg Multiple (only PASS/PAUSE deals)
  const positiveDeals = activeDeals.filter(d => d.verdict !== "KILL");
  const avgMultiple = positiveDeals.length 
    ? (positiveDeals.reduce((sum, d) => sum + d.purchaseMultiple, 0) / positiveDeals.length)
    : 0;
    
  const dscrAvg = positiveDeals.length
    ? (positiveDeals.reduce((sum, d) => sum + d.closeDayDSCR, 0) / positiveDeals.length)
    : 0;

  // Stages Count for Pipeline Chart
  const stageStats = Object.values(PipelineStage).reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage).length;
    return acc;
  }, {} as Record<PipelineStage, number>);

  // Outreach Stats
  const totalOutreach = outreach.length;
  const inDiligence = deals.filter(d => d.stage === PipelineStage.DUE_DILIGENCE).length;
  const loiDeals = deals.filter(d => d.stage === PipelineStage.LOI || d.stage === PipelineStage.DUE_DILIGENCE).length;

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-800">Workspace Dashboard</h2>
        <p className="text-slate-500 text-xs">M&A Acquisition Pipeline Insights & Outreach Analytics</p>
      </div>

      {/* Grid: High-Value Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Pipeline SDE</span>
            <div className="bg-indigo-50 p-1.5 rounded-lg text-indigo-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">${totalSDE.toLocaleString()}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Across active evaluated deals</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Avg Purchase Multiple</span>
            <div className="bg-teal-50 p-1.5 rounded-lg text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">{avgMultiple ? `${avgMultiple.toFixed(2)}x` : "N/A"}</h3>
            <p className="text-[10px] text-slate-400 font-medium">For qualifying Buy-Box deals</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Outreach Contacts</span>
            <div className="bg-amber-50 p-1.5 rounded-lg text-amber-600">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">{totalOutreach}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Brokers and Direct-to-Owner campaigns</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">LOI / DD Queue</span>
            <div className="bg-rose-50 p-1.5 rounded-lg text-rose-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">{loiDeals}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Deals past screening gates</p>
          </div>
        </div>
      </div>

      {/* Main Analytics Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Distribution Chart (Native SVG) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-500" />
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Acquisition Pipeline Stage Overview</h4>
              </div>
              <button 
                onClick={() => onNavigate("pipeline")}
                className="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold flex items-center gap-0.5"
              >
                Go to Pipeline <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4 py-2">
              {Object.entries(stageStats).map(([stage, count]) => {
                const maxCount = Math.max(...Object.values(stageStats), 1);
                const widthPercent = Math.max(8, (count / maxCount) * 100);
                
                // Color map for stages
                const colors: Record<string, string> = {
                  [PipelineStage.DEAL_INTAKE]: "bg-emerald-500",
                  [PipelineStage.SCREENING]: "bg-indigo-500",
                  [PipelineStage.PIPELINE]: "bg-cyan-500",
                  [PipelineStage.OUTREACH]: "bg-violet-500",
                  [PipelineStage.LOI]: "bg-amber-500",
                  [PipelineStage.DUE_DILIGENCE]: "bg-blue-500",
                  [PipelineStage.DEAD]: "bg-slate-400"
                };

                return (
                  <div key={stage} className="flex items-center gap-4 text-xs">
                    <span className="w-28 text-[11px] font-semibold text-slate-600 truncate">{stage}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-4 relative overflow-hidden">
                      <div 
                        className={`h-full ${colors[stage] || "bg-indigo-500"} transition-all duration-500 rounded-full`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                    <span className="w-6 text-right font-black text-slate-700 text-xs">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <span>Average SDE quality score: {averageSDE ? `$${averageSDE.toLocaleString()}/yr` : "N/A"}</span>
            <span>Target Sweet Spot: $200k - $300k</span>
          </div>
        </div>

        {/* Quick Insights card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 text-slate-700">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Search Insights</h4>
          </div>

          {activeDeals.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No deals currently in screening. Use of <strong>Deal Intake</strong> to add your first deal!
            </div>
          ) : (
            <div className="space-y-3">
              {/* Dynamic screening result summary */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Screener Quality</span>
                <div className="flex gap-2 p-2 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex-1 text-center py-1 border-r border-slate-200">
                    <span className="text-xs text-emerald-600 font-bold block">
                      {deals.filter(d => d.verdict === "PASS").length}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Pass</span>
                  </div>
                  <div className="flex-1 text-center py-1 border-r border-slate-200">
                    <span className="text-xs text-amber-500 font-bold block">
                      {deals.filter(d => d.verdict === "PAUSE" || d.verdict === "HOLD").length}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Hold / Pause</span>
                  </div>
                  <div className="flex-1 text-center py-1">
                    <span className="text-xs text-rose-500 font-bold block">
                      {deals.filter(d => d.verdict === "KILL" || d.stage === PipelineStage.DEAD).length}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Kill/Dead</span>
                  </div>
                </div>
              </div>

              {/* Action items list */}
              <div className="space-y-1 pb-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Urgent Actions</span>
                <div className="space-y-2">
                  {deals.filter(d => d.verdict === "PAUSE").slice(0, 2).map(deal => (
                    <div key={deal.id} className="p-2 border border-amber-100 bg-amber-50/50 rounded-xl text-[10px] space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold text-amber-800">
                        <span>{deal.businessName}</span>
                        <span className="px-1.5 py-0.5 bg-amber-100 rounded uppercase text-[8px]">Conditions</span>
                      </div>
                      <p className="text-slate-500 text-[9px] italic">Review state labor law flags or platform risk mitigations.</p>
                    </div>
                  ))}
                  {deals.filter(d => d.stage === PipelineStage.DUE_DILIGENCE).slice(0, 1).map(deal => (
                    <div key={deal.id} className="p-2 border border-indigo-100 bg-indigo-50/50 rounded-xl text-[10px] space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-bold text-indigo-800">
                        <span>{deal.businessName}</span>
                        <span className="px-1.5 py-0.5 bg-indigo-100 rounded uppercase text-[8px]">Active DD</span>
                      </div>
                      <p className="text-slate-500 text-[9px] italic">Verify QofE tax matches and execute Escrow agreements.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Outreach Campaign Overview */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-500" />
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">Outreach Campaign Engagement Logs</h4>
          </div>
          <button 
            onClick={() => onNavigate("outreach")}
            className="text-indigo-600 hover:text-indigo-700 text-[10px] font-bold"
          >
            Manage Contacts
          </button>
        </div>

        {outreach.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No outreach logged yet. Connect with brokers or cold-email owners in the <strong>Outreach Section</strong>!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {outreach.slice(0, 4).map(contact => (
              <div key={contact.id} className="p-3 border border-slate-100 rounded-xl hover:border-slate-200 transition-all space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-700">{contact.name}</h5>
                    <p className="text-[9px] text-slate-400">{contact.firm || "Direct Owner"}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    contact.status.includes("Diligence") || contact.status.includes("Active")
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                  }`}>
                    {contact.status.replace("Contacted / ", "")}
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 italic truncate font-medium">"{contact.notes}"</p>
                <div className="flex justify-between items-center text-[8px] text-slate-400 pt-1 border-t border-slate-50">
                  <span>Last contact: {contact.lastContactDate}</span>
                  <span className="font-bold text-indigo-500 uppercase">{contact.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
