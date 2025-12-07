<script setup>
import Card from '../components/Card.vue'
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen bg-gray-50">
    <Card class="text-center px-20 py-10 max-w-md">
      <div class="text-9xl font-bold mb-4">4😕4</div>
      <div class="text-2xl font-semibold mb-4">Oups ! On s'est perdu ?</div>
      <div class="mb-4 text-gray-600">
        <span class="inline-block mr-2">🔍</span>
        Nous avons cherché partout, mais cette page reste introuvable...
      </div>
      <div class="mb-8 text-gray-600">
        Pas de panique ! Vous pouvez retourner à l'accueil en toute sécurité.
      </div>
      <router-link 
        to="/" 
        class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-10 py-3 rounded-lg transition-colors"
        title="Cliquez ici, vous ne pouvez pas vous perdre davantage ! 😉"
      >
        🏠 Retour à la maison
      </router-link>
    </Card>
  </div>
</template>
