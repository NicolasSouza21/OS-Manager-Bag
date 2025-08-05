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

// ✨ ALTERAÇÃO AQUI: Legenda atualizada para refletir os novos tipos de OS
const Legenda = () => (
    <div className="legenda-container">
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#ffc107' }}></span>Corretiva</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#a2d2ff', border: '1px dashed #003566' }}></span>Preventiva Prevista</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#28a745' }}></span>Preventiva Agendada</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#6c757d' }}></span>Concluída</div>
    </div>
);

// ✨ ALTERAÇÃO AQUI: CustomEvent agora diferencia o título para corretivas
const CustomEvent = ({ event }) => {
    const os = event.resource;
    const frequenciaObj = os.frequencia;
    
    // Define um prefixo para o título baseado no tipo de manutenção
    const titlePrefix = os.tipoManutencao === 'CORRETIVA' ? 'Corretiva:' : `OS #${os.codigoOs || os.id}`;

    return (
        <div className="custom-event">
            <strong>{`${titlePrefix} - ${event.equipamentoNome}`}</strong>
            {frequenciaObj && <span className="event-frequencia">{frequenciaObj.nome}</span>}
        </div>
    );
};


// Componente da Barra de Ferramentas Personalizada (sem alterações)
const CustomToolbar = ({ label, onNavigate, onView, views, view }) => { const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1); const viewNames = { month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda' }; return ( <div className="rbc-toolbar"> <div className="rbc-btn-group"> <button type="button" onClick={() => onNavigate('TODAY')}>Hoje</button> <button type="button" onClick={() => onNavigate('PREV')}>Anterior</button> <button type="button" onClick={() => onNavigate('NEXT')}>Próximo</button> </div> <span className="rbc-toolbar-label">{label}</span> <div className="rbc-btn-group"> {views.map(viewName => ( <button key={viewName} type="button" className={view === viewName ? 'rbc-active' : ''} onClick={() => onView(viewName)} > {viewNames[viewName] || capitalize(viewName)} </button>))} </div> </div> ); };

// FUNÇÃO getNextDate (sem alterações)
const getNextDate = (startDate, frequenciaObj) => {
    if (!frequenciaObj || !frequenciaObj.nome) return null;
    const date = new Date(startDate);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const nomeFrequencia = frequenciaObj.nome.toUpperCase();
    switch (nomeFrequencia) {
        case 'DIARIO': date.setDate(date.getDate() + 1); break;
        case 'BIDIARIO': date.setDate(date.getDate() + 2); break;
        case 'SEMANAL': date.setDate(date.getDate() + 7); break;
        case 'QUINZENAL': date.setDate(date.getDate() + 14); break;
        case 'MENSAL': date.setMonth(date.getMonth() + 1); break;
        case 'BIMESTRAL': date.setMonth(date.getMonth() + 2); break;
        case 'TRIMESTRAL': date.setMonth(date.getMonth() + 3); break;
        case 'SEMESTRAL': date.setMonth(date.getMonth() + 6); break;
        case 'ANUAL': date.setFullYear(date.getFullYear() + 1); break;
        default: return null;
    }
    return date;
};

function CalendarioPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');

    // ✨ ALTERAÇÃO GERAL AQUI: A lógica de busca de eventos foi reestruturada
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const [resOrdens, resEquipamentos] = await Promise.all([
                getOrdensServico({ page: 0, size: 500 }), // Busca todas as OS
                getEquipamentos()
            ]);

            const todasAsOrdens = resOrdens.data.content;
            const listaEquipamentos = resEquipamentos.data;
            
            const formattedEvents = [];

            // ✅ 1. Itera sobre TODAS as ordens de serviço
            todasAsOrdens.forEach(os => {
                // Filtra OS em andamento ou abertas (não concluídas/canceladas)
                const isConcluidaOuCancelada = ['CONCLUIDA', 'CANCELADA'].includes(os.status);
                
                if (isConcluidaOuCancelada && os.tipoManutencao === 'PREVENTIVA') {
                    // Se for preventiva concluída, não adiciona ao calendário principal,
                    // mas ainda a usa para projetar a próxima.
                } else {
                    // Adiciona Corretivas e Preventivas não-concluídas
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

                // ✅ 2. Lógica de projeção de preventivas continua, baseada em TODAS as preventivas
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

    // ✨ ALTERAÇÃO AQUI: Estilização dos eventos atualizada
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
            style.backgroundColor = '#a2d2ff'; // Azul claro para previstas
            style.borderColor = '#6a9fca';
            style.color = '#003566';
            style.borderStyle = 'dashed';
        } else if (os.tipoManutencao === 'CORRETIVA') {
            style.backgroundColor = '#ffc107'; // Amarelo para corretivas
            style.color = '#333';
        } else if (os.status === 'CONCLUIDA' || os.status === 'CANCELADA') {
            style.backgroundColor = '#6c757d'; // Cinza para concluídas
        } else { // Preventivas agendadas (não concluídas)
            style.backgroundColor = '#28a745'; // Verde para preventivas agendadas
        }
        
        return { style };
    };
    
    // O resto do componente não precisa de alterações
    const dayPropGetter = useCallback(() => ({ style: { overflow: 'hidden' } }), []);
    const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
    const onView = useCallback((newView) => setView(newView), [setView]);

    if (loading) {
        return <div className="loading-calendar">Carregando Calendário...</div>;
    }

    return (
        <div className="calendario-container">
            {/* ✨ ALTERAÇÃO AQUI: Título da página atualizado */}
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