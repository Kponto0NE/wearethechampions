/**
 * 🎓 Agenda do Aluno - Agenda Escolar Virtual
 * Módulo: agenda-aluno.js
 * Perfil: Aluno
 * 
 * Funcionalidades:
 * - Calendário dinâmico com navegação mensal
 * - Lista de atividades filtrável
 * - Modal de detalhes do dia com eventos e atividades
 * - Busca em tempo real
 * - Adição de lembretes (simulado)
 * - Persistência local dos eventos
 */

'use strict';

// ========== CONFIGURAÇÃO INICIAL ==========
const CONFIG = {
    aluno: {
        nome: 'Matheus dos Santos',
        matricula: '2026001',
        turma: '9º Ano B'
    },
    coresEventos: {
        1: '#a8801c',  // Dourado - Tarefas
        2: '#28a745',  // Verde - Provas
        3: '#dc3545'   // Vermelho - Prazos
    }
};

// ========== ESTADO DA APLICAÇÃO ==========
const estado = {
    dataAtual: new Date(),
    mesAtual: new Date().getMonth(),
    anoAtual: new Date().getFullYear(),
    diaSelecionado: null,
    atividades: [],
    eventos: {},
    termoBusca: ''
};

// ========== DADOS SIMULADOS (Substituir por API) ==========
const dadosIniciais = {
    atividades: [
        { id: 1, nome: 'Trabalho de História', data: '2026-06-10', turma: '9º B', status: 'pendente', tipo: 1 },
        { id: 2, nome: 'Prova de Matemática', data: '2026-06-15', turma: '9º B', status: 'pendente', tipo: 2 },
        { id: 3, nome: 'Entregar Redação', data: '2026-06-05', turma: '9º B', status: 'atrasado', tipo: 1 },
        { id: 4, nome: 'Apresentação de Ciências', data: '2026-06-20', turma: '9º B', status: 'pendente', tipo: 3 },
        { id: 5, nome: 'Lista de Exercícios', data: '2026-06-08', turma: '9º B', status: 'concluido', tipo: 1 },
        { id: 6, nome: 'Prova de Inglês', data: '2026-06-25', turma: '9º B', status: 'pendente', tipo: 2 },
        { id: 7, nome: 'Feito em Grupo - Geografia', data: '2026-06-12', turma: '9º B', status: 'pendente', tipo: 1 },
        { id: 8, nome: 'Simulado ENEM', data: '2026-06-30', turma: '9º B', status: 'pendente', tipo: 2 }
    ],
    eventos: {
        '2026-06-05': [
            { id: 101, titulo: 'Entrega: Redação de Português', hora: '23:59', tipo: 1 }
        ],
        '2026-06-08': [
            { id: 102, titulo: 'Lista de Exercícios - Matemática', hora: '18:00', tipo: 1 }
        ],
        '2026-06-10': [
            { id: 103, titulo: 'Trabalho de História: Revolução Industrial', hora: '23:59', tipo: 1 },
            { id: 104, titulo: 'Reunião de Grupo', hora: '14:00', tipo: 3 }
        ],
        '2026-06-12': [
            { id: 105, titulo: 'Trabalho em Grupo - Geografia', hora: '23:59', tipo: 1 }
        ],
        '2026-06-15': [
            { id: 106, titulo: '📝 Prova de Matemática - Álgebra', hora: '08:00', tipo: 2 }
        ],
        '2026-06-20': [
            { id: 107, titulo: '🎤 Apresentação de Ciências', hora: '10:00', tipo: 3 }
        ],
        '2026-06-25': [
            { id: 108, titulo: '📝 Prova de Inglês', hora: '08:00', tipo: 2 }
        ],
        '2026-06-30': [
            { id: 109, titulo: '📋 Simulado ENEM', hora: '07:30', tipo: 2 }
        ]
    }
};

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarAplicacao();
    configurarEventos();
    carregarDados();
});

/**
 * Inicializa a aplicação
 */
function inicializarAplicacao() {
    // Definir nome do aluno
    const nomeEl = document.getElementById('userName');
    if (nomeEl) nomeEl.textContent = CONFIG.aluno.nome;
    
    // Carregar dados do localStorage ou usar dados iniciais
    carregarDados();
    
    // Renderizar interface
    renderizarCalendario();
    renderizarAtividades();
    atualizarDisplayMes();
}

/**
 * Configura todos os event listeners
 */
function configurarEventos() {
    // Navegação do calendário
    document.getElementById('prevMonth')?.addEventListener('click', () => navegarMes(-1));
    document.getElementById('nextMonth')?.addEventListener('click', () => navegarMes(1));
    
    // Scroll da sidebar
    document.getElementById('scrollUp')?.addEventListener('click', () => rolarSidebar(-100));
    document.getElementById('scrollDown')?.addEventListener('click', () => rolarSidebar(100));
    
    // Busca
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        estado.termoBusca = e.target.value.toLowerCase();
        renderizarAtividades();
        renderizarCalendario();
    });
    
    // Modal
    document.querySelector('.close')?.addEventListener('click', fecharModal);
    document.getElementById('dayModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('dayModal')) fecharModal();
    });
    
    // Adicionar evento
    document.getElementById('btnAddEvent')?.addEventListener('click', adicionarEvento);
    document.getElementById('newEventInput')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adicionarEvento();
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModal();
    });
}

/**
 * Carrega dados do localStorage ou usa dados iniciais
 */
function carregarDados() {
    // Carregar atividades
    const atividadesSalvas = localStorage.getItem('aev_atividades');
    estado.atividades = atividadesSalvas ? JSON.parse(atividadesSalvas) : [...dadosIniciais.atividades];
    
    // Carregar eventos
    const eventosSalvos = localStorage.getItem('aev_eventos');
    estado.eventos = eventosSalvos ? JSON.parse(eventosSalvos) : { ...dadosIniciais.eventos };
}

/**
 * Salva dados no localStorage
 */
function salvarDados() {
    localStorage.setItem('aev_atividades', JSON.stringify(estado.atividades));
    localStorage.setItem('aev_eventos', JSON.stringify(estado.eventos));
}

// ========== CALENDÁRIO ==========

/**
 * Renderiza o calendário do mês atual
 */
function renderizarCalendario() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Cabeçalho: Dias da semana
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    grid.appendChild(criarCelulaVazia()); // Espaço para números da semana
    
    diasSemana.forEach(dia => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.setAttribute('role', 'columnheader');
        header.textContent = dia;
        grid.appendChild(header);
    });
    
    // Obter primeiro e último dia do mês
    const primeiroDia = new Date(estado.anoAtual, estado.mesAtual, 1);
    const ultimoDia = new Date(estado.anoAtual, estado.mesAtual + 1, 0);
    const totalDias = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay(); // 0 = Domingo
    
    // Renderizar semanas
    let diaAtual = 1;
    let semanaAtual = 1;
    
    for (let semana = 0; semana < 6; semana++) {
        // Número da semana
        const weekNum = document.createElement('div');
        weekNum.className = 'week-number';
        weekNum.textContent = semanaAtual++;
        grid.appendChild(weekNum);
        
        // Dias da semana
        for (let dia = 0; dia < 7; dia++) {
            const celula = document.createElement('div');
            celula.className = 'calendar-cell';
            celula.setAttribute('role', 'gridcell');
            
            // Células vazias antes do primeiro dia
            if (semana === 0 && dia < diaSemanaInicio) {
                celula.classList.add('empty');
            }
            // Dias válidos do mês
            else if (diaAtual <= totalDias) {
                const dataStr = formatarData(estado.anoAtual, estado.mesAtual, diaAtual);
                const dataObj = new Date(estado.anoAtual, estado.mesAtual, diaAtual);
                const ehHoje = isDataHoje(dataObj);
                const ehFimDeSemana = dia === 0 || dia === 6;
                
                celula.dataset.data = dataStr;
                
                // Número do dia
                const dayNum = document.createElement('span');
                dayNum.className = 'day-number';
                dayNum.textContent = diaAtual;
                celula.appendChild(dayNum);
                
                // Classes especiais
                if (ehHoje) celula.classList.add('today');
                if (ehFimDeSemana) celula.classList.add('weekend');
                
                // Verificar eventos/atividades
                const eventosDoDia = estado.eventos[dataStr] || [];
                const atividadesDoDia = filtrarAtividadesPorData(dataStr);
                
                if (eventosDoDia.length > 0 || atividadesDoDia.length > 0) {
                    celula.classList.add('has-event');
                    
                    // Indicadores visuais
                    const indicators = document.createElement('div');
                    indicators.className = 'day-events';
                    
                    // Adicionar dots para diferentes tipos
                    const tiposVistos = new Set();
                    [...eventosDoDia, ...atividadesDoDia].forEach(item => {
                        const tipo = item.tipo || 1;
                        if (!tiposVistos.has(tipo)) {
                            const dot = document.createElement('span');
                            dot.className = `day-event-dot event-type-${tipo}`;
                            indicators.appendChild(dot);
                            tiposVistos.add(tipo);
                        }
                    });
                    
                    celula.appendChild(indicators);
                }
                
                // Clique para ver detalhes
                celula.addEventListener('click', () => abrirModalDia(dataStr, dataObj));
            }
            // Células vazias após o último dia
            else {
                celula.classList.add('empty');
            }
            
            grid.appendChild(celula);
            if (diaAtual <= totalDias) diaAtual++;
        }
    }
}

/**
 * Cria uma célula vazia para o grid
 * @returns {HTMLElement}
 */
function criarCelulaVazia() {
    const celula = document.createElement('div');
    celula.className = 'day-header';
    celula.textContent = 'Sem';
    return celula;
}

/**
 * Navega entre meses
 * @param {number} direcao - 1 para próximo, -1 para anterior
 */
function navegarMes(direcao) {
    estado.mesAtual += direcao;
    
    // Ajustar ano se necessário
    if (estado.mesAtual > 11) {
        estado.mesAtual = 0;
        estado.anoAtual++;
    } else if (estado.mesAtual < 0) {
        estado.mesAtual = 11;
        estado.anoAtual--;
    }
    
    renderizarCalendario();
    atualizarDisplayMes();
}

/**
 * Atualiza o display do mês/ano no header
 */
function atualizarDisplayMes() {
    const display = document.getElementById('currentYearMonth');
    if (display) {
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        display.textContent = `${meses[estado.mesAtual]} ${estado.anoAtual}`;
    }
}

/**
 * Formata data para string YYYY-MM-DD
 */
function formatarData(ano, mes, dia) {
    const m = String(mes + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${ano}-${m}-${d}`;
}

/**
 * Verifica se uma data é hoje
 * @param {Date} data 
 * @returns {boolean}
 */
function isDataHoje(data) {
    const hoje = new Date();
    return data.getDate() === hoje.getDate() &&
           data.getMonth() === hoje.getMonth() &&
           data.getFullYear() === hoje.getFullYear();
}

/**
 * Filtra atividades por data
 * @param {string} dataStr - Formato YYYY-MM-DD
 * @returns {Array}
 */
function filtrarAtividadesPorData(dataStr) {
    return estado.atividades.filter(atv => {
        const matchData = atv.data === dataStr;
        const matchBusca = !estado.termoBusca || 
            atv.nome.toLowerCase().includes(estado.termoBusca) ||
            atv.turma.toLowerCase().includes(estado.termoBusca);
        return matchData && matchBusca;
    });
}

// ========== ATIVIDADES (SIDEBAR) ==========

/**
 * Renderiza a lista de atividades na sidebar
 */
function renderizarAtividades() {
    const lista = document.getElementById('activitiesList');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    // Filtrar atividades
    const atividadesFiltradas = estado.atividades.filter(atv => {
        if (!estado.termoBusca) return true;
        return atv.nome.toLowerCase().includes(estado.termoBusca) ||
               atv.turma.toLowerCase().includes(estado.termoBusca);
    });
    
    // Ordenar por data
    atividadesFiltradas.sort((a, b) => new Date(a.data) - new Date(b.data));
    
    if (atividadesFiltradas.length === 0) {
        lista.innerHTML = '<p class="no-events" style="padding: 1rem; text-align: center;">Nenhuma atividade encontrada.</p>';
        return;
    }
    
    atividadesFiltradas.forEach(atividade => {
        const item = document.createElement('div');
        item.className = `activity-item ${atividade.status === 'atrasado' ? 'overdue' : ''} ${isDataHoje(new Date(atividade.data)) ? 'due-today' : ''}`;
        item.setAttribute('role', 'listitem');
        item.setAttribute('tabindex', '0');
        
        // Ícone baseado no tipo
        const icones = { 1: '📝', 2: '📝', 3: '⚠️' };
        
        // Status para exibição
        const statusText = {
            'pendente': 'Pendente',
            'concluido': 'Concluído',
            'atrasado': 'Atrasado'
        };
        
        // Formatar data para exibição
        const dataObj = new Date(atividade.data);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        item.innerHTML = `
            <div class="activity-icon" aria-hidden="true">${icones[atividade.tipo] || '📋'}</div>
            <div class="activity-info">
                <span class="activity-name">${atividade.nome}</span>
                <span class="activity-date">📅 ${dataFormatada} • ${atividade.turma}</span>
            </div>
            <span class="activity-status">${statusText[atividade.status]}</span>
        `;
        
        // Clique para ver detalhes no calendário
        item.addEventListener('click', () => {
            // Navegar para a data da atividade
            const [ano, mes, dia] = atividade.data.split('-');
            estado.anoAtual = parseInt(ano);
            estado.mesAtual = parseInt(mes) - 1;
            renderizarCalendario();
            atualizarDisplayMes();
            
            // Abrir modal do dia
            abrirModalDia(atividade.data, dataObj);
        });
        
        // Suporte a teclado
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
        
        lista.appendChild(item);
    });
}

/**
 * Rola a sidebar de atividades
 * @param {number} pixels - Quantidade de pixels para rolar
 */
function rolarSidebar(pixels) {
    const lista = document.getElementById('activitiesList');
    if (lista) {
        lista.scrollBy({ top: pixels, behavior: 'smooth' });
    }
}

// ========== MODAL ==========

/**
 * Abre o modal com detalhes de um dia específico
 * @param {string} dataStr - Formato YYYY-MM-DD
 * @param {Date} dataObj - Objeto Date para formatação
 */
function abrirModalDia(dataStr, dataObj) {
    estado.diaSelecionado = dataStr;
    
    // Atualizar título do modal
    const modalTitle = document.getElementById('modalDate');
    if (modalTitle) {
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        modalTitle.textContent = `${dias[dataObj.getDay()]}, ${dataObj.getDate()} de ${meses[dataObj.getMonth()]} de ${dataObj.getFullYear()}`;
    }
    
    // Renderizar eventos
    renderizarEventosDoDia(dataStr);
    
    // Renderizar atividades do dia
    renderizarAtividadesDoDia(dataStr);
    
    // Limpar input de novo evento
    const input = document.getElementById('newEventInput');
    if (input) input.value = '';
    
    // Mostrar modal
    const modal = document.getElementById('dayModal');
    if (modal) {
        modal.hidden = false;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Renderiza a lista de eventos do dia no modal
 * @param {string} dataStr 
 */
function renderizarEventosDoDia(dataStr) {
    const container = document.getElementById('eventsList');
    if (!container) return;
    
    const eventos = estado.eventos[dataStr] || [];
    
    if (eventos.length === 0) {
        container.innerHTML = '<p class="no-events">Nenhum evento para este dia.</p>';
        return;
    }
    
    container.innerHTML = eventos.map(evento => `
        <div class="event-item" role="listitem">
            <div>
                <span class="event-time">${evento.hora}</span>
                ${evento.titulo}
            </div>
            <button class="delete-event" onclick="removerEvento('${dataStr}', ${evento.id})" 
                    aria-label="Remover evento" title="Remover">🗑️</button>
        </div>
    `).join('');
}

/**
 * Renderiza a lista de atividades do dia no modal
 * @param {string} dataStr 
 */
function renderizarAtividadesDoDia(dataStr) {
    const container = document.getElementById('activitiesDayList');
    if (!container) return;
    
    const atividades = filtrarAtividadesPorData(dataStr);
    
    if (atividades.length === 0) {
        container.innerHTML = '<p class="no-events">Nenhuma atividade para este dia.</p>';
        return;
    }
    
    container.innerHTML = atividades.map(atv => `
        <div class="event-item" role="listitem">
            <div>
                <strong>${atv.nome}</strong><br>
                <small>${atv.turma} • ${atv.status}</small>
            </div>
            <span class="activity-status">${atv.status === 'pendente' ? '⏳' : atv.status === 'concluido' ? '✅' : '⚠️'}</span>
        </div>
    `).join('');
}

/**
 * Fecha o modal
 */
function fecharModal() {
    const modal = document.getElementById('dayModal');
    if (modal) {
        modal.hidden = true;
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    estado.diaSelecionado = null;
}

/**
 * Adiciona um novo evento ao dia selecionado
 */
function adicionarEvento() {
    const input = document.getElementById('newEventInput');
    const texto = input?.value.trim();
    
    if (!texto || !estado.diaSelecionado) {
        exibirToast('⚠️ Digite uma descrição para o lembrete', 'warning');
        return;
    }
    
    // Criar novo evento
    const novoEvento = {
        id: Date.now(),
        titulo: texto,
        hora: '00:00',
        tipo: 1
    };
    
    // Adicionar ao estado
    if (!estado.eventos[estado.diaSelecionado]) {
        estado.eventos[estado.diaSelecionado] = [];
    }
    estado.eventos[estado.diaSelecionado].push(novoEvento);
    
    // Salvar e atualizar
    salvarDados();
    renderizarEventosDoDia(estado.diaSelecionado);
    renderizarCalendario();
    
    // Limpar e feedback
    if (input) input.value = '';
    exibirToast('✅ Lembrete adicionado!', 'success');
}

/**
 * Remove um evento específico
 * @param {string} dataStr 
 * @param {number} eventoId 
 */
function removerEvento(dataStr, eventoId) {
    if (!estado.eventos[dataStr]) return;
    
    estado.eventos[dataStr] = estado.eventos[dataStr].filter(e => e.id !== eventoId);
    
    // Remover array vazio
    if (estado.eventos[dataStr].length === 0) {
        delete estado.eventos[dataStr];
    }
    
    salvarDados();
    renderizarEventosDoDia(dataStr);
    renderizarCalendario();
    exibirToast('🗑️ Evento removido', 'info');
}

// ========== UTILITÁRIOS ==========

/**
 * Exibe toast de notificação
 * @param {string} mensagem 
 * @param {string} tipo - 'success' | 'error' | 'warning' | 'info'
 */
function exibirToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = mensagem;
    toast.className = `toast ${tipo} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ========== FUNÇÕES GLOBAIS (para onclick no HTML) ==========
window.fecharModal = fecharModal;
window.removerEvento = removerEvento;
window.adicionarEvento = adicionarEvento;