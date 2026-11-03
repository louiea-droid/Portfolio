// Run: npm test
import assert from 'node:assert/strict'
import { validate } from '../api/_validate.js'

const ok = { name: 'Ana', email: 'ana@example.com', message: 'We need a dashboard redesign.' }
assert.deepEqual(validate(ok).value, ok)
assert.deepEqual(validate({ ...ok, name: '  Ana  ' }).value.name, 'Ana')
assert.ok(validate({ ...ok, name: '' }).error)
assert.ok(validate({ ...ok, email: 'not-an-email' }).error)
assert.ok(validate({ ...ok, message: 'hi' }).error)
assert.ok(validate({ ...ok, message: 'x'.repeat(5001) }).error)
assert.ok(validate(undefined).error)
console.log('contact validation: ok')
