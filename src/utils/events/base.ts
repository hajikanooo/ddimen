import { EventEmitter } from 'eventemitter3';

export class DDEventBus {
  eventBus: EventEmitter = new EventEmitter();
}
