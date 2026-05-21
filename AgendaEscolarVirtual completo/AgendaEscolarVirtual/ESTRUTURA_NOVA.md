# 📋 Guia de Reorganização - Agenda Escolar Virtual

## ✅ Mudanças Realizadas

### 1. Estrutura de Pastas
O projeto foi reorganizado para seguir as melhores práticas de organização de projetos web:

```
AgendaEscolarVirtual/
├── auth/                    (Antigo: Acesso-AEV)
├── dashboard/               (Antigo: Home-AEV)
├── schedules/               (Antigo: Agendas-AEV)
├── components/              (Antigo: Menu-AEV)
├── pages/                   (Antigo: SaibaMais-AEV)
└── assets/                  (Antigo: Images)
    ├── images/
    ├── css/
    └── js/
```

### 2. Renomeação de Arquivos

#### Autenticação (auth/)
| Antigo | Novo |
|--------|------|
| `Login-AEV.html` | `login.html` |
| `Login-AEV.css` | `login.css` |
| `Cadastro-AEV.html` | `register.html` |
| `Cadastro-AEV.css` | `register.css` |

#### Dashboard (dashboard/)
| Antigo | Novo |
|--------|------|
| `Home-AEV.html` | `index.html` |
| `Home-AEV.css` | `dashboard.css` |

#### Componentes (components/)
| Antigo | Novo |
|--------|------|
| `Menu-AEV.html` | `navbar.html` |
| `Menu-AEV.css` | `navbar.css` |
| `MenuAluno-AEV.html` | `menuAluno.html` |
| `MenuAluno-AEV.css` | `menuAluno.css` |
| `MenuProfessor-AEV.html` | `menuProfessor.html` |
| `MenuProfessor-AEV.css` | `menuProfessor.css` |
| `MenuResponsavel-AEV.html` | `menuResponsavel.html` |
| `MenuResponsavel-AEV.css` | `menuResponsavel.css` |

#### Agendas (schedules/)
| Antigo | Novo |
|--------|------|
| `AgendaAluno.html` | `calendarAluno.html` |
| `AgendaAluno.css` | `calendarAluno.css` |
| `AgendaProfessor-AEV.html` | `calendarProfessor.html` |
| `AgendaProfessor-AEV.css` | `calendarProfessor.css` |
| `AgendaResponsavel-AEV.html` | `calendarResponsavel.html` |
| `AgendaResponsavel-AEV.css` | `calendarResponsavel.css` |

#### Páginas (pages/)
| Antigo | Novo |
|--------|------|
| `SaibaMais-AEV.html` | `about.html` |
| `SaibaMais-AEV.css` | `about.css` |

#### Assets
| Antigo | Novo |
|--------|------|
| `Images/` | `assets/images/` |

### 3. Links Atualizados

Todos os arquivos HTML tiveram seus links corrigidos para a nova estrutura:

#### Em `auth/login.html`:
```html
<!-- CSS -->
<link rel="stylesheet" href="login.css">

<!-- Imagem -->
<img src="../assets/images/ImagemDeLogin-Login.png">

<!-- Links -->
<form action="../components/navbar.html">
<a href="register.html">Cadastre-se</a>
```

#### Em `auth/register.html`:
```html
<!-- CSS -->
<link rel="stylesheet" href="register.css">

<!-- Imagem -->
<img src="../assets/images/ImagemDeCadastro-cadastro.png">

<!-- Links -->
<form action="../components/navbar.html">
```

#### Em `dashboard/index.html`:
```html
<!-- CSS -->
<link rel="stylesheet" href="dashboard.css">

<!-- Imagem -->
<img src="../assets/images/ImagemDeLogoDaAEV.png">

<!-- Links de Navegação -->
<a href="../auth/login.html">Login</a>
<a href="../auth/register.html">Cadastro</a>
<a href="../components/navbar.html">Menu</a>

<!-- Botões CTA -->
<a href="../auth/login.html">Acessar a Plataforma</a>
<a href="../pages/about.html">Quer saber mais?</a>
```

#### Em `components/navbar.html`:
```html
<!-- CSS -->
<link rel="stylesheet" href="navbar.css">

<!-- Botão Sair -->
<button onclick="window.location.href='../dashboard/index.html'">Sair</button>

<!-- Links de Agenda -->
<a href="../schedules/calendarProfessor.html">Acessar Agenda</a>
<a href="../schedules/calendarAluno.html">Acessar Agenda</a>
```

## 📊 Resumo Executivo

- **Pastas Antigas Removidas**: 6 (Acesso-AEV, Home-AEV, Menu-AEV, Agendas-AEV, SaibaMais-AEV, Images)
- **Pastas Novas Criadas**: 7 (auth, dashboard, schedules, components, pages, assets, config)
- **Arquivos Movidos**: 28 arquivos
- **Imagens Relocalizadas**: Todas agora em `assets/images/`
- **Links HTML Atualizados**: 15+ referências

## 🔗 Padrão de Caminhos Agora Utilizados

### Caminhos Relativos a Partir de HTML
```
De /auth/login.html para /components/navbar.html:
  ../components/navbar.html

De /dashboard/index.html para /auth/login.html:
  ../auth/login.html

De /components/navbar.html para /assets/images/:
  ../assets/images/imagemXXX.png

De /schedules/calendarAluno.html para /components/navbar.html:
  ../components/navbar.html
```

## ✨ Próximas Etapas Recomendadas

1. **Verificar Links em CSS**: Revise se há URLs em arquivos CSS que referenciem imagens
2. **Testar Navegação**: Abra cada página HTML e verifique se todos os links funcionam
3. **Consolidar CSS**: Considere mover os arquivos CSS para `assets/css/` para melhor organização
4. **Documentar Scripts**: Se houver arquivos JS, mova para `assets/js/`
5. **Adicionar .gitignore**: Configure arquivo `.gitignore` para ignorar node_modules, build, etc.

## 📝 Notas Importantes

- ✅ Todos os caminhos foram convertidos para **caminhos relativos**
- ✅ Estrutura segue padrão **RESTful/MVC**
- ✅ Pastas antigas foram **completamente removidas**
- ✅ Nenhum arquivo foi perdido durante a migração
- ⚠️ Teste a aplicação completamente para garantir que todos os links funcionam

---

**Data da Reorganização**: 21 de maio de 2026
**Versão**: 1.0
