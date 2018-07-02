<script>
export default {
  data () {
    return {
      isEdit: false,
      isNew: false,
      id: '',
      appname: '',
      icon: '',
      describle: '',
      languages: []
    }
  },
  computed: {
    apps () {
      return this.$store.state.apps;
    },
    langs () {
      let langs = this.$store.state.langs;
      return langs;
    },
    langsMap () {
      let langs = this.langs;
      let langsCopy = [];
      Object.assign(langsCopy, langs);
      let langsMap = {};
      for (var i in langsCopy) {
        langsMap[langsCopy[i].language] = langsCopy[i].comment
      }
      return langsMap;
    }
  },
  methods: {
    toggleLang (item) {
      let lang = item.language;
      if (this.languages.indexOf(lang) >= 0) {
        this.languages.splice(this.languages.indexOf(lang), 1);
      } else {
        this.languages.push(lang);
      }
    },
    getLanguageType (item) {
      let lang = item.language;
      return this.languages.indexOf(lang) >= 0 ? 'on' : ''
    },
    submit () {
      let appname = this.appname;
      let describle = this.describle;
      let icon = this.icon;
      let languages = this.languages;
      let error = '';
      if (!languages.length) error = '请至少选择一个语种';
      if (!appname) error = '请填写产品名称';
      if (error) {
        this.$notify.error(error);
        return;
      }
      let data = {
        appname,
        describle,
        icon,
        languages: JSON.stringify(languages)
      }
      if (this.isNew) {
        this.addNewSubmit(data);
      } else {
        this.updateSubmit(data);
      }
    },
    addNewSubmit (data) {
      this.$axios.post('/api/app/add', data).then(res => {
        if (res.status === 200) {
          if (res.data.status === 0) {
            this.$store.dispatch('getApps');
            this.isEdit = false;
          }
        }
      }, console.log)
    },
    updateSubmit (data) {
      this.$axios.post('/api/app/edit', data).then(res => {
        if (res.status === 200) {
          if (res.data.status === 0) {
            this.$store.dispatch('getApps');
            this.isEdit = false;
          }
        }
      }, console.log)
    },
    deletItem (item) {
      let appname = item.appname;
      this.$confirm(`此操作将永久删除“${appname}”, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios.post('/api/app/delete', {
          appname
        }).then(res => {
          if (res.status === 200) {
            if (res.data.status === 0) {
              this.$store.dispatch('getApps');
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
            } else {
              this.$message({
                type: 'error',
                message: '删除是吧!' + res.data.message
              });
            }
          }
        }, console.log)
      }).catch(() => {});
    },
    addNewApp () {
      this.isEdit = true;
      this.appname = '';
      this.icon = '';
      this.describle = '';
      this.languages = [];
      this.isNew = true;
    },
    editItem (item) {
      this.isEdit = true;
      this.appname = item.appname;
      this.icon = item.icon;
      this.describle = item.describle;
      this.languages = item.languages;
      this.isNew = false;
    },
    jump (item) {
      this.$router.push({
        path: '/map',
        query: {
          app: item.appname
        }
      })
    }
  }
}
</script>
<template>
  <div class="wrap">
    <!-- {{apps}}
    <hr>
    {{langs}} -->
    <div class="list" v-if="!isEdit">
      <el-button type="primary" @click="addNewApp">新增App</el-button>
      <el-table
        :data="apps"
        border
      >
        <el-table-column prop="appname" label="产品名称" width="140"></el-table-column>
        <el-table-column label="icon" width="70">
          <template slot-scope="scope">
            <img class="app_icon" v-if="scope.row.icon" :src="scope.row.icon" alt="">
          </template>
        </el-table-column>
        <el-table-column prop="describle" label="产品描述" width="300"></el-table-column>
        <el-table-column prop="updated_time" label="更新时间" width="220"></el-table-column>
        <el-table-column label="语种">
          <template slot-scope="scope">
            <el-tag v-for="(item, key) in scope.row.languages" :key="key">{{langsMap[item]}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template slot-scope="scope">
            <el-button type="success" @click="jump(scope.row)">管理</el-button>
            <el-button type="primary" @click="editItem(scope.row)">编辑</el-button>
            <el-button type="warning" @click="deletItem(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div v-else>
      <el-form label-width="100px">
        <el-form-item label="产品名称">
          <el-input v-model="appname" v-if="isNew" placeholder="一旦提交不可更改"></el-input>
          <el-input v-model="appname" v-else disabled></el-input>
        </el-form-item>
        <el-form-item label="产品描述">
          <el-input v-model="describle"></el-input>
        </el-form-item>
        <el-form-item label="产品Icon">
          <el-input v-model="icon"></el-input>
        </el-form-item>
        <el-form-item label="产品支持语种">
          <span v-for="(item, key) in langs" :class="[getLanguageType(item), 'lang_mark']" @click="toggleLang(item)" :key="key">{{item.comment}}</span> 
        </el-form-item>
        <el-form-item label="">
          <el-button type="primary" @click="submit">提交</el-button>
          <el-button @click="isEdit=false">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<style lang="less" scoped>
.wrap{
  padding: 15px 0;
}
.el-table{
  margin-top: 15px;
  .el-tag{
    margin-bottom: 5px;
    margin-right: 5px;
  }
}
.app_icon{
  width: 40px;
  height: 40px;
}
.lang_mark{
  display: inline-block;
  margin-right: 10px;
  border: #ccc 1px solid;
  padding: 0 15px;
  border-radius: 4px;
  cursor: pointer;
  &.on{
    color: #fff;
    border-color: #409EFF;
    background: #409EFF;
  }
}
</style>
