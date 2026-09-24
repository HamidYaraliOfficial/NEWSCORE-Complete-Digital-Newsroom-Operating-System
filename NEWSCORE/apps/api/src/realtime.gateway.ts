import { Controller, MessageEvent, Sse } from '@nestjs/common'; import { Observable, Subject } from 'rxjs'; import { EventBusService } from './common/event-bus.service';
@Controller('realtime') export class RealtimeController {
  private readonly stream=new Subject<MessageEvent>();
  constructor(bus:EventBusService){for(const event of ['article.published','article.updated','breaking.created','breaking.updated','liveblog.updated','assignment.created']) bus.on<any>(event,p=>this.stream.next({type:event,data:p}));}
  @Sse('stream') streamEvents():Observable<MessageEvent>{return this.stream.asObservable();}
}
