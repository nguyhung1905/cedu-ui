<template>
  <div v-if="display">
    <img src="@/assets/images/access-denied.png" alt="access-denied" style="display: block; margin: auto;">
  </div>
</template>

<script>
export default {
  name: "access-denied",
  props: {
    display: {
      type: Boolean,
      default: false,
    }
  }
}
</script>

<style scoped>

</style>