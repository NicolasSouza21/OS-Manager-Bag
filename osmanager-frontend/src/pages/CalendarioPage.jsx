import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getOrdensServico, getEquipamentos } from '../services/apiService';
import './CalendarioPage.css';

// Configurações de localização, mensagens e formatos (sem alterações)
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const messages = { allDay: 'Dia todo', previous: 'Anterior', next: 'Próximo', today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda', date: 'Data', time: 'Hora', event: 'Evento', noEventsInRange: 'Não há eventos neste período.', showMore: total => `+ ver mais (${total})`};
const formats = { dayHeaderFormat: (date, culture, localizer) => localizer.format(date, "EEEE, dd 'de' MMMM", culture), dayRangeHeaderFormat: ({ start, end }, culture, localizer) => `${localizer.format(start, 'dd', culture)} - ${localizer.format(end, "dd 'de' MMMM", culture)}`, agendaHeaderFormat: ({ start, end }, culture, localizer) => `${localizer.format(start, 'dd/MM/yyyy', culture)} - ${localizer.format(end, 'dd/MM/yyyy', culture)}`};

const Legenda = () => (
    <div className="legenda-container">
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#ffc107' }}></span>Corretiva</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#a2d2ff', border: '1px dashed #003566' }}></span>Preventiva Prevista</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#28a745' }}></span>Preventiva Agendada</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#6c757d' }}></span>Concluída</div>
    </div>
);

const CustomEvent = ({ event }) => {
    const os = event.resource;
    const frequenciaObj = os.frequencia;
    
    const titlePrefix = os.tipoManutencao === 'CORRETIVA' ? 'Corretiva:' : `OS #${os.codigoOs || os.id}`;

    return (
        <div className="custom-event">
            <strong>{`${titlePrefix} - ${event.equipamentoNome}`}</strong>
            {frequenciaObj && <span className="event-frequencia">{frequenciaObj.nome}</span>}
        </div>
    );
};

const CustomToolbar = ({ label, onNavigate, onView, views, view }) => { const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1); const viewNames = { month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda' }; return ( <div className="rbc-toolbar"> <div className="rbc-btn-group"> <button type="button" onClick={() => onNavigate('TODAY')}>Hoje</button> <button type="button" onClick={() => onNavigate('PREV')}>Anterior</button> <button type="button" onClick={() => onNavigate('NEXT')}>Próximo</button> </div> <span className="rbc-toolbar-label">{label}</span> <div className="rbc-btn-group"> {views.map(viewName => ( <button key={viewName} type="button" className={view === viewName ? 'rbc-active' : ''} onClick={() => onView(viewName)} > {viewNames[viewName] || capitalize(viewName)} </button>))} </div> </div> ); };

// ✨ NOVA ALTERAÇÃO APLICADA AQUI
const getNextDate = (startDate, frequenciaObj) => {
    if (!frequenciaObj || !frequenciaObj.unidadeTempo || !frequenciaObj.intervalo) {
        return null;
    }

    // Guarda o dia original para a verificação de 'HORA'
    const originalDay = new Date(startDate).getDate();
    const date = new Date(startDate);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

    const { unidadeTempo, intervalo } = frequenciaObj;
    
    switch (unidadeTempo) {
        case 'HORA':
            date.setHours(date.getHours() + intervalo);
            // Se o dia da nova data for diferente do dia original, a projeção para.
            if (date.getDate() !== originalDay) {
                return null; 
            }
            break;
        case 'DIA':
            date.setDate(date.getDate() + intervalo);
            break;
        case 'SEMANA':
            date.setDate(date.getDate() + intervalo * 7);
            break;
        case 'MES':
            date.setMonth(date.getMonth() + intervalo);
            break;
        case 'ANO':
            date.setFullYear(date.getFullYear() + intervalo);
            break;
        default:
            return null;
    }

    if (unidadeTempo !== 'HORA' && date.getDay() === 0) {
        date.setDate(date.getDate() + 1); 
    }

    return date;
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
            const [resOrdens, resEquipamentos] = await Promise.all([
                getOrdensServico({ page: 0, size: 500 }),
                getEquipamentos()
            ]);

            const todasAsOrdens = resOrdens.data.content;
            const listaEquipamentos = resEquipamentos.data;
            
            const formattedEvents = [];

            todasAsOrdens.forEach(os => {
                const isConcluidaOuCancelada = ['CONCLUIDA', 'CANCELADA'].includes(os.status);
                
                if (isConcluidaOuCancelada && os.tipoManutencao === 'PREVENTIVA') {
                    // Não renderiza, mas usa para projetar a próxima
                } else {
                    const eventDateStr = os.tipoManutencao === 'PREVENTIVA' 
                        ? os.dataInicioPreventiva 
                        : os.dataSolicitacao;
                    
                    if (!eventDateStr) return;

                    const startDate = new Date(eventDateStr);
                    const equipamento = listaEquipamentos.find(e => e.id === os.equipamentoId);
                    const equipamentoNome = equipamento ? equipamento.nome : 'Não encontrado';

                    formattedEvents.push({
                        id: os.id,
                        title: `OS #${os.codigoOs || os.id} - ${equipamentoNome}`,
                        start: startDate,
                        end: startDate,
                        allDay: true,
                        resource: os, 
                        equipamentoNome: equipamentoNome,
                    });
                }

                if (os.tipoManutencao === 'PREVENTIVA' && os.frequencia && os.frequencia.nome !== 'UNICA' && os.dataInicioPreventiva) {
                    let currentDate = new Date(os.dataInicioPreventiva);
                    const endDateLimit = new Date();
                    endDateLimit.setFullYear(endDateLimit.getFullYear() + 2);

                    while (currentDate < endDateLimit) {
                        const nextDate = getNextDate(currentDate, os.frequencia); 
                        if (!nextDate || nextDate >= endDateLimit) break;
                        
                        const virtualId = `${os.id}-virtual-${nextDate.getTime()}`;
                        const equipamento = listaEquipamentos.find(e => e.id === os.equipamentoId);
                        const equipamentoNome = equipamento ? equipamento.nome : 'Não encontrado';

                        formattedEvents.push({
                            id: virtualId,
                            title: `(Previsto) ${equipamentoNome}`,
                            start: nextDate,
                            end: nextDate,
                            allDay: true,
                            resource: { ...os, status: 'PREVISTO', id: virtualId, tipoManutencao: 'PREVENTIVA' },
                            equipamentoNome: equipamentoNome,
                        });
                        currentDate = nextDate;
                    }
                }
            });
            
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

    const handleSelectEvent = (event) => {
        if (String(event.id).includes('-virtual-')) {
            alert(`Esta é uma ocorrência futura prevista para ${event.start.toLocaleDateString('pt-BR')}.\n\nA Ordem de Serviço real será criada no sistema assim que a anterior for concluída.`);
            return;
        }
        navigate(`/os/${event.id}`);
    };

    const eventStyleGetter = (event) => {
        const os = event.resource;
        let style = {
            borderRadius: '5px',
            opacity: 0.9,
            color: 'white',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'block'
        };

        if (os.status === 'PREVISTO') {
            style.backgroundColor = '#a2d2ff';
            style.borderColor = '#6a9fca';
            style.color = '#003566';
            style.borderStyle = 'dashed';
        } else if (os.tipoManutencao === 'CORRETIVA') {
            style.backgroundColor = '#ffc107';
            style.color = '#333';
        } else if (os.status === 'CONCLUIDA' || os.status === 'CANCELADA') {
            style.backgroundColor = '#6c757d';
        } else {
            style.backgroundColor = '#28a745';
        }
        
        return { style };
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