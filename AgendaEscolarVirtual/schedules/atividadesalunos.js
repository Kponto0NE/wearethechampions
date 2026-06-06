/**
 * 🎓 Atividades do Aluno - Agenda Escolar Virtual
 * Módulo: atividades-aluno.js
 */

'use strict';

// ========== DADOS DO ALUNO (Simulação - Substituir por API) ==========
const dadosAluno = {
    nome: 'João Silva',
    turma: '9º Ano B',
    matricula: '2026001'
};

// ========== LISTA DE ATIVIDADES (Simulação - Substituir por fetch) ==========
const atividades = [
    {
        id: 1,
        titulo: 'Lista de Exercícios - Equações do 2º Grau',
        disciplina: 'Matemática',
        professor: 'Prof. Ana Souza',
        dataEnvio: '10/05/2026',
        dataEntrega: '25/05/2026',
        status: 'nova',
        pdfUrl: '/pdfs/atividade_mat_eq2grau.pdf',
        descricao: 'Resolver os exercícios 1 a 15 da página 42. Entregar em PDF com resolução completa.'
    },
    {
        id: 2,
        titulo: 'Redação: Tema "Tecnologia e Sociedade"',
        disciplina: 'Português',
        professor: 'Prof. Carlos Lima',
        dataEnvio: '08/05/2026',
        dataEntrega: '20/05/2026',
        status: 'visualizada',
        pdfUrl: '/pdfs/atividade_port_redacao.pdf',
        descricao: 'Redação dissertativo-argumentativa com mínimo de 25 linhas. Seguir estrutura ENEM.'
    },
    {
        id: 3,
        titulo: 'Pesquisa: Revolução Industrial',
        disciplina: 'História',
        professor: 'Profª. Mariana Costa',
        dataEnvio: '01/05/2026',
        dataEntrega: '15/05/2026',
        status: 'entregue',
        pdfUrl: '/pdfs/atividade_hist_revolucao.pdf',
        respostaUrl: '/pdfs/resposta_joao_hist.pdf',
        descricao: 'Pesquisa sobre impactos da Revolução Industrial. Mínimo 2 páginas com fontes.'
    },
    {
        id: 4,
        titulo: 'Mapa Mental: Biomas Brasileiros',
        disciplina: 'Geografia',
        professor: 'Prof. Roberto Alves',
        dataEnvio: '05/05/2026',
        dataEntrega: '18/05/2026',
        status: 'atrasada',
        pdfUrl: '/pdfs/atividade_geo_biomas.pdf',
        descricao: 'Criar mapa mental com características dos 6 biomas. Entregar em PDF ou imagem.'
    }
];

// ========== VARIÁVEIS DE CONTROLE ==========
let atividadeSelecionada = null;
let arquivoEntrega = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarPerfil();
    renderizarAtividades();
    configurarDropZone();
    configurarFechamentoModais();
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

// ========== RENDERIZAÇÃO DE ATIVIDADES ==========
function renderizarAtividades() {
    const container = document.getElementById('atividades-container');
    if (!container) return;
    
    const filtros = obterFiltros();
    const atividadesFiltradas = filtrarAtividades(filtros);
    
    container.innerHTML = '';
    
    if (atividadesFiltradas.length === 0) {
        container.innerHTML = criarEstadoVazio();
        return;
    }
    
    // Ordenar: pendentes primeiro, depois por data de entrega
    atividadesFiltradas.sort((a, b) => {
        const pendentes = ['nova', 'visualizada', 'atrasada'];
        const aPendente = pendentes.includes(a.status) ? 0 : 1;
        const bPendente = pendentes.includes(b.status) ? 0 : 1;
        if (aPendente !== bPendente) return aPendente - bPendente;
        return compararDatas(a.dataEntrega, b.dataEntrega);
    });
    
    atividadesFiltradas.forEach(atividade => {
        container.appendChild(criarCardAtividade(atividade));
    });
}

/**
 * Obtém valores dos filtros
 * @returns {Object} Filtros aplicados
 */
function obterFiltros() {
    return {
        disciplina: document.getElementById('filtro-disciplina')?.value || 'all',
        status: document.getElementById('filtro-status')?.value || 'all',
        busca: document.getElementById('busca-atividade')?.value.toLowerCase() || ''
    };
}

/**
 * Filtra atividades conforme critérios
 * @param {Object} filtros 
 * @returns {Array} Atividades filtradas
 */
function filtrarAtividades(filtros) {
    return atividades.filter(a => {
        const matchDisciplina = filtros.disciplina === 'all' || 
            a.disciplina.toLowerCase().includes(filtros.disciplina);
        const matchStatus = filtros.status === 'all' || a.status === filtros.status;
        const matchBusca = a.titulo.toLowerCase().includes(filtros.busca) || 
            a.professor.toLowerCase().includes(filtros.busca);
        return matchDisciplina && matchStatus && matchBusca;
    });
}

/**
 * Compara duas datas no formato DD/MM/YYYY
 * @param {string} dataA 
 * @param {string} dataB 
 * @returns {number}
 */
function compararDatas(dataA, dataB) {
    const parseDate = (d) => new Date(d.split('/').reverse().join('-'));
    return parseDate(dataA) - parseDate(dataB);
}

/**
 * Cria HTML para estado vazio
 * @returns {string}
 */
function criarEstadoVazio() {
    return `
        <div class="empty-state" role="status">
            <span class="icon" aria-hidden="true">📭</span>
            <p>Nenhuma atividade encontrada com os filtros selecionados.</p>
        </div>
    `;
}

/**
 * Cria elemento card de atividade
 * @param {Object} atividade 
 * @returns {HTMLElement}
 */
function criarCardAtividade(atividade) {
    const card = document.createElement('article');
    card.className = `atividade-card${atividade.status === 'atrasada' ? ' atrasada' : ''}${atividade.status === 'entregue' ? ' entregue' : ''}`;
    card.setAttribute('role', 'listitem');
    
    const labels = { 
        nova: '🔵 Nova', 
        visualizada: '🟡 Visualizada', 
        entregue: '🟢 Entregue', 
        atrasada: '🔴 Atrasada' 
    };
    const classes = { 
        nova: 'status-nova', 
        visualizada: 'status-visualizada', 
        entregue: 'status-entregue', 
        atrasada: 'status-atrasada' 
    };
    
    card.innerHTML = `
        <div class="atividade-info">
            <h3>${atividade.titulo}</h3>
            <p><strong>${atividade.disciplina}</strong> • ${atividade.professor}</p>
            <div class="atividade-meta">
                <span>📅 Entrega: ${atividade.dataEntrega}</span>
                <span>📨 Enviada: ${atividade.dataEnvio}</span>
            </div>
            <span class="status-badge ${classes[atividade.status]}">${labels[atividade.status]}</span>
        </div>
        <div class="atividade-actions">
            <button type="button" class="btn btn-primary" onclick="abrirDetalhes(${atividade.id})">
                📋 Detalhes
            </button>
            ${atividade.status !== 'entregue' 
                ? `<button type="button" class="btn btn-success" onclick="abrirEntrega(${atividade.id})">📤 Entregar</button>` 
                : `<button type="button" class="btn btn-secondary" disabled aria-label="Atividade já entregue">✓ Entregue</button>`
            }
        </div>
    `;
    
    return card;
}

// ========== FILTROS ==========
function aplicarFiltros(e) {
    if (e) e.preventDefault();
    renderizarAtividades();
    return false;
}

function filtrarPendentes() {
    const select = document.getElementById('filtro-status');
    if (select) {
        select.value = 'nova';
        renderizarAtividades();
    }
}

// ========== MODAL: DETALHES ==========
function abrirDetalhes(id) {
    atividadeSelecionada = atividades.find(a => a.id === id);
    if (!atividadeSelecionada) return;
    
    const body = document.getElementById('modal-detalhes-body');
    if (!body) return;
    
    body.innerHTML = `
        <p><strong>Disciplina:</strong> ${atividadeSelecionada.disciplina}</p>
        <p><strong>Professor:</strong> ${atividadeSelecionada.professor}</p>
        <p><strong>Descrição:</strong> ${atividadeSelecionada.descricao}</p>
        <p><strong>Entrega até:</strong> ${atividadeSelecionada.dataEntrega}</p>
        ${atividadeSelecionada.status === 'entregue' && atividadeSelecionada.respostaUrl 
            ? `<p><strong>Sua resposta:</strong> <a href="${atividadeSelecionada.respostaUrl}" target="_blank" rel="noopener">📄 Ver arquivo enviado</a></p>` 
            : ''}
    `;
    
    const btnPdf = document.getElementById('btn-visualizar-pdf');
    if (btnPdf) {
        btnPdf.onclick = () => abrirVisualizadorPdf(atividadeSelecionada.pdfUrl, atividadeSelecionada.titulo);
    }
    
    const modal = document.getElementById('modal-detalhes');
    if (modal) {
        modal.hidden = false;
        modal.style.display = 'block';
    }
}

// ========== MODAL: VISUALIZADOR PDF ==========
function abrirVisualizadorPdf(url, titulo) {
    fecharModal('modal-detalhes');
    
    const frame = document.getElementById('pdf-frame');
    const title = document.getElementById('modal-pdf-title');
    const download = document.getElementById('pdf-download');
    const modal = document.getElementById('modal-pdf');
    
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
    const modal = document.getElementById('modal-pdf');
    const frame = document.getElementById('pdf-frame');
    
    if (modal) {
        modal.hidden = true;
        modal.style.display = 'none';
    }
    if (frame) frame.src = '';
    document.body.style.overflow = '';
}

// ========== MODAL: ENTREGA (UPLOAD) ==========
function abrirEntrega(id) {
    atividadeSelecionada = atividades.find(a => a.id === id);
    if (!atividadeSelecionada) return;
    
    // Resetar estado do modal
    document.getElementById('entrega-aluno').textContent = dadosAluno.nome;
    document.getElementById('entrega-atividade').textContent = atividadeSelecionada.titulo;
    arquivoEntrega = null;
    
    const fileInfo = document.getElementById('file-info-entrega');
    const progress = document.getElementById('progress-entrega');
    const btnConfirmar = document.getElementById('btn-confirmar-entrega');
    const fileInput = document.getElementById('file-entrega');
    
    if (fileInfo) fileInfo.style.display = 'none';
    if (progress) progress.style.display = 'none';
    if (btnConfirmar) btnConfirmar.disabled = true;
    if (fileInput) fileInput.value = '';
    
    const modal = document.getElementById('modal-entrega');
    if (modal) {
        modal.hidden = false;
        modal.style.display = 'block';
    }
}

function configurarDropZone() {
    const dropZone = document.getElementById('drop-zone-entrega');
    const fileInput = document.getElementById('file-entrega');
    
    if (!dropZone || !fileInput) return;
    
    // Clique para abrir seletor
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
        }
    });
    
    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        processarArquivoEntrega(e.dataTransfer.files[0]);
    });
    
    // Seleção via input
    fileInput.addEventListener('change', () => {
        processarArquivoEntrega(fileInput.files[0]);
    });
}

function processarArquivoEntrega(file) {
    if (!file) return;
    
    // Validar tipo
    if (file.type !== 'application/pdf') {
        exibirToast('⚠️ Apenas arquivos PDF são aceitos.', 'warning');
        return;
    }
    
    // Validar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
        exibirToast('⚠️ O arquivo deve ter no máximo 10MB.', 'warning');
        return;
    }
    
    // Arquivo válido
    arquivoEntrega = file;
    
    document.getElementById('file-name-entrega').textContent = file.name;
    document.getElementById('file-size-entrega').textContent = (file.size / (1024 * 1024)).toFixed(2);
    document.getElementById('file-info-entrega').style.display = 'block';
    document.getElementById('btn-confirmar-entrega').disabled = false;
    
    exibirToast('✅ Arquivo selecionado!', 'success');
}

function confirmarEntrega() {
    if (!arquivoEntrega || !atividadeSelecionada) return;
    
    const btnConfirmar = document.getElementById('btn-confirmar-entrega');
    const progressWrapper = document.getElementById('progress-entrega');
    const progressBar = document.getElementById('progress-bar-entrega');
    
    if (btnConfirmar) btnConfirmar.disabled = true;
    if (progressWrapper) progressWrapper.style.display = 'block';
    
    // Simular upload com progress bar
    let progresso = 0;
    const intervalo = setInterval(() => {
        progresso += 10;
        if (progressBar) progressBar.style.width = `${progresso}%`;
        
        if (progresso >= 100) {
            clearInterval(intervalo);
            setTimeout(() => {
                // Atualizar status da atividade
                atividadeSelecionada.status = 'entregue';
                atividadeSelecionada.respostaUrl = `/respostas/${dadosAluno.matricula}_ativ${atividadeSelecionada.id}.pdf`;
                
                exibirToast('✅ Atividade entregue com sucesso!', 'success');
                fecharModal('modal-entrega');
                renderizarAtividades();
            }, 400);
        }
    }, 150);
}

// ========== UTILITÁRIOS ==========
function fecharModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.hidden = true;
        modal.style.display = 'none';
    }
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
function configurarFechamentoModais() {
    // Fechar ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal(modal.id);
                if (modal.id === 'modal-pdf') {
                    fecharVisualizadorPdf();
                }
            }
        });
    });
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal('modal-detalhes');
            fecharModal('modal-entrega');
            fecharVisualizadorPdf();
        }
    });
}