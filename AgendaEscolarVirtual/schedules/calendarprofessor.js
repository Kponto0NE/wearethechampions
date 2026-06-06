/**
 * 👨‍🏫 Agenda do Professor - Agenda Escolar Virtual
 * Módulo: agenda-professor.js
 * Perfil: Professor
 * 
 * Funcionalidades:
 * - Calendário dinâmico com navegação mensal
 * - Lista de alunos filtrável por turma
 * - Modal de detalhes do dia com eventos e aulas
 * - Adicionar eventos/aulas com tipo, horário e turma
 * - Busca em tempo real (alunos, eventos)
 * - Persistência local dos dados
 */

'use strict';

// ========== CONFIGURAÇÃO INICIAL ==========
const CONFIG = {
    professor: {
        nome: 'Tranquedo Nieves',
        matricula: 'PROF-2026-001',
        disciplinas: ['Matemática', 'Álgebra']
    },
    tiposEvento: {
        evento: { cor: '#16844c', icone: '📌', label: 'Evento' },
        aula: { cor: '#17a2b8', icone: '🎓', label: 'Aula' },
        prova: { cor: '#dc3545', icone: '📝', label: 'Prova' },
        entrega: { cor: '#fd7e14', icone: '⏰', label: 'Prazo' }
    }
};

// ========== ESTADO DA APLICAÇÃO ==========
const estado = {
    dataAtual: new Date(),
    mesAtual: new Date().getMonth(),
    anoAtual: new Date().getFullYear(),
    diaSelecionado: null,
    alunos: [],
    turmas: [],
    eventos: {},
    aulas: {},
    termoBusca: '',
    turmaFiltro: 'all'
};

// ========== DADOS SIMULADOS (Substituir por API) ==========
const dadosIniciais = {
    turmas: [
        { id: '9A', nome: '9º Ano A', alunos: 28 },
        { id: '9B', nome: '9º Ano B', alunos: 25 },
        { id: '8A', nome: '8º Ano A', alunos: 30 }
    ],
    alunos: [
        { id: 1, nome: 'Ana Clara Silva', turma: '9A', matricula: '2026001', avatar: 'AS' },
        { id: 2, nome: 'Bruno Oliveira', turma: '9A', matricula: '2026002', avatar: 'BO' },
        { id: 3, nome: 'Carlos Mendes', turma: '9B', matricula: '2026003', avatar: 'CM' },
        { id: 4, nome: 'Diana Santos', turma: '9A', matricula: '2026004', avatar: 'DS' },
        { id: 5, nome: 'Eduardo Lima', turma: '9B', matricula: '2026005', avatar: 'EL' },
        { id: 6, nome: 'Fernanda Costa', turma: '9A', matricula: '2026006', avatar: 'FC' },
        { id: 7, nome: 'Gabriel Souza', turma: '9B', matricula: '2026007', avatar: 'GS' },
        { id: 8, nome: 'Helena Rocha', turma: '9B', matricula: '2026008', avatar: 'HR' },
        { id: 9, nome: 'Igor Ferreira', turma: '9A', matricula: '2026009', avatar: 'IF' },
        { id: 10, nome: 'Julia Martins', turma: '9B', matricula: '2026010', avatar: 'JM' },
        { id: 11, nome: 'Lucas Pereira', turma: '9A', matricula: '2026011', avatar: 'LP' },
        { id: 12, nome: 'Maria Eduarda', turma: '9B', matricula: '2026012', avatar: 'ME' }
    ],
    eventos: {
        '2026-06-05': [
            { id: 101, tipo: 'entrega', titulo: 'Prazo: Trabalhos de Redação', hora: '23:59', turma: '9A' },
            { id: 102, tipo: 'evento', titulo: 'Reunião de Coordenação', hora: '14:00', turma: null }
        ],
        '2026-06-10': [
            { id: 103, tipo: 'prova', titulo: 'Prova de Álgebra - Equações', hora: '08:00', turma: '9B' },
            { id: 104, tipo: 'aula', titulo: 'Aula de Reforço - Matemática', hora: '14:00', turma: '9A' }
        ],
        '2026-06-15': [
            { id: 105, tipo: 'prova', titulo: '📝 Prova Bimestral - 9º Ano', hora: '08:00', turma: 'all' }
        ],
        '2026-06-20': [
            { id: 106, tipo: 'evento', titulo: 'Conselho de Classe', hora: '18:00', turma: null },
            { id: 107, tipo: 'aula', titulo: 'Aula de Geometria', hora: '10:00', turma: '9B' }
        ],
        '2026-06-25': [
            { id: 108, tipo: 'entrega', titulo: 'Entrega: Notas do Bimestre', hora: '17:00', turma: null }
        ]
    },
    aulas: {
        // Aulas recorrentes podem ser armazenadas aqui
        '2026-06-10': [
            { id: 201, titulo: 'Matemática - 9º A', hora: '08:00', duracao: '50min', turma: '9A', conteudo: 'Equações do 2º grau' },
            { id: 202, titulo: 'Álgebra - 9º B', hora: '10:00', duracao: '50min', turma: '9B', conteudo: 'Fatoração' }
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
    // Definir nome do professor
    const nomeEl = document.getElementById('professorName');
    if (nomeEl) nomeEl.textContent = CONFIG.professor.nome;
    
    // Carregar dados
    carregarDados();
    
    // Renderizar interface
    renderizarCalendario();
    renderizarAlunos();
    atualizarDisplayMes();
    preencherSelectTurmas();
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
    
    // Filtro de turma
    document.getElementById('filtroTurma')?.addEventListener('change', (e) => {
        estado.turmaFiltro = e.target.value;
        renderizarAlunos();
    });
    
    // Busca
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        estado.termoBusca = e.target.value.toLowerCase();
        renderizarAlunos();
        renderizarCalendario();
    });
    
    // Modal
    document.querySelector('.close')?.addEventListener('click', fecharModal);
    document.getElementById('dayModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('dayModal')) fecharModal();
    });
    
    // Adicionar evento/aula
    document.getElementById('btnAddEvent')?.addEventListener('click', adicionarItemAgenda);
    
    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') fecharModal();
    });
}

/**
 * Carrega dados do localStorage ou usa dados iniciais
 */
function carregarDados() {
    // Turmas
    const turmasSalvas = localStorage.getItem('aev_prof_turmas');
    estado.turmas = turmasSalvas ? JSON.parse(turmasSalvas) : [...dadosIniciais.turmas];
    
    // Alunos
    const alunosSalvos = localStorage.getItem('aev_prof_alunos');
    estado.alunos = alunosSalvos ? JSON.parse(alunosSalvos) : [...dadosIniciais.alunos];
    
    // Eventos
    const eventosSalvos = localStorage.getItem('aev_prof_eventos');
    estado.eventos = eventosSalvos ? JSON.parse(eventosSalvos) : { ...dadosIniciais.eventos };
    
    // Aulas
    const aulasSalvas = localStorage.getItem('aev_prof_aulas');
    estado.aulas = aulasSalvas ? JSON.parse(aulasSalvas) : { ...dadosIniciais.aulas };
}

/**
 * Salva dados no localStorage
 */
function salvarDados() {
    localStorage.setItem('aev_prof_turmas', JSON.stringify(estado.turmas));
    localStorage.setItem('aev_prof_alunos', JSON.stringify(estado.alunos));
    localStorage.setItem('aev_prof_eventos', JSON.stringify(estado.eventos));
    localStorage.setItem('aev_prof_aulas', JSON.stringify(estado.aulas));
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
    grid.appendChild(criarCelulaVazia());
    
    diasSemana.forEach(dia => {
        const header = document.createElement('div');
        header.className = 'day-header';
        header.setAttribute('role', 'columnheader');
        header.textContent = dia;
        grid.appendChild(header);
    });
    
    // Calcular dias do mês
    const primeiroDia = new Date(estado.anoAtual, estado.mesAtual, 1);
    const ultimoDia = new Date(estado.anoAtual, estado.mesAtual + 1, 0);
    const totalDias = ultimoDia.getDate();
    const diaSemanaInicio = primeiroDia.getDay();
    
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
            
            if (semana === 0 && dia < diaSemanaInicio) {
                celula.classList.add('empty');
            }
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
                
                // Verificar eventos/aulas
                const eventosDoDia = estado.eventos[dataStr] || [];
                const aulasDoDia = estado.aulas[dataStr] || [];
                const itensFiltrados = filtrarItensPorBusca([...eventosDoDia, ...aulasDoDia]);
                
                if (itensFiltrados.length > 0) {
                    celula.classList.add('has-event');
                    
                    // Indicadores visuais por tipo
                    const indicators = document.createElement('div');
                    indicators.className = 'day-events';
                    
                    const tiposVistos = new Set();
                    itensFiltrados.forEach(item => {
                        const tipo = item.tipo || 'evento';
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
            else {
                celula.classList.add('empty');
            }
            
            grid.appendChild(celula);
            if (diaAtual <= totalDias) diaAtual++;
        }
    }
}

function criarCelulaVazia() {
    const celula = document.createElement('div');
    celula.className = 'day-header';
    celula.textContent = 'Sem';
    return celula;
}

function navegarMes(direcao) {
    estado.mesAtual += direcao;
    
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

function atualizarDisplayMes() {
    const display = document.getElementById('currentYearMonth');
    if (display) {
        const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        display.textContent = `${meses[estado.mesAtual]} ${estado.anoAtual}`;
    }
}

function formatarData(ano, mes, dia) {
    const m = String(mes + 1).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${ano}-${m}-${d}`;
}

function isDataHoje(data) {
    const hoje = new Date();
    return data.getDate() === hoje.getDate() &&
           data.getMonth() === hoje.getMonth() &&
           data.getFullYear() === hoje.getFullYear();
}

function filtrarItensPorBusca(itens) {
    if (!estado.termoBusca) return itens;
    
    return itens.filter(item => 
        item.titulo.toLowerCase().includes(estado.termoBusca) ||
        (item.turma && item.turma.toLowerCase().includes(estado.termoBusca))
    );
}

// ========== LISTA DE ALUNOS ==========

/**
 * Renderiza a lista de alunos na sidebar
 */
function renderizarAlunos() {
    const lista = document.getElementById('studentsList');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    // Filtrar alunos
    let alunosFiltrados = estado.alunos;
    
    if (estado.turmaFiltro !== 'all') {
        alunosFiltrados = alunosFiltrados.filter(a => a.turma === estado.turmaFiltro);
    }
    
    if (estado.termoBusca) {
        alunosFiltrados = alunosFiltrados.filter(a => 
            a.nome.toLowerCase().includes(estado.termoBusca) ||
            a.matricula.includes(estado.termoBusca) ||
            a.turma.toLowerCase().includes(estado.termoBusca)
        );
    }
    
    // Ordenar por nome
    alunosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));
    
    if (alunosFiltrados.length === 0) {
        lista.innerHTML = '<p class="no-events" style="padding: 1rem; text-align: center;">Nenhum aluno encontrado.</p>';
        return;
    }
    
    alunosFiltrados.forEach(aluno => {
        const item = document.createElement('div');
        item.className = 'student-item';
        item.setAttribute('role', 'listitem');
        item.setAttribute('tabindex', '0');
        item.dataset.alunoId = aluno.id;
        
        item.innerHTML = `
            <div class="student-avatar" aria-hidden="true">${aluno.avatar || '👤'}</div>
            <div class="student-info">
                <span class="student-name">${aluno.nome}</span>
                <span class="student-turma">${aluno.turma}</span>
            </div>
            <div class="student-actions">
                <button class="btn-student-action" onclick="verPerfilAluno(${aluno.id})" 
                        aria-label="Ver perfil de ${aluno.nome}" title="Ver perfil">👁️</button>
                <button class="btn-student-action" onclick="enviarMensagemAluno(${aluno.id})" 
                        aria-label="Enviar mensagem para ${aluno.nome}" title="Mensagem">💬</button>
            </div>
        `;
        
        // Clique para ver agenda do aluno
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-student-action')) {
                exibirToast(`📋 Visualizando agenda de ${aluno.nome}`, 'info');
            }
        });
        
        // Suporte a teclado
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!e.target.closest('.btn-student-action')) {
                    item.click();
                }
            }
        });
        
        lista.appendChild(item);
    });
}

/**
 * Preenche o select de turmas
 */
function preencherSelectTurmas() {
    const select = document.getElementById('eventTurma');
    if (!select) return;
    
    // Manter primeira opção
    const primeira = select.options[0];
    select.innerHTML = '';
    select.appendChild(primeira);
    
    estado.turmas.forEach(turma => {
        const option = document.createElement('option');
        option.value = turma.id;
        option.textContent = turma.nome;
        select.appendChild(option);
    });
}

function rolarSidebar(pixels) {
    const lista = document.getElementById('studentsList');
    if (lista) {
        lista.scrollBy({ top: pixels, behavior: 'smooth' });
    }
}

// ========== MODAL ==========

function abrirModalDia(dataStr, dataObj) {
    estado.diaSelecionado = dataStr;
    
    // Atualizar título
    const modalTitle = document.getElementById('modalDate');
    if (modalTitle) {
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        modalTitle.textContent = `${dias[dataObj.getDay()]}, ${dataObj.getDate()} de ${meses[dataObj.getMonth()]} de ${dataObj.getFullYear()}`;
    }
    
    // Renderizar conteúdo
    renderizarEventosDoDia(dataStr);
    renderizarAulasDoDia(dataStr);
    
    // Resetar formulário
    resetarFormularioEvento();
    
    // Mostrar modal
    const modal = document.getElementById('dayModal');
    if (modal) {
        modal.hidden = false;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function renderizarEventosDoDia(dataStr) {
    const container = document.getElementById('eventsList');
    if (!container) return;
    
    const eventos = estado.eventos[dataStr] || [];
    const itensFiltrados = filtrarItensPorBusca(eventos);
    
    if (itensFiltrados.length === 0) {
        container.innerHTML = '<p class="no-events">Nenhum evento para este dia.</p>';
        return;
    }
    
    container.innerHTML = itensFiltrados.map(evento => {
        const tipo = CONFIG.tiposEvento[evento.tipo] || CONFIG.tiposEvento.evento;
        return `
            <div class="event-item tipo-${evento.tipo}" role="listitem">
                <div>
                    <span class="event-time">${evento.hora}</span>
                    ${tipo.icone} ${evento.titulo}
                    ${evento.turma ? `<span class="event-turma">${evento.turma}</span>` : ''}
                </div>
                <button class="delete-event" onclick="removerEvento('${dataStr}', '${evento.id}', 'evento')" 
                        aria-label="Remover evento" title="Remover">🗑️</button>
            </div>
        `;
    }).join('');
}

function renderizarAulasDoDia(dataStr) {
    const container = document.getElementById('aulasList');
    if (!container) return;
    
    const aulas = estado.aulas[dataStr] || [];
    const itensFiltrados = filtrarItensPorBusca(aulas);
    
    if (itensFiltrados.length === 0) {
        container.innerHTML = '<p class="no-events">Nenhuma aula para este dia.</p>';
        return;
    }
    
    container.innerHTML = itensFiltrados.map(aula => `
        <div class="event-item tipo-aula" role="listitem">
            <div>
                <span class="event-time">${aula.hora}</span>
                🎓 ${aula.titulo}
                <span class="event-turma">${aula.turma}</span>
                <br><small style="color: var(--color-muted)">${aula.conteudo || ''}</small>
            </div>
            <button class="delete-event" onclick="removerEvento('${dataStr}', '${aula.id}', 'aula')" 
                    aria-label="Remover aula" title="Remover">🗑️</button>
        </div>
    `).join('');
}

function resetarFormularioEvento() {
    const input = document.getElementById('newEventInput');
    const time = document.getElementById('eventTime');
    const turma = document.getElementById('eventTurma');
    
    if (input) input.value = '';
    if (time) time.value = '08:00';
    if (turma) turma.value = '';
    
    // Resetar radio buttons
    document.querySelectorAll('input[name="eventType"]').forEach(radio => {
        if (radio.value === 'evento') radio.checked = true;
    });
}

function fecharModal() {
    const modal = document.getElementById('dayModal');
    if (modal) {
        modal.hidden = true;
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    estado.diaSelecionado = null;
}

// ========== ADICIONAR EVENTOS/AULAS ==========

function adicionarItemAgenda() {
    const input = document.getElementById('newEventInput');
    const time = document.getElementById('eventTime');
    const turma = document.getElementById('eventTurma');
    const tipoRadio = document.querySelector('input[name="eventType"]:checked');
    
    const texto = input?.value.trim();
    const horario = time?.value || '08:00';
    const turmaSelecionada = turma?.value || null;
    const tipo = tipoRadio?.value || 'evento';
    
    if (!texto || !estado.diaSelecionado) {
        exibirToast('⚠️ Digite uma descrição para o item', 'warning');
        return;
    }
    
    // Criar novo item
    const novoItem = {
        id: Date.now(),
        tipo: tipo,
        titulo: texto,
        hora: horario,
        turma: turmaSelecionada,
        dataCriacao: new Date().toISOString()
    };
    
    // Adicionar ao estado correto
    if (tipo === 'aula') {
        if (!estado.aulas[estado.diaSelecionado]) {
            estado.aulas[estado.diaSelecionado] = [];
        }
        estado.aulas[estado.diaSelecionado].push(novoItem);
    } else {
        if (!estado.eventos[estado.diaSelecionado]) {
            estado.eventos[estado.diaSelecionado] = [];
        }
        estado.eventos[estado.diaSelecionado].push(novoItem);
    }
    
    // Salvar e atualizar
    salvarDados();
    
    if (tipo === 'aula') {
        renderizarAulasDoDia(estado.diaSelecionado);
    } else {
        renderizarEventosDoDia(estado.diaSelecionado);
    }
    
    renderizarCalendario();
    
    // Resetar e feedback
    resetarFormularioEvento();
    exibirToast(`✅ ${CONFIG.tiposEvento[tipo].label} adicionado!`, 'success');
}

function removerEvento(dataStr, itemId, tipo) {
    const collection = tipo === 'aula' ? estado.aulas : estado.eventos;
    
    if (!collection[dataStr]) return;
    
    collection[dataStr] = collection[dataStr].filter(item => item.id != itemId);
    
    // Remover array vazio
    if (collection[dataStr].length === 0) {
        delete collection[dataStr];
    }
    
    salvarDados();
    
    if (tipo === 'aula') {
        renderizarAulasDoDia(dataStr);
    } else {
        renderizarEventosDoDia(dataStr);
    }
    
    renderizarCalendario();
    exibirToast('🗑️ Item removido da agenda', 'info');
}

// ========== FUNÇÕES DE AÇÃO PARA ALUNOS ==========

function verPerfilAluno(alunoId) {
    const aluno = estado.alunos.find(a => a.id === alunoId);
    if (aluno) {
        exibirToast(`👁️ Visualizando perfil de ${aluno.nome}`, 'info');
        // Em produção: window.location.href = `perfil-aluno.html?id=${alunoId}`;
    }
}

function enviarMensagemAluno(alunoId) {
    const aluno = estado.alunos.find(a => a.id === alunoId);
    if (aluno) {
        exibirToast(`💬 Abrindo chat com ${aluno.nome}...`, 'info');
        // Em produção: abrir modal de mensagem ou redirecionar
    }
}

// ========== UTILITÁRIOS ==========

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
window.adicionarItemAgenda = adicionarItemAgenda;
window.verPerfilAluno = verPerfilAluno;
window.enviarMensagemAluno = enviarMensagemAluno;