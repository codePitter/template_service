// === CONFIGURACIÓN ===
const GOOGLE_APPS_SCRIPT_URL = ""; // Pegar URL de Web App de Apps Script para crear eventos
const WHATSAPP_TEL = '5493410000000'; // Con país, sin +

// Utilidades
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// Año dinámico
const yNode = document.getElementById('y'); if (yNode) yNode.textContent = new Date().getFullYear();

// Reveal on scroll
const onScroll = () => { $$('.reveal').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < innerHeight - 100) el.classList.add('show'); }); };
document.addEventListener('scroll', onScroll); onScroll();

// Prefill servicio
window.prefill = (name) => { const s = $('#servicio'); if (s) { s.value = name; location.hash = '#turnos'; } };

// Alertas inline
function showAlert(type, msg) { const el = $('#alert'); if (!el) return; el.className = `alert alert-${type}`; el.textContent = msg; el.style.display = 'block'; }

// Link Google Calendar (cliente)
function buildGoogleCalTemplate({ title, start, end, details, location }) {
    const toUTC = (d) => { const z = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)); return new Date(z); };
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const s = fmt(toUTC(start)); const e = fmt(toUTC(end));
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.set('action', 'TEMPLATE'); url.searchParams.set('text', title); url.searchParams.set('dates', `${s}/${e}`);
    if (details) url.searchParams.set('details', details); if (location) url.searchParams.set('location', location);
    return url.toString();
}

// Submit del formulario
const form = document.getElementById('formTurno');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nombre = $('#nombre').value.trim();
        const telefono = $('#telefono').value.trim();
        const servicio = $('#servicio').value;
        const fecha = $('#fecha').value;
        const hora = $('#hora').value;
        const dur = parseInt($('#duracion').value || '60', 10);
        const coment = $('#coment').value.trim();
        const agendar = $('#agendar').checked;

        if (!fecha || !hora) { showAlert('warning', 'Elegí fecha y hora del turno.'); return; }
        const start = new Date(`${fecha}T${hora}:00`);
        if (isNaN(start.getTime())) { showAlert('danger', 'Fecha u hora no válidas.'); return; }
        const end = new Date(start.getTime() + dur * 60000);

        // 1) WhatsApp
        const msg = encodeURIComponent(`Hola! Soy ${nombre}. Quiero reservar: ${servicio}. Fecha: ${fecha} a las ${hora}. ${coment ? 'Comentarios: ' + coment : ''}`);
        window.open(`https://wa.me/${WHATSAPP_TEL}?text=${msg}`, '_blank');

        // 2) Agendar en Calendar (Apps Script)
        if (agendar) {
            if (!GOOGLE_APPS_SCRIPT_URL) { showAlert('warning', 'Agenda automática deshabilitada: falta configurar la URL del Google Apps Script.'); return; }
            try {
                const payload = { name: nombre, phone: telefono, service: servicio, date: fecha, time: hora, durationMinutes: dur, comments: coment, timezone: 'America/Argentina/Cordoba', location: 'Dirección de tu local' };
                const res = await fetch(GOOGLE_APPS_SCRIPT_URL, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                const data = await res.json().catch(() => ({ ok: false }));
                if (res.ok && data.ok) { showAlert('success', 'Turno enviado y agendado en el Calendar.'); }
                else { showAlert('warning', 'Turno enviado. No se pudo agendar en Calendar (revisá la configuración).'); }
            } catch (err) { console.error(err); showAlert('danger', 'Error al conectar con el servicio de agenda.'); }
        } else { showAlert('info', 'Turno enviado. No se agendó automáticamente.'); }
    });
}

// Botón: generar link de Google Calendar (cliente)
const btn = document.getElementById('btnGoogleLink');
if (btn) {
    btn.addEventListener('click', () => {
        const nombre = ($('#nombre')?.value.trim()) || 'Cliente';
        const servicio = $('#servicio')?.value || 'Turno';
        const fecha = $('#fecha')?.value; const hora = $('#hora')?.value; const dur = parseInt($('#duracion')?.value || '60', 10);
        if (!fecha || !hora) { showAlert('warning', 'Completá fecha y hora para generar el link.'); return; }
        const start = new Date(`${fecha}T${hora}:00`);
        const end = new Date(start.getTime() + dur * 60000);
        const url = buildGoogleCalTemplate({ title: `${servicio} – ${nombre}`, start, end, details: 'Reserva desde la web. Presentarse 5 min antes.', location: 'Dirección de tu local' });
        window.open(url, '_blank');
    });
}
// Galería: abrir modal con imagen
const galBtns = document.querySelectorAll('[data-gallery]');
if (galBtns.length) {
    const modalEl = document.getElementById('galleryModal');
    const modal = modalEl ? new bootstrap.Modal(modalEl) : null;
    const img = document.getElementById('gm-img');
    const cap = document.getElementById('gm-cap');
    galBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!modal) return;
            const src = btn.getAttribute('data-src');
            const text = btn.getAttribute('data-caption') || '';
            if (img) { img.src = src; img.alt = text; }
            if (cap) { cap.textContent = text; }
            modal.show();
        });
    });
}
function matchHeight() {
    const prevDiv = document.querySelector('.prev-div');
    const targetImg = document.querySelector('.target-img');
    if (prevDiv && targetImg) {
        targetImg.style.height = prevDiv.offsetHeight + 'px';
    }
}
window.addEventListener('load', matchHeight);
window.addEventListener('resize', matchHeight);