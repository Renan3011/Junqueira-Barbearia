export const TZ = "America/Sao_Paulo";
export function localToUtc(date: string, minute: number) { return new Date(`${date}T${String(Math.floor(minute / 60)).padStart(2,"0")}:${String(minute % 60).padStart(2,"0")}:00-03:00`); }
export function weekday(date: string) { const [y,m,d]=date.split("-").map(Number); return new Date(Date.UTC(y,m-1,d)).getUTCDay(); }
export function dayBounds(date: string) { return { start: localToUtc(date,0), end: localToUtc(date,1440) }; }
export function isPast(date: Date) { return date.getTime() < Date.now(); }
