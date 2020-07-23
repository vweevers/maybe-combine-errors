'use strict'

const test = require('tape')
const combine = require('.')

test('combines errors', function (t) {
  const errors = [
    new Error('1'),
    new Error('2'),
    new Error('3')
  ]

  const err = combine(errors)

  t.ok(err instanceof Error)
  t.is(err.name, 'CombinedError')
  t.is(err.message, '1; 2; 3')
  t.is(String(err), 'CombinedError: 1; 2; 3')
  t.is(err.stack, errors.map(err => err.stack).join('\n\n'))

  t.end()
})

test('does not combine one error', function (t) {
  const err = new Error()
  t.ok(combine([err]) === err)
  t.end()
})

test('skips null and undefined', function (t) {
  const err = new Error()

  t.is(combine([]), undefined)
  t.is(combine([null, undefined]), undefined)
  t.is(combine([null, err, undefined]), err)

  t.end()
})

test('sets transient', function (t) {
  const err1 = new Error()
  const err2 = new Error()

  t.is(combine([err1, err2]).transient, false)

  err1.transient = true
  t.is(combine([err1, err2]).transient, false)

  err2.transient = true
  t.is(combine([err1, err2]).transient, true)

  t.end()
})

test('sets expected', function (t) {
  const err1 = new Error()
  const err2 = new Error()

  t.is(combine([err1, err2]).expected, false)

  err1.expected = true
  t.is(combine([err1, err2]).expected, false)

  err2.expected = true
  t.is(combine([err1, err2]).expected, true)

  t.end()
})

test('deduplicates messages', function (t) {
  const err = combine([
    new Error('1'),
    new Error('2'),
    new Error('2')
  ])

  t.is(err.message, '1; 2')
  t.end()
})

test('skips empty messages', function (t) {
  const err = combine([
    new Error('1'),
    new Error(),
    new Error('3')
  ])

  t.is(err.message, '1; 3')
  t.end()
})

test('is iterable', function (t) {
  const errors = [new Error(), new Error()]
  const arr = Array.from(combine(errors))

  t.ok(arr[0] === errors[0])
  t.ok(arr[1] === errors[1])

  t.end()
})
