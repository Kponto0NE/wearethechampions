/**
 * 👨‍👩‍👧‍👦 Desempenho dos Filhos - Agenda Escolar Virtual
 * Módulo: desempenho-filhos.js
 * Perfil: Responsável
 */

'use strict';

// ========== DADOS DO RESPONSÁVEL (Simulação - Substituir por API) ==========
const dadosResponsavel = {
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    filhos: [
        {
            id: 1,
            nome: 'João Silva',
            turma: '9º Ano B',
            matricula: '2026001',
            avatar: 'JS',
            mediaGeral: 8.4,
            frequencia: 96,
            atividadesPendentes: 2,
            atividadesEntregues: 12,
            desempenho: 'bom',
            disciplinas: [
                { nome: 'Matemática', nota: 9.2, status: 'alta' },
                { nome: 'Português', nota: 8.5, status: 'alta' },
                { nome: 'História', nota: 7.8, status: 'media' },
                { nome: 'Ciências', nota: 8.0, status: 'media' },
                { nome: 'Inglês', nota: 9.5, status: 'alta' }
            ]
        },
        {
            id: 2,
            nome: 'Ana Silva',
            turma: '6º Ano A',
            matricula: '2026045',
            avatar: 'AS',
            mediaGeral: 9.3,
            frequencia: 99,
            atividadesPendentes: 0,
            atividadesEntregues: 15,
            desempenho: 'excelente',
            disciplinas: [
                { nome: 'Matemática', nota: 9.8, status: 'alta' },
                { nome: 'Português', nota: 9.5, status: 'alta' },
                { nome: 'História', nota: 9.0, status: 'alta' },
                { nome: 'Ciências', nota: 9.2, status: 'alta' },
                { nome: 'Arte', nota: 10.0, status: 'alta' }
            ]
        },
        {
            id: 3,
            nome: 'Pedro Silva',
            turma: '3º Ano EM',
            matricula: '2024112',
            avatar: 'PS',
            mediaGeral: 6.1,
            frequencia: 78,
            atividadesPendentes: 5,
            atividadesEntregues: 6,
            desempenho: 'atencao',
            disciplinas: [
                { nome: 'Matemática', nota: 5.5, status: 'baixa' },
                { nome: 'Português', nota: 7.2, status: 'media' },
                { nome: 'Física', nota: 4.8, status: 'baixa' },
                { nome: 'Química', nota: 6.5, status: 'media' },
                { nome: 'Biologia', nota: 7.0, status: 'media' }
            ]
        }
    ]
};

// ========== VARIÁVEIS DE CONTROLE ==========
let filhoSelecionado = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarPerfil();
    renderizarFilhos();
    configurarFechamentoModal();
});

/**
 * Preenche os dados do responsável na interface
 */
function inicializarPerfil() {
    const nomeEl = document.getElementById('responsavel-nome');
    const emailEl = document.getElementById('responsavel-email');
    
    if (nomeEl) nomeEl.textContent = dadosResponsavel.nome;
    if (emailEl) emailEl.textContent = dadosResponsavel.email;
}

// ========== RENDERIZAÇÃO DOS CARDS ==========
function renderizarFilhos(filtro = 'todos') {
    const container = document.getElementById('filhos-container');
    if (!container) return;
    
    const filhosFiltrados = filtrarFilhos(filtro);
    
    container.innerHTML = '';
    
    if (filhosFiltrados.length === 0) {
        container.innerHTML = criarEstadoVazio();
        return;
    }
    
    filhosFiltrados.forEach(filho => {
        container.appendChild(criarCardFilho(filho));
    });
}

/**
 * Filtra filhos conforme critério selecionado
 * @param {string} tipo - Tipo de filtro
 * @returns {Array} Filhos filtrados
 */
function filtrarFilhos(tipo) {
    let filhos = dadosResponsavel.filhos;
    
    switch (tipo) {
        case 'pendentes':
            return filhos.filter(f => f.atividadesPendentes > 0 || f.frequencia < 85);
        case 'excelente':
            return filhos.filter(f => f.desempenho === 'excelente');
        case 'atencao':
            return filhos.filter(f => f.desempenho === 'atencao' || f.frequencia < 80);
        default:
            return filhos;
    }
}

/**
 * Cria HTML para estado vazio
 * @returns {string}
 */
function criarEstadoVazio() {
    return `
        <div class="empty-state" role="status">
            <span class="icon" aria-hidden="true">🔍</span>
            <p>Nenhum filho encontrado com este filtro.</p>
        </div>
    `;
}

/**
 * Cria elemento card de filho
 * @param {Object} filho 
 * @returns {HTMLElement}
 */
function criarCardFilho(filho) {
    const card = document.createElement('article');
    card.className = `filho-card ${definirClasseDestaque(filho)}`;
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `Ver detalhes de ${filho.nome}`);
    
    // Evento de clique e teclado
    card.addEventListener('click', () => abrirDetalhes(filho.id));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            abrirDetalhes(filho.id);
        }
    });
    
    const percentual = Math.min(100, Math.max(0, filho.mediaGeral * 10));
    const classeBarra = definirClassePerformance(filho.mediaGeral);
    const corPendentes = filho.atividadesPendentes > 0 ? 'var(--color-danger)' : 'var(--color-success)';
    
    card.innerHTML = `
        <div class="filho-header">
            <div class="filho-avatar" aria-hidden="true">${filho.avatar}</div>
            <div class="filho-nome">
                <h3>${filho.nome}</h3>
                <p>${filho.turma} • Matrícula: ${filho.matricula}</p>
            </div>
        </div>
        
        <div class="filho-stats">
            <div class="stat-item">
                <span class="stat-value">${filho.mediaGeral.toFixed(1)}</span>
                <span class="stat-label">Média</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${filho.frequencia}%</span>
                <span class="stat-label">Frequência</span>
            </div>
            <div class="stat-item">
                <span class="stat-value" style="color:${corPendentes}">
                    ${filho.atividadesPendentes}
                </span>
                <span class="stat-label">Pendentes</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${filho.atividadesEntregues}</span>
                <span class="stat-label">Entregues</span>
            </div>
        </div>

        <div class="performance-label">
            <span>Desempenho Geral</span>
            <strong>${filho.mediaGeral.toFixed(1)}/10</strong>
        </div>
        <div class="performance-bar" role="progressbar" 
             aria-valuenow="${filho.mediaGeral * 10}" 
             aria-valuemin="0" 
             aria-valuemax="100"
             aria-label="Barra de desempenho: ${filho.mediaGeral.toFixed(1)} de 10">
            <div class="performance-fill ${classeBarra}" style="width: ${percentual}%"></div>
        </div>

        <div class="filho-actions" onclick="event.stopPropagation()">
            <button type="button" class="btn btn-primary" onclick="abrirDetalhes(${filho.id})">
                📊 Detalhes
            </button>
            <button type="button" class="btn btn-outline" onclick="abrirBoletinsFilho(${filho.id})">
                📘 Boletins
            </button>
        </div>
    `;
    
    return card;
}

/**
 * Define classe CSS de destaque conforme desempenho
 * @param {Object} filho 
 * @returns {string}
 */
function definirClasseDestaque(filho) {
    if (filho.desempenho === 'excelente') return 'destaque';
    if (filho.desempenho === 'atencao') return 'alerta';
    if (filho.atividadesPendentes > 0) return 'atencao';
    return '';
}

/**
 * Define classe da barra de performance conforme média
 * @param {number} media 
 * @returns {string}
 */
function definirClassePerformance(media) {
    if (media >= 9) return 'excelente';
    if (media >= 7) return 'bom';
    if (media >= 5) return 'regular';
    return 'atencao';
}

// ========== FILTROS ==========
function filtrarPor(tipo) {
    // Atualizar estado dos botões
    document.querySelectorAll('.filters-row .btn-outline').forEach(btn => {
        btn.setAttribute('aria-pressed', 'false');
        btn.classList.remove('active');
    });
    event.currentTarget.setAttribute('aria-pressed', 'true');
    event.currentTarget.classList.add('active');
    
    renderizarFilhos(tipo);
}

// ========== MODAL: DETALHES ==========
function abrirDetalhes(id) {
    filhoSelecionado = dadosResponsavel.filhos.find(f => f.id === id);
    if (!filhoSelecionado) return;
    
    // Preencher informações gerais
    document.getElementById('modal-detalhes-title').textContent = `📊 ${filhoSelecionado.nome}`;
    document.getElementById('det-turma').textContent = filhoSelecionado.turma;
    document.getElementById('det-matricula').textContent = filhoSelecionado.matricula;
    document.getElementById('det-media').textContent = `${filhoSelecionado.mediaGeral.toFixed(1)}/10`;
    document.getElementById('det-frequencia').textContent = `${filhoSelecionado.frequencia}%`;
    document.getElementById('det-atividades').textContent = 
        `${filhoSelecionado.atividadesEntregues} entregues • ${filhoSelecionado.atividadesPendentes} pendentes`;
    
    // Renderizar disciplinas
    renderizarDisciplinas();
    
    // Exibir modal
    const modal = document.getElementById('modal-detalhes');
    if (modal) {
        modal.hidden = false;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Renderiza lista de disciplinas no modal
 */
function renderizarDisciplinas() {
    const container = document.getElementById('det-disciplinas');
    if (!container || !filhoSelecionado) return;
    
    container.innerHTML = filhoSelecionado.disciplinas.map(d => `
        <div class="disciplina-row" role="listitem">
            <span class="disciplina-nome">${d.nome}</span>
            <span class="disciplina-nota nota-${d.status}" aria-label="Nota ${d.nota.toFixed(1)}">
                ${d.nota.toFixed(1)}
            </span>
        </div>
    `).join('');
}

function fecharModal() {
    const modal = document.getElementById('modal-detalhes');
    if (modal) {
        modal.hidden = true;
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    filhoSelecionado = null;
}

// ========== AÇÕES DO MODAL ==========
function abrirBoletins() {
    if (!filhoSelecionado) return;
    exibirToast(`📘 Abrindo boletins de ${filhoSelecionado.nome}...`, 'info');
    // Em produção: window.location.href = `boletins.html?aluno=${filhoSelecionado.matricula}`;
}

function abrirBoletinsFilho(id) {
    const filho = dadosResponsavel.filhos.find(f => f.id === id);
    if (filho) {
        exibirToast(`📘 Abrindo boletins de ${filho.nome}...`, 'info');
    }
}

function abrirAtividades() {
    if (!filhoSelecionado) return;
    exibirToast(`📋 Abrindo atividades de ${filhoSelecionado.nome}...`, 'info');
    // Em produção: window.location.href = `atividades.html?aluno=${filhoSelecionado.matricula}`;
}

function contatarProfessor() {
    if (!filhoSelecionado) return;
    exibirToast(`✉️ Redirecionando para contato com professores de ${filhoSelecionado.turma}...`, 'info');
}

function exportarRelatorioGeral() {
    exibirToast('📥 Gerando relatório consolidado de todos os filhos...', 'info');
    // Em produção: chamar API de exportação
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

function voltar() {
    window.history.back();
}

function sair() {
    // Em produção: implementar logout real
    window.location.href = '../login.html';
}

// ========== EVENTOS GLOBAIS ==========
function configurarFechamentoModal() {
    const modal = document.getElementById('modal-detalhes');
    if (!modal) return;
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharModal();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });
}