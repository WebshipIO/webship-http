import {AutoMethod} from './automethod'

export enum Event {
  REQUEST_START, REQUEST_END, REQUEST_ERROR
}

export type EventContainer = Map<Event, AutoMethod | Array<AutoMethod>> 