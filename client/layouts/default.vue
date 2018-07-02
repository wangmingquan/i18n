<script>
import appHeader from '../components/header.vue'
export default {
  components: {
    appHeader
  }
}
</script>

<template>
  <div>
    <app-header></app-header>
    <nuxt/>
  </div>
</template>

<style lang="less">
.flex {
  display: flex;
}
.wrap{
  width: 1120px;
  margin: 0 auto;
}
*{
  padding: 0;
  margin: 0;
}
body{
  font-size: 13px;
}
a{
  color: #1a0dab;
  text-decoration: none;
  &:hover{
    text-decoration: underline;
  }
}
</style>
