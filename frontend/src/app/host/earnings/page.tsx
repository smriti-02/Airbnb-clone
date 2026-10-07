"use client";

import { useEffect, useState } from "react";
import { hostApi } from "@/lib/hostApi";
import { formatINR } from "@/lib/format";

export default function EarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hostApi.getEarnings()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="h-10 w-48 bg-gray-200 animate-pulse rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  // Bar chart math
  const monthlyChart = Object.entries(data.monthly || {}).map(([month, amount]) => ({ month, amount }));
  const maxAmount = Math.max(...monthlyChart.map((m: any) => m.amount as number), 1); // prevent div by zero

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Earnings</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 font-semibold mb-2">This month</p>
          <p className="text-4xl font-bold">{formatINR(data.this_month || 0)}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 font-semibold mb-2">Upcoming</p>
          <p className="text-4xl font-bold">{formatINR(data.upcoming || 0)}</p>
        </div>
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <p className="text-gray-500 font-semibold mb-2">Total earned</p>
          <p className="text-4xl font-bold">{formatINR(data.total_earned || data.total || 0)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Past 6 months</h2>
        <div className="h-64 border-b border-gray-200 flex items-end gap-2 sm:gap-4 md:gap-8 pb-4 relative">
          {monthlyChart.map((m: any) => {
            const height = `${(m.amount / maxAmount) * 100}%`;
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                {/* Tooltip */}
                <div className="absolute -top-10 bg-black text-white px-3 py-1 rounded text-sm font-semibold opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                  {formatINR(m.amount)}
                </div>
                {/* Bar */}
                <div 
                  className="w-full max-w-[60px] bg-black rounded-t-sm transition-all duration-500 ease-out group-hover:bg-gray-700" 
                  style={{ height: height === "0%" ? "2px" : height }}
                ></div>
                {/* Label */}
                <span className="absolute -bottom-8 text-sm font-semibold text-gray-500">{m.month}</span>
              </div>
            );
          })}
        </div>
        <div className="h-8"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* By Listing */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Earnings by listing</h2>
          {(data.by_listing || []).length === 0 ? (
            <p className="text-gray-500">No earnings yet.</p>
          ) : (
            <div className="border rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold">Listing</th>
                    <th className="p-4 font-semibold text-right">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.by_listing || []).map((l: any, i: number) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="p-4 max-w-[200px] truncate">{l.title}</td>
                      <td className="p-4 text-right font-semibold">{formatINR(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recent payouts</h2>
          {(data.recent || []).length === 0 ? (
            <p className="text-gray-500">No recent payouts.</p>
          ) : (
            <div className="space-y-4">
              {(data.recent || []).map((r: any) => (
                <div key={r.id} className="border rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{r.guest_name}</p>
                    <p className="text-sm text-gray-500">{new Date(r.check_in).toLocaleDateString()} • {r.listing_title}</p>
                  </div>
                  <div className="font-bold text-lg">{formatINR(r.total_price)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
