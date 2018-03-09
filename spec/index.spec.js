'use strict' /* eslint-env jasmine */
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
//
const createPropsHandler = require('../').default

describe('createPropsHandler:', function () {
  describe('when called with an IndexedMap of action creators, ' +
  'that includes an `onProps` key:', function () {
    let factory

    beforeEach(function () {
      factory = createPropsHandler({
        onProps: function () {}
      })
    })

    it('returns a props handler factory', function () {
      expect(factory).toEqual(jasmine.any(Function))
    })

    describe('the returned props handler factory:', function () {
      describe('when called with a dispatcher (val: any) => void:', function () {
        let actions, factory, dispatch, handler, result
        let onProps, onEvent, onLinkEvent

        beforeEach(function () {
          dispatch = jasmine.createSpy('dispatch')
          onProps = jasmine.createSpy('onProps').and.returnValue({ type: 'PROPS' })
          onEvent = jasmine.createSpy('onEvent').and.returnValue({ type: 'EVENT' })
          onLinkEvent = jasmine.createSpy('onEvent').and.returnValue({ type: 'LINKEVENT' })
          actions = { onEvent, onLinkEvent, onProps }

          factory = createPropsHandler(actions)
          handler = factory(dispatch)
          result = handler({ foo: 'foo' })
        })

        it('returns a handler function', function () {
          expect(handler).toEqual(jasmine.any(Function))
          expect(result).toBeUndefined()
        })

        describe('the returned props handler:', function () {
          it('calls the `onProps` action creator with a copy of the given props ' +
          'extended with handlers from the remaining action creators', function () {
            expect(onProps).toHaveBeenCalledWith({
              foo: 'foo',
              onEvent: jasmine.any(Function),
              onLinkEvent: jasmine.any(Function)
            })
          })

          it('calls the dispatcher with the output from the `onProps` action creator',
          function () {
            expect(dispatch).toHaveBeenCalledWith({ type: 'PROPS' })
          })
        })

        describe('the handlers added to the given props:', function () {
          beforeEach(function () {
            dispatch.calls.reset()
            onEvent.calls.reset()
            onLinkEvent.calls.reset()
            const props = onProps.calls.argsFor(0)[0]
            props.onEvent({ bar: 'bar' })
            props.onLinkEvent('context', { baz: 'baz' })
          })

          it('call the corresponding action creator with its arguments ', function () {
            expect(onEvent).toHaveBeenCalledWith({ bar: 'bar' })
            expect(onLinkEvent).toHaveBeenCalledWith('context', { baz: 'baz' })
          })

          it('call the dispatcher with the output from the corresponding action creator',
          function () {
            expect(dispatch.calls.allArgs()).toEqual([
              [{ type: 'EVENT' }], [{ type: 'LINKEVENT' }]
            ])
          })
        })

        describe('when the given props already include some handlers ' +
        'sharing the same keys as some of the remaining action creators', function () {
          let parent

          beforeEach(function () {
            dispatch.calls.reset()
            onProps.calls.reset()
            onEvent.calls.reset()
            onLinkEvent.calls.reset()
            parent = jasmine.createSpy('parent')
            handler({ foo: 'foo', onEvent: parent })
            onProps.calls.argsFor(0)[0].onEvent({ baz: 'baz' })
            handler({ bar: 'bar', onEvent: { data: 'inferno', event: parent } })
            onProps.calls.argsFor(1)[0].onEvent({ bzb: 'bzb' })
          })

          it('the conflicting handlers call the original handler when called, ' +
          'even if the latter is an Inferno LinkEvent object', function () {
            expect(parent.calls.allArgs()).toEqual([
              [{ baz: 'baz' }],
              ['inferno', { bzb: 'bzb' }]
            ])
          })
        })
      })
    })
  })

  describe('when called with an IndexedMap of action creators, ' +
  'without an `onProps` key:', function () {
    let factory

    beforeEach(function () {
      factory = function () {
        createPropsHandler({
          onEvent: function () {}
        })
      }
    })

    it('returns a props handler factory', function () {
      expect(factory).toThrow(jasmine.any(Error))
    })
  })
})
