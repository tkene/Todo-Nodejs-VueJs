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

export function formatCommentDate(timestampOrDate) {
  if (!timestampOrDate) return '';
  
  // Si c'est un timestamp (nombre), on le convertit directement
  // Si c'est une date ISO string, on la parse
  let date;
  if (typeof timestampOrDate === 'number') {
    date = new Date(timestampOrDate);
  } else {
    date = new Date(timestampOrDate);
  }
  
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) {
    return 'À l\'instant';
  } else if (diffMinutes < 60) {
    return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  } else if (diffDays === 1) {
    return 'Hier';
  } else if (diffDays < 7) {
    return `Il y a ${diffDays} jours`;
  } else {
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}