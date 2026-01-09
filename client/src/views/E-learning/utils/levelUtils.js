/**
 * Utilitaires pour gérer les niveaux de difficulté
 */

export function getLevelColor(level) {
  switch(level) {
    case 'Jr': return 'green'
    case 'Int': return 'orange'
    case 'Sr': return 'red'
    default: return 'grey'
  }
}

export function getLevelIcon(level) {
  switch(level) {
    case 'Jr': return 'trending_up'
    case 'Int': return 'trending_flat'
    case 'Sr': return 'trending_down'
    default: return 'help'
  }
}

export function getLevelLabel(level) {
  switch(level) {
    case 'Jr': return 'Junior'
    case 'Int': return 'Intermédiaire'
    case 'Sr': return 'Senior'
    default: return level
  }
}

