// ──────────────────────────────────────────────
// Algorithm registry
// ──────────────────────────────────────────────
const ALGOS = {
    caesar: {
        label: 'CAESAR',
        info: 'Shifts each letter by a fixed number of positions in the alphabet.',
        params: () => `
      <div class="param-group">
        <div class="param-label">Shift Value</div>
        <input class="param-input" id="caesarShift" type="number" value="3" min="1" max="25"/>
        <div class="param-hint">Integer 1–25</div>
      </div>`
    },
    rot13: {
        label: 'ROT-13',
        info: 'A special case of Caesar cipher with a fixed shift of 13. Applying it twice returns the original text.',
        params: () => '' // no params
    },
    hill: {
        label: 'HILL',
        info: 'Uses linear algebra (matrix multiplication) over Z₂₆ to encrypt blocks of letters.',
        params: () => `
      <div class="param-group">
        <div class="param-label">Key Matrix (2×2)</div>
        <input class="param-input" id="hillKey" type="text" value="GYBN" maxlength="4" style="width:120px"/>
        <div class="param-hint">4 uppercase letters (e.g. GYBN)</div>
      </div>`
    },
    vigenere: {
        label: 'VIGENÈRE',
        info: 'Uses a keyword to apply different Caesar shifts to each character of the plaintext.',
        params: () => `
      <div class="param-group">
        <div class="param-label">Keyword</div>
        <input class="param-input" id="vigenereKey" type="text" value="SECRET" style="width:160px"/>
        <div class="param-hint">Alphabetic keyword</div>
      </div>`
    },
    playfair: {
        label: 'PLAYFAIR',
        info: 'Encrypts digraphs (pairs of letters) using a 5×5 key square derived from a keyword.',
        params: () => `
      <div class="param-group">
        <div class="param-label">Keyword</div>
        <input class="param-input" id="playfairKey" type="text" value="MONARCHY" style="width:160px"/>
        <div class="param-hint">Alphabetic keyword</div>
      </div>`
    },
    rail_fence: {
        label: 'RAIL FENCE',
        info: 'Writes plaintext in a zigzag pattern across N rails, then reads off each rail sequentially.',
        params: () => `
      <div class="param-group">
        <div class="param-label">Number of Rails</div>
        <input class="param-input" id="railCount" type="number" value="3" min="2" max="10" style="width:100px"/>
        <div class="param-hint">Integer 2–10</div>
      </div>`
    },
    affine: {
        label: 'AFFINE',
        info: 'Encrypts using E(x) = (a·x + b) mod 26. Key "a" must be coprime to 26.',
        params: () => `
      <div class="param-group">
        <div class="param-label">Key A</div>
        <input class="param-input" id="affineA" type="number" value="5" style="width:90px"/>
        <div class="param-hint">Coprime to 26 (1,3,5,7...)</div>
      </div>
      <div class="param-group">
        <div class="param-label">Key B</div>
        <input class="param-input" id="affineB" type="number" value="8" style="width:90px"/>
        <div class="param-hint">Integer 0–25</div>
      </div>`
    }
};

// ──────────────────────────────────────────────
// State
// ──────────────────────────────────────────────
let currentAlgo = 'caesar';
let mode = 'encrypt'; // 'encrypt' | 'decrypt'

// ──────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────
document.getElementById('inputText').addEventListener('input', function () {
    document.getElementById('charCount').textContent = this.value.length + ' chars';
});

document.getElementById('algoGrid').addEventListener('click', function (e) {
    const btn = e.target.closest('.algo-btn');
    if (!btn) return;
    document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentAlgo = btn.dataset.algo;
    refreshAlgoPanel();
});

function refreshAlgoPanel() {
    const algo = ALGOS[currentAlgo];
    document.getElementById('algoInfo').innerHTML = `<strong>${algo.label} :</strong> ${algo.info}`;
    const paramsHTML = algo.params();
    const panel = document.getElementById('paramsPanel');
    if (paramsHTML) {
        document.getElementById('paramsGrid').innerHTML = paramsHTML;
        panel.classList.add('visible');
    } else {
        document.getElementById('paramsGrid').innerHTML = '';
        panel.classList.remove('visible');
    }
    clearOutput();
}

// ──────────────────────────────────────────────
// Collect params for the request body
// ──────────────────────────────────────────────
function getParams() {
    const p = {};
    const get = id => { const el = document.getElementById(id); return el ? el.value : null; };
    switch (currentAlgo) {
        case 'caesar': p.shift = parseInt(get('caesarShift')) || 3; break;
        case 'hill': p.key = (get('hillKey') || 'GYBN').toUpperCase(); break;
        case 'vigenere': p.key = (get('vigenereKey') || 'SECRET').toUpperCase(); break;
        case 'playfair': p.key = (get('playfairKey') || 'MONARCHY').toUpperCase(); break;
        case 'rail_fence': p.rails = parseInt(get('railCount')) || 3; break;
        case 'affine': p.a = parseInt(get('affineA')) || 5; p.b = parseInt(get('affineB')) || 8; break;
    }
    return p;
}

// ──────────────────────────────────────────────
// API endpoint map  →  http://127.0.0.1:8000/encrypt/<slug>
// ──────────────────────────────────────────────
const API_BASE = 'http://127.0.0.1:8000/encrypt';

const ENDPOINTS = {
    caesar: 'caeser-cipher',   // as given in your example
    rot13: 'rot13-cipher',
    hill: 'hill-cipher',
    vigenere: 'vigenere-cipher',
    playfair: 'playfair-cipher',
    rail_fence: 'rail-fence-cipher',
    affine: 'affine-cipher',
};

// ──────────────────────────────────────────────
// Core API call — pure fetch, no local logic
// ──────────────────────────────────────────────
async function callEncryptionAPI(algorithm, text, params, decrypt = false) {
    const slug = ENDPOINTS[algorithm];
    if (!slug) throw new Error(`No endpoint mapped for algorithm: ${algorithm}`);

    const url = `${API_BASE}/${slug}`;

    const body = {
        text,
        mode: decrypt ? 'decrypt' : 'encrypt',
        ...params,          // spread shift / key / rails / a / b as top-level fields
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        let msg = `HTTP ${response.status}`;
        try { const err = await response.json(); msg = err.detail || err.message || msg; } catch { }
        throw new Error(msg);
    }

    const data = await response.json();

    // Accept common response shapes: { result }, { ciphertext }, { output }, or bare string
    if (typeof data === 'string') return data;
    return data.result ?? data.ciphertext ?? data.output ?? data.text ?? JSON.stringify(data);
}

// ──────────────────────────────────────────────
// UI Actions
// ──────────────────────────────────────────────
async function doEncrypt() {
    await runCipher(false);
}

async function doDecrypt() {
    await runCipher(true);
}

async function runCipher(decrypt) {
    const text = document.getElementById('inputText').value.trim();
    if (!text) { showError('Plaintext is empty.'); return; }
    clearError();

    const btn = document.getElementById('encryptBtn');
    btn.classList.add('loading');

    try {
        const params = getParams();
        const result = await callEncryptionAPI(currentAlgo, text, params, decrypt);
        showOutput(result);
    } catch (err) {
        showError('API Error: ' + err.message);
    } finally {
        btn.classList.remove('loading');
    }
}

function showOutput(text) {
    const area = document.getElementById('outputArea');
    area.innerHTML = '';
    area.textContent = text;
    document.getElementById('outputPanel').classList.add('has-content');
}

function clearOutput() {
    const area = document.getElementById('outputArea');
    area.innerHTML = '<span class="output-placeholder">Encrypted output will appear here...</span>';
    document.getElementById('outputPanel').classList.remove('has-content');
}

function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('charCount').textContent = '0 chars';
    clearOutput();
}

function clearError() {
    const el = document.getElementById('errorMsg');
    el.textContent = '';
    el.classList.remove('visible');
}

function showError(msg) {
    const el = document.getElementById('errorMsg');
    el.textContent = '⚠ ' + msg;
    el.classList.add('visible');
}

function copyOutput() {
    const area = document.getElementById('outputArea');
    const text = area.textContent;
    if (!text || text.includes('Encrypted output')) return;
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard'));
}

function swapPanels() {
    const input = document.getElementById('inputText');
    const output = document.getElementById('outputArea');
    const outText = output.textContent;
    if (outText.includes('Encrypted output will appear')) return;
    input.value = outText;
    document.getElementById('charCount').textContent = outText.length + ' chars';
    clearOutput();
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2000);
}