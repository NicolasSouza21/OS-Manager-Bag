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
import './CalendarioPage.css'; // Criaremos este CSS a seguir

// Configuração de localização para o calendário em Português-Brasil
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

// Mensagens do calendário em Português
const messages = {
    allDay: 'Dia todo',
    previous: '<',
    next: '>',
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

function CalendarioPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Função para buscar as OSs e formatá-las para o calendário
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getOrdensServico({ page: 0, size: 500 }); // Busca um grande número de OSs
            const ordens = response.data.content;
            
            const formattedEvents = ordens.map(os => {
                // Usa a data programada para preventivas e a de solicitação para corretivas
                const eventDateStr = os.tipoManutencao === 'PREVENTIVA' && os.dataInicioPreventiva 
                    ? os.dataInicioPreventiva 
                    : os.dataSolicitacao;
                
                const eventDate = new Date(eventDateStr);

                return {
                    id: os.id,
                    title: `OS #${os.id} - ${os.equipamentoNome || os.descricaoProblema}`,
                    start: eventDate,
                    end: eventDate, // Evento de dia único
                    allDay: true,
                    resource: os, // Guarda a OS completa para uso posterior
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

    // Navega para a página de detalhes ao clicar em um evento
    const handleSelectEvent = (event) => {
        navigate(`/os/${event.id}`);
    };
    
    // Customiza a aparência do evento no calendário
    const eventStyleGetter = (event) => {
        const os = event.resource;
        let backgroundColor = '#3174ad'; // Cor padrão

        if(os.status === 'CONCLUIDA' || os.status === 'CANCELADA') {
            backgroundColor = '#6c757d'; // Cinza para finalizadas/canceladas
        } else if (os.tipoManutencao === 'PREVENTIVA') {
            backgroundColor = '#28a745'; // Verde para preventivas
        } else if (os.tipoManutencao === 'CORRETIVA') {
            backgroundColor = '#dc3545'; // Vermelho para corretivas
        }
        
        const style = {
            backgroundColor: backgroundColor,
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        };
        return { style };
    };

    if (loading) {
        return <div className="loading-calendar">Carregando Calendário...</div>;
    }

    return (
        <div className="calendario-container">
            <h1 className="calendario-title">Calendário de Manutenção</h1>
            <div className="calendario-wrapper">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '85vh' }}
                    messages={messages}
                    culture='pt-BR'
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                />
            </div>
        </div>
    );
}

export default CalendarioPage;