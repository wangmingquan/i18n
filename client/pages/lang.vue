<script>
export default {
  computed: {
    langs () {
      let langs = this.$store.state.langs;
      return langs;
    }
  }
}
</script>

<template>
  <section class="container">
    <div class="wrap">
      <el-table
        :data="langs"
        border
      >
        <el-table-column prop="language" label="code"></el-table-column>
        <el-table-column prop="comment" label="语种"></el-table-column>
      </el-table>
    </div>
  </section>
</template>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.wrap{
  width: 1180px;
  margin: 0 auto;
}
</style>
