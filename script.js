const horarioData = {
    1: [ { id: "L1", nombre: "Admón. de Recursos", inicio: "05:50 PM", fin: "07:30 PM", profe: "Edna Marcela" }, { id: "L2", nombre: "Matemáticas Discretas", inicio: "07:40 PM", fin: "09:20 PM", profe: "Héctor Hernández" }, { id: "L3", nombre: "Física para Informática", inicio: "09:20 PM", fin: "10:10 PM", profe: "César Alberto" } ],
    2: [ { id: "M1", nombre: "Telecomunicaciones", inicio: "10:40 AM", fin: "12:30 PM", profe: "Javier Martinez" }, { id: "M2", nombre: "Cálculo Integral", inicio: "01:20 PM", fin: "02:00 PM", profe: "Adriana Hernandez" }, { id: "M3", nombre: "Admón. de Recursos", inicio: "05:50 PM", fin: "07:30 PM", profe: "Edna Marcela" }, { id: "M4", nombre: "Matemáticas Discretas", inicio: "07:40 PM", fin: "09:20 PM", profe: "Héctor Hernández" }, { id: "M5", nombre: "Tutoría", inicio: "09:20 PM", fin: "10:10 PM", profe: "Héctor Hernández" } ],
    3: [ { id: "W1", nombre: "Cálculo Integral", inicio: "07:00 AM", fin: "07:50 AM", profe: "Adriana Hernandez" }, { id: "W2", nombre: "P. Orientada a Objetos", inicio: "05:50 PM", fin: "07:30 PM", profe: "Victor Alfonso" }, { id: "W3", nombre: "Matemáticas Discretas", inicio: "07:40 PM", fin: "08:30 PM", profe: "Héctor Hernández" }, { id: "W4", nombre: "Física para Informática", inicio: "08:30 PM", fin: "10:10 PM", profe: "César Alberto" } ],
    4: [ { id: "J1", nombre: "Cálculo Integral", inicio: "10:40 AM", fin: "12:20 PM", profe: "Adriana Hernandez" }, { id: "J2", nombre: "P. Orientada a Objetos", inicio: "05:50 PM", fin: "07:30 PM", profe: "Victor Alfonso" }, { id: "J3", nombre: "Contabilidad Financiera", inicio: "07:40 PM", fin: "09:20 PM", profe: "Jairo Cristopher" } ],
    5: [ { id: "V1", nombre: "Cálculo Integral", inicio: "09:30 AM", fin: "10:20 AM", profe: "Adriana Hernandez" }, { id: "V2", nombre: "Telecomunicaciones", inicio: "12:20 PM", fin: "02:00 PM", profe: "Javier Martinez" }, { id: "V3", nombre: "Contabilidad Financiera", inicio: "05:00 PM", fin: "06:40 PM", profe: "Jairo Cristopher" }, { id: "V4", nombre: "P. Orientada a Objetos", inicio: "06:40 PM", fin: "07:30 PM", profe: "Victor Alfonso" }, { id: "V5", nombre: "Física para Informática", inicio: "07:30 PM", fin: "09:20 PM", profe: "César Alberto" } ]
};

let diaVisual = new Date().getDay();
if(diaVisual === 0 || diaVisual === 6) diaVisual = 1;

function getF(id) { return parseInt(localStorage.getItem('f_'+id) || '0'); }
function addF(id) { localStorage.setItem('f_'+id, getF(id) + 1); actualizarApp(true); }
function resF(id) { if(confirm("¿Resetear faltas?")) { localStorage.setItem('f_'+id, 0); actualizarApp(true); } }

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
        const faltas = getF(c.id);
        let color = 'var(--border)';
        if(faltas === 1) color = '#00b894'; 
        if(faltas === 2) color = '#f1c40f'; 
        if(faltas >= 3) color = '#e74c3c';  
        
        return `
        <div class="card" style="border-left: 7px solid ${color}">
            <small style="float:right; opacity:0.6">${c.profe}</small>
            <h3>${c.nombre}</h3>
            <div class="time-tag">${c.inicio} - ${c.fin}</div>
            <div class="attendance-row">
                <button class="asistencia-btn" onclick="addF('${c.id}')">Faltas: ${faltas}</button>
                <button class="reset-btn" onclick="resF('${c.id}')">REINICIAR</button>
            </div>
        </div>`;
    }).join('') || '<p style="text-align:center; padding:20px;">Sin clases este día.</p>';
    updateExam();
}

function updateClock() {
    const d = new Date();
    const diaSemana = d.getDay();
    document.getElementById('digital-clock').innerText = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
    const badge = document.getElementById('status-badge');
    if(diaSemana === 0 || diaSemana === 6) {
        badge.innerText = "Finde 😴";
    } else {
        const hM = d.getHours()*60 + d.getMinutes();
        const actual = (horarioData[diaSemana]||[]).find(c => hM >= tToM(c.inicio) && hM < tToM(c.fin));
        badge.innerText = actual ? `Faltan ${tToM(actual.fin)-hM}m` : "Libre 🙌";
    }
}

const v = (id) => { const el=document.getElementById(id); const val=el.value; el.value=''; return val; };
function save(k, obj) { let i=JSON.parse(localStorage.getItem(k)||'[]'); i.push(obj); localStorage.setItem(k, JSON.stringify(i)); }
function del(k, i, cb) { let items=JSON.parse(localStorage.getItem(k)); items.splice(i,1); localStorage.setItem(k, JSON.stringify(items)); cb(); }
function render(k, id, temp, filter=null) {
    let items = JSON.parse(localStorage.getItem(k)||'[]');
    if(filter) items = items.filter(filter);
    const el = document.getElementById(id);
    if(el) el.innerHTML = items.map(temp).join('');
}

function updateExam() {
    const items = JSON.parse(localStorage.getItem('s')||'[]');
    const hoy = new Date();
    const prox = items.filter(i => new Date(i.f) >= hoy).sort((a,b)=>new Date(a.f)-new Date(b.f))[0];
    const w = document.getElementById('exam-alert-widget');
    if(w) w.innerHTML = prox ? `<div class="exam-alert">⚠️ <b>Examen:</b> ${prox.m} (U${prox.u}) el ${prox.f}</div>` : '';
}

function tToM(t) { let [tm, m] = t.split(' '); let [h, min] = tm.split(':').map(Number); if(m==='PM'&&h<12) h+=12; if(m==='AM'&&h===12) h=0; return h*60+min; }
function cambiarSeccion(id, el) { 
    document.querySelectorAll('.app-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('section-'+id).classList.add('active'); el.classList.add('active');
    document.getElementById('app-title').innerText = id.charAt(0).toUpperCase() + id.slice(1);
}
function verDia(d) { diaVisual = d; actualizarApp(true); }
function cambiarNombre() { const n=prompt("¿Nombre?"); if(n) { localStorage.setItem('user_name',n); location.reload(); } }

function agregarTarea() { const t=v('input-tarea'), f=v('fecha-tarea'); if(t&&f) save('t', {t,f}); renderT(); }
function renderT() { const h=new Date().toISOString().split('T')[0]; render('t', 'lista-tareas', (x,i)=>`<div class="saved-item"><div><b>${x.t}</b><br><small>${x.f}</small></div><button class="reset-btn" onclick="del('t',${i},renderT)">✕</button></div>`, x=>x.f>=h); }
function agregarSumativa() { const m=v('select-materia-sumativa'), u=v('input-unidad-sumativa'), n=v('input-nota-sumativa'), f=v('fecha-sumativa'); if(u&&n&&f) save('s', {m,u,n,f}); renderS(); }
function renderS() { render('s', 'lista-sumativas', (x,i)=>`<div class="saved-item"><div><b>${x.m}</b> (U${x.u})<br><small>Nota: ${x.n} | ${x.f}</small></div><button class="reset-btn" onclick="del('s',${i},renderS)">✕</button></div>`); updateExam(); }
function agregarNota() { const t=v('input-nota'); if(t) save('n', {t, d:new Date().toLocaleDateString()}); renderN(); }
function renderN() { render('n', 'lista-notas', (x,i)=>`<div class="saved-item" style="flex-direction:column;align-items:flex-start"><small>${x.d}</small><p>${x.t}</p><button class="reset-btn" onclick="del('n',${i},renderN)">BORRAR</button></div>`); }

if(localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark');
document.getElementById('user-name').innerText = localStorage.getItem('user_name') || "Brayan";
renderT(); renderS(); renderN(); actualizarApp();
setInterval(updateClock, 1000);
updateClock();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('✅ App lista para instalar: ', reg.scope))
            .catch(err => console.log('❌ Error al registrar el motor: ', err));
    });
}