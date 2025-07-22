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

// Configuração de localização (permanece igual)
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

// Mensagens em Português (permanece igual)
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
const CustomEvent = ({ event }) => {
    return (
        <div className="custom-event">
            <strong>{`OS #${event.resource.id}`}</strong>
            <span className="event-title">{event.resource.equipamentoNome || event.title}</span>
        </div>
    );
};

function CalendarioPage() {
    // ✅ TODA A LÓGICA FOI MOVIDA PARA DENTRO DA FUNÇÃO, COMO DEVE SER
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getOrdensServico({ page: 0, size: 500 });
            const ordens = response.data.content;
            
            const formattedEvents = ordens.map(os => {
                const eventDateStr = os.tipoManutencao === 'PREVENTIVA' && os.dataInicioPreventiva 
                    ? os.dataInicioPreventiva 
                    : os.dataSolicitacao;
                
                const eventDate = new Date(eventDateStr);
                eventDate.setMinutes(eventDate.getMinutes() + eventDate.getTimezoneOffset());

                return {
                    id: os.id,
                    title: `${os.equipamentoNome ? os.equipamentoNome + ' - ' : ''}${os.descricaoProblema}`,
                    start: eventDate,
                    end: eventDate,
                    allDay: true,
                    resource: os,
                };
            });
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
                backgroundColor = '#6c757d';
                break;
            case 'EM_EXECUCAO':
            case 'PAUSADA':
                backgroundColor = '#ffc107';
                break;
            default:
                if (os.tipoManutencao === 'PREVENTIVA') {
                    backgroundColor = '#28a745';
                } else if (os.tipoManutencao === 'CORRETIVA') {
                    backgroundColor = '#dc3545';
                }
        }
        
        const style = {
            backgroundColor: backgroundColor,
            borderRadius: '5px',
            opacity: 0.9,
            color: 'white',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'block'
        };
        return { style };
    };

    const dayPropGetter = useCallback(() => ({
        style: {
            overflow: 'hidden',
        }
    }), []);

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
                    components={{ event: CustomEvent }}
                    dayPropGetter={dayPropGetter}
                />
            </div>
        </div>
    );
}

export default CalendarioPage;