/* script.js
  Funcionalidades:
  - cadastro/login (guardian, driver, admin-demo)
  - driver inicia/encerra viagem -> atualiza posição via localStorage & BroadcastChannel
  - guardian acompanha trajetos (lê posição e anima marcador no SVG)
  - suporte salva mensagens
*/

// ---------- Util (storage) ----------
const DB_KEYS = { USERS: 'escolar_users_v1', SUPPORT: 'escolar_support_v1', TRIPS: 'escolar_trips_v1' };
const bc = ('BroadcastChannel' in window) ? new BroadcastChannel('escolar_channel') : null;

function readUsers(){ return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]') }
function writeUsers(u){ localStorage.setItem(DB_KEYS.USERS, JSON.stringify(u)) }
function readSupport(){ return JSON.parse(localStorage.getItem(DB_KEYS.SUPPORT) || '[]') }
function writeSupport(s){ localStorage.setItem(DB_KEYS.SUPPORT, JSON.stringify(s)) }
function readTrips(){ return JSON.parse(localStorage.getItem(DB_KEYS.TRIPS) || '{}') }
function writeTrips(t){ localStorage.setItem(DB_KEYS.TRIPS, JSON.stringify(t)); if(bc) bc.postMessage({type:'trips:update', payload:t}); }

// For demo create admin if not exists
(function ensureAdmin(){
  const u = readUsers();
  if(!u.find(x=>x.role==='admin')) {
    u.push({id:Date.now(),name:'Admin Demo',email:'admin@demo',password:'admin123',role:'admin'});
    writeUsers(u);
  }
})();

// ---------- Navegação simples ----------
const pages = { home:elem('home'), register:elem('register'), login:elem('login'), dashboard:elem('dashboard'), support:elem('support') };
document.getElementById('nav-home').onclick = () => show('home');
document.getElementById('nav-register').onclick = () => show('register');
document.getElementById('nav-login').onclick = () => show('login');
document.getElementById('nav-support').onclick = () => show('support');
document.getElementById('cta-register').onclick = () => show('register');
document.getElementById('cta-login').onclick = () => show('login');

function show(id){
  Object.values(pages).forEach(p => p.classList.remove('active'));
  pages[id].classList.add('active');
  if(id==='dashboard') renderDashboard();
}
function elem(id){ return document.getElementById(id) }

// start on home
show('home');

// ---------- Cadastro ----------
document.getElementById('form-register-guardian').addEventListener('submit', e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const user = { id: Date.now(), name: f.get('name'), email: f.get('email'), password: f.get('password'), role:'guardian', childName: f.get('childName') };
  registerUser(user);
  e.target.reset();
  alert('Responsável cadastrado!');
});
document.getElementById('form-register-driver').addEventListener('submit', e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const user = { id: Date.now(), name: f.get('name'), email: f.get('email'), password: f.get('password'), role:'driver', vehicle: f.get('vehicle') };
  registerUser(user);
  e.target.reset();
  alert('Motorista cadastrado!');
});
function registerUser(user){
  const users = readUsers();
  if(users.find(u=>u.email === user.email)) { alert('Email já cadastrado'); return; }
  users.push(user);
  writeUsers(users);
}

// ---------- Login ----------
let currentUser = null;
document.getElementById('form-login').addEventListener('submit', e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const email = f.get('email'), pass = f.get('password'), role = document.getElementById('login-role').value;
  const users = readUsers();
  const found = users.find(u => u.email === email && u.password === pass && (role==='admin' ? u.role==='admin' : u.role===role));
  if(!found){ alert('Credenciais inválidas ou role incorreto.'); return; }
  currentUser = found;
  localStorage.setItem('escolar_current_user', JSON.stringify(currentUser));
  alert('Login realizado!');
  show('dashboard');
});

// restore login if present
(function tryRestore(){
  const s = localStorage.getItem('escolar_current_user');
  if(s){ currentUser = JSON.parse(s); }
})();

document.getElementById('btn-logout').addEventListener('click', ()=>{
  currentUser = null;
  localStorage.removeItem('escolar_current_user');
  show('home');
});

// ---------- Dashboard rendering ----------
function renderDashboard(){
  // hide everything
  const panels = ['panel-guardian','panel-driver','panel-admin','dashboard-guest'];
  panels.forEach(id=>elem(id).style.display='none');

  if(!currentUser){ elem('dashboard-guest').style.display='block'; return; }

  if(currentUser.role==='guardian'){
    elem('panel-guardian').style.display='block';
    elem('g-name').textContent = currentUser.name;
    elem('g-child').textContent = currentUser.childName || '—';
    populateDriversSelect();
    stopGuardianTrackingUI();
  } else if(currentUser.role==='driver'){
    elem('panel-driver').style.display='block';
    elem('d-name').textContent = currentUser.name;
    elem('d-vehicle').textContent = currentUser.vehicle || '—';
    updateDriverStatusUI();
  } else if(currentUser.role==='admin'){
    elem('panel-admin').style.display='block';
    renderAdminUsers();
    renderAdminSupport();
  }
}

// ---------- Support ----------
document.getElementById('form-support').addEventListener('submit', e=>{
  e.preventDefault();
  const f = new FormData(e.target);
  const msg = { id:Date.now(), name: f.get('name'), email: f.get('email'), message: f.get('message'), created: new Date().toISOString() };
  const s = readSupport(); s.unshift(msg); writeSupport(s);
  e.target.reset();
  renderSupportList();
  alert('Solicitação enviada ao suporte!');
});
function renderSupportList(){
  const list = readSupport();
  const el = elem('support-list');
  el.innerHTML = list.length ? list.map(m=>`<div class="card" style="margin-bottom:8px"><strong>${m.name}</strong> <span class="muted">(${m.email})</span><p>${m.message}</p><small class="muted">${new Date(m.created).toLocaleString()}</small></div>`).join('') : '<p class="muted">Sem mensagens.</p>';
}
function renderAdminSupport(){
  const list = readSupport();
  elem('admin-support').innerHTML = list.length ? list.map(m=>`<div style="padding:8px;border-bottom:1px solid #f1f5f9"><strong>${m.name}</strong><div class="muted">${m.email}</div><div style="margin-top:6px">${m.message}</div></div>`).join('') : '<p class="muted">Sem mensagens</p>';
}
renderSupportList();

// ---------- Admin users list ----------
function renderAdminUsers(){
  const users = readUsers();
  elem('admin-users').innerHTML = users.map(u=>`<div style="padding:8px;border-bottom:1px solid #f1f5f9"><strong>${u.name}</strong> <div class="muted">${u.email} — ${u.role}${u.vehicle ? ' — '+u.vehicle : ''}${u.childName ? ' — filho: '+u.childName : ''}</div></div>`).join('');
}

// ---------- Drivers select for guardian ----------
function populateDriversSelect(){
  const sel = elem('select-driver-to-track');
  const drivers = readUsers().filter(u => u.role === 'driver');
  sel.innerHTML = drivers.length ? drivers.map(d=>`<option value="${d.id}">${d.name} — ${d.vehicle || ''}</option>`).join('') : '<option disabled>Sem motoristas cadastrados</option>';
}

// ---------- Simulação de rota & tracking ----------
/*
  - Trips state structure (stored in localStorage):
    { [driverId]: { running: bool, progress: 0..1, lastUpdated: ISOString } }
  - Driver starts trip: set running=true, progress=0, then JS simula avanço por intervalo
  - Guardian polls trips via BroadcastChannel or interval to update marker
*/

// simple path points sampling along the SVG path
const svg = elem('svg-map');
const routePath = elem('route-path');
const busMarker = elem('bus-marker');

function getPointAt(t){
  // t in [0,1] -> use SVG getPointAtLength
  const path = routePath;
  const total = path.getTotalLength();
  const pt = path.getPointAtLength(t * total);
  return pt;
}

// Render marker position based on trip state
function renderMarkerFromState(state){
  // state: object for driver id
  if(!state) { // hide?
    busMarker.style.display = 'none';
    return;
  }
  busMarker.style.display = 'block';
  const p = getPointAt(state.progress || 0);
  busMarker.setAttribute('cx', p.x);
  busMarker.setAttribute('cy', p.y);
}

// Driver trip control (simulate motion)
let driverInterval = null;
elem('btn-start-trip').addEventListener('click', ()=>{
  if(!currentUser || currentUser.role!=='driver'){ alert('Faça login como motorista.'); return; }
  startDriverTrip(currentUser.id);
});
elem('btn-end-trip').addEventListener('click', ()=>{
  if(!currentUser || currentUser.role!=='driver'){ alert('Faça login como motorista.'); return; }
  endDriverTrip(currentUser.id);
});

function startDriverTrip(driverId){
  const trips = readTrips();
  trips[driverId] = { running: true, progress: 0, lastUpdated: new Date().toISOString() };
  writeTrips(trips);
  updateDriverStatusUI();
  // simulate driver moving (only in this tab)
  if(driverInterval) clearInterval(driverInterval);
  driverInterval = setInterval(()=>{
    const t = readTrips();
    if(!t[driverId] || !t[driverId].running){ clearInterval(driverInterval); driverInterval = null; return; }
    t[driverId].progress = Math.min(1, (t[driverId].progress || 0) + 0.01); // advance
    t[driverId].lastUpdated = new Date().toISOString();
    writeTrips(t);
    if(t[driverId].progress >= 1){ // auto finish
      t[driverId].running = false;
      writeTrips(t);
      clearInterval(driverInterval); driverInterval = null;
      alert('Viagem finalizada (simulação).');
      updateDriverStatusUI();
    }
  }, 1000); // every segundo
}

function endDriverTrip(driverId){
  const t = readTrips();
  if(t[driverId]){ t[driverId].running = false; t[driverId].lastUpdated = new Date().toISOString(); writeTrips(t); }
  if(driverInterval){ clearInterval(driverInterval); driverInterval = null; }
  updateDriverStatusUI();
}

function updateDriverStatusUI(){
  const s = elem('driver-status');
  const trips = readTrips();
  const state = trips[currentUser.id];
  if(state && state.running){
    s.textContent = `Status: em viagem — progresso ${(Math.round((state.progress||0)*100))}%`;
    elem('btn-start-trip').style.display = 'none';
    elem('btn-end-trip').style.display = 'inline-block';
  } else {
    s.textContent = 'Status: ocioso';
    elem('btn-start-trip').style.display = 'inline-block';
    elem('btn-end-trip').style.display = 'none';
  }
}

// Guardian tracking UI
let guardianTrackingDriverId = null;
let guardianInterval = null;
elem('btn-start-tracking').addEventListener('click', ()=>{
  const sel = elem('select-driver-to-track');
  if(!sel || !sel.value) return alert('Escolha um motorista');
  startGuardianTracking(sel.value);
});
elem('btn-stop-tracking').addEventListener('click', stopGuardianTrackingUI);

function startGuardianTracking(driverId){
  guardianTrackingDriverId = driverId;
  elem('btn-start-tracking').style.display = 'none';
  elem('btn-stop-tracking').style.display = 'inline-block';
  // immediate render
  renderMarkerFromTrip(driverId);
  // subscribe via BroadcastChannel if available
  if(bc){
    // also render on incoming messages
    bc.onmessage = (ev) => {
      if(ev.data && ev.data.type === 'trips:update'){
        renderMarkerFromTrip(driverId);
      }
    }
  }
  // fallback polling
  guardianInterval = setInterval(()=> renderMarkerFromTrip(driverId), 1500);
}

function stopGuardianTrackingUI(){
  guardianTrackingDriverId = null;
  elem('btn-start-tracking').style.display = 'inline-block';
  elem('btn-stop-tracking').style.display = 'none';
  if(guardianInterval){ clearInterval(guardianInterval); guardianInterval = null; }
  // hide marker or reset to start
  const trips = readTrips();
  renderMarkerFromState(null);
}

function renderMarkerFromTrip(driverId){
  const trips = readTrips();
  const state = trips[driverId];
  if(!state){ renderMarkerFromState(null); return; }
  renderMarkerFromState(state);
  // update text status area (optional)
  const pct = Math.round((state.progress||0)*100);
  // show small overlay
  // (we could add a small text, omitted for brevity)
}

// initial marker at start
renderMarkerFromState({progress:0});

// BroadcastChannel handler to update dashboards across tabs
if(bc){
  bc.onmessage = (ev) => {
    if(ev.data && ev.data.type === 'trips:update'){
      // if guardian is tracking, re-render
      if(guardianTrackingDriverId) renderMarkerFromTrip(guardianTrackingDriverId);
      // if driver page belongs to driver, update status
      if(currentUser && currentUser.role==='driver' && readTrips()[currentUser.id]) updateDriverStatusUI();
      // admin lists
      if(currentUser && currentUser.role==='admin') { renderAdminUsers(); renderAdminSupport(); }
    }
  }
}

// ensure dashboard updates when user logs in/out
window.addEventListener('storage', (e)=>{
  if(e.key === 'escolar_current_user'){ tryRestore(); renderDashboard(); }
});

// ensure page renders dashboard if user already logged in
if(currentUser) renderDashboard();