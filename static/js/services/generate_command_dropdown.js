// Copyright (c) 2019 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

const listeners = new Map();
const destroyers = new Map();
let locks = null;

const addListener = (uuid, fn) => {
  listeners.set(uuid, fn);

  if (locks) fn(locks);
};

const addDestroyer = (uuid, fn) => {
  destroyers.set(uuid, fn);
};

export const removeListener = uuid => listeners.delete(uuid);

export const removeDestroyer = uuid => destroyers.delete(uuid);

const onMessage = ({ data }) => {
  locks = JSON.parse(data);

  listeners.forEach(fn => {
    fn(locks);
  });
};

const removeAllListeners = () => {
  window.removeEventListener("message", onMessage);
  listeners.clear();
};

const destroyAllButtons = () => {
  destroyers.forEach(fn => fn());
  destroyers.clear();
};

// Handle receiving locks from the parent
window.addEventListener("message", onMessage);

// Remove the event listeners when the page unloads
window.addEventListener("unload", () => {
  removeAllListeners();
  destroyAllButtons();
});

window.addEventListener("action_selected", ({ detail }) => {
  window.parent.postMessage(
    JSON.stringify({ type: "action_selected", detail }),
    location.origin
  );
});

function getRandomValue() {
  const array = new Uint32Array(1);
  return window.crypto.getRandomValues(array)[0];
}

let id = () => {};

// Called whenever the table:
// A. Finishes rendering
// B. A pagination table update completed
export function dataTableInfoCallback(settings) {
  settings.aoData.forEach(({ nTr: row, _aData: data }) => {
    let cell = Array.from(row.cells).find(cell =>
      cell.classList.contains("actions-cell")
    );
    if (cell != null) {
      const div = document.createElement("div");
      cell.appendChild(div);

      generateDropdown(div, data);
    }
  });
}

export function cleanupButtons(settings) {
  Array.from(settings.rows).forEach(row => {
    const cell = Array.from(row.cells).find(cell =>
      cell.classList.contains("actions-cell")
    );

    if (cell) {
      const div = cell.querySelector("div");
      if (div) {
        const uuid = div.id;
        if (uuid) {
          removeListener(uuid);
          const destroyer = destroyers.get(uuid);
          if (destroyer) destroyer();

          removeDestroyer(uuid);
        }
      }
    }
  });
}

export function generateDropdown(el, record, placement = "left") {
  const uuid = getRandomValue().toString();
  el.id = uuid;

  const { init } = window.wasm_bindgen;

  const instance = init(
    {
      uuid,
      records: [record],
      locks: {},
      flag: undefined,
      tooltip_placement: placement,
      tooltip_size: undefined
    },
    el
  );

  addListener(uuid, locks => instance.set_locks(locks));

  addDestroyer(uuid, () => {
    instance.destroy();
    instance.free();
  });

  return instance;
}
