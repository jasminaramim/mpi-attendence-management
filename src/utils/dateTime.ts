// Bangladesh Time (GMT+6) utilities

export const getBangladeshTime = () => {
  const now = new Date();
  // Convert to Bangladesh time (GMT+6)
  const bangladeshTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  return bangladeshTime;
};

export const formatDate = (date?: Date) => {
  const d = date || getBangladeshTime();
  return d.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

export const formatTime = (date?: Date) => {
  const d = date || getBangladeshTime();
  return d.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: true 
  });
};

export const formatDateTime = () => {
  const now = getBangladeshTime();
  return {
    date: formatDate(now),
    time: formatTime(now),
    timestamp: now.getTime(),
  };
};

export const calculateDuration = (checkIn: string, checkOut: string) => {
  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };
  
  const diffMinutes = parseTime(checkOut) - parseTime(checkIn);
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}h ${minutes}m`;
};
