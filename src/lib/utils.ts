import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts price level (1-4) to Norwegian Kroner range
 * Based on typical drink prices in Bergen bars
 */
export function getPriceRangeInNOK(priceLevel: number): string {
  const ranges: Record<number, string> = {
    1: '50-100 kr', // Budget-friendly
    2: '100-150 kr', // Moderate
    3: '150-250 kr', // Upscale
    4: '250+ kr', // Premium/Luxury
  };
  
  return ranges[priceLevel] || ranges[2]; // Default to moderate
}

/**
 * Formats distance in meters to human-readable string
 */
export function formatDistance(meters?: number): string {
  if (!meters) return '';
  
  if (meters < 1000) {
    return `${Math.round(meters)} meters`;
  }
  
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Converts 24-hour time string (e.g., "1530") to readable format (e.g., "15:30")
 */
export function formatTime(time: string): string {
  if (!time || time.length !== 4) return time;
  
  const hours = time.substring(0, 2);
  const minutes = time.substring(2, 4);
  return `${hours}:${minutes}`;
}

/**
 * Formats business hours for display
 */
export function formatBusinessHours(hours?: Array<{
  day: number;
  start: string;
  end: string;
  is_overnight: boolean;
}>): string {
  if (!hours || hours.length === 0) return 'Hours not available';
  
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Group consecutive days with same hours
  const grouped: Array<{ days: string; hours: string }> = [];
  let currentGroup: number[] = [];
  let currentHours = '';
  
  hours.forEach((hour, index) => {
    const timeStr = `${formatTime(hour.start)}-${formatTime(hour.end)}`;
    
    if (timeStr !== currentHours && currentGroup.length > 0) {
      // Save previous group
      const dayRange = currentGroup.length === 1 
        ? dayNames[currentGroup[0]]
        : `${dayNames[currentGroup[0]]}-${dayNames[currentGroup[currentGroup.length - 1]]}`;
      grouped.push({ days: dayRange, hours: currentHours });
      currentGroup = [];
    }
    
    currentGroup.push(hour.day);
    currentHours = timeStr;
    
    // If it's the last item, save the group
    if (index === hours.length - 1) {
      const dayRange = currentGroup.length === 1 
        ? dayNames[currentGroup[0]]
        : `${dayNames[currentGroup[0]]}-${dayNames[currentGroup[currentGroup.length - 1]]}`;
      grouped.push({ days: dayRange, hours: currentHours });
    }
  });
  
  return grouped.map(g => `${g.days}: ${g.hours}`).join(', ');
}
