export const formatSystemDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return String(dateString);
        
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric'
        }); // e.g. "April 01, 2026"
    } catch {
        return String(dateString);
    }
};

export const formatSystemTime = (timeString: string | null | undefined): string => {
    if (!timeString) return 'N/A';
    try {
        // Check if timeString is "HH:MM" or "HH:MM:SS"
        if (timeString.includes(':')) {
            const parts = timeString.split(':');
            let h = parseInt(parts[0], 10);
            const m = parts[1];
            
            // if parts[0] is not a number, it might be a malformed ISO string
            if (!isNaN(h)) {
                const ampm = h >= 12 ? 'pm' : 'am';
                h = h % 12;
                h = h ? h : 12; // 0 becomes 12
                const formattedH = h.toString().padStart(2, '0');
                return `${formattedH}:${m} ${ampm}`;
            }
        }
        
        // Check if it's an ISO timestamp
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
        }
        
        return timeString;
    } catch {
        return String(timeString);
    }
};

export const formatSystemDateTime = (dateString: string | null | undefined, timeString: string | null | undefined): string => {
    if (!dateString && !timeString) return 'N/A';
    if (!timeString) return formatSystemDate(dateString);
    if (!dateString) return formatSystemTime(timeString);
    
    // Some dates from the backend might just be standard dates, so format carefully.
    const dateFormatted = formatSystemDate(dateString);
    const timeFormatted = formatSystemTime(timeString);
    
    // Clean up typical comma from 'April 01, 2026' to 'April 01 2026' purely for the styling requirement
    const cleanDate = dateFormatted.replace(',', '');
    
    return `${cleanDate} - ${timeFormatted}`;
};

export const formatTimestamp = (isoString: string | Date | null | undefined): string => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return String(isoString);
        
        const dStr = date.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }).replace(',', '');
        const tStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(); 
        
        return `${dStr} - ${tStr}`;
    } catch {
        return String(isoString);
    }
};
