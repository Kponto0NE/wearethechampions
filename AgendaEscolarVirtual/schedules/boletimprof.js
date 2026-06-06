/**
 * 👨‍🏫 Lançamento de Boletins - Agenda Escolar Virtual
 * Módulo: lancamento-boletins.js
 * Perfil: Professor
 */

'use strict';

// ========== ESTADO DA APLICAÇÃO (Simulação - Substituir por API) ==========
const estado = {
    professor: 'Prof. Ana Souza',
    periodo: '2º Bimestre 2026',
    alunos: [
        { id: 1, nome: 'João Silva', turma: '9B', matricula: '2026001', status: 'pending', pdf: null },
        { id: 2, nome: 'Maria Oliveira', turma: '9A', matricula: '2026002', status: 'uploaded', pdf: 'boletim_maria.pdf' },
        { id: 3, nome: 'Pedro Santos', turma: '9B', matricula: '2026003', status: 'sent', pdf: 'boletim_pedro.pdf' },
        { id: 4, nome: 'Ana Costa', turma: '8A', matricula: '2026004', status: 'pending', pdf: null },
        { id: 5, nome: 'Lucas Ferreira', turma: '9A', matricula: '2026005', status: 'uploaded', pdf: 'boletim_lucas.pdf' },
        { id: 6, nome: 'Sofia Mendes', turma: '9B', matricula: '2026006', status: 'sent', pdf: 'boletim_sofia.pdf' }
    ]
};

// ========== VARIÁVEIS DE CONTROLE ==========
let alunoSelecionado = null;
let arquivoSelecionado = null;

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarPerfil();
    renderizarAlunos();
    configurarDropZone();
    configurarFechamentoModal();
});

/**
 * Preenche os dados do professor na interface
 */
function inicializarPerfil() {
    const nomeEl = document.getElementById('professor-nome');
    const periodoEl = document.getElementById('periodo-letivo');
    
    if (nomeEl) nomeEl.textContent = estado.professor;
    if (periodoEl) periodoEl.textContent = estado.periodo;
}

// ========== RENDERIZAÇÃO DE ALUNOS ==========
function renderizarAlunos() {
    const container = document.getElementById('alunos-container');
    if (!container) return;
    
    const filtros = obterFiltros();
    const alunosFiltrados = filtrarAlunos(filtros);
    
    container.innerHTML = '';
    
    if (alunosFiltrados.length === 0) {
        container.innerHTML = criarEstadoVazio();
        return;
    }
    
    alunosFiltrados.forEach(aluno => {
        container.appendChild(criarCardAluno(aluno));
    });
}

/**
 * Obtém valores dos filtros
 * @returns {Object} Filtros aplicados
 */
function obterFiltros() {
    return {
        turma: document.getElementById('filtro-turma')?.value || 'all',
        busca: document.getElementById('busca-aluno')?.value.toLowerCase() || ''
    };
}

/**
 * Filtra alunos conforme critérios
 * @param {Object} filtros 
 * @returns {Array} Alunos filtrados
 */
function filtrarAlunos(filtros) {
    return estado.alunos.filter(a => {
        const matchTurma = filtros.turma === 'all' || a.turma === filtros.turma;
        const matchBusca = a.nome.toLowerCase().includes(filtros.busca) || 
            a.matricula.includes(filtros.busca);
        return matchTurma && matchBusca;
    });
}

/**
 * Cria HTML para estado vazio
 * @returns {string}
 */
function criarEstadoVazio() {
    return `
        <div class="empty-state" role="status">
            <span class="icon" aria-hidden="true">🔍</span>
            <p>Nenhum aluno encontrado com os filtros selecionados.</p>
        </div>
    `;
}

/**
 * Cria elemento card de aluno
 * @param {Object} aluno 
 * @returns {HTMLElement}
 */
function criarCardAluno(aluno) {
    const item = document.createElement('article');
    item.className = 'aluno-item';
    item.setAttribute('role', 'listitem');
    
    const labels = { 
        pending: '⏳ Pendente', 
        uploaded: '📎 PDF Anexado', 
        sent: '📤 Enviado' 
    };
    const classes = { 
        pending: 'status-pending', 
        uploaded: 'status-uploaded', 
        sent: 'status-sent' 
    };
    
    const botaoAnexar = aluno.status === 'pending' ? '📎 Anexar' : '🔄 Trocar';
    const botaoEnviar = aluno.status === 'sent' ? 'Reenviar' : 'Enviar';
    const enviarDisabled = aluno.status !== 'uploaded' ? 'disabled' : '';
    const enviarLabel = aluno.status === 'sent' ? 'Reenviar boletim' : 'Enviar boletim';
    
    item.innerHTML = `
        <div class="aluno-info">
            <h3>${aluno.nome}</h3>
            <p>Matrícula: ${aluno.matricula} | Turma: ${aluno.turma}</p>
            <span class="status-badge ${classes[aluno.status]}">${labels[aluno.status]}</span>
        </div>
        <div class="aluno-actions">
            <button type="button" class="btn btn-primary" onclick="abrirModal(${aluno.id})">
                ${botaoAnexar}
            </button>
            <button type="button" class="btn btn-success" 
                ${enviarDisabled} 
                onclick="enviarBoletim(${aluno.id})"
                aria-label="${enviarLabel} para ${aluno.nome}">
                📩 ${botaoEnviar}
            </button>
        </div>
    `;
    
    return item;
}

// ========== FILTROS ==========
function aplicarFiltros(e) {
    if (e) e.preventDefault();
    renderizarAlunos();
    return false;
}

// ========== MODAL: UPLOAD ==========
function abrirModal(id) {
    alunoSelecionado = estado.alunos.find(a => a.id === id);
    if (!alunoSelecionado) return;
    
    // Resetar estado do modal
    document.getElementById('modal-aluno-nome').textContent = alunoSelecionado.nome;
    arquivoSelecionado = null;
    
    const fileInfo = document.getElementById('file-info');
    const progress = document.getElementById('progress-wrapper');
    const btnEnviar = document.getElementById('btn-enviar');
    const fileInput = document.getElementById('file-input');
    
    if (fileInfo) fileInfo.style.display = 'none';
    if (progress) progress.style.display = 'none';
    if (btnEnviar) btnEnviar.disabled = true;
    if (fileInput) fileInput.value = '';
    
    const modal = document.getElementById('modal-upload');
    if (modal) {
        modal.hidden = false;
        modal.style.display = 'block';
    }
}

function fecharModal() {
    const modal = document.getElementById('modal-upload');
    if (modal) {
        modal.hidden = true;
        modal.style.display = 'none';
    }
}

// ========== DROP ZONE & UPLOAD ==========
function configurarDropZone() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    
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
        processarArquivo(e.dataTransfer.files[0]);
    });
    
    // Seleção via input
    fileInput.addEventListener('change', () => {
        processarArquivo(fileInput.files[0]);
    });
}

function processarArquivo(file) {
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
    arquivoSelecionado = file;
    
    document.getElementById('file-name').textContent = file.name;
    document.getElementById('file-size').textContent = (file.size / (1024 * 1024)).toFixed(2);
    document.getElementById('file-info').style.display = 'block';
    document.getElementById('btn-enviar').disabled = false;
    
    exibirToast('✅ Arquivo selecionado!', 'success');
}

function realizarUpload() {
    if (!arquivoSelecionado || !alunoSelecionado) return;
    
    const btnEnviar = document.getElementById('btn-enviar');
    const progressWrapper = document.getElementById('progress-wrapper');
    const progressBar = document.getElementById('progress-bar');
    
    if (btnEnviar) btnEnviar.disabled = true;
    if (progressWrapper) progressWrapper.style.display = 'block';
    
    // Simular upload com progress bar
    let progresso = 0;
    const intervalo = setInterval(() => {
        progresso += 8;
        if (progressBar) progressBar.style.width = `${progresso}%`;
        
        if (progresso >= 100) {
            clearInterval(intervalo);
            setTimeout(() => {
                // Atualizar status do aluno
                alunoSelecionado.status = 'uploaded';
                alunoSelecionado.pdf = arquivoSelecionado.name;
                
                exibirToast(`✅ PDF anexado para ${alunoSelecionado.nome}`, 'success');
                fecharModal();
                renderizarAlunos();
            }, 400);
        }
    }, 120);
}

// ========== ENVIO DE BOLETINS ==========
function enviarBoletim(id) {
    const aluno = estado.alunos.find(a => a.id === id);
    if (!aluno) return;
    
    exibirToast(`📩 Enviando boletim para ${aluno.nome}...`, 'info');
    
    // Simular envio
    setTimeout(() => {
        aluno.status = 'sent';
        exibirToast(`✅ Boletim enviado para responsáveis e aluno: ${aluno.nome}`, 'success');
        renderizarAlunos();
    }, 1200);
}

function exportarRelatorio() {
    exibirToast('📊 Gerando relatório de envios...', 'info');
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
    const modal = document.getElementById('modal-upload');
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