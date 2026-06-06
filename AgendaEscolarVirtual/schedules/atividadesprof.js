/**
 * 👨‍🏫 Envio de Atividades - Agenda Escolar Virtual
 * Módulo: enviar-atividades.js
 * Perfil: Professor
 */

'use strict';

// ========== ESTADO DA APLICAÇÃO (Simulação - Substituir por API) ==========
const estado = {
    professor: 'Prof. Ana Souza',
    turma: '9º Ano B',
    alunos: [
        { id: 1, nome: 'João Silva', matricula: '2026001', disciplina: 'Matemática - Álgebra', status: 'pending', arquivo: null },
        { id: 2, nome: 'Maria Oliveira', matricula: '2026002', disciplina: 'Português', status: 'uploaded', arquivo: 'atividade_port_maria.pdf' },
        { id: 3, nome: 'Pedro Santos', matricula: '2026003', disciplina: 'História', status: 'sent', arquivo: 'atividade_hist_pedro.pdf' },
        { id: 4, nome: 'Ana Costa', matricula: '2026004', disciplina: 'Matemática', status: 'pending', arquivo: null },
        { id: 5, nome: 'Lucas Ferreira', matricula: '2026005', disciplina: 'Português', status: 'uploaded', arquivo: 'atividade_port_lucas.pdf' }
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
    configurarFechamentoModais();
});

/**
 * Preenche os dados do professor na interface
 */
function inicializarPerfil() {
    const nomeEl = document.getElementById('professor-nome');
    const turmaEl = document.getElementById('turma-atual');
    
    if (nomeEl) nomeEl.textContent = estado.professor;
    if (turmaEl) turmaEl.textContent = estado.turma;
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
        disciplina: document.getElementById('filtro-disciplina')?.value || 'all',
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
        const matchDisciplina = filtros.disciplina === 'all' || 
            a.disciplina.toLowerCase().includes(filtros.disciplina);
        const matchBusca = a.nome.toLowerCase().includes(filtros.busca) || 
            a.matricula.includes(filtros.busca);
        return matchDisciplina && matchBusca;
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
    const enviarLabel = aluno.status === 'sent' ? 'Reenviar atividade' : 'Enviar atividade';
    
    item.innerHTML = `
        <div class="aluno-info">
            <h3>${aluno.nome}</h3>
            <p>Matrícula: ${aluno.matricula} | Atividade: ${aluno.disciplina}</p>
            <span class="status-badge ${classes[aluno.status]}">${labels[aluno.status]}</span>
        </div>
        <div class="aluno-actions">
            <button type="button" class="btn btn-primary" onclick="abrirModal(${aluno.id})">
                ${botaoAnexar}
            </button>
            <button type="button" class="btn btn-success" 
                ${enviarDisabled} 
                onclick="enviarAtividade(${aluno.id})"
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
    
    const modal = document.getElementById('modal-atividade');
    if (modal) {
        modal.hidden = false;
        modal.style.display = 'block';
    }
}

function fecharModal() {
    const modal = document.getElementById('modal-atividade');
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
    
    // Validar tamanho (15MB)
    if (file.size > 15 * 1024 * 1024) {
        exibirToast('⚠️ O arquivo deve ter no máximo 15MB.', 'warning');
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
                alunoSelecionado.arquivo = arquivoSelecionado.name;
                
                exibirToast(`✅ Atividade anexada para ${alunoSelecionado.nome}`, 'success');
                fecharModal();
                renderizarAlunos();
            }, 400);
        }
    }, 120);
}

// ========== ENVIO DE ATIVIDADES ==========
function enviarAtividade(id) {
    const aluno = estado.alunos.find(a => a.id === id);
    if (!aluno) return;
    
    exibirToast(`📩 Enviando atividade para ${aluno.nome}...`, 'info');
    
    // Simular envio
    setTimeout(() => {
        aluno.status = 'sent';
        exibirToast(`✅ Atividade enviada para ${aluno.nome}`, 'success');
        renderizarAlunos();
    }, 1200);
}

function enviarParaTurmaInteira() {
    const pendentes = estado.alunos.filter(a => a.status === 'uploaded');
    
    if (pendentes.length === 0) {
        exibirToast('⚠️ Nenhum PDF pronto para envio.', 'warning');
        return;
    }
    
    exibirToast(`📩 Enviando para ${pendentes.length} aluno(s)...`, 'info');
    
    let i = 0;
    const intervalo = setInterval(() => {
        if (i < pendentes.length) {
            pendentes[i].status = 'sent';
            i++;
        } else {
            clearInterval(intervalo);
            renderizarAlunos();
            exibirToast('✅ Envio em massa concluído com sucesso!', 'success');
        }
    }, 300);
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
function configurarFechamentoModais() {
    // Fechar ao clicar fora
    const modal = document.getElementById('modal-atividade');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
    }
    
    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal();
        }
    });
}