import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getOrdensServico } from '../services/apiService';
import './CalendarioPage.css';

// Configuração de localização
const locales = {
    'pt-BR': ptBR,
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

// Mensagens em Português
const messages = {
    allDay: 'Dia todo',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há eventos neste período.',
    showMore: total => `+ ver mais (${total})`
};

// Objeto de formatação para customizar os textos de data
const formats = {
    dayHeaderFormat: (date, culture, localizer) =>
        localizer.format(date, "EEEE, dd 'de' MMMM", culture),
    
    dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
        `${localizer.format(start, 'dd', culture)} - ${localizer.format(end, "dd 'de' MMMM", culture)}`,
    
    agendaHeaderFormat: ({ start, end }, culture, localizer) =>
        `${localizer.format(start, 'dd/MM/yyyy', culture)} - ${localizer.format(end, 'dd/MM/yyyy', culture)}`,
};

// Componente Legenda
const Legenda = () => (
    <div className="legenda-container">
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#dc3545' }}></span>Corretiva Aberta</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#28a745' }}></span>Preventiva Aberta</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#ffc107' }}></span>Em Andamento</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#6c757d' }}></span>Concluída / Cancelada</div>
    </div>
);

// Componente CustomEvent
const CustomEvent = ({ event }) => (
    <div className="custom-event">
        <strong>{`OS #${event.resource.id}`}</strong>
        <span className="event-title">{event.resource.equipamentoNome || event.title}</span>
    </div>
);

// Componente da Barra de Ferramentas Personalizada
const CustomToolbar = ({ label, onNavigate, onView, views, view }) => {
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    const viewNames = { month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda' };

    return (
        <div className="rbc-toolbar">
            <div className="rbc-btn-group">
                <button type="button" onClick={() => onNavigate('TODAY')}>Hoje</button>
                <button type="button" onClick={() => onNavigate('PREV')}>Anterior</button>
                <button type="button" onClick={() => onNavigate('NEXT')}>Próximo</button>
            </div>
            <span className="rbc-toolbar-label">{label}</span>
            <div className="rbc-btn-group">
                {views.map(viewName => (
                    <button
                        key={viewName}
                        type="button"
                        className={view === viewName ? 'rbc-active' : ''}
                        onClick={() => onView(viewName)}
                    >
                        {viewNames[viewName] || capitalize(viewName)}
                    </button>
                ))}
            </div>
        </div>
    );
};


function CalendarioPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getOrdensServico({ page: 0, size: 500 });
            const ordens = response.data.content;
            
            // ✅ --- LÓGICA DE MAPEAMENTO DE EVENTOS CORRIGIDA --- ✅
            const formattedEvents = ordens.map(os => {
                const isPreventiva = os.tipoManutencao === 'PREVENTIVA';
                
                const eventDateStr = isPreventiva && os.dataInicioPreventiva 
                    ? os.dataInicioPreventiva 
                    : os.dataSolicitacao;

                if (!eventDateStr) return null;

                const startDate = new Date(eventDateStr);

                // Define uma duração de 1 hora para corretivas, para que ocupem espaço no grid
                const endDate = isPreventiva 
                    ? startDate 
                    : new Date(startDate.getTime() + 60 * 60 * 1000); 

                return {
                    id: os.id,
                    title: `${os.equipamentoNome ? os.equipamentoNome + ' - ' : ''}${os.descricaoProblema}`,
                    start: startDate,
                    end: endDate,
                    allDay: isPreventiva, // Preventivas são "allDay: true", Corretivas são "allDay: false"
                    resource: os,
                };
            }).filter(Boolean); // Remove qualquer evento que possa ter retornado nulo
            
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Erro ao carregar eventos para o calendário:", error);
            alert("Não foi possível carregar os dados do calendário.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSelectEvent = (event) => {
        navigate(`/os/${event.id}`);
    };
    
    const eventStyleGetter = (event) => {
        const os = event.resource;
        let backgroundColor = '#3174ad';

        switch(os.status) {
            case 'CONCLUIDA':
            case 'CANCELADA':
                backgroundColor = '#6c757d'; break;
            case 'EM_EXECUCAO':
            case 'PAUSADA':
                backgroundColor = '#ffc107'; break;
            default:
                if (os.tipoManutencao === 'PREVENTIVA') backgroundColor = '#28a745';
                else if (os.tipoManutencao === 'CORRETIVA') backgroundColor = '#dc3545';
        }
        
        return { style: { backgroundColor, borderRadius: '5px', opacity: 0.9, color: 'white', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'block' } };
    };

    const dayPropGetter = useCallback(() => ({ style: { overflow: 'hidden' } }), []);

    const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
    const onView = useCallback((newView) => setView(newView), [setView]);

    if (loading) {
        return <div className="loading-calendar">Carregando Calendário...</div>;
    }

    return (
        <div className="calendario-container">
            <h1 className="calendario-title">Calendário de Manutenção</h1>
            <Legenda />
            <div className="calendario-wrapper">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ minHeight: '90vh' }}
                    messages={messages}
                    culture='pt-BR'
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    popup
                    dayPropGetter={dayPropGetter}
                    date={date}
                    view={view}
                    onNavigate={onNavigate}
                    onView={onView}
                    components={{
                        event: CustomEvent,
                        toolbar: CustomToolbar
                    }}
                    formats={formats}
                />
            </div>
        </div>
    );
}

export default CalendarioPage;