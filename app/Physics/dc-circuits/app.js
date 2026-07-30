// ============================================================
// DC CIRCUITS INTERACTIVE TEACHING TOOL
// ============================================================

// --- Polyfill roundRect ---
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
        if (typeof r === 'number') r = [r, r, r, r];
        else if (!Array.isArray(r)) r = [0, 0, 0, 0];
        const [tl, tr, br, bl] = r;
        this.moveTo(x + tl, y);
        this.lineTo(x + w - tr, y);
        this.quadraticCurveTo(x + w, y, x + w, y + tr);
        this.lineTo(x + w, y + h - br);
        this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
        this.lineTo(x + bl, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - bl);
        this.lineTo(x, y + tl);
        this.quadraticCurveTo(x, y, x + tl, y);
        this.closePath();
    };
}

// --- NAVIGATION ---
const sections = document.querySelectorAll('.section');
const navItems = document.querySelectorAll('.nav-links li');

function navigateTo(id) {
    sections.forEach(s => s.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    document.querySelector(`[data-section="${id}"]`).classList.add('active');
    window.scrollTo(0, 0);
}

navItems.forEach(item => {
    item.addEventListener('click', () => {
        if (item.dataset.section) navigateTo(item.dataset.section);
    });
});

// ============================================================
// COLORS FOR LIGHT CANVAS
// ============================================================
const C = {
    bg: '#f8fafc',
    wire: '#475569',
    wireLight: '#94a3b8',
    electron: '#2563eb',
    electronGlow: '#3b82f6',
    resistor: '#ea580c',
    battery: '#16a34a',
    batteryNeg: '#dc2626',
    text: '#1e293b',
    textLight: '#64748b',
    accent: '#2563eb',
    yellow: '#b45309',
    grid: '#e2e8f0',
    gridDot: '#cbd5e1',
    positive: '#16a34a',
    negative: '#dc2626',
    arrow: '#7c3aed'
};

// ============================================================
// 1. ELECTRON ANIMATION
// ============================================================
const elCanvas = document.getElementById('electronCanvas');
const elCtx = elCanvas.getContext('2d');
let electrons = [];

function initElectrons() {
    electrons = [];
    for (let i = 0; i < 30; i++) {
        electrons.push({
            x: Math.random() * 600 + 50,
            y: 60 + Math.random() * 130,
        });
    }
}
initElectrons();

function drawElectronAnim() {
    const V = parseFloat(document.getElementById('voltageSlider').value);
    const R = parseFloat(document.getElementById('resistSlider').value);
    const I = R > 0 ? V / R : 0;
    const speed = I * 2;

    document.getElementById('voltageValue').textContent = V;
    document.getElementById('resistValue').textContent = R;
    document.getElementById('currentResult').textContent = I.toFixed(2);

    elCtx.clearRect(0, 0, 700, 250);
    elCtx.fillStyle = '#ffffff';
    elCtx.fillRect(0, 0, 700, 250);

    // Wire body (copper colored)
    const grad = elCtx.createLinearGradient(50, 105, 50, 145);
    grad.addColorStop(0, '#d97706');
    grad.addColorStop(0.5, '#b45309');
    grad.addColorStop(1, '#d97706');
    elCtx.fillStyle = grad;
    elCtx.beginPath();
    elCtx.rect(50, 105, 600, 40);
    elCtx.fill();

    // Wire outline
    elCtx.strokeStyle = '#92400e';
    elCtx.lineWidth = 2;
    elCtx.strokeRect(50, 105, 600, 40);

    // Battery
    elCtx.fillStyle = C.batteryNeg;
    elCtx.fillRect(20, 100, 12, 50);
    elCtx.fillStyle = C.positive;
    elCtx.fillRect(36, 108, 8, 34);
    elCtx.fillStyle = C.text;
    elCtx.font = 'bold 14px Fira Code';
    elCtx.fillText('+', 37, 96);
    elCtx.fillText('−', 20, 96);

    // Resistor symbol
    elCtx.strokeStyle = C.resistor;
    elCtx.lineWidth = 3;
    elCtx.beginPath();
    const rx = 500;
    elCtx.moveTo(rx - 40, 125);
    for (let i = 0; i < 8; i++) {
        elCtx.lineTo(rx - 30 + i * 10, 125 + (i % 2 === 0 ? -15 : 15));
    }
    elCtx.lineTo(rx + 50, 125);
    elCtx.stroke();
    elCtx.fillStyle = C.resistor;
    elCtx.font = 'bold 12px Sarabun';
    elCtx.fillText(`R = ${R} Ω`, rx - 15, 165);

    // Electrons
    electrons.forEach(e => {
        e.x += speed + (Math.random() - 0.5) * 0.5;
        e.y += (Math.random() - 0.5) * 0.8;
        e.y = Math.max(110, Math.min(140, e.y));
        if (e.x > 650) e.x = 50;
        if (e.x < 50) e.x = 650;

        // Electron dot
        elCtx.beginPath();
        elCtx.arc(e.x, e.y, 5, 0, Math.PI * 2);
        elCtx.fillStyle = C.electron;
        elCtx.fill();

        // Glow
        if (speed > 1) {
            elCtx.beginPath();
            elCtx.arc(e.x, e.y, 9, 0, Math.PI * 2);
            elCtx.fillStyle = 'rgba(37,99,235,0.2)';
            elCtx.fill();
        }

        // e⁻ label
        elCtx.fillStyle = '#fff';
        elCtx.font = '7px Fira Code';
        elCtx.textAlign = 'center';
        elCtx.fillText('e⁻', e.x, e.y + 3);
        elCtx.textAlign = 'left';
    });

    // Current arrow
    if (I > 0) {
        elCtx.fillStyle = C.accent;
        elCtx.font = 'bold 16px Sarabun';
        elCtx.fillText(`I = ${I.toFixed(2)} A  →`, 250, 30);

        elCtx.fillStyle = C.positive;
        elCtx.fillText(`V = ${V} V`, 80, 30);
    } else {
        elCtx.fillStyle = C.textLight;
        elCtx.font = '14px Sarabun';
        elCtx.fillText('เพิ่มแรงดันเพื่อให้กระแสไหล', 220, 30);
    }

    requestAnimationFrame(drawElectronAnim);
}
drawElectronAnim();

// --- Current Calculator ---
function calcCurrent() {
    const Q = parseFloat(document.getElementById('calc-q').value);
    const t = parseFloat(document.getElementById('calc-t').value);
    if (t === 0) { document.getElementById('current-calc-result').textContent = 'เวลาต้องไม่เป็น 0'; return; }
    const I = Q / t;
    document.getElementById('current-calc-result').innerHTML =
        `I = Q / t = ${Q} / ${t} = <strong>${I.toFixed(4)} A</strong>`;
}

// ============================================================
// 2. OHM'S LAW
// ============================================================
function showOhmFormula(target) {
    const display = document.getElementById('ohmFormulaDisplay');
    document.querySelectorAll('.tri-text').forEach(t => t.classList.remove('highlight'));
    document.getElementById('tri-' + target.toLowerCase()).classList.add('highlight');
    const formulas = { 'V': 'V = I × R', 'I': 'I = V / R', 'R': 'R = V / I' };
    display.textContent = formulas[target];
}

// V-I Graph
const viCanvas = document.getElementById('viGraphCanvas');
const viCtx = viCanvas.getContext('2d');

function drawVIGraph() {
    const R1 = parseInt(document.getElementById('graphR1').value);
    const R2 = parseInt(document.getElementById('graphR2').value);
    document.getElementById('graphR1Val').textContent = R1;
    document.getElementById('graphR2Val').textContent = R2;

    viCtx.clearRect(0, 0, 500, 400);
    viCtx.fillStyle = '#ffffff';
    viCtx.fillRect(0, 0, 500, 400);
    const ox = 60, oy = 350, w = 400, h = 300;

    // Grid
    viCtx.strokeStyle = '#e2e8f0';
    viCtx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
        const x = ox + (w / 10) * i;
        const y = oy - (h / 10) * i;
        viCtx.beginPath(); viCtx.moveTo(x, oy); viCtx.lineTo(x, oy - h); viCtx.stroke();
        viCtx.beginPath(); viCtx.moveTo(ox, y); viCtx.lineTo(ox + w, y); viCtx.stroke();
    }

    // Axes
    viCtx.strokeStyle = '#334155';
    viCtx.lineWidth = 2;
    viCtx.beginPath(); viCtx.moveTo(ox, oy); viCtx.lineTo(ox + w + 10, oy); viCtx.stroke();
    viCtx.beginPath(); viCtx.moveTo(ox, oy); viCtx.lineTo(ox, oy - h - 10); viCtx.stroke();

    // Arrow heads
    viCtx.fillStyle = '#334155';
    viCtx.beginPath(); viCtx.moveTo(ox + w + 10, oy); viCtx.lineTo(ox + w, oy - 5); viCtx.lineTo(ox + w, oy + 5); viCtx.fill();
    viCtx.beginPath(); viCtx.moveTo(ox, oy - h - 10); viCtx.lineTo(ox - 5, oy - h); viCtx.lineTo(ox + 5, oy - h); viCtx.fill();

    viCtx.fillStyle = '#334155';
    viCtx.font = 'bold 14px Sarabun';
    viCtx.fillText('V (โวลต์)', ox + w / 2, oy + 35);
    viCtx.save();
    viCtx.translate(18, oy - h / 2);
    viCtx.rotate(-Math.PI / 2);
    viCtx.fillText('I (แอมแปร์)', 0, 0);
    viCtx.restore();

    const maxV = 20, maxI = 5;
    viCtx.font = '11px Fira Code';
    viCtx.fillStyle = '#64748b';
    for (let v = 0; v <= maxV; v += 5) {
        viCtx.fillText(v, ox + (v / maxV) * w - 5, oy + 18);
    }
    for (let i = 0; i <= maxI; i++) {
        viCtx.fillText(i, ox - 25, oy - (i / maxI) * h + 4);
    }

    function drawLine(R, color, label) {
        viCtx.strokeStyle = color;
        viCtx.lineWidth = 3;
        viCtx.beginPath();
        let lastX, lastY;
        for (let v = 0; v <= maxV; v += 0.5) {
            const I = v / R;
            const x = ox + (v / maxV) * w;
            const y = oy - (I / maxI) * h;
            if (y < oy - h) break;
            if (v === 0) viCtx.moveTo(x, y); else viCtx.lineTo(x, y);
            lastX = x; lastY = y;
        }
        viCtx.stroke();

        // Label
        if (lastX && lastY) {
            viCtx.fillStyle = color;
            viCtx.font = 'bold 13px Sarabun';
            viCtx.fillText(label, lastX + 5, lastY - 5);
        }
    }

    drawLine(R1, '#2563eb', `R₁=${R1}Ω`);
    drawLine(R2, '#dc2626', `R₂=${R2}Ω`);
}

document.getElementById('graphR1').addEventListener('input', drawVIGraph);
document.getElementById('graphR2').addEventListener('input', drawVIGraph);
drawVIGraph();

// Ohm Calculator
let ohmTarget = 'V';
function setOhmTab(t, btn) {
    ohmTarget = t;
    document.querySelectorAll('.ohm-calc .tab-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    else {
        // Find the correct tab button during init
        document.querySelectorAll('.ohm-calc .tab-btn').forEach(b => {
            if (b.textContent.includes(t)) b.classList.add('active');
        });
    }
    const inputs = document.getElementById('ohm-inputs');
    if (t === 'V') {
        inputs.innerHTML = '<div class="calc-row"><label>I (A):</label><input type="number" id="ohm-i" value="2" step="0.1"><label>R (Ω):</label><input type="number" id="ohm-r" value="5" step="0.1"></div>';
    } else if (t === 'I') {
        inputs.innerHTML = '<div class="calc-row"><label>V (V):</label><input type="number" id="ohm-v" value="10" step="0.1"><label>R (Ω):</label><input type="number" id="ohm-r" value="5" step="0.1"></div>';
    } else {
        inputs.innerHTML = '<div class="calc-row"><label>V (V):</label><input type="number" id="ohm-v" value="10" step="0.1"><label>I (A):</label><input type="number" id="ohm-i" value="2" step="0.1"></div>';
    }
}
setOhmTab('V');

function calcOhm() {
    const res = document.getElementById('ohm-calc-result');
    if (ohmTarget === 'V') {
        const I = parseFloat(document.getElementById('ohm-i').value);
        const R = parseFloat(document.getElementById('ohm-r').value);
        res.innerHTML = `V = I × R = ${I} × ${R} = <strong>${(I * R).toFixed(4)} V</strong>`;
    } else if (ohmTarget === 'I') {
        const V = parseFloat(document.getElementById('ohm-v').value);
        const R = parseFloat(document.getElementById('ohm-r').value);
        if (R === 0) { res.textContent = 'R ต้องไม่เป็น 0'; return; }
        res.innerHTML = `I = V / R = ${V} / ${R} = <strong>${(V / R).toFixed(4)} A</strong>`;
    } else {
        const V = parseFloat(document.getElementById('ohm-v').value);
        const I = parseFloat(document.getElementById('ohm-i').value);
        if (I === 0) { res.textContent = 'I ต้องไม่เป็น 0'; return; }
        res.innerHTML = `R = V / I = ${V} / ${I} = <strong>${(V / I).toFixed(4)} Ω</strong>`;
    }
}

// ============================================================
// 3. RESISTANCE VISUALIZATION
// ============================================================
const wireCanvas = document.getElementById('wireCanvas');
const wireCtx = wireCanvas.getContext('2d');

function drawWire() {
    const rho = parseFloat(document.getElementById('materialSelect').value);
    const L = parseFloat(document.getElementById('wireLengthSlider').value);
    const d = parseFloat(document.getElementById('wireDiamSlider').value);

    document.getElementById('wireLengthVal').textContent = L.toFixed(1);
    document.getElementById('wireDiamVal').textContent = d.toFixed(1);

    const dMeters = d * 1e-3;
    const A = Math.PI * (dMeters / 2) ** 2;
    const R = (rho * L) / A;

    document.getElementById('wireArea').textContent = A.toExponential(3);
    document.getElementById('wireResistance').textContent = R < 1 ? R.toExponential(3) : R.toFixed(4);

    wireCtx.clearRect(0, 0, 700, 300);
    wireCtx.fillStyle = '#ffffff';
    wireCtx.fillRect(0, 0, 700, 300);

    const wireLen = 100 + (L / 10) * 450;
    const wireThick = 5 + (d / 5) * 35;
    const startX = 50;
    const cy = 150;

    // Wire body
    const grad = wireCtx.createLinearGradient(startX, cy - wireThick / 2, startX, cy + wireThick / 2);
    const matColors = {
        '1.59e-8': ['#d1d5db', '#9ca3af', 'เงิน (Ag)'],
        '1.72e-8': ['#f59e0b', '#b45309', 'ทองแดง (Cu)'],
        '2.44e-8': ['#fbbf24', '#a16207', 'ทองคำ (Au)'],
        '2.83e-8': ['#d1d5db', '#6b7280', 'อลูมิเนียม (Al)'],
        '1.0e-7': ['#9ca3af', '#4b5563', 'เหล็ก (Fe)'],
        '1.1e-6': ['#a8a29e', '#78716c', 'นิโครม']
    };
    const [c1, c2, matName] = matColors[document.getElementById('materialSelect').value] || ['#aaa', '#666', ''];
    grad.addColorStop(0, c1);
    grad.addColorStop(0.5, c2);
    grad.addColorStop(1, c1);

    wireCtx.fillStyle = grad;
    wireCtx.beginPath();
    wireCtx.rect(startX, cy - wireThick / 2, wireLen, wireThick);
    wireCtx.fill();

    // Wire outline
    wireCtx.strokeStyle = '#374151';
    wireCtx.lineWidth = 1.5;
    wireCtx.strokeRect(startX, cy - wireThick / 2, wireLen, wireThick);

    // Length dimension line
    wireCtx.strokeStyle = '#2563eb';
    wireCtx.lineWidth = 1.5;
    wireCtx.setLineDash([5, 3]);
    const dimY = cy + wireThick / 2 + 30;
    wireCtx.beginPath(); wireCtx.moveTo(startX, dimY); wireCtx.lineTo(startX + wireLen, dimY); wireCtx.stroke();
    wireCtx.beginPath(); wireCtx.moveTo(startX, dimY - 10); wireCtx.lineTo(startX, dimY + 10); wireCtx.stroke();
    wireCtx.beginPath(); wireCtx.moveTo(startX + wireLen, dimY - 10); wireCtx.lineTo(startX + wireLen, dimY + 10); wireCtx.stroke();
    wireCtx.setLineDash([]);

    wireCtx.fillStyle = '#2563eb';
    wireCtx.font = 'bold 14px Fira Code';
    wireCtx.textAlign = 'center';
    wireCtx.fillText(`L = ${L.toFixed(1)} m`, startX + wireLen / 2, dimY + 22);

    // Diameter dimension
    const dx = startX + wireLen + 30;
    wireCtx.strokeStyle = '#dc2626';
    wireCtx.setLineDash([5, 3]);
    wireCtx.beginPath(); wireCtx.moveTo(dx, cy - wireThick / 2); wireCtx.lineTo(dx, cy + wireThick / 2); wireCtx.stroke();
    wireCtx.setLineDash([]);
    wireCtx.beginPath(); wireCtx.moveTo(dx - 6, cy - wireThick / 2); wireCtx.lineTo(dx + 6, cy - wireThick / 2); wireCtx.stroke();
    wireCtx.beginPath(); wireCtx.moveTo(dx - 6, cy + wireThick / 2); wireCtx.lineTo(dx + 6, cy + wireThick / 2); wireCtx.stroke();
    wireCtx.fillStyle = '#dc2626';
    wireCtx.fillText(`d = ${d.toFixed(1)} mm`, dx + 55, cy + 5);

    // Formula result
    wireCtx.fillStyle = '#1e293b';
    wireCtx.font = 'bold 16px Fira Code';
    wireCtx.textAlign = 'left';
    wireCtx.fillText(`R = ρL/A = ${R < 1 ? R.toExponential(3) : R.toFixed(4)} Ω`, 50, 30);
    wireCtx.fillStyle = '#64748b';
    wireCtx.font = '13px Sarabun';
    wireCtx.fillText(`วัสดุ: ${matName}  |  ρ = ${rho.toExponential(2)} Ω·m`, 50, 52);
    wireCtx.textAlign = 'center';
}

['materialSelect', 'wireLengthSlider', 'wireDiamSlider'].forEach(id => {
    document.getElementById(id).addEventListener('input', drawWire);
});
drawWire();

// ============================================================
// 4. SERIES & PARALLEL SIMULATION
// ============================================================
const spCanvas = document.getElementById('spCanvas');
const spCtx = spCanvas.getContext('2d');
let circuitMode = 'series';
let spAnimPhase = 0;

function setCircuitMode(mode) {
    circuitMode = mode;
    document.getElementById('btnSeries').classList.toggle('active', mode === 'series');
    document.getElementById('btnParallel').classList.toggle('active', mode === 'parallel');
}

function drawSPCircuit() {
    const E = parseInt(document.getElementById('spE').value);
    const R1 = parseInt(document.getElementById('spR1').value);
    const R2 = parseInt(document.getElementById('spR2').value);
    const R3 = parseInt(document.getElementById('spR3').value);

    document.getElementById('spEVal').textContent = E;
    document.getElementById('spR1Val').textContent = R1;
    document.getElementById('spR2Val').textContent = R2;
    document.getElementById('spR3Val').textContent = R3;

    spCtx.clearRect(0, 0, 700, 350);
    spCtx.fillStyle = '#ffffff';
    spCtx.fillRect(0, 0, 700, 350);
    spAnimPhase += 0.02;

    let Rtotal, I;

    if (circuitMode === 'series') {
        Rtotal = R1 + R2 + R3;
        I = E / Rtotal;
        const V1 = I * R1, V2 = I * R2, V3 = I * R3;

        // Draw series circuit
        drawCircuitWire(spCtx, [[80, 60], [600, 60], [600, 300], [80, 300], [80, 60]]);

        // Battery on left
        drawBatteryIcon(spCtx, 80, 140, E, true);

        // Resistors along top
        drawResistorBox(spCtx, 200, 40, R1, `V₁=${V1.toFixed(1)}V`);
        drawResistorBox(spCtx, 350, 40, R2, `V₂=${V2.toFixed(1)}V`);
        drawResistorBox(spCtx, 500, 40, R3, `V₃=${V3.toFixed(1)}V`);

        // Current direction arrows
        drawCurrentArrow(spCtx, 140, 60, 'right', I);
        drawCurrentArrow(spCtx, 600, 180, 'down', I);
        drawCurrentArrow(spCtx, 400, 300, 'left', I);

        // Electrons
        drawFlowingElectrons(spCtx, [
            {x: 80, y: 60}, {x: 600, y: 60}, {x: 600, y: 300}, {x: 80, y: 300}, {x: 80, y: 60}
        ], I, spAnimPhase);

        // Current label
        spCtx.fillStyle = '#1e293b';
        spCtx.font = 'bold 14px Fira Code';
        spCtx.fillText(`I = ${I.toFixed(3)} A`, 300, 330);

        document.getElementById('spResults').innerHTML =
            `R<sub>รวม</sub> = ${R1} + ${R2} + ${R3} = <strong>${Rtotal} Ω</strong> | I = ${E}/${Rtotal} = <strong>${I.toFixed(3)} A</strong><br>` +
            `V₁ = ${V1.toFixed(2)}V | V₂ = ${V2.toFixed(2)}V | V₃ = ${V3.toFixed(2)}V | ΣV = ${(V1+V2+V3).toFixed(2)}V ✓`;
    } else {
        const invR = 1/R1 + 1/R2 + 1/R3;
        Rtotal = 1 / invR;
        I = E / Rtotal;
        const I1 = E/R1, I2 = E/R2, I3 = E/R3;

        // Draw parallel circuit
        drawCircuitWire(spCtx, [[80, 40], [600, 40]]);
        drawCircuitWire(spCtx, [[80, 310], [600, 310]]);
        drawCircuitWire(spCtx, [[80, 40], [80, 310]]);
        drawCircuitWire(spCtx, [[600, 40], [600, 310]]);

        // Battery on left
        drawBatteryIcon(spCtx, 50, 140, E, true);

        // Three parallel branches
        const bx = [230, 380, 530];
        const Rs = [R1, R2, R3];
        const Is = [I1, I2, I3];
        bx.forEach((x, i) => {
            drawCircuitWire(spCtx, [[x, 40], [x, 120]]);
            drawCircuitWire(spCtx, [[x, 230], [x, 310]]);
            drawResistorBoxV(spCtx, x, 130, Rs[i], `I${i+1}=${Is[i].toFixed(2)}A`);
        });

        drawCurrentArrow(spCtx, 130, 40, 'right', I);

        drawFlowingElectrons(spCtx, [
            {x: 80, y: 40}, {x: 600, y: 40}, {x: 600, y: 310}, {x: 80, y: 310}, {x: 80, y: 40}
        ], I, spAnimPhase);

        document.getElementById('spResults').innerHTML =
            `1/R<sub>รวม</sub> = 1/${R1}+1/${R2}+1/${R3} → R<sub>รวม</sub> = <strong>${Rtotal.toFixed(3)} Ω</strong><br>` +
            `I<sub>รวม</sub> = <strong>${I.toFixed(3)} A</strong> | I₁=${I1.toFixed(3)}A | I₂=${I2.toFixed(3)}A | I₃=${I3.toFixed(3)}A`;
    }

    requestAnimationFrame(drawSPCircuit);
}

function drawCircuitWire(ctx, points) {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();
}

function drawBatteryIcon(ctx, x, y, V, vertical) {
    ctx.save();
    ctx.translate(x, y);

    // Box
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(-22, -25, 44, 50);
    ctx.fill();
    ctx.stroke();

    // + plate
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-8, -22, 4, 44);
    // - plate
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(4, -15, 4, 30);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 10px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText('+', -6, -26);
    ctx.fillText('−', 6, -26);
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 11px Fira Code';
    ctx.fillText(`${V}V`, 0, 42);
    ctx.textAlign = 'left';
    ctx.restore();
}

function drawResistorBox(ctx, x, y, R, label) {
    // Horizontal resistor
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = C.resistor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x - 35, y, 70, 40);
    ctx.fill();
    ctx.stroke();

    // Zigzag inside
    ctx.strokeStyle = C.resistor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 30, y + 20);
    for (let i = 0; i < 6; i++) {
        ctx.lineTo(x - 25 + i * 10, y + (i % 2 === 0 ? 8 : 32));
    }
    ctx.lineTo(x + 30, y + 20);
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText(`${R}Ω`, x, y - 6);
    if (label) {
        ctx.fillStyle = '#2563eb';
        ctx.font = '11px Fira Code';
        ctx.fillText(label, x, y + 56);
    }
    ctx.textAlign = 'left';
}

function drawResistorBoxV(ctx, x, y, R, label) {
    // Vertical resistor
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = C.resistor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x - 20, y, 40, 80);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText(`${R}Ω`, x, y + 45);
    if (label) {
        ctx.fillStyle = '#2563eb';
        ctx.font = '11px Fira Code';
        ctx.fillText(label, x, y + 100);
    }
    ctx.textAlign = 'left';
}

function drawCurrentArrow(ctx, x, y, dir, I) {
    ctx.fillStyle = '#7c3aed';
    ctx.font = '11px Sarabun';
    const size = 8;
    ctx.beginPath();
    if (dir === 'right') {
        ctx.moveTo(x + size, y); ctx.lineTo(x - size, y - size/2); ctx.lineTo(x - size, y + size/2);
    } else if (dir === 'down') {
        ctx.moveTo(x, y + size); ctx.lineTo(x - size/2, y - size); ctx.lineTo(x + size/2, y - size);
    } else if (dir === 'left') {
        ctx.moveTo(x - size, y); ctx.lineTo(x + size, y - size/2); ctx.lineTo(x + size, y + size/2);
    }
    ctx.fill();
}

function drawFlowingElectrons(ctx, path, current, phase) {
    if (current < 0.01) return;
    const speed = Math.min(current * 0.4, 2.5);
    const count = Math.min(Math.floor(current * 4) + 4, 25);

    for (let i = 0; i < count; i++) {
        let t = ((phase * speed + i / count) % 1 + 1) % 1;
        let totalLen = 0;
        const segs = [];
        for (let j = 0; j < path.length - 1; j++) {
            const dx = path[j + 1].x - path[j].x;
            const dy = path[j + 1].y - path[j].y;
            const len = Math.sqrt(dx * dx + dy * dy);
            segs.push({ len, dx, dy, sx: path[j].x, sy: path[j].y });
            totalLen += len;
        }
        let dist = t * totalLen;
        for (const seg of segs) {
            if (dist <= seg.len) {
                const frac = dist / seg.len;
                const ex = seg.sx + seg.dx * frac;
                const ey = seg.sy + seg.dy * frac;
                ctx.beginPath();
                ctx.arc(ex, ey, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#2563eb';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(ex, ey, 7, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(37,99,235,0.15)';
                ctx.fill();
                break;
            }
            dist -= seg.len;
        }
    }
}

drawSPCircuit();

// ============================================================
// 5. EMF SIMULATION
// ============================================================
const emfCanvas = document.getElementById('emfCanvas');
const emfCtx = emfCanvas.getContext('2d');
let emfPhase = 0;

function drawEMF() {
    const E = parseFloat(document.getElementById('emfE').value);
    const r = parseFloat(document.getElementById('emfR').value);
    const R = parseFloat(document.getElementById('emfRext').value);

    document.getElementById('emfEVal').textContent = E;
    document.getElementById('emfRVal').textContent = r.toFixed(1);
    document.getElementById('emfRextVal').textContent = R;

    const I = E / (R + r);
    const V = E - I * r;
    const Vr = I * r;

    emfCtx.clearRect(0, 0, 700, 350);
    emfCtx.fillStyle = '#ffffff';
    emfCtx.fillRect(0, 0, 700, 350);
    emfPhase += 0.02;

    // Cell box (dashed)
    emfCtx.strokeStyle = '#94a3b8';
    emfCtx.lineWidth = 2;
    emfCtx.setLineDash([6, 4]);
    emfCtx.strokeRect(60, 60, 160, 230);
    emfCtx.setLineDash([]);
    emfCtx.fillStyle = '#64748b';
    emfCtx.font = '12px Sarabun';
    emfCtx.fillText('เซลล์ไฟฟ้า', 100, 55);

    // EMF source inside cell
    emfCtx.fillStyle = '#dc2626'; emfCtx.fillRect(155, 120, 6, 50);
    emfCtx.fillStyle = '#16a34a'; emfCtx.fillRect(125, 130, 6, 30);
    emfCtx.fillStyle = '#1e293b'; emfCtx.font = 'bold 12px Fira Code';
    emfCtx.fillText('+', 156, 115);
    emfCtx.fillText('−', 120, 118);
    emfCtx.fillStyle = '#2563eb'; emfCtx.font = 'bold 13px Fira Code';
    emfCtx.fillText(`E=${E}V`, 100, 108);

    // Internal resistance (r)
    emfCtx.fillStyle = '#fff';
    emfCtx.strokeStyle = '#dc2626';
    emfCtx.lineWidth = 2;
    emfCtx.beginPath();
    emfCtx.rect(120, 195, 45, 60);
    emfCtx.fill(); emfCtx.stroke();
    emfCtx.fillStyle = '#dc2626';
    emfCtx.font = 'bold 11px Fira Code';
    emfCtx.textAlign = 'center';
    emfCtx.fillText(`r`, 142, 220);
    emfCtx.fillText(`${r.toFixed(1)}Ω`, 142, 238);

    // External R
    emfCtx.fillStyle = '#fff';
    emfCtx.strokeStyle = C.resistor;
    emfCtx.lineWidth = 2;
    emfCtx.beginPath();
    emfCtx.rect(480, 110, 60, 130);
    emfCtx.fill(); emfCtx.stroke();
    emfCtx.fillStyle = C.resistor;
    emfCtx.font = 'bold 14px Fira Code';
    emfCtx.fillText(`R`, 510, 170);
    emfCtx.fillText(`${R}Ω`, 510, 190);

    // Wires
    drawCircuitWire(emfCtx, [[155, 120], [155, 40], [510, 40], [510, 110]]);
    drawCircuitWire(emfCtx, [[142, 255], [142, 310], [510, 310], [510, 240]]);

    // Voltage labels
    emfCtx.fillStyle = '#16a34a';
    emfCtx.font = 'bold 13px Fira Code';
    emfCtx.fillText(`V = ${V.toFixed(2)} V`, 555, 180);

    emfCtx.fillStyle = '#dc2626';
    emfCtx.fillText(`Vr = ${Vr.toFixed(2)} V`, 175, 230);

    // Current
    emfCtx.fillStyle = '#7c3aed';
    emfCtx.font = 'bold 14px Fira Code';
    emfCtx.fillText(`I = ${I.toFixed(3)} A`, 300, 32);
    emfCtx.textAlign = 'left';

    // Draw arrow
    emfCtx.fillStyle = '#7c3aed';
    emfCtx.beginPath();
    emfCtx.moveTo(400, 36); emfCtx.lineTo(390, 30); emfCtx.lineTo(390, 42);
    emfCtx.fill();

    // Electrons
    drawFlowingElectrons(emfCtx, [
        {x: 155, y: 40}, {x: 510, y: 40}, {x: 510, y: 310}, {x: 142, y: 310}, {x: 142, y: 40}, {x: 155, y: 40}
    ], I, emfPhase);

    document.getElementById('emfResults').innerHTML =
        `I = E/(R+r) = ${E}/(${R}+${r.toFixed(1)}) = <strong>${I.toFixed(4)} A</strong><br>` +
        `V(ขั้ว) = E − Ir = ${E} − ${I.toFixed(4)}×${r.toFixed(1)} = <strong>${V.toFixed(4)} V</strong><br>` +
        `V(ภายใน) = Ir = <strong>${Vr.toFixed(4)} V</strong> | V + Vr = ${(V+Vr).toFixed(4)} = E ✓`;

    requestAnimationFrame(drawEMF);
}
drawEMF();

// Cell calculator
let cellMode = 'series';
function setCellMode(m) {
    cellMode = m;
    document.getElementById('cellSerBtn').classList.toggle('active', m === 'series');
    document.getElementById('cellParBtn').classList.toggle('active', m === 'parallel');
}

function calcCell() {
    const e = parseFloat(document.getElementById('cellE').value);
    const r = parseFloat(document.getElementById('cellR').value);
    const n = parseInt(document.getElementById('cellN').value);
    const R = parseFloat(document.getElementById('cellRext').value);

    let Etotal, rtotal;
    if (cellMode === 'series') {
        Etotal = n * e; rtotal = n * r;
    } else {
        Etotal = e; rtotal = r / n;
    }
    const I = Etotal / (R + rtotal);
    const V = I * R;

    document.getElementById('cell-result').innerHTML =
        `<strong>การต่อแบบ${cellMode === 'series' ? 'อนุกรม' : 'ขนาน'}</strong> (${n} ก้อน)<br>` +
        `E<sub>รวม</sub> = ${Etotal.toFixed(2)} V | r<sub>รวม</sub> = ${rtotal.toFixed(3)} Ω<br>` +
        `I = E/(R+r) = ${Etotal.toFixed(2)}/(${R}+${rtotal.toFixed(3)}) = <strong>${I.toFixed(4)} A</strong><br>` +
        `V = IR = <strong>${V.toFixed(4)} V</strong>`;
}

// ============================================================
// 6. KCL ANIMATION
// ============================================================
const kclCanvas = document.getElementById('kclCanvas');
const kclCtx = kclCanvas.getContext('2d');
let kclPhase = 0;

function drawKCL() {
    const I1 = parseFloat(document.getElementById('kclI1').value);
    const I2 = parseFloat(document.getElementById('kclI2').value);
    const I3 = parseFloat(document.getElementById('kclI3').value);
    const I4 = I1 + I2 - I3;

    document.getElementById('kclI1Val').textContent = I1.toFixed(1);
    document.getElementById('kclI2Val').textContent = I2.toFixed(1);
    document.getElementById('kclI3Val').textContent = I3.toFixed(1);

    document.getElementById('kclResult').innerHTML =
        `I₄ ออก = <strong>${I4.toFixed(1)} A</strong> | ΣI<sub>เข้า</sub>(${(I1+I2).toFixed(1)}) = ΣI<sub>ออก</sub>(${(I3+I4).toFixed(1)}) ${I4 >= 0 ? '✓' : '(I₄ ไหลกลับเข้า)'}`;

    kclCtx.clearRect(0, 0, 700, 350);
    kclCtx.fillStyle = '#ffffff';
    kclCtx.fillRect(0, 0, 700, 350);
    kclPhase += 0.015;

    const cx = 350, cy = 175;

    // Node circle
    kclCtx.beginPath();
    kclCtx.arc(cx, cy, 20, 0, Math.PI * 2);
    kclCtx.fillStyle = '#fbbf24';
    kclCtx.fill();
    kclCtx.strokeStyle = '#b45309';
    kclCtx.lineWidth = 3;
    kclCtx.stroke();

    function drawKCLArrow(fromX, fromY, toX, toY, color, label, current) {
        const lineWidth = Math.max(2, Math.min(Math.abs(current) * 1.5, 10));
        kclCtx.strokeStyle = color;
        kclCtx.lineWidth = lineWidth;
        kclCtx.beginPath();
        kclCtx.moveTo(fromX, fromY);
        kclCtx.lineTo(toX, toY);
        kclCtx.stroke();

        // Arrow head
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const hl = 14;
        kclCtx.beginPath();
        kclCtx.moveTo(toX, toY);
        kclCtx.lineTo(toX - hl * Math.cos(angle - 0.4), toY - hl * Math.sin(angle - 0.4));
        kclCtx.lineTo(toX - hl * Math.cos(angle + 0.4), toY - hl * Math.sin(angle + 0.4));
        kclCtx.closePath();
        kclCtx.fillStyle = color;
        kclCtx.fill();

        // Label
        const mx = (fromX + toX) / 2;
        const my = (fromY + toY) / 2;
        const offX = (toY !== fromY) ? 35 : 0;
        const offY = (toX !== fromX) ? -18 : 0;
        kclCtx.fillStyle = color;
        kclCtx.font = 'bold 14px Fira Code';
        kclCtx.textAlign = 'center';
        kclCtx.fillText(label, mx + offX, my + offY);
        kclCtx.textAlign = 'left';

        // Electrons
        const count = Math.max(2, Math.floor(Math.abs(current)));
        for (let i = 0; i < count; i++) {
            const t = ((kclPhase * Math.abs(current) * 0.3 + i / count) % 1);
            const ex = fromX + (toX - fromX) * t;
            const ey = fromY + (toY - fromY) * t;
            kclCtx.beginPath();
            kclCtx.arc(ex, ey, 4, 0, Math.PI * 2);
            kclCtx.fillStyle = '#2563eb';
            kclCtx.fill();
        }
    }

    drawKCLArrow(80, cy, cx - 20, cy, '#16a34a', `I₁=${I1.toFixed(1)}A`, I1);
    drawKCLArrow(cx, 25, cx, cy - 20, '#16a34a', `I₂=${I2.toFixed(1)}A`, I2);
    drawKCLArrow(cx + 20, cy, 620, cy, '#dc2626', `I₃=${I3.toFixed(1)}A`, I3);

    if (I4 >= 0) {
        drawKCLArrow(cx, cy + 20, cx, 330, '#ea580c', `I₄=${I4.toFixed(1)}A`, I4);
    } else {
        drawKCLArrow(cx, 330, cx, cy + 20, '#16a34a', `I₄=${Math.abs(I4).toFixed(1)}A`, Math.abs(I4));
    }

    kclCtx.fillStyle = '#1e293b';
    kclCtx.font = 'bold 12px Sarabun';
    kclCtx.textAlign = 'center';
    kclCtx.fillText('Node', cx, cy + 5);
    kclCtx.textAlign = 'left';

    requestAnimationFrame(drawKCL);
}
drawKCL();

// Wheatstone Bridge
function checkBridge() {
    const R1 = parseFloat(document.getElementById('wb1').value);
    const R2 = parseFloat(document.getElementById('wb2').value);
    const R3 = parseFloat(document.getElementById('wb3').value);
    const R4 = parseFloat(document.getElementById('wb4').value);
    const ratio1 = R1 / R2;
    const ratio2 = R3 / R4;
    const balanced = Math.abs(ratio1 - ratio2) < 0.001;
    document.getElementById('bridge-result').innerHTML =
        `R₁/R₂ = ${R1}/${R2} = ${ratio1.toFixed(4)}<br>` +
        `R₃/R₄ = ${R3}/${R4} = ${ratio2.toFixed(4)}<br>` +
        (balanced ?
            `<strong style="color:#16a34a">✓ สมดุล! ไม่มีกระแสผ่าน R₅</strong>` :
            `<strong style="color:#dc2626">✗ ไม่สมดุล — มีกระแสผ่าน R₅</strong>`);
}

// ============================================================
// 7. POWER & ELECTRICITY BILL
// ============================================================
function addAppliance() {
    const list = document.getElementById('applianceList');
    const row = document.createElement('div');
    row.className = 'appliance-row';
    row.innerHTML = `
        <input type="text" placeholder="ชื่อเครื่องใช้" value="" class="app-name">
        <input type="number" placeholder="กำลัง (W)" value="100" class="app-watt" step="1">
        <input type="number" placeholder="ชม./วัน" value="1" class="app-hours" step="0.5">
        <button onclick="removeAppliance(this)" class="remove-btn">✕</button>`;
    list.appendChild(row);
}
function removeAppliance(btn) { btn.parentElement.remove(); }

function calcElecBill() {
    const rows = document.querySelectorAll('.appliance-row');
    const days = parseFloat(document.getElementById('billDays').value);
    const rate = parseFloat(document.getElementById('billRate').value);
    let totalUnits = 0;
    let details = '';

    rows.forEach(row => {
        const name = row.querySelector('.app-name').value || 'ไม่ระบุ';
        const watt = parseFloat(row.querySelector('.app-watt').value) || 0;
        const hours = parseFloat(row.querySelector('.app-hours').value) || 0;
        const units = (watt / 1000) * hours * days;
        totalUnits += units;
        details += `${name}: ${watt}W × ${hours}ชม. × ${days}วัน = <strong>${units.toFixed(2)} Unit</strong><br>`;
    });

    const cost = totalUnits * rate;
    document.getElementById('bill-result').innerHTML =
        details +
        `<hr style="border-color:#cbd5e1;margin:10px 0">` +
        `รวม: <strong>${totalUnits.toFixed(2)} Unit</strong><br>` +
        `ค่าไฟ = ${totalUnits.toFixed(2)} × ${rate} = <strong style="font-size:1.4em;color:#dc2626">${cost.toFixed(2)} บาท</strong>`;
}

// ============================================================
// 8. CIRCUIT BUILDER LAB
// ============================================================
const labCanvas = document.getElementById('labCanvas');
const labCtx = labCanvas.getContext('2d');
let labComponents = [];
let labWires = [];
let dragComponent = null;
let selectedComponent = null;
let wireDrawing = false;
let wireModeActive = false;
let wireStart = null;
let nextId = 1;
const GRID = 20;
function snap(v) { return Math.round(v / GRID) * GRID; }

function createComponent(type, x, y) {
    const defaults = {
        battery: { label: 'E', value: 12, unit: 'V', r: 0.5, w: 60, h: 40, color: '#16a34a' },
        resistor: { label: 'R', value: 10, unit: 'Ω', w: 80, h: 30, color: '#ea580c' },
        bulb: { label: 'L', value: 100, unit: 'Ω', w: 40, h: 40, color: '#eab308' },
        switch: { label: 'SW', value: 1, unit: '', w: 60, h: 20, color: '#2563eb', closed: true },
        ammeter: { label: 'A', value: 0, unit: 'A', w: 40, h: 40, color: '#db2777' },
        voltmeter: { label: 'V', value: 0, unit: 'V', w: 40, h: 40, color: '#7c3aed' }
    };
    const d = defaults[type];
    return {
        id: nextId++, type, x: snap(x), y: snap(y), ...d,
        terminals: [
            { x: -d.w / 2 - 8, y: 0 },
            { x: d.w / 2 + 8, y: 0 }
        ]
    };
}

function drawLabComponent(ctx, comp, selected) {
    const { x, y, w, h, type, color, value, unit } = comp;
    ctx.save();
    ctx.translate(x, y);

    if (selected) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16);
        ctx.setLineDash([]);
    }

    // Terminals
    comp.terminals.forEach(t => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#64748b';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    });

    if (type === 'battery') {
        ctx.fillStyle = '#f0fdf4';
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.rect(-w/2, -h/2, w, h); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#dc2626'; ctx.fillRect(w/2 - 10, -h/2 + 5, 5, h - 10);
        ctx.fillStyle = '#16a34a'; ctx.fillRect(-w/2 + 5, -h/2 + 8, 5, h - 16);
        ctx.fillStyle = '#1e293b'; ctx.font = 'bold 10px Fira Code'; ctx.textAlign = 'center';
        ctx.fillText('+', w/2 - 7, -h/2 - 3);
        ctx.fillText('−', -w/2 + 7, -h/2 - 3);
        ctx.fillStyle = '#2563eb';
        ctx.fillText(`${value}${unit}`, 0, 6);
    } else if (type === 'resistor') {
        ctx.strokeStyle = color; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-w/2, 0);
        for (let i = 0; i < 8; i++) ctx.lineTo(-w/2 + (w/8) * (i + 0.5), (i % 2 === 0 ? -h/2 : h/2));
        ctx.lineTo(w/2, 0); ctx.stroke();
        ctx.fillStyle = '#1e293b'; ctx.font = 'bold 11px Fira Code'; ctx.textAlign = 'center';
        ctx.fillText(`${value}${unit}`, 0, h/2 + 16);
    } else if (type === 'bulb') {
        ctx.beginPath(); ctx.arc(0, 0, w/2, 0, Math.PI * 2);
        ctx.fillStyle = '#fefce8'; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8,-8); ctx.lineTo(8,8); ctx.moveTo(8,-8); ctx.lineTo(-8,8); ctx.stroke();
        ctx.fillStyle = '#1e293b'; ctx.font = '10px Fira Code'; ctx.textAlign = 'center';
        ctx.fillText(`${value}Ω`, 0, w/2 + 15);
    } else if (type === 'switch') {
        ctx.strokeStyle = color; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(-w/2 + 5, 0, 4, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.arc(w/2 - 5, 0, 4, 0, Math.PI*2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-w/2 + 9, 0);
        if (comp.closed) ctx.lineTo(w/2 - 9, 0); else ctx.lineTo(w/2 - 15, -20);
        ctx.stroke();
        ctx.fillStyle = color; ctx.font = 'bold 10px Sarabun'; ctx.textAlign = 'center';
        ctx.fillText(comp.closed ? 'ปิด' : 'เปิด', 0, 20);
    } else if (type === 'ammeter' || type === 'voltmeter') {
        ctx.beginPath(); ctx.arc(0, 0, w/2, 0, Math.PI*2);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = color; ctx.font = 'bold 18px Fira Code'; ctx.textAlign = 'center';
        ctx.fillText(type === 'ammeter' ? 'A' : 'V', 0, 7);
    }

    ctx.textAlign = 'left';
    ctx.restore();
}

function drawLab() {
    labCtx.clearRect(0, 0, 800, 600);
    labCtx.fillStyle = '#ffffff';
    labCtx.fillRect(0, 0, 800, 600);

    // Grid dots
    labCtx.fillStyle = '#cbd5e1';
    for (let x = 0; x < 800; x += GRID) {
        for (let y = 0; y < 600; y += GRID) {
            labCtx.beginPath();
            labCtx.arc(x, y, 1, 0, Math.PI * 2);
            labCtx.fill();
        }
    }

    // Wires
    labWires.forEach(w => {
        labCtx.strokeStyle = '#475569';
        labCtx.lineWidth = 3;
        labCtx.beginPath();
        labCtx.moveTo(w.x1, w.y1);
        labCtx.lineTo(w.x2, w.y2);
        labCtx.stroke();
    });

    // Wire being drawn
    if (wireDrawing && wireStart) {
        labCtx.strokeStyle = 'rgba(37,99,235,0.5)';
        labCtx.lineWidth = 2;
        labCtx.setLineDash([5, 5]);
        labCtx.beginPath();
        labCtx.moveTo(wireStart.x, wireStart.y);
        labCtx.lineTo(wireStart.mx, wireStart.my);
        labCtx.stroke();
        labCtx.setLineDash([]);
    }

    // Components
    labComponents.forEach(comp => {
        drawLabComponent(labCtx, comp, comp === selectedComponent);
    });

    if (labComponents.length === 0 && labWires.length === 0) {
        labCtx.fillStyle = '#94a3b8';
        labCtx.font = '16px Sarabun';
        labCtx.textAlign = 'center';
        labCtx.fillText('ลากอุปกรณ์จากแถบด้านซ้ายมาวางที่นี่', 400, 270);
        labCtx.fillText('หรือเลือก "ตัวอย่าง" เพื่อโหลดวงจรสำเร็จรูป', 400, 300);
        labCtx.textAlign = 'left';
    }
}
drawLab();

// Drag from toolbox
document.querySelectorAll('.tool-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('type', item.dataset.type);
    });
});
labCanvas.addEventListener('dragover', (e) => e.preventDefault());
labCanvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const rect = labCanvas.getBoundingClientRect();
    const scaleX = labCanvas.width / rect.width;
    const scaleY = labCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const type = e.dataTransfer.getData('type');
    if (type) { labComponents.push(createComponent(type, x, y)); drawLab(); }
});

let mouseDown = false;
let mouseOffset = { x: 0, y: 0 };

labCanvas.addEventListener('mousedown', (e) => {
    const rect = labCanvas.getBoundingClientRect();
    const scaleX = labCanvas.width / rect.width;
    const scaleY = labCanvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    if (wireModeActive) {
        if (!wireDrawing) {
            wireStart = { x: snap(mx), y: snap(my), mx, my };
            wireDrawing = true;
        } else {
            labWires.push({ x1: wireStart.x, y1: wireStart.y, x2: snap(mx), y2: snap(my) });
            wireDrawing = false; wireStart = null; drawLab();
        }
        return;
    }

    selectedComponent = null;
    for (let i = labComponents.length - 1; i >= 0; i--) {
        const c = labComponents[i];
        if (mx >= c.x - c.w/2 - 10 && mx <= c.x + c.w/2 + 10 &&
            my >= c.y - c.h/2 - 10 && my <= c.y + c.h/2 + 10) {
            selectedComponent = c;
            dragComponent = c;
            mouseOffset = { x: mx - c.x, y: my - c.y };
            mouseDown = true;
            showComponentProps(c);
            if (c.type === 'switch') c.closed = !c.closed;
            break;
        }
    }
    drawLab();
});

labCanvas.addEventListener('mousemove', (e) => {
    const rect = labCanvas.getBoundingClientRect();
    const scaleX = labCanvas.width / rect.width;
    const scaleY = labCanvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    if (wireDrawing && wireStart) { wireStart.mx = mx; wireStart.my = my; drawLab(); }
    if (mouseDown && dragComponent) {
        dragComponent.x = snap(mx - mouseOffset.x);
        dragComponent.y = snap(my - mouseOffset.y);
        drawLab();
    }
});

labCanvas.addEventListener('mouseup', () => { mouseDown = false; dragComponent = null; });

function showComponentProps(comp) {
    const propsDiv = document.getElementById('componentProps');
    const editor = document.getElementById('propEditor');
    propsDiv.style.display = 'block';
    let html = `<p><strong>${comp.type}</strong> (ID: ${comp.id})</p>`;
    if (comp.type === 'battery') {
        html += `<label>EMF (V): <input type="number" value="${comp.value}" onchange="updateProp(${comp.id},'value',this.value)" style="width:80px"></label><br>`;
        html += `<label>r (Ω): <input type="number" value="${comp.r}" step="0.1" onchange="updateProp(${comp.id},'r',this.value)" style="width:80px"></label>`;
    } else if (comp.type !== 'ammeter' && comp.type !== 'voltmeter' && comp.type !== 'switch') {
        html += `<label>ค่า (${comp.unit}): <input type="number" value="${comp.value}" onchange="updateProp(${comp.id},'value',this.value)" style="width:80px"></label>`;
    }
    html += `<br><button onclick="deleteComponent(${comp.id})" style="margin-top:8px;background:#dc2626;color:#fff;border:none;padding:5px 12px;border-radius:6px;cursor:pointer">ลบ</button>`;
    editor.innerHTML = html;
}
function updateProp(id, prop, val) {
    const comp = labComponents.find(c => c.id === id);
    if (comp) { comp[prop] = parseFloat(val); drawLab(); }
}
function deleteComponent(id) {
    labComponents = labComponents.filter(c => c.id !== id);
    selectedComponent = null;
    document.getElementById('componentProps').style.display = 'none';
    drawLab();
}
function toggleWireMode() {
    wireModeActive = !wireModeActive;
    document.getElementById('wireMode').classList.toggle('active', wireModeActive);
    wireDrawing = false; wireStart = null;
    labCanvas.style.cursor = wireModeActive ? 'crosshair' : 'default';
}
function clearLab() {
    labComponents = []; labWires = []; selectedComponent = null;
    document.getElementById('analysisResult').innerHTML = '<p class="placeholder">วางอุปกรณ์แล้วกด "วิเคราะห์"</p>';
    document.getElementById('componentProps').style.display = 'none';
    drawLab();
}

function loadPreset(type) {
    clearLab();
    if (type === 'series') {
        const b = createComponent('battery', 100, 300); b.value = 12;
        const r1 = createComponent('resistor', 300, 100); r1.value = 10;
        const r2 = createComponent('resistor', 500, 100); r2.value = 20;
        labComponents = [b, r1, r2];
        labWires = [
            {x1:130,y1:300,x2:130,y2:100},{x1:130,y1:100,x2:260,y2:100},
            {x1:340,y1:100,x2:460,y2:100},{x1:540,y1:100,x2:640,y2:100},
            {x1:640,y1:100,x2:640,y2:300},{x1:640,y1:300,x2:70,y2:300}
        ];
    } else if (type === 'parallel') {
        const b = createComponent('battery', 100, 250); b.value = 12;
        const r1 = createComponent('resistor', 350, 150); r1.value = 10;
        const r2 = createComponent('resistor', 550, 150); r2.value = 20;
        labComponents = [b, r1, r2];
        labWires = [
            {x1:130,y1:250,x2:130,y2:80},{x1:130,y1:80,x2:640,y2:80},
            {x1:640,y1:80,x2:640,y2:420},{x1:640,y1:420,x2:70,y2:420},{x1:70,y1:420,x2:70,y2:250},
            {x1:310,y1:80,x2:310,y2:150},{x1:390,y1:150,x2:390,y2:80},
            {x1:510,y1:80,x2:510,y2:150},{x1:590,y1:150,x2:590,y2:80},
            {x1:310,y1:150,x2:310,y2:420},{x1:510,y1:150,x2:510,y2:420}
        ];
    } else if (type === 'mixed') {
        const b = createComponent('battery', 100, 250); b.value = 24;
        const r1 = createComponent('resistor', 350, 100); r1.value = 10;
        const r2 = createComponent('resistor', 550, 180); r2.value = 20;
        const r3 = createComponent('resistor', 550, 320); r3.value = 30;
        labComponents = [b, r1, r2, r3];
        labWires = [
            {x1:130,y1:250,x2:130,y2:100},{x1:130,y1:100,x2:310,y2:100},
            {x1:390,y1:100,x2:500,y2:100},{x1:500,y1:100,x2:500,y2:180},{x1:500,y1:180,x2:510,y2:180},
            {x1:590,y1:180,x2:660,y2:180},{x1:660,y1:180,x2:660,y2:400},
            {x1:500,y1:100,x2:500,y2:320},{x1:500,y1:320,x2:510,y2:320},
            {x1:590,y1:320,x2:660,y2:320},{x1:660,y1:400,x2:70,y2:400},{x1:70,y1:400,x2:70,y2:250}
        ];
    }
    drawLab();
}

function analyzeCircuit() {
    const batteries = labComponents.filter(c => c.type === 'battery');
    const resistors = labComponents.filter(c => c.type === 'resistor' || c.type === 'bulb');
    const switches = labComponents.filter(c => c.type === 'switch');

    if (batteries.length === 0) {
        document.getElementById('analysisResult').innerHTML = '<p style="color:#dc2626">ไม่พบแบตเตอรี่!</p>';
        return;
    }
    if (resistors.length === 0) {
        document.getElementById('analysisResult').innerHTML = '<p style="color:#dc2626">ไม่พบตัวต้านทาน!</p>';
        return;
    }
    if (switches.find(s => !s.closed)) {
        document.getElementById('analysisResult').innerHTML = '<p style="color:#ea580c">วงจรเปิด! คลิกสวิตช์เพื่อปิด</p>';
        return;
    }

    const totalE = batteries.reduce((s, b) => s + b.value, 0);
    const totalRi = batteries.reduce((s, b) => s + (b.r || 0), 0);

    let topology = 'series';
    if (resistors.length >= 2) {
        const ySpread = Math.max(...resistors.map(r => r.y)) - Math.min(...resistors.map(r => r.y));
        const xSpread = Math.max(...resistors.map(r => r.x)) - Math.min(...resistors.map(r => r.x));
        if (ySpread > 80 && xSpread < 80) topology = 'parallel';
        else if (ySpread > 80 && xSpread > 80) topology = 'mixed';
    }

    let html;
    if (topology === 'series') {
        const Rt = resistors.reduce((s, r) => s + r.value, 0);
        const Rall = Rt + totalRi;
        const I = totalE / Rall;
        html = `<h4 style="color:#16a34a">วงจรอนุกรม</h4>`;
        html += `<p>E = ${totalE}V, r = ${totalRi}Ω</p>`;
        html += `<p>R<sub>รวม</sub> = ${resistors.map(r => r.value).join('+')} = <strong>${Rt}Ω</strong></p>`;
        html += `<p>I = ${totalE}/${Rall} = <strong>${I.toFixed(4)} A</strong></p>`;
        html += `<p>V(ขั้ว) = <strong>${(totalE - I*totalRi).toFixed(4)} V</strong></p><hr style="border-color:#e2e8f0">`;
        resistors.forEach((r, i) => {
            html += `<p>V<sub>R${i+1}</sub> = ${(I*r.value).toFixed(4)} V | P = ${(I*I*r.value).toFixed(4)} W</p>`;
        });
    } else if (topology === 'parallel') {
        const invR = resistors.reduce((s, r) => s + 1/r.value, 0);
        const Rt = 1/invR;
        const Rall = Rt + totalRi;
        const I = totalE / Rall;
        const Vt = totalE - I*totalRi;
        html = `<h4 style="color:#dc2626">วงจรขนาน</h4>`;
        html += `<p>R<sub>รวม</sub> = <strong>${Rt.toFixed(4)}Ω</strong></p>`;
        html += `<p>I<sub>รวม</sub> = <strong>${I.toFixed(4)} A</strong></p>`;
        html += `<p>V(ขั้ว) = <strong>${Vt.toFixed(4)} V</strong></p><hr style="border-color:#e2e8f0">`;
        resistors.forEach((r, i) => {
            html += `<p>I<sub>R${i+1}</sub> = ${(Vt/r.value).toFixed(4)} A</p>`;
        });
    } else {
        const sR = resistors[0];
        const pRs = resistors.slice(1);
        const invRp = pRs.reduce((s, r) => s + 1/r.value, 0);
        const Rp = 1/invRp;
        const Rt = sR.value + Rp;
        const Rall = Rt + totalRi;
        const I = totalE / Rall;
        const Vp = I * Rp;
        html = `<h4 style="color:#ea580c">วงจรผสม</h4>`;
        html += `<p>R₁=${sR.value}Ω (อนุกรม) + R<sub>ขนาน</sub>=${Rp.toFixed(4)}Ω</p>`;
        html += `<p>R<sub>รวม</sub> = <strong>${Rt.toFixed(4)}Ω</strong></p>`;
        html += `<p>I = <strong>${I.toFixed(4)} A</strong></p>`;
        html += `<p>V<sub>R1</sub> = ${(I*sR.value).toFixed(4)} V | V<sub>ขนาน</sub> = ${Vp.toFixed(4)} V</p>`;
        pRs.forEach((r, i) => {
            html += `<p>I<sub>R${i+2}</sub> = ${(Vp/r.value).toFixed(4)} A</p>`;
        });
    }
    document.getElementById('analysisResult').innerHTML = html;
}

// ============================================================
// 9. QUIZ
// ============================================================
const quizData = [
    { q: 'กระแสไฟฟ้า 2 A ไหลผ่านตัวนำ 5 วินาที ประจุไฟฟ้าไหลผ่านกี่คูลอมบ์?', options: ['5 C', '7 C', '10 C', '2.5 C'], answer: 2, explain: 'Q = It = 2×5 = 10 C' },
    { q: 'V = 12 V, R = 4 Ω → กระแสไฟฟ้าเท่าใด?', options: ['48 A', '3 A', '8 A', '0.33 A'], answer: 1, explain: 'I = V/R = 12/4 = 3 A' },
    { q: 'R 10Ω, 20Ω, 30Ω ต่ออนุกรม → R รวม?', options: ['5.45 Ω', '20 Ω', '60 Ω', '30 Ω'], answer: 2, explain: 'R = 10+20+30 = 60 Ω' },
    { q: 'R 6Ω สองตัวต่อขนาน → R รวม?', options: ['12 Ω', '6 Ω', '3 Ω', '0.33 Ω'], answer: 2, explain: '1/R = 1/6+1/6 = 2/6 → R = 3 Ω' },
    { q: 'EMF=2V, r=0.5Ω, R=4Ω → V ที่ขั้วเซลล์?', options: ['2.00 V', '1.78 V', '0.22 V', '1.50 V'], answer: 1, explain: 'I=2/(4+0.5)=0.444A, V=2-0.444×0.5=1.778V' },
    { q: 'ลวดมี R รีดยาว 2 เท่า (ปริมาตรคงที่) → R ใหม่?', options: ['R/2', '2R', '4R', 'R'], answer: 2, explain: 'ยาว 2× พื้นที่ลด 2× → R_ใหม่ = 4R' },
    { q: 'หลอด 100W เปิด 5 ชม./วัน 30 วัน → กี่ Unit?', options: ['15 Unit', '150 Unit', '1.5 Unit', '1500 Unit'], answer: 0, explain: '(100/1000)×5×30 = 15 Unit' },
    { q: 'KCL: กระแสเข้า 3A + 5A → กระแสออกรวม?', options: ['2 A', '8 A', '15 A', '1.67 A'], answer: 1, explain: 'ΣI_เข้า = ΣI_ออก = 3+5 = 8 A' },
    { q: 'ถ่าน 1.5V × 4 ก้อน อนุกรม → E รวม?', options: ['1.5 V', '3.0 V', '6.0 V', '0.375 V'], answer: 2, explain: 'E = 4×1.5 = 6.0 V' },
    { q: 'Wheatstone: R₁=2, R₂=4, R₃=6 → R₄ เพื่อสมดุล?', options: ['3 Ω', '8 Ω', '12 Ω', '24 Ω'], answer: 2, explain: 'R₁/R₂=R₃/R₄ → 2/4=6/R₄ → R₄=12Ω' }
];

let currentQ = 0;
let userAnswers = new Array(quizData.length).fill(-1);
let quizSubmitted = false;

function renderQuiz() {
    const container = document.getElementById('quizContainer');
    const q = quizData[currentQ];
    let html = `<div class="quiz-question"><h3>ข้อ ${currentQ+1}. ${q.q}</h3><div class="quiz-options">`;
    q.options.forEach((opt, i) => {
        let cls = 'quiz-option';
        if (quizSubmitted) {
            if (i === q.answer) cls += ' correct';
            else if (i === userAnswers[currentQ] && i !== q.answer) cls += ' wrong';
        } else if (userAnswers[currentQ] === i) cls += ' selected';
        html += `<div class="${cls}" onclick="selectAnswer(${i})">${String.fromCharCode(65+i)}. ${opt}</div>`;
    });
    html += '</div>';
    if (quizSubmitted) html += `<div class="quiz-explanation"><strong>เฉลย:</strong> ${q.explain}</div>`;
    html += '</div>';
    container.innerHTML = html;
    document.getElementById('quizProgress').textContent = `ข้อ ${currentQ+1}/${quizData.length}`;
    document.getElementById('prevBtn').disabled = currentQ === 0;
    document.getElementById('nextBtn').disabled = currentQ === quizData.length - 1;
    if (!quizSubmitted && userAnswers.every(a => a >= 0)) document.getElementById('submitQuiz').style.display = 'block';
}

function selectAnswer(i) { if (quizSubmitted) return; userAnswers[currentQ] = i; renderQuiz(); }
function nextQuestion() { if (currentQ < quizData.length - 1) { currentQ++; renderQuiz(); } }
function prevQuestion() { if (currentQ > 0) { currentQ--; renderQuiz(); } }

function submitQuiz() {
    quizSubmitted = true;
    let correct = quizData.filter((q, i) => userAnswers[i] === q.answer).length;
    const pct = Math.round((correct / quizData.length) * 100);
    document.getElementById('submitQuiz').style.display = 'none';
    const r = document.getElementById('quizResult');
    r.style.display = 'block';
    let grade = pct >= 80 ? '🌟 ยอดเยี่ยม!' : pct >= 60 ? '👍 ดีมาก!' : pct >= 40 ? '📚 ทบทวนเพิ่ม' : '💪 พยายามอีก!';
    r.innerHTML = `<div class="score-big">${correct}/${quizData.length}</div><p style="font-size:1.5em">${pct}%</p><p style="font-size:1.3em">${grade}</p><button onclick="resetQuiz()" style="margin-top:15px;background:#2563eb;color:#fff;border:none;padding:10px 25px;border-radius:8px;cursor:pointer;font-family:Sarabun">ทำใหม่</button>`;
    renderQuiz();
}
function resetQuiz() {
    currentQ = 0; userAnswers = new Array(quizData.length).fill(-1); quizSubmitted = false;
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('submitQuiz').style.display = 'none';
    renderQuiz();
}
renderQuiz();

// ============================================================
// 10. STATIC vs CURRENT ELECTRICITY COMPARISON
// ============================================================
const staticCanvas = document.getElementById('staticCanvas');
const staticCtx = staticCanvas ? staticCanvas.getContext('2d') : null;
const currentCompCanvas = document.getElementById('currentCompCanvas');
const currentCompCtx = currentCompCanvas ? currentCompCanvas.getContext('2d') : null;

// --- Static Electricity State ---
let staticCharges = [];
let staticChargeCount = 0;
let isRubbing = false;
let rubFrame = 0;
let isDischarging = false;
let dischargeFrame = 0;
let dischargeSparks = [];

// --- Current Electricity State ---
let currentFlowOn = false;
let currentCompPhase = 0;

// ---- STATIC ELECTRICITY ANIMATION ----
function rubStatic() {
    isRubbing = true;
    rubFrame = 0;
    const addCount = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < addCount; i++) {
        staticCharges.push({
            x: 140 + Math.random() * 140,
            y: 170 + Math.random() * 80,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: 3 + Math.random() * 2
        });
    }
    staticChargeCount = staticCharges.length;
    document.getElementById('staticChargeDisplay').textContent = staticChargeCount;
}

function dischargeStatic() {
    if (staticCharges.length === 0) return;
    isDischarging = true;
    dischargeFrame = 0;
    dischargeSparks = [];
    const sparkCount = 15 + staticCharges.length;
    for (let i = 0; i < sparkCount; i++) {
        dischargeSparks.push({
            x: 210, y: 300,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 6 - 2,
            life: 30 + Math.random() * 30,
            maxLife: 60
        });
    }
}

function drawStaticAnim() {
    if (!staticCtx) return;
    const W = 420, H = 400;
    staticCtx.clearRect(0, 0, W, H);
    staticCtx.fillStyle = '#ffffff';
    staticCtx.fillRect(0, 0, W, H);

    // Title
    staticCtx.fillStyle = '#92400e';
    staticCtx.font = 'bold 13px Sarabun';
    staticCtx.textAlign = 'center';
    staticCtx.fillText('แท่งอำพัน ถูกับผ้าขนสัตว์', 210, 22);

    // Cloth
    staticCtx.fillStyle = '#94a3b8';
    const clothX = isRubbing ? 60 + Math.sin(rubFrame * 0.3) * 20 : 60;
    staticCtx.beginPath();
    staticCtx.rect(clothX, 160, 60, 90);
    staticCtx.fill();
    staticCtx.strokeStyle = '#64748b';
    staticCtx.lineWidth = 2;
    staticCtx.stroke();
    staticCtx.strokeStyle = '#cbd5e1';
    staticCtx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        staticCtx.beginPath();
        staticCtx.moveTo(clothX + 5, 170 + i * 16);
        staticCtx.lineTo(clothX + 55, 170 + i * 16);
        staticCtx.stroke();
    }
    staticCtx.fillStyle = '#64748b';
    staticCtx.font = '11px Sarabun';
    staticCtx.textAlign = 'center';
    staticCtx.fillText('ผ้าขนสัตว์', clothX + 30, 268);

    // Amber rod
    const rodShake = isRubbing ? Math.sin(rubFrame * 0.5) * 3 : 0;
    const rodGrad = staticCtx.createLinearGradient(130, 170, 130, 240);
    rodGrad.addColorStop(0, '#f59e0b');
    rodGrad.addColorStop(0.5, '#b45309');
    rodGrad.addColorStop(1, '#f59e0b');
    staticCtx.fillStyle = rodGrad;
    staticCtx.beginPath();
    staticCtx.rect(130, 170 + rodShake, 160, 70);
    staticCtx.fill();
    staticCtx.strokeStyle = '#78350f';
    staticCtx.lineWidth = 2;
    staticCtx.strokeRect(130, 170 + rodShake, 160, 70);
    // Handle
    staticCtx.fillStyle = '#78350f';
    staticCtx.beginPath();
    staticCtx.rect(290, 185 + rodShake, 80, 40);
    staticCtx.fill();
    staticCtx.strokeStyle = '#451a03';
    staticCtx.lineWidth = 1.5;
    staticCtx.strokeRect(290, 185 + rodShake, 80, 40);

    staticCtx.fillStyle = '#78350f';
    staticCtx.font = 'bold 12px Sarabun';
    staticCtx.textAlign = 'center';
    staticCtx.fillText('แท่งอำพัน', 210, 165 + rodShake);

    // Draw accumulated charges on rod
    staticCharges.forEach(function(ch) {
        ch.x += ch.vx + (Math.random() - 0.5) * 0.6;
        ch.y += ch.vy + (Math.random() - 0.5) * 0.6;
        ch.x = Math.max(135, Math.min(285, ch.x));
        ch.y = Math.max(175 + rodShake, Math.min(235 + rodShake, ch.y));
        if (ch.x < 145) ch.vx += 0.05;
        if (ch.x > 275) ch.vx -= 0.05;
        ch.vx *= 0.98;
        ch.vy *= 0.98;

        staticCtx.beginPath();
        staticCtx.arc(ch.x, ch.y, ch.size, 0, Math.PI * 2);
        staticCtx.fillStyle = 'rgba(37,99,235,0.8)';
        staticCtx.fill();
        staticCtx.beginPath();
        staticCtx.arc(ch.x, ch.y, ch.size + 3, 0, Math.PI * 2);
        staticCtx.fillStyle = 'rgba(37,99,235,0.15)';
        staticCtx.fill();
        staticCtx.fillStyle = '#fff';
        staticCtx.font = 'bold ' + (ch.size * 2) + 'px Fira Code';
        staticCtx.textAlign = 'center';
        staticCtx.fillText('−', ch.x, ch.y + ch.size * 0.5);
    });

    // Rubbing sparks
    if (isRubbing) {
        rubFrame++;
        if (rubFrame < 30) {
            for (let i = 0; i < 3; i++) {
                var sx = 120 + Math.random() * 20;
                var sy = 180 + Math.random() * 50;
                staticCtx.beginPath();
                staticCtx.arc(sx, sy + rodShake, 2, 0, Math.PI * 2);
                staticCtx.fillStyle = 'rgba(251,191,36,' + (1 - rubFrame / 30) + ')';
                staticCtx.fill();
            }
        }
        if (rubFrame > 40) isRubbing = false;
    }

    // Discharge animation
    if (isDischarging) {
        dischargeFrame++;
        // Lightning bolt
        var alpha1 = Math.max(0, 1 - dischargeFrame / 40);
        staticCtx.strokeStyle = 'rgba(124,58,237,' + alpha1 + ')';
        staticCtx.lineWidth = 3;
        staticCtx.beginPath();
        var bx = 210, by = 250 + rodShake;
        staticCtx.moveTo(bx, by);
        for (let i = 0; i < 6; i++) {
            bx += (Math.random() - 0.5) * 30;
            by += 20;
            staticCtx.lineTo(bx, by);
        }
        staticCtx.stroke();
        staticCtx.strokeStyle = 'rgba(124,58,237,' + Math.max(0, 0.3 - dischargeFrame / 60) + ')';
        staticCtx.lineWidth = 8;
        staticCtx.stroke();

        // Sparks
        dischargeSparks.forEach(function(sp) {
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.vy += 0.15;
            sp.life--;
            var alph = Math.max(0, sp.life / sp.maxLife);
            staticCtx.beginPath();
            staticCtx.arc(sp.x, sp.y, 2.5, 0, Math.PI * 2);
            staticCtx.fillStyle = 'rgba(251,191,36,' + alph + ')';
            staticCtx.fill();
        });

        // Remove charges gradually
        if (dischargeFrame % 2 === 0 && staticCharges.length > 0) {
            staticCharges.pop();
        }
        staticChargeCount = staticCharges.length;
        document.getElementById('staticChargeDisplay').textContent = staticChargeCount;

        if (staticCharges.length === 0 && dischargeFrame > 50) {
            isDischarging = false;
            dischargeSparks = [];
        }
    }

    // Ground plate
    staticCtx.fillStyle = '#6b7280';
    staticCtx.fillRect(170, 370, 80, 8);
    staticCtx.strokeStyle = '#9ca3af';
    staticCtx.lineWidth = 1.5;
    for (let i = 0; i < 5; i++) {
        staticCtx.beginPath();
        staticCtx.moveTo(180 + i * 15, 378);
        staticCtx.lineTo(175 + i * 15, 392);
        staticCtx.stroke();
    }
    staticCtx.fillStyle = '#64748b';
    staticCtx.font = '11px Sarabun';
    staticCtx.textAlign = 'center';
    staticCtx.fillText('กราวด์ (พื้นดิน)', 210, 398);

    // Info text
    staticCtx.fillStyle = '#92400e';
    staticCtx.font = '11px Sarabun';
    if (staticCharges.length > 0 && !isDischarging) {
        staticCtx.fillText('ประจุลบสะสมบนผิว — กดคายประจุเพื่อดู!', 210, 50);
    } else if (staticCharges.length === 0 && !isRubbing) {
        staticCtx.fillText('กดปุ่ม "ถูแท่งอำพัน" เพื่อสร้างไฟฟ้าสถิต', 210, 50);
    }

    staticCtx.textAlign = 'left';
    requestAnimationFrame(drawStaticAnim);
}

// ---- CURRENT ELECTRICITY ANIMATION ----
function toggleCurrentFlow() {
    currentFlowOn = !currentFlowOn;
    var btn = document.getElementById('currentFlowBtn');
    if (currentFlowOn) {
        btn.textContent = '🔌 ปิดสวิตช์';
        btn.classList.add('active');
    } else {
        btn.textContent = '🔌 เปิดสวิตช์';
        btn.classList.remove('active');
    }
}

function drawCurrentCompAnim() {
    if (!currentCompCtx) return;
    var ctx = currentCompCtx;
    var W = 420, H = 400;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    var left = 60, right = 360, top_ = 80, bottom = 320;

    // Wires
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left, top_); ctx.lineTo(right, top_);
    ctx.lineTo(right, bottom); ctx.lineTo(left, bottom);
    ctx.lineTo(left, top_);
    ctx.stroke();

    // Battery (left side)
    var batY = 200;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(left - 22, batY - 30, 44, 60);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(left - 6, batY - 28, 12, 4);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(left - 4, batY + 22, 8, 4);
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText('+', left, batY - 32);
    ctx.fillText('−', left, batY + 40);
    ctx.fillStyle = '#2563eb';
    ctx.font = 'bold 12px Fira Code';
    ctx.fillText('12V', left, batY + 5);

    // Resistor (right side)
    var resY = 200;
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(right - 20, resY - 35, 40, 70);
    ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(right, resY - 25);
    for (let i = 0; i < 5; i++) {
        ctx.lineTo(right + (i % 2 === 0 ? -10 : 10), resY - 25 + (i + 1) * 9);
    }
    ctx.lineTo(right, resY + 25);
    ctx.stroke();
    ctx.fillStyle = '#ea580c';
    ctx.font = 'bold 11px Fira Code';
    ctx.fillText('R', right, resY + 5);
    ctx.textAlign = 'left';
    ctx.fillText('10Ω', right + 25, resY + 5);
    ctx.textAlign = 'center';

    // Switch (top)
    var swX = 210, swY = top_;
    ctx.beginPath();
    ctx.arc(swX - 25, swY, 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath();
    ctx.arc(swX + 25, swY, 5, 0, Math.PI * 2);
    ctx.stroke();

    if (currentFlowOn) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(swX - 20, swY);
        ctx.lineTo(swX + 20, swY);
        ctx.stroke();
        ctx.fillStyle = '#16a34a';
        ctx.font = 'bold 11px Sarabun';
        ctx.fillText('ปิด (ON)', swX, swY - 14);
    } else {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(swX - 20, swY);
        ctx.lineTo(swX + 10, swY - 25);
        ctx.stroke();
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 11px Sarabun';
        ctx.fillText('เปิด (OFF)', swX, swY - 28);
    }

    // Bulb (bottom)
    var bulbX = 210, bulbY = bottom;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, 18, 0, Math.PI * 2);
    if (currentFlowOn) {
        ctx.fillStyle = '#fef08a';
        ctx.fill();
        ctx.strokeStyle = '#eab308'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, 26, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250,204,21,0.2)';
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bulbX - 8, bulbY - 8);
        ctx.lineTo(bulbX, bulbY + 5);
        ctx.lineTo(bulbX + 8, bulbY - 8);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(234,179,8,0.5)';
        ctx.lineWidth = 1.5;
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.moveTo(bulbX + Math.cos(a) * 22, bulbY + Math.sin(a) * 22);
            ctx.lineTo(bulbX + Math.cos(a) * 30, bulbY + Math.sin(a) * 30);
            ctx.stroke();
        }
    } else {
        ctx.fillStyle = '#f1f5f9';
        ctx.fill();
        ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2; ctx.stroke();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bulbX - 6, bulbY - 6);
        ctx.lineTo(bulbX, bulbY + 4);
        ctx.lineTo(bulbX + 6, bulbY - 6);
        ctx.stroke();
    }

    // Electrons flowing
    if (currentFlowOn) {
        currentCompPhase += 0.012;
        var path = [
            { x: left, y: top_ },
            { x: right, y: top_ },
            { x: right, y: bottom },
            { x: left, y: bottom },
            { x: left, y: top_ }
        ];
        drawFlowingElectrons(ctx, path, 1.2, currentCompPhase);

        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 13px Fira Code';
        ctx.textAlign = 'center';
        ctx.fillText('I = 1.20 A →', 300, 60);
        document.getElementById('currentFlowDisplay').textContent = '1.20';
    } else {
        document.getElementById('currentFlowDisplay').textContent = '0.00';
    }

    // Title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 13px Sarabun';
    ctx.textAlign = 'center';
    ctx.fillText('กระแสไหลต่อเนื่องในวงจรปิด', 210, 22);

    if (!currentFlowOn) {
        ctx.fillStyle = '#64748b';
        ctx.font = '12px Sarabun';
        ctx.fillText('กดเปิดสวิตช์เพื่อให้กระแสไหล', 210, 395);
    } else {
        ctx.fillStyle = '#16a34a';
        ctx.font = '12px Sarabun';
        ctx.fillText('⚡ อิเล็กตรอนไหลต่อเนื่องจาก − ไป +', 210, 395);
    }

    ctx.textAlign = 'left';
    requestAnimationFrame(drawCurrentCompAnim);
}

// Start both comparison animations
if (staticCanvas) drawStaticAnim();
if (currentCompCanvas) drawCurrentCompAnim();
