/**
 * ⚙️ Configurações de Conta - Agenda Escolar Virtual
 * Módulo: confperfil.js
 */

'use strict';

// ========== DADOS DO USUÁRIO (Simulação - Substituir por API) ==========
const usuario = {
    nome: 'Maria Silva',
    email: 'maria.silva@email.com',
    emailVerificado: true,
    telefone: '+55 (11) 99999-9999',
    telefoneVerificado: true,
    avatar: 'MS'
};

// ========== VARIÁVEIS DE CONTROLE ==========
let codigoEmail = null;
let codigoTelefone = null;
let timers = { email: null, telefone: null };

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', () => {
    inicializarPerfil();
    configurarMascaraTelefone();
    configurarInputsCodigo();
    configurarFechamentoModais();
});

/**
 * Preenche os dados do perfil na interface
 */
function inicializarPerfil() {
    const elementos = {
        nome: document.getElementById('profile-name'),
        email: document.getElementById('profile-email'),
        phone: document.getElementById('profile-phone'),
        avatar: document.getElementById('profile-avatar')
    };

    if (elementos.nome) elementos.nome.textContent = usuario.nome;
    if (elementos.email) elementos.email.textContent = usuario.email;
    if (elementos.phone) elementos.phone.textContent = usuario.telefone;
    if (elementos.avatar) elementos.avatar.textContent = usuario.avatar;
}

// ========== MÁSCARA DE TELEFONE ==========
function configurarMascaraTelefone() {
    const input = document.getElementById('novo-telefone');
    if (!input) return;

    input.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 10) {
            value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '+55 ($1) $2-$3');
        } else if (value.length > 6) {
            value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '+55 ($1) $2-$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{0,5})/, '+55 ($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/^(\d*)/, '+55 $1');
        }
        e.target.value = value;
    });
}

// ========== INPUTS DE CÓDIGO DE VERIFICAÇÃO ==========
function configurarInputsCodigo() {
    document.querySelectorAll('.code-digit').forEach((input, index, inputs) => {
        // Auto-focus no próximo dígito
        input.addEventListener('input', (e) => {
            if (e.target.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        // Navegação com Backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });

        // Suporte a paste
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const digits = paste.replace(/\D/g, '').slice(0, 6);
            
            digits.split('').forEach((digit, i) => {
                if (inputs[i]) inputs[i].value = digit;
            });
            
            if (digits.length === 6) inputs[5].focus();
        });
    });
}

/**
 * Obtém o valor completo do código de verificação
 * @returns {string} Código concatenado
 */
function obterCodigoVerificacao() {
    return Array.from(document.querySelectorAll('.code-digit'))
        .map(input => input.value)
        .join('');
}

// ========== ALTERAR SENHA ==========
function salvarSenha(e) {
    e.preventDefault();
    
    const campos = {
        atual: document.getElementById('senha-atual'),
        nova: document.getElementById('senha-nova'),
        confirm: document.getElementById('senha-confirm')
    };

    let valido = true;

    // Validar senha atual (simulação)
    if (campos.atual.value !== 'senha123') {
        marcarErro(campos.atual, 'error-senha-atual');
        valido = false;
    } else {
        limparErro(campos.atual, 'error-senha-atual');
    }

    // Validar nova senha
    if (campos.nova.value.length < 8) {
        marcarErro(campos.nova, 'error-senha-nova');
        valido = false;
    } else {
        limparErro(campos.nova, 'error-senha-nova');
    }

    // Validar confirmação
    if (campos.nova.value !== campos.confirm.value) {
        marcarErro(campos.confirm, 'error-senha-confirm');
        valido = false;
    } else {
        limparErro(campos.confirm, 'error-senha-confirm');
    }

    if (!valido) return false;

    // Simular salvamento
    exibirToast('✅ Senha alterada com sucesso!', 'success');
    limparSenha();
    return false;
}

function limparSenha() {
    const form = document.getElementById('form-senha');
    if (form) form.reset();
    
    document.querySelectorAll('#form-senha .form-group').forEach(group => {
        group.classList.remove('error');
    });
}

// ========== VERIFICAÇÃO DE E-MAIL ==========
function solicitarVerificacaoEmail(e) {
    e.preventDefault();
    
    const input = document.getElementById('novo-email');
    const email = input.value;

    if (!validarEmail(email)) {
        marcarErro(input, 'error-novo-email');
        return false;
    }
    limparErro(input, 'error-novo-email');

    // Gerar código simulado
    codigoEmail = gerarCodigoAleatorio();
    console.log('[DEV] Código de verificação (email):', codigoEmail);

    // Atualizar modal e exibir
    const destino = document.getElementById('modal-email-destino');
    if (destino) destino.textContent = email;
    
    const modal = document.getElementById('modal-verificar-email');
    if (modal) {
        modal.hidden = false;
        modal.style.display = 'block';
        focarPrimeiroDigito(modal);
    }

    iniciarTimer('email');
    exibirToast('📧 Código de verificação enviado!', 'success');
    return false;
}

function confirmarVerificacaoEmail(e) {
    if (e) e.preventDefault();
    
    const codigo = obterCodigoVerificacao();
    
    if (codigo === codigoEmail) {
        const novoEmail = document.getElementById('novo-email').value;
        
        // Atualizar dados
        usuario.email = novoEmail;
        usuario.emailVerificado = true;

        // Atualizar interface
        const perfilEmail = document.getElementById('profile-email');
        const status = document.getElementById('status-email');
        
        if (perfilEmail) perfilEmail.textContent = novoEmail;
        if (status) {
            status.className = 'verification-status verified';
            status.innerHTML = '<span class="dot"></span><span>E-mail verificado ✓</span>';
        }

        fecharModal('modal-verificar-email');
        document.getElementById('form-email')?.reset();
        exibirToast('✅ E-mail atualizado e verificado!', 'success');
    } else {
        exibirToast('❌ Código incorreto. Tente novamente.', 'error');
    }
    return false;
}

// ========== VERIFICAÇÃO DE TELEFONE ==========
function solicitarVerificacaoTelefone(e) {
    e.preventDefault();
    
    const input = document.getElementById('novo-telefone');
    const telefone = input.value;

    if (!validarTelefone(telefone)) {
        marcarErro(input, 'error-novo-telefone');
        return false;
    }
    limparErro(input, 'error-novo-telefone');

    // Gerar código simulado
    codigoTelefone = gerarCodigoAleatorio();
    console.log('[DEV] Código de verificação (SMS):', codigoTelefone);

    // Atualizar modal e exibir
    const destino = document.getElementById('modal-telefone-destino');
    if (destino) destino.textContent = telefone;
    
    const modal = document.getElementById('modal-verificar-telefone');
    if (modal) {
        modal.hidden = false;
        modal.style.display = 'block';
        focarPrimeiroDigito(modal);
    }

    iniciarTimer('telefone');
    exibirToast('📱 Código SMS enviado!', 'success');
    return false;
}

function confirmarVerificacaoTelefone(e) {
    if (e) e.preventDefault();
    
    const codigo = obterCodigoVerificacao();
    
    if (codigo === codigoTelefone) {
        const novoTelefone = document.getElementById('novo-telefone').value;
        
        // Atualizar dados
        usuario.telefone = novoTelefone;
        usuario.telefoneVerificado = true;

        // Atualizar interface
        const perfilPhone = document.getElementById('profile-phone');
        const status = document.getElementById('status-telefone');
        
        if (perfilPhone) perfilPhone.textContent = novoTelefone;
        if (status) {
            status.className = 'verification-status verified';
            status.innerHTML = '<span class="dot"></span><span>Telefone verificado ✓</span>';
        }

        fecharModal('modal-verificar-telefone');
        document.getElementById('form-telefone')?.reset();
        exibirToast('✅ Telefone atualizado e verificado!', 'success');
    } else {
        exibirToast('❌ Código incorreto. Tente novamente.', 'error');
    }
    return false;
}

// ========== TIMER DE REENVIO ==========
function iniciarTimer(tipo) {
    let segundos = 30;
    const container = document.getElementById(`resend-${tipo}`);
    if (!container) return;

    const link = container.querySelector('a');
    const timer = container.querySelector('#timer-' + tipo);
    const spanTimer = container.querySelector('.timer');

    if (!link || !timer || !spanTimer) return;

    // Esconder link, mostrar timer
    link.style.display = 'none';
    spanTimer.style.display = 'inline';

    // Limpar timer anterior
    if (timers[tipo]) clearInterval(timers[tipo]);

    timers[tipo] = setInterval(() => {
        segundos--;
        timer.textContent = segundos;
        
        if (segundos <= 0) {
            clearInterval(timers[tipo]);
            link.style.display = 'inline';
            spanTimer.style.display = 'none';
        }
    }, 1000);
}

function reenviarCodigo(tipo) {
    const container = document.getElementById(`resend-${tipo}`);
    if (!container) return;
    
    const link = container.querySelector('a');
    if (!link || link.style.display === 'none') return;

    // Gerar novo código
    if (tipo === 'email') {
        codigoEmail = gerarCodigoAleatorio();
        console.log('[DEV] Novo código (email):', codigoEmail);
        exibirToast('📧 Novo código enviado!', 'success');
    } else {
        codigoTelefone = gerarCodigoAleatorio();
        console.log('[DEV] Novo código (SMS):', codigoTelefone);
        exibirToast('📱 Novo código SMS enviado!', 'success');
    }
    
    iniciarTimer(tipo);
}

// ========== PREFERÊNCIAS ==========
function salvarPreferencias() {
    const prefs = {
        twoFactor: document.getElementById('toggle-2fa')?.checked ?? false,
        emailNotif: document.getElementById('toggle-email-notif')?.checked ?? true,
        whatsappNotif: document.getElementById('toggle-whatsapp-notif')?.checked ?? true
    };
    
    console.log('💾 Preferências salvas:', prefs);
    exibirToast('✅ Preferências salvas com sucesso!', 'success');
}

// ========== VALIDAÇÕES ==========
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTelefone(telefone) {
    // Remove espaços para validação
    const limpo = telefone.replace(/\s/g, '');
    return /^\+55\(\d{2}\)9?\d{8}$/.test(limpo) || /^\+55\d{2}9?\d{8}$/.test(limpo);
}

function gerarCodigoAleatorio() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ========== UTILITÁRIOS DE UI ==========
function marcarErro(input, errorId) {
    const group = input.closest('.form-group');
    const error = document.getElementById(errorId);
    
    if (group) group.classList.add('error');
    if (error) error.style.display = 'block';
}

function limparErro(input, errorId) {
    const group = input.closest('.form-group');
    const error = document.getElementById(errorId);
    
    if (group) group.classList.remove('error');
    if (error) error.style.display = 'none';
}

function fecharModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    
    modal.hidden = true;
    modal.style.display = 'none';
    
    // Limpar campos de código
    modal.querySelectorAll('.code-digit').forEach(input => {
        input.value = '';
    });
    
    // Focar no primeiro campo do formulário pai, se existir
    const firstInput = modal.querySelector('form input:not([type="hidden"])');
    if (firstInput) firstInput.focus();
}

function focarPrimeiroDigito(modal) {
    const firstDigit = modal.querySelector('.code-digit');
    if (firstDigit) {
        firstDigit.focus();
        firstDigit.select?.();
    }
}

function exibirToast(mensagem, tipo = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = mensagem;
    toast.className = `toast ${tipo} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

// ========== NAVEGAÇÃO ==========
function voltar() {
    window.history.back();
}

function sair() {
    // Em produção: implementar logout real
    window.location.href = '../dashboard/index.html';
}

// ========== EVENTOS GLOBAIS ==========
function configurarFechamentoModais() {
    // Fechar ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal(modal.id);
            }
        });
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModal('modal-verificar-email');
            fecharModal('modal-verificar-telefone');
        }
    });
}