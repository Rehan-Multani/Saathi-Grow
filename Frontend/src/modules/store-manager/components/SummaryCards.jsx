import React from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SummaryCards = ({ stats }) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
                const Icon = Icons[stat.icon] || Icons.Activity;
                const hasTrend = typeof stat.trend === 'number' && !isNaN(stat.trend) && stat.trend !== 0;

                return (
                    <div
                        key={index}
                        onClick={() => stat.path && navigate(stat.path)}
                        className={`bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group ${stat.path ? 'cursor-pointer hover:border-blue-400' : 'cursor-default'}`}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center transition-all duration-300 group-hover:bg-blue-50 group-hover:scale-110 shadow-sm border border-slate-100">
                                <Icon size={24} className="text-slate-600 group-hover:text-blue-600 transition-colors" />
                            </div>
                            
                            {hasTrend && (
                                <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${stat.trend > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {stat.trend > 0 ? <Icons.TrendingUp size={12} /> : <Icons.TrendingDown size={12} />}
                                    {Math.abs(stat.trend).toFixed(1)}%
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;
