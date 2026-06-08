import "./admin.css";
import { useState, useCallback } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('es');
const localizer = momentLocalizer(moment);

export default function Citas({ events: propsEvents, setEvents: propsSetEvents }) {
  const [showForm, setShowForm] = useState(false);
  const [internalEvents, setInternalEvents] = useState([
    {
      id: 1,
      title: 'Visita: Juan Pérez - Depto Centro',
      start: new Date(2024, 4, 10, 10, 0),
      end: new Date(2024, 4, 10, 11, 30),
      desc: 'Interesado en alquiler de 2 ambientes',
    }
  ]);
  const [newEvento, setNewEvento] = useState({
    title: '',
    date: '',
    time: '',
    desc: ''
  });

  const events = propsEvents ?? internalEvents;
  const setEventsFn = propsSetEvents ?? setInternalEvents;

  const handleSelectSlot = useCallback(({ start }) => {
    const dateStr = moment(start).format('YYYY-MM-DD');
    const timeStr = moment(start).format('HH:mm');
    setNewEvento({ ...newEvento, date: dateStr, time: timeStr });
    setShowForm(true);
  }, [newEvento]);

  const handleAddEvent = (e) => {
    e.preventDefault();
    const start = moment(`${newEvento.date} ${newEvento.time}`, 'YYYY-MM-DD HH:mm').toDate();
    const end = moment(start).add(1, 'hour').toDate(); // Por defecto 1 hora

    const nuevo = {
      id: events.length + 1,
      title: newEvento.title,
      start,
      end,
      desc: newEvento.desc
    };

    setEventsFn([...events, nuevo]);
    setShowForm(false);
    setNewEvento({ title: '', date: '', time: '', desc: '' });
  };

  const messages = {
    allDay: 'Todo el día',
    previous: 'Anterior',
    next: 'Siguiente',
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda',
    date: 'Fecha',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'No hay citas en este rango',
    showMore: total => `+ Ver más (${total})`
  };

  return (
    <div className="admin-section calendar-page">
      <div className="admin-actions-bar">
        <div>
          <h2>Agenda de Citas</h2>
          <p style={{color: '#6b7280', fontSize: '0.9rem'}}>Haz clic en cualquier horario para agendar.</p>
        </div>
        <button className="btn btn-success" onClick={() => setShowForm(true)}>
          + Nueva Cita
        </button>
      </div>

      <div className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={event => alert(`${event.title}\n\nNota: ${event.desc}`)}
          style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}
          messages={messages}
          culture='es'
          eventPropGetter={() => ({
            style: {
              backgroundColor: '#2563eb',
              borderRadius: '6px',
              border: 'none',
            }
          })}
        />
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}></div>
      )}

      {showForm && (
        <div className="modal-form">
          <h2>Agendar Cita</h2>
          <form onSubmit={handleAddEvent}>
            <input 
              type="text" 
              placeholder="Título de la cita (Ej: Visita Juan)" 
              required 
              value={newEvento.title}
              onChange={e => setNewEvento({...newEvento, title: e.target.value})}
            />
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <label style={{fontSize: '0.8rem', color: '#6b7280'}}>Fecha</label>
                <input 
                  type="date" 
                  required 
                  value={newEvento.date}
                  onChange={e => setNewEvento({...newEvento, date: e.target.value})}
                />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                <label style={{fontSize: '0.8rem', color: '#6b7280'}}>Hora</label>
                <input 
                  type="time" 
                  required 
                  value={newEvento.time}
                  onChange={e => setNewEvento({...newEvento, time: e.target.value})}
                />
              </div>
            </div>
            <textarea 
              placeholder="Notas adicionales..."
              value={newEvento.desc}
              onChange={e => setNewEvento({...newEvento, desc: e.target.value})}
            ></textarea>
            <div className="modal-form-actions">
              <button type="submit" className="btn btn-success">Guardar en Agenda</button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
