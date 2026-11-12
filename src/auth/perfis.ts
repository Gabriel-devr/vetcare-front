import type { Perfil } from '../api/types'

export interface ItemMenu {
  rotulo: string
  caminho: string
}

const menus: Record<Perfil, ItemMenu[]> = {
  Recepcionista: [
    { rotulo: 'Início', caminho: '/inicio' },
    { rotulo: 'Agenda', caminho: '/agenda' },
    { rotulo: 'Tutores e animais', caminho: '/tutores' },
  ],
  Admin: [
    { rotulo: 'Início', caminho: '/inicio' },
    { rotulo: 'Agenda', caminho: '/agenda' },
    { rotulo: 'Tutores e animais', caminho: '/tutores' },
    { rotulo: 'Usuários', caminho: '/usuarios' },
    { rotulo: 'Serviços e configurações', caminho: '/servicos' },
  ],
  Veterinario: [{ rotulo: 'Minha agenda', caminho: '/minha-agenda' }],
  Tutor: [
    { rotulo: 'Meus animais', caminho: '/meus-animais' },
    { rotulo: 'Minhas consultas', caminho: '/minhas-consultas' },
  ],
}

const paginasIniciais: Record<Perfil, string> = {
  Recepcionista: '/inicio',
  Admin: '/usuarios',
  Veterinario: '/minha-agenda',
  Tutor: '/meus-animais',
}

const rotulos: Record<Perfil, string> = {
  Recepcionista: 'Recepcionista',
  Admin: 'Administrador',
  Veterinario: 'Veterinário',
  Tutor: 'Tutor',
}

export const itensMenu = (perfil: Perfil) => menus[perfil]
export const paginaInicial = (perfil: Perfil) => paginasIniciais[perfil]
export const rotuloPerfil = (perfil: Perfil) => rotulos[perfil]
