/**
 * 🎓 Meus Boletins - Agenda Escolar Virtual
 * Módulo: boletins-aluno.js
 * Perfil: Aluno
 */

'use strict';

// ========== DADOS DO ALUNO (Simulação - Substituir por API) ==========
const dadosAluno = {
    nome: 'João Silva',
    turma: '9º Ano B',
    matricula: '2026001'
};

// ========== LISTA DE BOLETINS (Simulação - Substituir por fetch) ==========
const boletins = [
    { id: 1, periodo: "1º Bimestre", ano: "2026", dataLiberacao: "15/04/2026", url: "/pdfs/boletim_2026_1b.pdf" },
    { id: 2, periodo: "2º Bimestre", ano: "2026", dataLiberacao: "20/07/2026", url: "/pdfs/boletim_2026_2b.pdf" },
    { id: 3, periodo: "1º Semestre", ano: "2025", dataLiberacao: "10/01/2026", url: "/pdfs/boletim_2025_1s.pdf" },
    { id: 4, periodo: "2º Semestre", ano: "2025", dataLiberacao: "15/12/2025", url: "/pdfs/boletim_2025_2s.pdf" }
];

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarPerfil();
    renderizarBoletins();
    configurarFechamentoModal();
});

/**
 * Preenche os dados do aluno na interface
 */
function inicializarPerfil() {
    const nomeEl = document.getElementById('aluno-nome');
    const turmaEl = document.getElementById('turma-info');
    
    if (nomeEl) nomeEl.textContent = dadosAluno.nome;
    if (turmaEl) turmaEl.textContent = `${dadosAluno.turma} • Matrícula: ${dadosAluno.matricula}`;
}

// ========== RENDERIZAÇÃO DOS BOLETINS ==========
function renderizarBoletins() {
    const grid = document.getElementById('boletinsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (boletins.length === 0) {
        grid.innerHTML = criarEstadoVazio();
        return;
    }
    
    // Ordenar por ano (mais recente primeiro) e depois por período
    const boletinsOrdenados = [...boletins].sort((a, b) => {
        if (b.ano !== a.ano) return parseInt(b.ano) - parseInt(a.ano);
        return b.periodo.localeCompare(a.periodo);
    });
    
    boletinsOrdenados.forEach(boletim => {
        grid.appendChild(criarCardBoletim(boletim));
    });
}

/**
 * Cria HTML para estado vazio
 * @returns {string}
 */
function criarEstadoVazio() {
    return `
        <div class="empty-state" role="status">
            <span class="icon" aria-hidden="true">📭</span>
            <p>Nenhum boletim disponível no momento.</p>
        </div>
    `;
}

/**
 * Cria elemento card de boletim
 * @param {Object} boletim 
 * @returns {HTMLElement}
 */
function criarCardBoletim(boletim) {
    const card = document.createElement('article');
    card.className = 'boletim-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('aria-label', `Boletim ${boletim.periodo} de ${boletim.ano}`);
    
    card.innerHTML = `
        <div class="boletim-period">${boletim.ano}</div>
        <div class="boletim-title">${boletim.periodo}</div>
        <div class="boletim-meta">📅 Liberado em: ${boletim.dataLiberacao}</div>
        <div class="btn-group">
            <button type="button" class="btn btn-primary" onclick="abrirVisualizadorPdf('${boletim.url}', '${boletim.periodo} ${boletim.ano}')">
                👁 Visualizar
            </button>
            <a href="${boletim.url}" download class="btn btn-download" aria-label="Baixar boletim ${boletim.periodo} ${boletim.ano}">
                ⬇️ Baixar
            </a>
        </div>
    `;
    
    return card;
}

// ========== MODAL: VISUALIZADOR PDF ==========
function abrirVisualizadorPdf(url, titulo) {
    const frame = document.getElementById('pdfFrame');
    const title = document.getElementById('modal-pdf-title');
    const download = document.getElementById('modal-download');
    const modal = document.getElementById('pdfModal');
    
    if (frame) frame.src = url;
    if (title) title.textContent = `📄 ${titulo}`;
    if (download) download.href = url;
    if (modal) {
        modal.hidden = false;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function fecharVisualizadorPdf() {
    const modal = document.getElementById('pdfModal');
    const frame = document.getElementById('pdfFrame');
    
    if (modal) {
        modal.hidden = true;
        modal.style.display = 'none';
    }
    if (frame) frame.src = '';
    document.body.style.overflow = '';
}

// ========== FUNÇÕES AUXILIARES ==========
function baixarTodos() {
    exibirToast('📦 Preparando download de todos os boletins...', 'info');
    // Em produção: chamar endpoint que gera ZIP com todos os PDFs
    // fetch('/api/aluno/boletins/download-all')...
}

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
    const modal = document.getElementById('pdfModal');
    if (!modal) return;
    
    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            fecharVisualizadorPdf();
        }
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharVisualizadorPdf();
        }
    });
}