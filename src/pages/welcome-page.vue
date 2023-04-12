<template>
  <div class="HomePage">
    <header class="HomePage__header">
      <div class="HomePage__header__container">
        <div class="HomePage__header__container__logo">
          <a href="/">
            <img src="@/assets/images/logo.png" alt="Logo"/>
          </a>
        </div>
        <b-button variant="outline-primary" @click="$router.push('login')">
          Login
        </b-button>
      </div>
    </header>
    <body>
    <div class="HomePage__background"></div>
    <div class="HomePage__overlay"></div>
    <div class="HomePage__description">
      <span class="HomePage__description__welcome">Welcome to CEDU</span>
      <span class="HomePage__description__content">CEdu platform provides learners and instructors with a variety of educational technologies following the social constructive learning.</span>
    </div>
    </body>
  </div>
</template>

<script>
export default {
  name: "welcome-page"
}
</script>

<style lang="scss">
.HomePage {
  &__header {
    padding: 10px 0;
    z-index: 10;
    position: sticky;

    &__container {
      max-width: 1400px;
      margin-left: auto;
      margin-right: auto;
      padding-right: 15px;
      padding-left: 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &__logo {
        padding-right: 20px;
      }

      &__logo img {
        width: 125px;
        height: auto;
        position: unset;
        margin-right: 15px;
      }
    }
  }

  &__background {
    background: url("https://statics.pancake.vn/web-media/e3/b1/2a/77/b12ad5cf39bcf1da0d8e0fcb94cd62d58cd4dd1cbb7a293119732d00.jpg") center center / cover no-repeat content-box border-box;
    position: absolute;
    width: 100%;
    height: 100%;
  }

  &__overlay {
    width: 100%;
    height: 100%;
    position: absolute;
    background: rgba(21, 21, 21, 0.55);
  }

  &__description {
    position: relative;
    text-align: center;
    display: flex;
    flex-direction: column;
    height: 500px;
    justify-content: center;

    &__welcome {
      color: rgb(255, 255, 255);
      font-size: 46px;
      font-weight: 900;
      height: auto;
    }

    &__content {
      color: rgb(255, 255, 255);
      font-size: 21px;
      text-align: center;
    }
  }
}
</style>