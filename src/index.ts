/**
 * @license
 * Copyright 2018-present, Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http: *www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
import Handler, { LinkEventSpec, EventHandler, ActionCreator, LinkEventHandler } from './handler'

export interface ActionCreatorMap<A> extends IndexedMap<ActionCreator<A>> {
  onProps: ActionCreator<A>
}

export type EventHandlerMap = IndexedMap<EventHandler<any>|LinkEventHandler<any,any>>

export interface IndexedMap<V> {
  [key: string]: V
}

export { EventHandler, LinkEventHandler, ActionCreator }

export default function createPropsHandler <P,A>(
  actions: ActionCreatorMap<A>
) {
  if (!actions || !actions.onProps) {
    throw new Error('missing or invalid IndexedMap of action creators')
  }
  return function(dispatch: (val: any) => void) {
    // handlers is stateful !
    const { onProps, ...handlers } = getHandlers(dispatch, actions)
    const keys = Object.keys(handlers)

    return function _onProps (props: P) {
      (<EventHandler<P&EventHandlerMap>>onProps.handle)(withHandlers(props))
    }

    function withHandlers(props: P): P & EventHandlerMap {
      const o = Object.assign(<P&EventHandlerMap>{}, props)
      let i = keys.length
      while (i--) {
        const k = keys[i]
        const h = handlers[k].withParent(props[k])
        handlers[k] = h
        o[k] = h.handle
      }
      return o
    }
  }
}

interface HandlerMap<P,A> extends IndexedMap<Handler<A,any,any>> {
  onProps: Handler<A,P&EventHandlerMap,void>
}

function getHandlers <P,A>(
  dispatch: (val: any) => void,
  actions: ActionCreatorMap<A>
) {
  return Object.keys(actions).reduce(function(handlers, key) {
    const action = actions[key]
    handlers[key] = new Handler(dispatch, action)
    return handlers
  }, {} as HandlerMap<P,A>)
}
