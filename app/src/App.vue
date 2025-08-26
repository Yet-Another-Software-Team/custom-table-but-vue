<template>
  <h1>Hello App!</h1>
  <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
  <nav>
    <RouterLink to="/" class="text-blue-500 mr-5">Home</RouterLink>
    <RouterLink to="/about" class="text-blue-500">About</RouterLink>
  </nav>
  <main>
    <RouterView />
  </main>
</template>