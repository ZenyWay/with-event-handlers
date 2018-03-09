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
export type EventHandler<E> = (event: E) => void

export type LinkEventHandler<E,D> = (data: D, event: E) => void

export interface LinkEventSpec<E,D> {
  data: D
  event: (data: D, event: E) => void
}

export interface ActionCreator<A> {
  (...args: any[]): A
}

export default class _EventHandler<A,E,D=void> {
	constructor(
    public dispatch: EventHandler<A>,
    public action: ActionCreator<A>,
    public parent?: EventHandler<E>|LinkEventSpec<E,D>
  ) {}

	withParent <P>(parent: EventHandler<E>|LinkEventSpec<E,P>) {
		return isSameHandler(this.parent, parent)
			? this
			: new _EventHandler(this.dispatch, this.action, parent)
	}

	handle: EventHandler<E>|LinkEventHandler<E,D> = (...args: any[]) => {
		this.dispatch(this.action.apply(void 0, args))
		const { parent } = this
		if (!parent) { return }
		const event: E = args[args.length - 1]
		isInfernoLinkEvent(parent)
			? callInfernoLinkEvent(parent, event)
			: parent(event)
	}
}

function isSameHandler (
  a: EventHandler<any>|LinkEventSpec<any,any>,
  b: EventHandler<any>|LinkEventSpec<any,any>
): boolean {
	return (!a && !b) || (a === b) || isSameInfernoLinkEvent(a, b)
}

function isSameInfernoLinkEvent (a: any, b: any): boolean {
	return (
		!!b && isInfernoLinkEvent(a) && a.event === b.event && a.data === b.data
	)
}

function isInfernoLinkEvent <E,D>(a: any): a is LinkEventSpec<E,D> {
	return !!a && 'data' in a && isFunction(a.event)
}

function callInfernoLinkEvent <E,D>(handler: LinkEventSpec<E,D>, event: E): void {
	handler.event(handler.data, event)
}

function isFunction(v: any): v is Function {
	return typeof v === 'function'
}
