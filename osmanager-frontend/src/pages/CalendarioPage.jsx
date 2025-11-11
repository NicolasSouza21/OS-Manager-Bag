// Local: osmanager-frontend/src/pages/CalendarioPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { useReactToPrint } from 'react-to-print';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, eachDayOfInterval, addDays, isSameMonth, subMonths, addMonths } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getOrdensServico, getEquipamentos } from '../services/apiService';
import './CalendarioPage.css';

// Configurações de localização (sem alterações)
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const messages = { allDay: 'Dia todo', previous: 'Anterior', next: 'Próximo', today: 'Hoje', month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda', date: 'Data', time: 'Hora', event: 'Evento', noEventsInRange: 'Não há eventos neste período.', showMore: total => `+ ver mais (${total})`};
const formats = { dayHeaderFormat: (date, culture, localizer) => localizer.format(date, "EEEE, dd 'de' MMMM", culture), dayRangeHeaderFormat: ({ start, end }, culture, localizer) => `${localizer.format(start, 'dd', culture)} - ${localizer.format(end, "dd 'de' MMMM", culture)}`, agendaHeaderFormat: ({ start, end }, culture, localizer) => `${localizer.format(start, 'dd/MM/yyyy', culture)} - ${localizer.format(end, 'dd/MM/yyyy', culture)}`};

// ✨✅ CORREÇÃO AQUI: A Legenda está correta agora
const Legenda = () => (
    <div className="legenda-container">
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#ffc107' }}></span>Corretiva</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#a2d2ff', border: '1px dashed #003566' }}></span>Preventiva (Prevista)</div>
        <div className="legenda-item"><span className="cor-box" style={{ backgroundColor: '#28a745' }}></span>Preventiva (Em Andamento)</div>
        {/* Removido o 'Concluída' */}
    </div>
);

// ✨✅ CORREÇÃO AQUI: O título do evento reflete o status 'Prevista'
const CustomEvent = ({ event }) => {
    const os = event.resource;
    const frequenciaObj = os.frequencia;
    
    let titlePrefix = `OS #${os.codigoOs || os.id}`;
    if (os.tipoManutencao === 'CORRETIVA') {
        titlePrefix = 'Corretiva:';
    } else if (os.status === 'ABERTA') {
        // As OSs 'ABERTA' são as "Previstas"
        titlePrefix = '(Prevista):';
    }

    return (
        <div className="custom-event">
            <strong>{`${titlePrefix} - ${event.equipamentoNome}`}</strong>
            {frequenciaObj && <span className="event-frequencia">{frequenciaObj.nome}</span>}
        </div>
    );
};

const CustomToolbar = ({ label, onNavigate, onView, views, view }) => { const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1); const viewNames = { month: 'Mês', week: 'Semana', day: 'Dia', agenda: 'Agenda' }; return ( <div className="rbc-toolbar"> <div className="rbc-btn-group"> <button type="button" onClick={() => onNavigate('TODAY')}>Hoje</button> <button type="button" onClick={() => onNavigate('PREV')}>Anterior</button> <button type="button" onClick={() => onNavigate('NEXT')}>Próximo</button> </div> <span className="rbc-toolbar-label">{label}</span> <div className="rbc-btn-group"> {views.map(viewName => ( <button key={viewName} type="button" className={view === viewName ? 'rbc-active' : ''} onClick={() => onView(viewName)} > {viewNames[viewName] || capitalize(viewName)} </button>))} </div> </div> ); };

// Função de range (sem alterações)
const getRangeForAPI = (targetDate) => {
    const dataInicio = format(startOfWeek(subMonths(targetDate, 1)), 'yyyy-MM-dd');
    const dataFim = format(endOfMonth(addMonths(targetDate, 1)), 'yyyy-MM-dd');
    return { dataInicio, dataFim };
};

// Componente de impressão (sem alterações)
const PrintableCalendar = React.forwardRef(({ events, currentDate }, ref) => {
    const monthName = format(currentDate, 'MMMM yyyy', { locale: ptBR });
    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const firstDayOfMonth = startOfMonth(currentDate);
    const lastDayOfMonth = endOfMonth(currentDate);
    const firstDayOfGrid = startOfWeek(firstDayOfMonth);
    const days = eachDayOfInterval({ start: firstDayOfGrid, end: lastDayOfMonth });
    let lastDayOfGrid = days[days.length - 1];
    while(getDay(lastDayOfGrid) !== 6) {
        lastDayOfGrid = addDays(lastDayOfGrid, 1);
        days.push(lastDayOfGrid);
    }
    const preventivas = events.filter(e => e.resource.tipoManutencao === 'PREVENTIVA');
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return (
        <div ref={ref} className="printable-content">
            <h1 className="print-title">Calendário de Manutenção Preventiva</h1>
            <h2 className="print-subtitle">{monthName.charAt(0).toUpperCase() + monthName.slice(1)}</h2>
            <table className="print-table">
                <thead>
                    <tr>
                        {weekDays.map(day => <th key={day}>{day}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week, i) => (
                        <tr key={i}>
                            {week.map((day, j) => {
                                const isCurrent = isSameMonth(day, currentDate);
                                const dayEvents = preventivas.filter(event =>
                                    format(new Date(event.start), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                                );
                                return (
                                    <td key={j} className={`day-cell ${!isCurrent ? 'other-month' : ''}`}>
                                        <div className="day-number">{format(day, 'd')}</div>
                                        <div className="events-list">
                                            {dayEvents.map(event => (
                                                <div key={event.id} className="event-item">
                                                    <div className="event-item-equip">
                                                        #{event.resource.codigoOs || event.id} - {event.equipamentoNome}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

// Estilos de impressão (sem alterações)
const printStyles = `
    @page {
        size: landscape;
        margin: 10mm;
    }
    .printable-content {
        color: #000;
        font-family: Arial, sans-serif;
    }
    .print-title {
        text-align: center;
        font-size: 16pt;
        margin-bottom: 5px;
    }
    .print-subtitle {
        text-align: center;
        font-size: 12pt;
        margin-bottom: 15px;
        text-transform: capitalize;
    }
    .print-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 7pt;
        table-layout: fixed;
    }
    .print-table th, .print-table td {
        border: 1px solid #999;
        padding: 3px;
        vertical-align: top;
        height: 85px;
    }
    .print-table th {
        background-color: #e0e0e0 !important;
        font-weight: bold;
        text-align: center;
        height: auto;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .day-cell.other-month .day-number {
        color: #ccc;
    }
    .day-number {
        font-weight: bold;
        text-align: right;
        font-size: 9pt;
        margin-bottom: 3px;
    }
    .events-list {
        display: flex;
        flex-direction: column;
        gap: 3px;
    }
    .event-item {
        background-color: #f0f0f0 !important;
        padding: 3px;
        border-radius: 2px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    .event-item-equip {
        font-weight: bold;
        white-space: normal;
        overflow: visible;
        word-wrap: break-word;
    }
`;

function CalendarioPage() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date());
    const [view, setView] = useState('month');
    
    const [listaEquipamentos, setListaEquipamentos] = useState(null);

    const componentRef = useRef();
    
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Calendario-Manutencao-${format(date, 'MM-yyyy')}`,
        pageStyle: printStyles
    });

    const fetchEvents = useCallback(async (targetDate) => {
        setLoading(true);
        
        let equipamentos = listaEquipamentos;
        if (!equipamentos) {
            try {
                const resEquipamentos = await getEquipamentos();
                equipamentos = resEquipamentos.data || [];
                setListaEquipamentos(equipamentos); 
            } catch (e) {
                console.error("Erro ao buscar equipamentos:", e);
                equipamentos = []; 
            }
        }
        
        const { dataInicio, dataFim } = getRangeForAPI(targetDate);

        try {
            const resOrdens = await getOrdensServico({ 
                page: 0, 
                size: 500, 
                dataInicio: dataInicio,
                dataFim: dataFim
            });
            
            const todasAsOrdens = resOrdens.data.content || [];
            const formattedEvents = [];

            // ✨✅ CORREÇÃO AQUI: Esta é a lógica que você quer.
            // "Me mostre TUDO, exceto CONCLUIDA e CANCELADA"
            todasAsOrdens.forEach(os => {
                const isConcluidaOuCancelada = ['CONCLUIDA', 'CANCELADA'].includes(os.status);
                
                // Se NÃO ESTÁ concluída ou cancelada, adicione ao calendário.
                if (!isConcluidaOuCancelada) { 
                    const eventDateStr = os.tipoManutencao === 'PREVENTIVA' ? os.dataInicioPreventiva : os.dataSolicitacao;
                    if (!eventDateStr) return;
                    
                    const startDate = new Date(eventDateStr);
                    // Corrige o fuso horário (problema comum do react-big-calendar)
                    startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());

                    const equipamento = equipamentos.find(e => e.id === os.equipamentoId);
                    const equipamentoNome = equipamento ? equipamento.nome : 'Não encontrado';
                    
                    formattedEvents.push({ 
                        id: os.id, 
                        title: `OS #${os.codigoOs || os.id} - ${equipamentoNome}`, 
                        start: startDate, 
                        end: startDate, 
                        allDay: true, 
                        resource: os, 
                        equipamentoNome: equipamentoNome 
                    });
                }
            });
            
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Erro ao carregar dados do calendário:", error);
            alert("Não foi possível carregar os dados do calendário.");
        } finally {
            setLoading(false);
        }
    }, [listaEquipamentos]);

    useEffect(() => { 
        fetchEvents(date); 
    }, [fetchEvents, date]); 

    const handleSelectEvent = (event) => {
        // Esta verificação 'virtual' não é mais necessária
        if (String(event.id).includes('-virtual-')) {
            alert(`Esta é uma ocorrência futura prevista para ${event.start.toLocaleDateString('pt-BR')}.\n\nA Ordem de Serviço real será criada no sistema assim que a anterior for concluída.`);
            return;
        }
        navigate(`/os/${event.id}`);
    };

    // ✨✅ CORREÇÃO AQUI: Lógica de estilo corrigida para Bater com a Legenda
    const eventStyleGetter = (event) => {
        const os = event.resource;
        let style = { borderRadius: '5px', opacity: 0.9, color: 'white', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'block' };
        
        // A lógica de filtro em fetchEvents já removeu Concluída/Cancelada.

        if (os.tipoManutencao === 'CORRETIVA') {
            style.backgroundColor = '#ffc107'; // 1. Amarelo para Corretiva
            style.color = '#333';
        } else if (os.tipoManutencao === 'PREVENTIVA' && os.status === 'ABERTA') {
            // 2. Azul para Preventiva "ABERTA" (que é a sua "Prevista")
            style.backgroundColor = '#a2d2ff'; 
            style.borderColor = '#6a9fca'; 
            style.color = '#003566'; 
            style.borderStyle = 'dashed';
        } else {
            // 3. Verde para Preventiva (Pendente, Em Execução, Aguardando Verificação)
            style.backgroundColor = '#28a745'; 
        }
        
        return { style };
    };
    
    const dayPropGetter = useCallback(() => ({ style: { overflow: 'hidden' } }), []);
    
    const onNavigate = useCallback((newDate) => setDate(newDate), [setDate]);
    const onView = useCallback((newView) => setView(newView), [setView]);

    if (loading) { return <div className="loading-calendar">Carregando Calendário...</div>; }

    return (
        <div className="calendario-container">
            {/* Cabeçalho (sem alterações) */}
            <div className="calendario-header">
                <h1 className="calendario-title">Calendário de Manutenção</h1>
                <div className="header-controls">
                    <Legenda />
                    <button onClick={handlePrint} className="print-button">Imprimir Calendário</button>
                </div>
            </div>
            
            <div style={{ display: 'none' }}>
                <PrintableCalendar ref={componentRef} events={events} currentDate={date} />
            </div>
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
                    components={{ event: CustomEvent, toolbar: CustomToolbar }}
                    formats={formats}
                />
            </div>
        </div>
    );
}

export default CalendarioPage;