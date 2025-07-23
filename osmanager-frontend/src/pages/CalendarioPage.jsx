import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// ✅ Importa a função para buscar equipamentos
import { getOrdensServico, getEquipamentos } from '../services/apiService';
import './CalendarioPage.css';

// Configurações de localização, mensagens e formatos (sem alterações)
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const messages = { allDay: 'Dia todo', previous: 'Anterior', next: 'Próximo', today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda', date: 'Data', time: 'Hora', event: 'Evento', noEventsInRange: 'Não há eventos neste período.', showMore: total => `+ ver mais (${total})`};
const formats = { dayHeaderFormat: (date, culture, localizer) => localizer.format(date, "EEEE, dd 'de' MMMM", culture), dayRangeHeaderFormat: ({ start, end }, culture, localizer) => `${localizer.format(start, 'dd', culture)} - ${localizer.format(end, "dd 'de' MMMM", culture)}`, agendaHeaderFormat: ({ start, end }, culture, localizer) => `${localizer.format(start, 'dd/MM/yyyy', culture)} - ${localizer.format(end, 'dd/MM/yyyy', culture)}`};

// Componente Legenda (sem alterações)
const Legenda = () => (
    <div className="legenda-container">
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#28a745' }}></span>Preventiva Aberta</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#ffc107' }}></span>Em Andamento</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#6c757d' }}></span>Concluída / Cancelada</div>
    </div>
);

// ✅ CUSTOM EVENT CORRIGIDO PARA RECEBER O NOME DO EQUIPAMENTO
const CustomEvent = ({ event }) => {
    const frequencia = event.resource.frequencia;

    return (
        <div className="custom-event">
            <strong>{`OS #${event.resource.id} - ${event.equipamentoNome}`}</strong>
            {frequencia && <span className="event-frequencia">{frequencia}</span>}
        </div>
    );
};


// Componente da Barra de Ferramentas Personalizada (sem alterações)
const CustomToolbar = ({ label, onNavigate, onView, views, view }) => { const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1); const viewNames = { month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda' }; return ( <div className="rbc-toolbar"> <div className="rbc-btn-group"> <button type="button" onClick={() => onNavigate('TODAY')}>Hoje</button> <button type="button" onClick={() => onNavigate('PREV')}>Anterior</button> <button type="button" onClick={() => onNavigate('NEXT')}>Próximo</button> </div> <span className="rbc-toolbar-label">{label}</span> <div className="rbc-btn-group"> {views.map(viewName => ( <button key={viewName} type="button" className={view === viewName ? 'rbc-active' : ''} onClick={() => onView(viewName)} > {viewNames[viewName] || capitalize(viewName)} </button>))} </div> </div> ); };


function CalendarioPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');

    // ✅ FETCHEVENTS ATUALIZADO COM A LÓGICA CORRETA
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Busca as OS e os Equipamentos em paralelo
            const [resOrdens, resEquipamentos] = await Promise.all([
                getOrdensServico({ page: 0, size: 500 }),
                getEquipamentos()
            ]);

            const todasAsOrdens = resOrdens.data.content;
            const listaEquipamentos = resEquipamentos.data;

            // 2. Filtra apenas as ordens preventivas
            const ordensPreventivas = todasAsOrdens.filter(os => os.tipoManutencao === 'PREVENTIVA');
            
            // 3. Mapeia as preventivas, encontrando o nome do equipamento para cada uma
            const formattedEvents = ordensPreventivas.map(os => {
                const eventDateStr = os.dataInicioPreventiva || os.dataSolicitacao;
                if (!eventDateStr) return null;

                const startDate = new Date(eventDateStr);
                
                // Encontra o equipamento correspondente na lista
                const equipamento = listaEquipamentos.find(e => e.id === os.equipamentoId);
                const equipamentoNome = equipamento ? equipamento.nome : 'Não encontrado';

                return {
                    id: os.id,
                    title: `OS #${os.id} - ${equipamentoNome}`, // Title para acessibilidade
                    start: startDate,
                    end: startDate,
                    allDay: true,
                    resource: os, 
                    equipamentoNome: equipamentoNome, // Passa o nome para o CustomEvent
                };
            }).filter(Boolean);
            
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Erro ao carregar dados do calendário:", error);
            alert("Não foi possível carregar os dados do calendário.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // O resto do componente não precisa de alterações
    const handleSelectEvent = (event) => { navigate(`/os/${event.id}`); };
    const eventStyleGetter = (event) => { const os = event.resource; let backgroundColor = '#28a745'; switch(os.status) { case 'CONCLUIDA': case 'CANCELADA': backgroundColor = '#6c757d'; break; case 'EM_EXECUCAO': case 'PAUSADA': backgroundColor = '#ffc107'; break; default: backgroundColor = '#28a745'; } return { style: { backgroundColor, borderRadius: '5px', opacity: 0.9, color: 'white', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'block' } }; };
    const dayPropGetter = useCallback(() => ({ style: { overflow: 'hidden' } }), []);
    const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
    const onView = useCallback((newView) => setView(newView), [setView]);

    if (loading) {
        return <div className="loading-calendar">Carregando Calendário...</div>;
    }

    return (
        <div className="calendario-container">
            <h1 className="calendario-title">Calendário de Manutenção Preventiva</h1>
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