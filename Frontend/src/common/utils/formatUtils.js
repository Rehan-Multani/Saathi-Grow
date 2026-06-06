/**
 * formatUtils.js
 * Centralized formatting utilities for dates, currency, and other common patterns.
 */

export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

export const formatCurrency = (amount) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    const formatted = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    }).format(val);
    return `₹${formatted}`;
};

export const formatCompactNumber = (number) => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    }).format(number);
};

export const downloadCSV = (content, fileName) => {
    if (content instanceof Blob) {
        try {
            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result;
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
            reader.readAsDataURL(content);
        } catch (e) {
            console.error("Blob FileReader read failed, trying URL fallback:", e);
            const url = URL.createObjectURL(content);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    } else {
        try {
            const base64Content = btoa(unescape(encodeURIComponent(content)));
            const url = `data:text/csv;base64,${base64Content}`;
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error("Base64 CSV download failed, trying fallback:", e);
            const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
            downloadCSV(blob, fileName);
        }
    }
};
