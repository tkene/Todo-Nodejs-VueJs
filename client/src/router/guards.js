import { checkAuth } from '../api/auth'

/**
 * Guard de navigation pour protéger les routes nécessitant une authentification
 */
export async function authGuard(to, from, next) {
  // Si la route ne nécessite pas d'authentification, autoriser l'accès
  if (!to.meta.requiresAuth) {
    return next()
  }

  try {
    // Vérifier si l'utilisateur est authentifié
    const authStatus = await checkAuth()
    
    if (authStatus.authenticated) {
      // Utilisateur authentifié, autoriser l'accès
      next()
    } else {
      // Utilisateur non authentifié, rediriger vers la page de login
      next({
        name: 'Login',
        query: { redirect: to.fullPath }
      })
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error)
    // En cas d'erreur, rediriger vers la page de login
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
  }
}

/**
 * Guard pour rediriger les utilisateurs connectés depuis la page de login
 */
export async function guestGuard(to, from, next) {
  // Si ce n'est pas la page de login, continuer
  if (to.name !== 'Login') {
    return next()
  }

  try {
    const authStatus = await checkAuth()
    
    if (authStatus.authenticated) {
      // Utilisateur déjà connecté, rediriger vers la page d'accueil ou la route demandée
      const redirect = to.query.redirect || '/'
      next(redirect)
    } else {
      // Utilisateur non connecté, autoriser l'accès à la page de login
      next()
    }
  } catch (error) {
    // En cas d'erreur, autoriser l'accès à la page de login
    next()
  }
}

