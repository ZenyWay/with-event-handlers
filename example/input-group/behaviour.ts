/**
 * @license
 * Copyright 2018 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
import createPropsHandler, { ActionCreatorMap } from '../..'
import { InputGroupViewProps, AddonButton } from './view'
import log from '../console'
import compose from 'basic-compose'
import { into } from 'basic-cursors'
import { BehaviourSpec, RxOperator } from 'component-from-stream'
import { shallowEqual } from '../utils'
import { distinctUntilChanged, scan, tap } from 'rxjs/operators'

export interface InputGroupWithButtonProps {
  type: string,
  onInput: (event: any) => void,
  children: AddonButton,
  placeholder: string,
  disabled: boolean
}

export interface Action<P> { type: string, payload?: P }

const actions: ActionCreatorMap<Action<any>> = {
	onInput(payload: any) {
		return { type: 'INPUT', payload }
	},
	onProps(payload: InputGroupWithButtonProps) {
		return { type: 'PROPS', payload }
	}
}

const dispatcher = createPropsHandler(actions)

const operator = compose(
  tap(log('input-group-with-button:view-props:')),
	distinctUntilChanged(shallowEqual),
	scan(reduce, {})
) as RxOperator<InputGroupWithButtonProps,InputGroupViewProps>

const behaviour = {
  operator, dispatcher
} as BehaviourSpec<InputGroupWithButtonProps,Action<any>,InputGroupViewProps>

export default behaviour

function reduce(props, { type, payload }) {
  switch(type) {
    case 'INPUT':
      const { value } = payload.target
      return { ...props, value }
    case 'PROPS':
      return { ...payload }
    default:
      return props
  }
}

function valueFromInputEvent({ event }) {
  return event.payload.target.value
}
