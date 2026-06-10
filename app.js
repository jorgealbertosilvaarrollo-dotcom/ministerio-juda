let datos = null;
const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

async function cargarDatos() {
  try {
    const res = await fetch('./datos.json?_=' + Date.now());
    datos = await res.json();
    renderAll();
  } catch (e) {
    document.getElementById('app').innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>Error cargando datos. Verifica que datos.json existe.</p></div>`;
  }
}

function renderAll() {
  renderVersiculo();
  renderReuniones();
  renderUjieres();
  renderAnuncios();
  renderEquipo();
  setupNav();
}

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatFecha(fechaStr) {
  const d = new Date(fechaStr + 'T12:00:00');
  return `${DIAS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
}

function formatFechaLegible(fechaStr) {
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const d = new Date(fechaStr + 'T12:00:00');
  return `${d.getDate()} de ${meses[d.getMonth()]}`;
}

function renderVersiculo() {
  const container = document.getElementById('versiculo-container');
  if (!datos.versiculos || datos.versiculos.length === 0) {
    container.innerHTML = '<p class="text-center text-secondary">No hay versículos configurados</p>';
    return;
  }
  const hoy = getTodayStr();
  let versiculo = datos.versiculos.find(v => v.fecha === hoy);
  if (!versiculo) {
    const idx = new Date().getDay() % datos.versiculos.length;
    versiculo = datos.versiculos[idx];
  }
  document.getElementById('versiculo-texto').textContent = versiculo.texto;
  document.getElementById('versiculo-ref').textContent = versiculo.referencia;
}

function renderReuniones() {
  const container = document.getElementById('reuniones-container');
  const r = datos.reuniones.proxima;
  if (!r || !r.fecha) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><p>No hay reuniones programadas</p></div>';
    return;
  }

  const hoy = new Date();
  const fechaReu = new Date(r.fecha + 'T12:00:00');
  const diff = Math.ceil((fechaReu - hoy) / (1000 * 60 * 60 * 24));
  const esHoy = diff === 0;
  const esManana = diff === 1;

  let countdownHtml = '';
  if (diff > 0) {
    countdownHtml = `
      <div class="countdown">
        <span class="days">${diff}</span>
        <span class="label">días para el sábado</span>
      </div>`;
  } else if (esHoy) {
    countdownHtml = `<div class="countdown"><span class="days" style="font-size:1.2em">¡HOY!</span></div>`;
  }

  container.innerHTML = `
    <div class="card card-highlight">
      <div class="section-title"><span class="icon">📅</span> Próxima Reunión</div>
      <div class="meeting-info">
        <div class="meeting-row">
          <span class="label">Fecha</span>
          <span class="value">${formatFechaLegible(r.fecha)}${esHoy ? ' (Hoy)' : esManana ? ' (Mañana)' : ''}</span>
        </div>
        <div class="meeting-row">
          <span class="label">Hora</span>
          <span class="value">${r.hora}</span>
        </div>
        <div class="meeting-row">
          <span class="label">Lugar</span>
          <span class="value">${r.lugar}</span>
        </div>
        <div class="meeting-row">
          <span class="label">Tema</span>
          <span class="value"><strong>${r.tema}</strong></span>
        </div>
        <div class="meeting-row">
          <span class="label">Actividad</span>
          <span class="value">${r.actividad}</span>
        </div>
        <div class="meeting-row">
          <span class="label">Líder</span>
          <span class="value">${r.lider}</span>
        </div>
        ${countdownHtml}
      </div>
    </div>`;
}

function renderUjieres() {
  const container = document.getElementById('ujieres-container');
  if (!datos.ujieres || datos.ujieres.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">🙏</div><p>No hay programación de ujieres</p></div>';
    return;
  }

  const hoy = getTodayStr();
  const hoyDate = new Date();
  const diaSemana = hoyDate.getDay(); // 0=Dom, 5=Vie, 6=Sab

  const ujierHoy = datos.ujieres.find(u => u.fecha === hoy);
  let reminderHtml = '';

  if (diaSemana === 5) {
    const ujierManana = datos.ujieres.find(u => u.fecha === getProximoSabado());
    if (ujierManana) {
      reminderHtml = `
        <div class="usher-reminder">
          <span class="big">🔔 ¡Recordatorio!</span>
          <span>Mañana sirven como ujieres: <strong>${ujierManana.nombres.join(' y ')}</strong></span>
        </div>`;
    }
  }

  if (ujierHoy) {
    reminderHtml = `
      <div class="usher-reminder">
        <span class="big">🙏 Ujieres de Hoy</span>
        <span>Sirven: <strong>${ujierHoy.nombres.join(' y ')}</strong></span>
      </div>`;
  }

  const hoyDia = hoyDate.getDate();
  const hoyMes = hoyDate.getMonth();

  let scheduleHtml = '';
  for (const u of datos.ujieres) {
    const fechaU = new Date(u.fecha + 'T12:00:00');
    const diffU = Math.ceil((fechaU - hoyDate) / (1000 * 60 * 60 * 24));
    let isToday = u.fecha === hoy;
    scheduleHtml += `
      <div class="usher-item ${isToday ? 'today' : ''}">
        <span class="date">${formatFecha(u.fecha)}${diffU === 0 ? ' (Hoy)' : diffU === 1 ? ' (Mañana)' : ''}</span>
        <span class="names">${u.nombres.join(' y ')}</span>
      </div>`;
  }

  container.innerHTML = `
    ${reminderHtml}
    <div class="card">
      <div class="section-title"><span class="icon">🙏</span> Programación de Ujieres</div>
      <div class="usher-schedule">${scheduleHtml}</div>
    </div>`;
}

function getProximoSabado() {
  const d = new Date();
  const dia = d.getDay();
  const diff = dia === 6 ? 7 : (6 - dia);
  d.setDate(d.getDate() + diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function renderAnuncios() {
  const container = document.getElementById('anuncios-container');
  if (!datos.anuncios || datos.anuncios.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">📢</div><p>No hay anuncios nuevos</p></div>';
    return;
  }

  let html = '';
  for (const a of datos.anuncios) {
    const impTag = a.importante ? '<span class="tag-important">IMPORTANTE</span>' : '';
    html += `
      <div class="announcement ${a.importante ? 'important' : ''}">
        <div class="title">${a.titulo}${impTag}</div>
        <div class="date">${a.fecha}</div>
        <div class="msg">${a.mensaje}</div>
      </div>`;
  }
  container.innerHTML = `<div class="card"><div class="section-title"><span class="icon">📢</span> Anuncios</div>${html}</div>`;
}

function renderEquipo() {
  const container = document.getElementById('equipo-container');
  if (!datos.equipo || datos.equipo.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>No hay equipo registrado</p></div>';
    return;
  }

  let html = '<div class="card"><div class="section-title"><span class="icon">👥</span> Equipo de Líderes</div><div class="team-grid">';
  for (const m of datos.equipo) {
    const iniciales = m.nombre.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase();
    const telLink = m.telefono ? `<a href="tel:${m.telefono}" class="phone">📞 ${m.telefono}</a>` : '';
    html += `
      <div class="team-member">
        <div class="team-avatar">${iniciales}</div>
        <div class="team-info">
          <div class="name">${m.nombre}</div>
          <div class="role">${m.rol}</div>
          ${telLink}
        </div>
      </div>`;
  }
  html += '</div></div>';
  container.innerHTML = html;
}

function setupNav() {
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.dataset.page;
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      pages.forEach(p => p.classList.remove('active'));
      document.getElementById(target).classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

cargarDatos();
