export type Interval={startsAt:Date;endsAt:Date};
export function overlaps(a:Interval,b:Interval){return a.startsAt < b.endsAt && a.endsAt > b.startsAt}
export function freeSlots(openMinute:number,closeMinute:number,duration:number, date:string, occupied:Interval[], step=30){
  const slots:Date[]=[]; for(let m=openMinute;m+duration<=closeMinute;m+=step){const startsAt=new Date(`${date}T${String(m/60|0).padStart(2,"0")}:${String(m%60).padStart(2,"0")}:00-03:00`);const endsAt=new Date(startsAt.getTime()+duration*60000);if(startsAt.getTime()>Date.now()&&!occupied.some(x=>overlaps({startsAt,endsAt},x)))slots.push(startsAt)} return slots;
}
