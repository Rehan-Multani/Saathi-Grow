import React, { useState } from 'react';
import { Headphones, Search, Filter, Clock, CheckCircle, AlertCircle, MessageCircle, Send, User, X } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const SupportTickets = () => {
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [replyText, setReplyText] = useState('');

    // Mock ticket data
    const tickets = [
        { id: 'TKT-001', customer: 'Rahul Sharma', email: 'rahul@example.com', subject: 'Product damaged during delivery', status: 'open', priority: 'high', date: '2024-02-09 10:30 AM', messages: [{ from: 'customer', text: 'The product arrived damaged', time: '10:30 AM' }] },
        { id: 'TKT-002', customer: 'Priya Singh', email: 'priya@example.com', subject: 'Wrong item received', status: 'in-progress', priority: 'medium', date: '2024-02-09 09:15 AM', messages: [{ from: 'customer', text: 'I ordered vegetables but got fruits', time: '09:15 AM' }, { from: 'vendor', text: 'We are checking this', time: '09:45 AM' }] },
        { id: 'TKT-003', customer: 'Amit Kumar', email: 'amit@example.com', subject: 'Product quality issue', status: 'resolved', priority: 'low', date: '2024-02-08 04:20 PM', messages: [{ from: 'customer', text: 'Quality not as expected', time: '04:20 PM' }, { from: 'vendor', text: 'Refund processed', time: '05:00 PM' }] },
        { id: 'TKT-004', customer: 'Neha Patel', email: 'neha@example.com', subject: 'Refund not received', status: 'open', priority: 'high', date: '2024-02-08 02:10 PM', messages: [{ from: 'customer', text: 'Waiting for refund for 5 days', time: '02:10 PM' }] },
        { id: 'TKT-005', customer: 'Sanjay Verma', email: 'sanjay@example.com', subject: 'Packaging issue', status: 'in-progress', priority: 'low', date: '2024-02-07 11:30 AM', messages: [{ from: 'customer', text: 'Package was not sealed properly', time: '11:30 AM' }] },
    ];

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchesSearch = ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusColors = {
        'open': 'bg-amber-50 text-amber-700 border-amber-100',
        'in-progress': 'bg-blue-50 text-blue-700 border-blue-100',
        'resolved': 'bg-green-50 text-green-700 border-green-100',
    };

    const priorityColors = {
        'high': 'bg-red-50 text-red-600 border-red-100',
        'medium': 'bg-yellow-50 text-yellow-600 border-yellow-100',
        'low': 'bg-gray-50 text-gray-600 border-gray-100',
    };

    const openTickets = tickets.filter(t => t.status === 'open').length;
    const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length;
    const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

    const handleSendReply = () => {
        if (replyText.trim()) {
            // In real app, send reply to backend
            setReplyText('');
            // Show success message
        }
    };

    return (
        <div className="space-y-6 lg:space-y-5 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Support Tickets</h1>
                    <p className="text-sm text-gray-500">Manage customer inquiries and support requests</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="premium-card p-5 lg:p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Open</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{openTickets}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5 lg:p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">In Progress</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{inProgressTickets}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5 lg:p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Resolved</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{resolvedTickets}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="premium-card p-4 lg:p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ticket ID, customer, or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'open', 'in-progress', 'resolved'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize border transition-colors ${filterStatus === status
                                    ? 'bg-[#0c831f] text-white border-[#0c831f]'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {status === 'in-progress' ? 'In Progress' : status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tickets List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket Cards */}
                <div className="space-y-4">
                    {filteredTickets.map(ticket => (
                        <div
                            key={ticket.id}
                            onClick={() => setSelectedTicket(ticket)}
                            className={`premium-card p-5 lg:p-4 cursor-pointer transition-all ${selectedTicket?.id === ticket.id ? 'border-[#0c831f] bg-green-50/30' : ''
                                }`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{ticket.id}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${priorityColors[ticket.priority]}`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900">{ticket.subject}</h3>
                                </div>
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${statusColors[ticket.status]}`}>
                                    {ticket.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <User size={14} />
                                <span>{ticket.customer}</span>
                                <span className="text-gray-300">•</span>
                                <span>{ticket.date}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
                                <MessageCircle size={14} />
                                <span>{ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    ))}
                    {filteredTickets.length === 0 && (
                        <div className="premium-card p-10 text-center">
                            <Headphones size={32} className="text-gray-200 mx-auto mb-3" />
                            <p className="text-sm font-bold text-gray-400">No tickets found</p>
                        </div>
                    )}
                </div>

                {/* Ticket Details */}
                <div className="lg:sticky lg:top-6">
                    {selectedTicket ? (
                        <div className="premium-card overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">{selectedTicket.id}</span>
                                        <h3 className="text-base font-bold text-gray-900 mt-1">{selectedTicket.subject}</h3>
                                    </div>
                                    <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="font-bold text-gray-900">{selectedTicket.customer}</span>
                                    <span className="text-gray-400">•</span>
                                    <span className="text-gray-500">{selectedTicket.email}</span>
                                </div>
                            </div>
                            <div className="p-5 max-h-96 overflow-y-auto space-y-4">
                                {selectedTicket.messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.from === 'vendor' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs px-4 py-3 rounded-lg ${msg.from === 'vendor'
                                            ? 'bg-[#0c831f] text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}>
                                            <p className="text-sm">{msg.text}</p>
                                            <p className={`text-xs mt-1 ${msg.from === 'vendor' ? 'text-green-100' : 'text-gray-500'}`}>
                                                {msg.time}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t border-gray-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                                    />
                                    <button
                                        onClick={handleSendReply}
                                        className="px-4 py-2 bg-[#0c831f] text-white rounded-lg hover:bg-[#0a6b19] transition-colors"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="premium-card p-20 text-center">
                            <MessageCircle size={48} className="text-gray-200 mx-auto mb-4" />
                            <p className="text-sm font-bold text-gray-400">Select a ticket to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportTickets;
