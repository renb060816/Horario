
const horarioData = {
    1: [ 
        { id: "L1", nombre: "Redes de computadoras", inicio: "08:40 AM", fin: "10:20 PM", profe: "Javier marlequin" },
        { id: "L2", nombre: "Ingles", inicio: "04:00 PM", fin: "05:30 PM", profe: "Nelly Villareal" },
        { id: "L3", nombre: "F sistemas de informacion", inicio: "07:10 PM", fin: "08:40 PM", profe: "Homero zertuche" }, 
        { id: "L4", nombre: "Costos Empresariales", inicio: "08:40 PM", fin: "09:25 PM", profe: "Jairo Cristopher" }, 
       
    ],
    2: [ 
        { id: "M1", nombre: "Redes de computadoras", inicio: "09:30 AM", fin: "10:20 AM", profe: "Javier marlequin" },
        { id: "M2", nombre: "F Bases de datos", inicio: "10:40 AM", fin: "01:10 PM", profe: "Ruben Riojas" },
        { id: "M3", nombre: "F sistemas de informacion", inicio: "07:10 PM", fin: "08:40 PM", profe: "Homero zertuche" }, 
         
    ],
    3: [ 
        { id: "W1", nombre: "F Bases de datos", inicio: "12:20 PM", fin: "02:00 PM", profe: "Ruben Riojas" },
        { id: "W2", nombre: "Costos Empresariales", inicio: "05:30 PM", fin: "07:00 PM", profe: "Jairo Cristopher" }, 
        { id: "W3", nombre: "Estructuras de Datos", inicio: "07:10 PM", fin: "07:55 PM", profe: "Nuevo 2" }, 
        
    ],
    4: [ 
         { id: "J1", nombre: "Taller de leg info", inicio: "07:00 AM", fin: "08:40 AM", profe: "Aguilera" },
        { id: "J2",nombre: "Ingles", inicio: "04:00 PM", fin: "05:30 PM", profe: "Nelly Villareal" }, 
        { id: "J3", nombre: "Estructuras de Datos", inicio: "07:55 PM", fin: "09:25 PM", profe: "maistro2" }, 
        { id: "J4", nombre: "Tutoría", inicio: "09:25 PM", fin: "10:10 PM", profe: "cesar alberto" } 
    ],
    5: [ 
        { id: "V1", nombre: "Taller de leg info", inicio: "07:50 AM", fin: "08:40 AM", profe: "Aguilera" },
        { id: "V2", nombre: "Redes de computadoras", inicio: "08:40 AM", fin: "10:20 AM", profe: "Javier marlequin" },
        { id: "V3", nombre: "Costos Empresariales", inicio: "06:15 PM", fin: "07:00 PM", profe: "Jairo Cristopher" }, 
        { id: "V4",  nombre: "Estructuras de Datos", inicio: "08:40 PM", fin: "10:20 PM", profe: "maistro2" }, 
         
    ]
};

function obtenerMateriasUnicas() {
    const materiasSet = new Set();
    Object.values(horarioData).forEach(dia => {
        dia.forEach(clase => materiasSet.add(clase.nombre));
    });
    return Array.from(materiasSet).sort();
}

function cargarSelectsMaterias() {
    const materias = obtenerMateriasUnicas();
    
    const selectIds = [
        'select-nota-materia', 
        'select-falta-materia', 
        'select-examen-materia',
        'select-tarea-materia'
    ];

    selectIds.forEach(id => {
        const selectElem = document.getElementById(id);
        if (selectElem) {
            selectElem.innerHTML = '<option value="General">General</option>';
            materias.forEach(materia => {
                const option = document.createElement('option');
                option.value = materia;
                option.textContent = materia;
                selectElem.appendChild(option);
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    cargarSelectsMaterias();
});

let diaVisual = new Date().getDay();
if(diaVisual === 0 || diaVisual === 6) diaVisual = 1;

function getF(m) { return parseInt(localStorage.getItem('faltas_'+m) || '0'); }
function addF(m) { localStorage.setItem('faltas_'+m, getF(m) + 1); actualizarApp(true); }
function resF(m) { if(confirm(`¿Resetear faltas de ${m}?`)) { localStorage.setItem('faltas_'+m, 0); actualizarApp(true); } }

function toggleDarkMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

function actualizarApp(f = false) {
    const hoy = new Date();
    if(!f && hoy.getDay() > 0 && hoy.getDay() < 6) diaVisual = hoy.getDay();
    document.querySelectorAll('.btn-day').forEach((b, i) => b.classList.toggle('active', (i+1) === diaVisual));
    const n = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
    document.getElementById('current-date-text').innerText = "Hoy es " + n[hoy.getDay()];
    document.getElementById('day-title').innerText = n[diaVisual] + " " + hoy.toLocaleDateString();
    const clases = horarioData[diaVisual] || [];
    document.getElementById('schedule-container').innerHTML = clases.map(c => {
        const faltas = getF(c.nombre);
        let color = 'var(--border)';
        if(faltas === 1) color = '#00b894'; 
        if(faltas === 2) color = '#f1c40f'; 
        if(faltas >= 3) color = '#e74c3c';  
        return `<div class="card" style="border-left: 7px solid ${color}"><small style="float:right; opacity:0.6">${c.profe}</small><h3>${c.nombre}</h3><div class="time-tag">${c.inicio} - ${c.fin}</div><div class="attendance-row"><button class="asistencia-btn" onclick="addF('${c.nombre}')">Faltas: ${faltas}</button><button class="reset-btn" onclick="resF('${c.nombre}')">REINICIAR</button></div></div>`;
    }).join('') || '<p style="text-align:center; padding:20px;">Sin clases este día.</p>';
    updateExam();
}

function updateClock() {
    const d = new Date();
    document.getElementById('digital-clock').innerText = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    const badge = document.getElementById('status-badge');
    const hM = d.getHours()*60 + d.getMinutes();
    const actual = (horarioData[d.getDay()]||[]).find(c => hM >= tToM(c.inicio) && hM < tToM(c.fin));
    badge.innerText = actual ? `Faltan ${tToM(actual.fin)-hM}m` : (d.getDay()==0||d.getDay()==6?"Finde 😴":"Libre 🙌");
}

const v = (id) => { const el=document.getElementById(id); const val=el.value; el.value=''; return val; };
function save(k, obj) { let i=JSON.parse(localStorage.getItem(k)||'[]'); i.push(obj); localStorage.setItem(k, JSON.stringify(i)); }
function del(k, i, cb) { let items=JSON.parse(localStorage.getItem(k)); items.splice(i,1); localStorage.setItem(k, JSON.stringify(items)); cb(); }

function obtenerNombreDia(fechaStr) {
    const fecha = new Date(fechaStr + "T00:00:00");
    return ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][fecha.getDay()];
}

function render(k, id, temp, filter=null) {
    let items = JSON.parse(localStorage.getItem(k)||'[]');
    if(filter) items = items.filter(filter);
    const el = document.getElementById(id);
    if(el) el.innerHTML = items.map(temp).join('');
}

function updateExam() {
    const items = JSON.parse(localStorage.getItem('s')||'[]');
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const prox = items.filter(i => new Date(i.f + "T00:00:00") >= hoy).sort((a,b) => new Date(a.f + "T00:00:00") - new Date(b.f + "T00:00:00"))[0];
    const w = document.getElementById('exam-alert-widget');
    if(w && prox) {
        const dif = Math.ceil((new Date(prox.f + "T00:00:00") - hoy) / 86400000);
        w.innerHTML = `<div class="exam-alert">⚠️ <b>Examen:</b> ${prox.m} <br><small>${obtenerNombreDia(prox.f)} - ${dif==0?"¡HOY!":dif==1?"Mañana":"en "+dif+" días"} (${prox.f})</small></div>`;
    } else if(w) { w.innerHTML = ''; }
}

function tToM(t) { let [tm, m] = t.split(' '); let [h, min] = tm.split(':').map(Number); if(m==='PM'&&h<12) h+=12; if(m==='AM'&&h===12) h=0; return h*60+min; }

function cambiarSeccion(id, el) { 
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('section-'+id).classList.add('active'); el.classList.add('active');
    document.getElementById('app-title').innerText = (id === 'sumativas') ? "Exámenes" : id.charAt(0).toUpperCase() + id.slice(1);
}

function verDia(d) { diaVisual = d; actualizarApp(true); }
function cambiarNombre() { const n=prompt("¿Nombre?"); if(n) { localStorage.setItem('user_name',n); location.reload(); } }

function agregarTarea() { const t=v('input-tarea'), f=v('fecha-tarea'); if(t&&f) save('t', {t,f}); renderT(); }
function renderT() { render('t', 'lista-tareas', (x,i)=> `<div class="saved-item"><div><b>${x.t}</b><br><small>${obtenerNombreDia(x.f)} ${x.f}</small></div><button class="reset-btn" onclick="del('t',${i},renderT)">✕</button></div>`, x=>x.f>=new Date().toISOString().split('T')[0]); }

function agregarSumativa() { const m=v('select-materia-sumativa'), u=v('input-unidad-sumativa'), n=v('input-nota-sumativa'), f=v('fecha-sumativa'); if(u&&n&&f) save('s', {m,u,n,f}); renderS(); }
function renderS() { render('s', 'lista-sumativas', (x,i)=> `<div class="saved-item"><div><b>${x.m}</b> (U${x.u})<br><small>${obtenerNombreDia(x.f)} | Calif: ${x.n} | ${x.f}</small></div><button class="reset-btn" onclick="del('s',${i},renderS)">✕</button></div>`); updateExam(); }

// --- LÓGICA DE NOTAS MEJORADA ---
function agregarNota() { 
    const ti = v('input-nota-titulo') || 'Nota sin título';
    const ma = document.getElementById('select-nota-materia').value;
    const te = v('input-nota-texto');
    if(te) {
        save('n', {ti, ma, te, d: new Date().toLocaleDateString()});
        renderN();
    }
}

function renderN() {
    render('n', 'lista-notas', (x, i) => `
        <div class="saved-item" style="flex-direction:column; align-items:flex-start;">
            <div onclick="toggleNota(${i})" style="width:100%; cursor:pointer;">
                <small style="float:right; opacity:0.6">${x.d}</small>
                <div style="color:var(--primary); font-size:0.8rem; font-weight:bold;">${x.ma}</div>
                <b style="font-size:1.1rem;">${x.ti}</b>
                <p id="nota-content-${i}" style="display:none; margin-top:10px; white-space: pre-wrap; border-top:1px solid var(--border); padding-top:10px;">${x.te}</p>
            </div>
            <button class="reset-btn" style="margin-top:10px;" onclick="del('n',${i},renderN)">BORRAR</button>
        </div>
    `);
}

function toggleNota(i) {
    const el = document.getElementById(`nota-content-${i}`);
    el.style.display = (el.style.display === 'none') ? 'block' : 'none';
}

// Swipe
let touchstartX = 0; let touchendX = 0;
const gestureZone = document.getElementById('schedule-container');
gestureZone.addEventListener('touchstart', e => touchstartX = e.changedTouches[0].screenX, false);
gestureZone.addEventListener('touchend', e => { touchendX = e.changedTouches[0].screenX; handleGesture(); }, false);
function handleGesture() {
    if (Math.abs(touchendX - touchstartX) > 50) {
        if (touchendX < touchstartX && diaVisual < 5) verDia(diaVisual + 1);
        if (touchendX > touchstartX && diaVisual > 1) verDia(diaVisual - 1);
    }
}

// Inicio
if(localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
document.getElementById('user-name').innerText = localStorage.getItem('user_name') || "Brayan";
renderT(); renderS(); renderN(); actualizarApp();
setInterval(updateClock, 1000); updateClock();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').then(reg => console.log('✅ App lista')).catch(err => console.log('❌ Error'));
    });
}