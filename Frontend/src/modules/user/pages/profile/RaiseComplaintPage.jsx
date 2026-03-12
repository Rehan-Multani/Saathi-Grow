import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ShieldCheck, CheckCircle, Camera, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as complaintApi from '../../api/complaintApi';
import { toast } from 'react-toastify';

const RaiseComplaintPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [selectedIssue, setSelectedIssue] = useState('');
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [images, setImages] = useState([]);
    const [ticketId, setTicketId] = useState('');

    const issues = id 
        ? ['Missing Item', 'Damaged Goods', 'Poor Quality', 'Payment Issue', 'Late Delivery', 'Wrong Item', 'Other']
        : ['Wallet Issue', 'App Glitch', 'Account Issue', 'Payment Failure', 'Store Experience', 'Other'];

    const isGeneral = !id;

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        // Simple mock for production - usually upload to Cloudinary directly or send as part of form
        if (files.length > 3) {
            toast.warn('You can upload up to 3 images.');
            return;
        }
        setImages(files);
        toast.info(`${files.length} images added.`);
    };

    const submitRequest = async () => {
        if (!selectedIssue) return;

        try {
            setIsSubmitting(true);

            // Use FormData for multipart/form-data upload
            const formData = new FormData();
            if (id) formData.append('orderId', id);
            formData.append('category', selectedIssue);
            formData.append('description', comment || 'No comments provided');

            // Append images to 'attachments' field
            images.forEach((image) => {
                formData.append('attachments', image);
            });

            const response = await complaintApi.raiseComplaint(token, formData);

            if (response.success) {
                setTicketId(response.complaint.ticketId);
                setSubmitted(true);
                toast.success('Complaint submitted successfully!');
            } else {
                toast.error(response.message || 'Something went wrong');
            }
        } catch (error) {
            console.error('Submission error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to submit complaint';
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-r from-[#e8f5e9] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-green-50 dark:bg-[#0c831f]/10 rounded-full flex items-center justify-center mb-6 text-[#0c831f] animate-bounce shadow-xl">
                    <CheckCircle size={32} strokeWidth={3} />
                </div>
                <h2 className="text-[17px] md:text-2xl font-black text-gray-900 dark:text-gray-100 mb-2 tracking-tight uppercase">{isGeneral ? 'Request Received' : 'Complaint registered!'}</h2>
                <div className="bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-lg mb-4">
                    <span className="text-[10px] font-black text-gray-400 mr-2">TICKET ID:</span>
                    <span className="text-[14px] font-black text-[#0c831f]">{ticketId}</span>
                </div>
                <p className="text-[11px] md:text-sm text-gray-500 mb-8 max-w-[250px] font-bold">
                    {isGeneral 
                        ? 'Our technical support team will investigate your request shortly.' 
                        : `Your complaint for Order #${id.slice(-6).toUpperCase()} is being reviewed by our Admin team.`}
                </p>
                <button
                    onClick={() => navigate('/orders')}
                    className="px-8 py-3 bg-[#0c831f] text-white rounded-xl font-black text-[12px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-green-500/20"
                >
                    Back to orders
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-[#f9fafb] to-[#ffffff] dark:from-[#141414] dark:to-[#141414] pb-10">
            {/* Native Mobile Header */}
            <div className="sticky top-0 z-40 bg-white/60 dark:bg-black/40 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 p-4 transition-all">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white dark:bg-white/5 rounded-full shadow-sm text-gray-600 dark:text-gray-300 active:scale-95 transition-all border border-gray-100 dark:border-white/10">
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="text-[13.5px] md:text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none uppercase">{isGeneral ? 'Get Help & Support' : 'Raise complaint'}</h1>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl p-6 shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-white/5 space-y-8">
                    {/* Reason Selection */}
                    <div>
                        <p className="!text-[9px] md:!text-sm font-black text-gray-400 tracking-[0.2em] mb-4 px-1 uppercase">Reason for complaint</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {issues.map((issue, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedIssue(issue)}
                                    className={`py-3 px-4 rounded-xl text-left transition-all !text-[11px] md:!text-base font-black flex items-center justify-between group border uppercase tracking-tight ${selectedIssue === issue
                                        ? 'bg-[#0c831f]/10 border-[#0c831f] text-[#0c831f] shadow-sm'
                                        : 'bg-gray-50/50 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-400'}`}
                                >
                                    <span>{issue}</span>
                                    {selectedIssue === issue && <CheckCircle size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <p className="!text-[9px] md:!text-sm font-black text-gray-400 tracking-[0.2em] mb-4 px-1 uppercase">Upload Evidence (Optional)</p>
                        <label className="flex flex-col items-center justify-center py-6 bg-gray-50/50 dark:bg-white/5 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl cursor-pointer hover:bg-[#0c831f]/5 transition-all group">
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                            <Camera size={24} className="text-gray-400 group-hover:text-[#0c831f] transition-all mb-2" />
                            <span className="text-[10px] md:text-sm font-black text-gray-400 group-hover:text-[#0c831f] transition-all uppercase tracking-widest">{images.length > 0 ? `${images.length} images selected` : 'Click to upload photos'}</span>
                            <p className="text-[8px] text-gray-300 mt-1">MAX 3 IMAGES · DAMAGED OR WRONG ITEMS</p>
                        </label>
                    </div>

                    {/* Comments */}
                    <div>
                        <p className="text-[9.5px] md:text-sm font-black text-gray-400 tracking-[0.2em] mb-4 uppercase">Additional details</p>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Please provide details about your issue..."
                            className="w-full h-32 p-4 bg-gray-50/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0c831f]/50 text-[12px] md:text-lg dark:text-white placeholder:text-gray-400 font-bold transition-all"
                        />
                    </div>

                    {/* Policy Banner */}
                    <div className="bg-amber-50/50 dark:bg-amber-500/10 p-4 rounded-2xl flex gap-4 text-amber-700 dark:text-amber-500 border border-amber-100 dark:border-amber-500/10">
                        <ShieldCheck size={28} className="flex-shrink-0" />
                        <p className="text-[10px] md:text-[14px] font-black leading-tight italic uppercase tracking-tighter">
                            Your protection is our priority. Complaints are escalated directly to the store manager and monitored by SaathiGro Admins.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={!selectedIssue || isSubmitting}
                        onClick={submitRequest}
                        className={`w-full py-4 rounded-2xl text-[12px] md:text-xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${selectedIssue && !isSubmitting
                            ? 'bg-[#0c831f] text-white shadow-green-500/30 ring-4 ring-green-500/5'
                            : 'bg-gray-200 dark:bg-white/10 text-gray-400 cursor-not-allowed shadow-none'}`}
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        {isSubmitting ? 'Submitting...' : 'Register Ticket'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RaiseComplaintPage;


