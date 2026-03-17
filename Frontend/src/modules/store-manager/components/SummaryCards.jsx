import React from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SummaryCards = ({ stats }) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats.map((stat, index) => {
                const Icon = Icons[stat.icon] || Icons.Activity;
                const hasTrend = typeof stat.trend === 'number' && !isNaN(stat.trend) && stat.trend !== 0;

                return (
                    <div
                        key={index}
                        onClick={() => stat.path && navigate(stat.path)}
                        className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group ${stat.path ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            {/* Unified Light Gray Background for Icons */}
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center transition-all duration-300 group-hover:bg-slate-200 group-hover:scale-110 shadow-sm border border-slate-200/50">
                                <Icon size={20} className="text-slate-600 group-hover:text-slate-900 transition-colors" />
                            </div>
                            
                            {hasTrend && (
                                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${stat.trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {stat.trend > 0 ? <Icons.TrendingUp size={10} /> : <Icons.TrendingDown size={10} />}
                                    {Math.abs(stat.trend).toFixed(1)}%
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">{stat.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;
