import React from 'react';
import { ActivityLog } from '../../types';
import { Activity, Clock, User, ShieldCheck } from 'lucide-react';

interface ActivityLogViewerProps {
  logs: ActivityLog[];
}

export const ActivityLogViewer: React.FC<ActivityLogViewerProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-400" />
          System Activity Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Comprehensive audit trail of editorial actions, logins, and article modifications
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-3 px-4 text-white font-sans font-semibold">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {log.userName}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-800 text-amber-300 border border-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
