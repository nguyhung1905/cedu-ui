<template>
  <div v-if="loading" class="loading-overlay">
    <div class="donut"></div>
  </div>
</template>

<script>
export default {
  name: "loading",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss">
.loading-overlay {
  background-color: rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1099;
.donut {
  display: flex;
  justify-content: center;
  position: fixed;
  top: 40%;
  left: 50%;
  right: 0;
  width: 3rem;
  height: 3rem;
  margin: 3rem;
  border-radius: 50%;
  border: 0.4rem solid rgba(black, 0.1);
  border-top-color: dodgerblue;
  animation: 1.5s spin infinite linear;
}
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>