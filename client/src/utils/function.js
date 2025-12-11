export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function isPendingReview(dateString) {
  if (!dateString) return null;

  const now = new Date()
  const date = new Date(dateString)
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  switch(true) {
    case diffDays >= 8:
      return {
        days: diffDays,
        color: 'red',
        label: 'Relance à faire : ' + diffDays + ' jours passés'
      }
    case diffDays >= 4:
      return {
        days: diffDays,
        color: 'orange',
        label: 'candidature en attente depuis ' + diffDays + ' jours'
      }
    default:
      return {
        days: diffDays,
        color: 'green',
        label: 'candidature en attente depuis ' + diffDays + ' jours'
      }
  }  
}
