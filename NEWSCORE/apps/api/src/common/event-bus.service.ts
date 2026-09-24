import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter } from 'node:events';

@Injectable()
export class EventBusService implements OnModuleDestroy {
  private readonly emitter = new EventEmitter();
  emit<T>(event: string, payload: T) { this.emitter.emit(event, payload); }
  on<T>(event: string, handler: (payload: T) => void) { this.emitter.on(event, handler); }
  onModuleDestroy() { this.emitter.removeAllListeners(); }
}
