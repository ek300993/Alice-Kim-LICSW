const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const source = readFileSync(require.resolve('../script.js'), 'utf8');

function setup(fetchResult) {
  let submit;
  let timeoutCallback;
  let resets = 0;
  let calls = 0;
  let request;
  const status = { hidden: true, dataset: {} };
  const button = { innerHTML: 'Send message →', disabled: false };
  const fields = [{ readOnly: false }, { readOnly: false }];
  const attributes = {};
  const form = {
    action: 'https://formsubmit.co/alice@alicekimlicsw.com',
    valid: true,
    querySelector: selector => selector === '.contact-submit' ? button : status,
    querySelectorAll: () => fields,
    addEventListener: (_, handler) => { submit = handler; },
    reportValidity: () => form.valid,
    setAttribute: (name, value) => { attributes[name] = value; },
    removeAttribute: name => { delete attributes[name]; },
    reset: () => { resets++; }
  };
  vm.runInNewContext(source, {
    document: {
      addEventListener: (_, handler) => handler(),
      querySelector: selector => selector === '#contact-form' ? form : null,
      querySelectorAll: () => []
    },
    IntersectionObserver: class {},
    FormData: class { *[Symbol.iterator]() { yield ['email', 'test@example.com']; yield ['message', 'Availability question']; yield ['phone', '']; yield ['_honey', '']; } },
    AbortController,
    setTimeout: callback => { timeoutCallback = callback; return 1; },
    clearTimeout: () => {},
    fetch: async (url, options) => { calls++; request = { url, ...options }; return fetchResult(options); }
  });
  return { form, status, button, fields, attributes, send: () => submit({ preventDefault() {} }), timeout: () => timeoutCallback(), resets: () => resets, calls: () => calls, request: () => request };
}

for (const success of [true, 'true']) {
  test(`confirmed success (${typeof success}) uses AJAX and clears the form`, async () => {
    const state = setup(async () => ({ ok: true, json: async () => ({ success }) }));
    await state.send();
    assert.equal(state.request().url, 'https://formsubmit.co/ajax/alice@alicekimlicsw.com');
    assert.equal(JSON.parse(state.request().body).phone, '');
    assert.equal(state.status.dataset.state, 'success');
    assert.equal(state.resets(), 1);
    assert.equal(state.button.disabled, false);
    assert.equal(state.fields.every(field => !field.readOnly), true);
    assert.equal(state.attributes['aria-busy'], undefined);
  });
}

for (const failure of ['network', 'http', 'rejected', 'invalid JSON']) {
  test(`${failure} preserves the form and allows retry`, async () => {
    const state = setup(async () => {
      if (failure === 'network') throw new Error('offline');
      return { ok: failure !== 'http', json: async () => {
        if (failure === 'invalid JSON') throw new Error('invalid JSON');
        return { success: 'false' };
      } };
    });
    await state.send();
    assert.equal(state.status.dataset.state, 'error');
    assert.equal(state.resets(), 0);
    assert.equal(state.button.disabled, false);
    assert.equal(state.fields.every(field => !field.readOnly), true);
    await state.send();
    assert.equal(state.calls(), 2);
  });
}

test('pending request blocks duplicate submissions; timeout preserves text', async () => {
  const state = setup(({ signal }) => new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(new Error('timeout')))));
  const pending = state.send();
  assert.equal(state.button.disabled, true);
  assert.equal(state.fields.every(field => field.readOnly), true);
  assert.equal(state.attributes['aria-busy'], 'true');
  await state.send();
  assert.equal(state.calls(), 1);
  state.timeout();
  await pending;
  assert.equal(state.status.dataset.state, 'error');
  assert.equal(state.resets(), 0);
  assert.equal(state.button.disabled, false);
});

test('invalid fields prevent requests', async () => {
  const state = setup(() => { throw new Error('Should not run'); });
  state.form.valid = false;
  await state.send();
  assert.equal(state.calls(), 0);
});
