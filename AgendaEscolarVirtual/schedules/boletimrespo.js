/**
 * 👨‍👩‍👧‍👦 Boletins dos Filhos - Agenda Escolar Virtual
 * Módulo: boletins-responsavel.js
 * Perfil: Responsável
 */

'use strict';

// ========== DADOS DO RESPONSÁVEL (Simulação - Substituir por API) ==========
const dadosResponsavel = {
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    filhos: [
        { id: 1, nome: 'João Silva', matricula: '2026001' },
        { id: 2, nome: 'Ana Silva', matricula: '2026045' }
    ]
};

// ========== LISTA DE BOLETINS (Simulação - Substituir por fetch) ==========
const boletins = [
    { 
        id: 1, 
        filhoId: 1,
        filhoNome: 'João Silva',
        periodo: "1º Bimestre", 
        ano: "2026", 
        dataLiberacao: "15/04/2026", 
        url: "/pdfs/boletim_joao_2026_1b.pdf" 
    },
    { 
        id: 2, 
        filhoId: 1,
        filhoNome: 'João Silva',
        periodo: "2º Bimestre", 
        ano: "2026", 
        dataLiberacao: "20/07/2026", 
        url: "/pdfs/boletim_joao_2026_2b.pdf" 
    },
    { 
        id: 3, 
        filhoId: 2,
        filhoNome: 'Ana Silva',
        periodo: "1º Bimestre", 
        ano: "2026", 
        dataLiberacao: "15/04/2026", 
        url: "/pdfs/boletim_ana_2026_1b.pdf" 
    },
    { 
        id: 4, 
        filhoId: 2,
        filhoNome: 'Ana Silva',
        periodo: "2º Bimestre", 
        ano: "2026", 
        dataLiberacao: "20/07/2026", 
        url: "/pdfs/boletim_ana_2026_2b.pdf" 
    }
];

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarPerfil();
    renderizarBoletins();
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
    card.setAttribute('aria-label', `Boletim de ${boletim.filhoNome}: ${boletim.periodo} de ${boletim.ano}`);
    
    card.innerHTML = `
        <div class="boletim-period">${boletim.ano}</div>
        <div class="boletim-title">${boletim.filhoNome} • ${boletim.periodo}</div>
        <div class="boletim-meta">📅 Liberado em: ${boletim.dataLiberacao}</div>
        <div class="btn-group">
            <button type="button" class="btn btn-primary" onclick="abrirVisualizadorPdf('${boletim.url}', '${boletim.filhoNome} - ${boletim.periodo} ${boletim.ano}')">
                👁 Visualizar
            </button>
            <a href="${boletim.url}" download class="btn btn-download" aria-label="Baixar boletim de ${boletim.filhoNome}">
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
    // fetch('/api/responsavel/boletins/download-all')...
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