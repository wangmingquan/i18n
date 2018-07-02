<script>
import Vue from 'vue'
export default Vue.component('appHeader', {
});
</script>
<template>
  <header>
    <div class="wrap">
      <nav>
        <router-link to="/app">产品线管理</router-link>
        <router-link to="/lang">语言管理</router-link>
        <!-- <router-link to="/map">语言文件管理</router-link> -->
      </nav>
    </div>
  </header>
</template>
<style lang="less" scoped>
header{
  height: 40px;
  background: #fafafa;
  border-bottom: #ebebeb 1px solid;
  nav{
    a{
      display: inline-block;
      color: #777;
      line-height: 40px;
      font-size: 15px;
      padding: 0 15px;
      &.nuxt-link-active{
        position: relative;
        color: #1b72e9;
        font-weight: 600;
        &:after{
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 2px;
          background: #1b72e9;
          content: '';
        }
      }
    }
  }
}
</style>

