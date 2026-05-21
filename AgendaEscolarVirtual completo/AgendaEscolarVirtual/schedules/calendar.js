// Seleção de Perfil
function selectProfile(tipo) {
    // Aqui você pode salvar o tipo de perfil selecionado
    localStorage.setItem('userProfile', tipo);
    
    // Feedback visual
    alert(`Perfil selecionado: ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`);
    
    // Aqui você pode redirecionar ou filtrar as turmas baseadas no perfil
    filtrarTurmasPorPerfil(tipo);
}

// Filtrar turmas por perfil
function filtrarTurmasPorPerfil(perfil) {
    const turmasContainer = document.getElementById('turmasContainer');
    const cards = turmasContainer.getElementsByClassName('turma-card');
    
    for (let card of cards) {
        const tipoTurma = card.querySelector('.turma-type').textContent.toLowerCase();
        if (tipoTurma === perfil) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.5s';
        } else {
            card.style.display = 'none';
        }
    }
}

// Acessar Turma (leva para a agenda - futuro)
function acessarTurma(turmaId) {
    const perfil = localStorage.getItem('userProfile') || 'aluno';
    alert(`Redirecionando para a agenda da turma...\nTurma: ${turmaId}\nPerfil: ${perfil}`);
    // Futuramente: window.location.href = `agenda.html?turma=${turmaId}&perfil=${perfil}`;
}

// Gerenciar Escola
function gerenciarEscola(escolaId) {
    alert(`Gerenciando escola: ${escolaId}\nAqui você poderá criar turmas, adicionar professores, etc.`);
    // Futuramente: window.location.href = `gerenciar-escola.html?id=${escolaId}`;
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Logout
function logout() {
    if (confirm('Deseja realmente sair?')) {
        localStorage.removeItem('userProfile');
        window.location.href = 'index.html';
    }
}

// Formulário: Entrar em Turma
document.getElementById('formEntrarTurma').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const codigo = document.getElementById('codigoTurma').value;
    const tipo = document.getElementById('tipoAcesso').value;
    
    if (codigo && tipo) {
        alert(`Entrando na turma ${codigo} como ${tipo}...`);
        closeModal('modalEntrarTurma');
        // Aqui você faria a requisição para o backend
    }
});

// Formulário: Criar Escola
document.getElementById('formCriarEscola').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nomeEscola').value;
    const endereco = document.getElementById('endereco').value;
    
    if (nome && endereco) {
        alert(`Escola "${nome}" criada com sucesso!\nAgora você pode criar turmas para esta escola.`);
        closeModal('modalCriarEscola');
        this.reset();
        // Aqui você faria a requisição para o backend
    }
});

// Ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    const perfilSalvo = localStorage.getItem('userProfile');
    if (perfilSalvo) {
        console.log(`Perfil carregado: ${perfilSalvo}`);
    }
});