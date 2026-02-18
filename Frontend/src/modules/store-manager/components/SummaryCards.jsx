import React from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SummaryCards = ({ stats }) => {
    const navigate = useNavigate();

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats.map((stat, index) => {
                const Icon = Icons[stat.icon] || Icons.Activity;
                return (
                    <div
                        key={index}
                        onClick={() => stat.path && navigate(stat.path)}
                        className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group ${stat.path ? 'cursor-pointer hover:border-blue-300' : 'cursor-default'}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                                <Icon size={20} className={stat.textColor} />
                            </div>
                            {stat.trend !== 0 && (
                                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${stat.trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                    {stat.trend > 0 ? <Icons.TrendingUp size={10} /> : <Icons.TrendingDown size={10} />}
                                    {Math.abs(stat.trend)}%
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-0.5">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;
