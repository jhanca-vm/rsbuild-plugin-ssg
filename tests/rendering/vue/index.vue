<script setup>
import Counter from './counter.vue'
import './island-vue?client'
</script>

<template>
  <html>
    <head>
      <title>vue</title>
    </head>
    <body>
      <h1>vue</h1>
      <island-vue data-name="counter">
        <Counter />
      </island-vue>
    </body>
  </html>
</template>

<style>
h1 {
  font-weight: 600;
}
</style>
