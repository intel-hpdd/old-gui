// Copyright (c) 2019 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

const listeners = [];

let locks = null;

const addListener = fn => {
  listeners.push(fn);

  if (locks) fn(locks);
};

const removeListener = fn => listeners.splice(listeners.findIndex(fn), 1);

window.addEventListener("message", locks => {
  locks = JSON.parse(locks);

  listeners.forEach(fn => {
    fn(locks);
  });
});

function getRandomValue() {
  const array = new Uint32Array(1);
  return window.crypto.getRandomValues(array)[0];
}

let id = () => {};

export function dataTableInitComplete (settings) {
  settings.aoData.forEach(({nTr: row, _aData: data}) => {
    let cell = Array.from(row.cells).find(cell => cell.classList.contains("actions-cell"));
    if (cell != null) {
      const div = document.createElement('div');
      cell.appendChild(div);  

      generateDropdown(div, data);
    }
  });
}

export function generateDropdown(el, record, placement = "left") {
  const uuid = getRandomValue().toString();
  el.id = uuid;

  const { init } = window.wasm_bindgen;

  const instance = init({
    uuid,
    records: [record],
    locks: {},
    flag: undefined,
    tooltip_placement: placement,
    tooltip_size: undefined
  });

  addListener(locks => {
    instance.set_locks(locks);
  });

  return instance;
}
