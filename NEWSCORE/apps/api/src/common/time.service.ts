import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

export interface Rule { day:number; open:string; close:string; enabled:boolean; }
const minute = (s:string) => { const [h,m] = s.split(':').map(Number); return h*60+m; };

@Injectable()
export class TimeService {
  availability(now:Date, timezone:string, rules:Rule[]) {
    const local=DateTime.fromJSDate(now).setZone(timezone);
    const current=local.hour*60+local.minute;
    const today=rules.find(r=>r.day===local.weekday%7&&r.enabled);
    if(today){
      const open=minute(today.open), close=minute(today.close);
      const sameDay = close>=open;
      const isOpen = sameDay ? current>=open && current<close : current>=open || current<close;
      if(isOpen){
        let closeAt=local.startOf('day').set({hour:Number(today.close.split(':')[0]),minute:Number(today.close.split(':')[1]),second:0,millisecond:0});
        if(!sameDay && current>=open) closeAt=closeAt.plus({days:1});
        return {timezone,now:now.toISOString(),state:'open' as const,currentWindow:{open:today.open,close:today.close,day:local.weekday%7},secondsUntilClose:Math.max(0,Math.floor(closeAt.diff(local,'seconds').seconds))};
      }
    }
    for(let offset=0;offset<8;offset++){
      const candidateDay=(local.weekday%7+offset)%7;
      const rule=rules.find(r=>r.day===candidateDay&&r.enabled); if(!rule) continue;
      let candidate=local.plus({days:offset}).startOf('day').set({hour:Number(rule.open.split(':')[0]),minute:Number(rule.open.split(':')[1]),second:0,millisecond:0});
      if(candidate<=local) continue;
      return {timezone,now:now.toISOString(),state:'closed' as const,nextOpenAt:candidate.toUTC().toISO(),secondsUntilNextOpen:Math.floor(candidate.diff(local,'seconds').seconds)};
    }
    return {timezone,now:now.toISOString(),state:'closed' as const};
  }
}
