# with-event-handlers
[![NPM](https://nodei.co/npm/with-event-handlers.png?compact=true)](https://nodei.co/npm/with-event-handlers/)

essentially a redux core within a [`component-from-stream`](https://npmjs.com/package/component-from-stream/),
in less than 3k bytes, non-minified, uncompressed.

create a custom props dispatcher from a dispatcher and action creators,
that adds corresponding event handlers to the props it receives
before dispatching them.
the reactive operator in the `component-from-stream` instantiated
with this custom dispatcher receives an action stream,
which it reduces to a stream of view props.

# Example
see the full [example](./example/index.tsx) in this directory.
run the example in your browser locally with `npm run example`
or [online here](https://cdn.rawgit.com/ZenyWay/with-event-handlers/v1.0.0/example/index.html).

this example is refactored from that of [`component-from-stream`](https://npmjs.com/package/component-from-stream/):
it demonstrates how to implement `component-from-stream` Components
using `with-event-handlers` to work with an actions stream instead of props:

`copy-button/behaviour.ts`
```ts
import createPropsHandler, { ActionCreatorMap } from '../..'
import { omit, shallowEqual } from '../utils'
import compose from 'basic-compose'
import { into } from 'basic-cursors'
import { distinctUntilChanged, map, scan, tap } from 'rxjs/operators'
import copyToClipboard = require('clipboard-copy')

// ...

const actions: ActionCreatorMap<Action<any>> = {
  onClick(payload: any) {
    return { type: 'CLICK', payload }
  },
  enable() {
    return { type: 'ENABLE' }
  },
  onProps(payload: CopyButtonProps) {
    return { type: 'PROPS', payload }
  }
}

const dispatcher = createPropsHandler(actions)

const operator = compose(
  tap(log('copy-button:view-props:')),
  distinctUntilChanged(shallowEqual),
  map(omit('value', 'icons', 'timeout', 'enable')), // clean-up
  map(into('icon')(iconFromDisabled)),
  scan(reduce, {})
) as RxOperator<Action<any>,ButtonViewProps>

const behaviour = {
  operator, dispatcher
} as BehaviourSpec<CopyButtonProps,Action<any>,ButtonViewProps>

export default behaviour

function reduce(props, { type, payload }) {
  switch (type) {
    case 'CLICK':
      if (!doCopyToClipboard(payload, props.value)) {
        return props
      }
      setTimeout(props.enable, props.timeout) // stateful
      return { ...props, disabled: true }
    case 'ENABLE':
      return { ...props, disabled: false }
    case 'PROPS':
      const { disabled } = props
      return { ...DEFAULT_PROPS, ...payload, disabled }
    default:
      return props
  }
}

function doCopyToClipboard(event, value) {
  event.preventDefault()
  return copyToClipboard(value) //true on success
}

function iconFromDisabled ({ disabled, icons }: any) {
  return disabled ? icons.disabled : icons.enabled
}

// ...
```

# API
for a detailed specification of this API,
run the [unit tests](https://cdn.rawgit.com/ZenyWay/with-event-handlers/v1.0.0/spec/web/index.html)
in your browser.

```ts
export interface ActionCreatorMap<A> extends IndexedMap<ActionCreator<A>> {
  onProps: ActionCreator<A>
}

export declare type EventHandlerMap =
IndexedMap<EventHandler<any> | LinkEventHandler<any, any>>

export interface IndexedMap<V> {
  [key: string]: V
}

export default function createPropsHandler<P, A>(
  actions: ActionCreatorMap<A>
): (dispatch: (val: any) => void) => (props: P) => void

export declare type EventHandler<E> = (event: E) => void

export declare type LinkEventHandler<E, D> = (data: D, event: E) => void

export interface ActionCreator<A> {
  (...args: any[]): A
}
```

# TypeScript
although this library is written in [TypeScript](https://www.typescriptlang.org),
it may also be imported into plain JavaScript code:
modern code editors will still benefit from the available type definition,
e.g. for helpful code completion.

# License
Copyright 2018 Stéphane M. Catala

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the [License](./LICENSE) for the specific language governing permissions and
Limitations under the License.

