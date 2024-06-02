import { EventEmitter } from 'eventemitter3';

// 创建一个 EventEmitter 实例
export const eventBus = new EventEmitter();

export function getIsDev() {
  return process.env.NODE_ENV === 'development';
}

export function getIsProd() {
  return process.env.NODE_ENV === 'production';
}
