<script>
import axios from 'axios';
export default {
  data () {
    let query = this.$route.query;
    return {
      query,
      app: query.app || '',
      info: {},
      maps: {
        label: 'key'
      },
      key: '',
      comment: '',
      parent_id: '',
      id: '',
      languages: {},
      isEdit: false,
      isNew: true,
      node: null,
      activeName: 'web',
      upload_lang: '',
      upload_file_type: '',
      showIframe: false
    }
  },
  computed: {
    apps () {
      return this.$store.state.apps;
    },
    langs () {
      return this.$store.state.langs;
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
  watch: {
    $route () {
      this.query = this.$route.query;
      this.app = this.query.app || '';
    },
    app () {
      this.getAppInfo();
    }
  },
  created () {
    this.getAppInfo();
  },
  methods: {
    getAppInfo () {
      if (!this.app) {
        return;
      }
      axios.get('/api/app/info?appname=' + this.app).then(res => {
        if (res.status === 200 && res.data.status === 0) {
          this.info = res.data.data;
          // 每次新的APP都需要初始化语种的表单
          let languages = this.info.languages;
          let data_languages = {};
          for (var i in languages) {
            data_languages[languages[i]] = '';
          }
          this.languages = data_languages;
        }
      }, console.log)
    },
    loadDetail (node, resolve) {
      if (node.level === 0) {
        return resolve([{ 
          key: this.app,
          children: []
        }]);
      }
      if (node.level > 0) {
        let id = node.data._id || '';
        axios.get('/api/map/list', {
          params: {
            app: this.app,
            parent_id: id
          }
        }).then(res => {
          if (res.status === 200 && res.data.status === 0) {
            let list = res.data.data.list;
            for (var i in list) {
              list[i]['children'] = [];
            }
            node.data.children = list;
            resolve(list);
          }
        }, console.log)
      }
    },
    appendItem (e, node) {
      e.stopPropagation();
      this.node = node;
      let data = node.data;
      node.isLeaf = false;
      node.loaded = false;
      // node.expanded = false;
      this.key = '';
      this.comment = '';
      this.parent_id = data._id || '';
      for (var i in this.languages) {
        this.languages[i] = '';
      }
      this.isEdit = true;
      this.isNew = true;
    },

    removeItem (e, node) {
      e.stopPropagation();
      let data = node.data;
      let id = data._id;
      this.$confirm('该字段可能已经应用到产品中，请谨慎操作', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        callback: action => {
          if (action === 'confirm') {
            axios.post('/api/map/delete', {id}).then(res => {
              if (res.status === 200) {
                if (res.data.status === 0) {
                  this.$notify({
                    type: 'success',
                    message: '删除成功'
                  });
                  const parent = node.parent;
                  const children = parent.childNodes || parent.data;
                  const index = children.indexOf(node);
                  children.splice(index, 1);
                } else {
                  this.$notify.error(res.data.message);
                }
              }
            }, console.log)
          }
        }
      });
    },
    editItem (e, node) {
      e.stopPropagation();
      let data = node.data;
      this.node = node;
      this.key = data.key;
      this.comment = data.comment;
      this.parent_id = data.parent_id || '';
      this.id = data._id;
      let languages = data.value ? JSON.parse(data.value) : {};
      for (var i in this.languages) {
        if (languages[i]) {
          this.languages[i] = languages[i];
        } else {
          this.languages[i] = '';
        }
        
      }
      this.isEdit = true;
      this.isNew = false;
    },
    showDetail (value) {
      this.$alert(value, '语言详情', {
        dangerouslyUseHTMLString: true
      });
    },
    renderContent(h, { node, data, store }) {
      return (
      <div class="custom-tree-node">
        <span class="label">{node.label} </span>
        {
          node.data.comment
          ? (<span class="comment">({node.data.comment}) </span>)
          : null
        }
        {
          node.data.value
          ? (<span class="value" title={node.data.value} on-click={ () => this.showDetail(node.data.value) } style="color:#39B54A"> 语言详情 </span>)
          : null
        }
        {
          node.data.value
          ? (<span class="full_key" style="color: #E6A23C"> {node.data.full_key} </span>)
          : null
        }
        <span>
          <el-button size="mini" type="text" on-click={ (e) => this.appendItem(e, node) }>添加</el-button>
          {
            node.level > 1
            ? (<el-button size="mini" type="text" on-click={ (e) => this.editItem(e, node) }>编辑</el-button>)
            : null
          }
          {
            node.level > 1
            ? (<el-button size="mini" type="text" on-click={ (e) => this.removeItem(e, node) }>删除</el-button>)
            : null
          }
        </span>
      </div>);
    },
    submitKey () {
      let key = this.key;
      let parent_id = this.parent_id;
      let app = this.app;
      let comment = this.comment;
      let value = {};
      let data = {};
      let error = '';
      for (var i in this.languages) {
        if (this.languages[i]) {
          value[i] = this.languages[i];
        }
      }
      if (!key) {
        error = 'key必填';
      }
      if (error) {
        this.$notify.error(error);
        return;
      }
      data = {
        app,
        parent_id,
        comment,
        key
      }
      if (JSON.stringify(value) !== '{}') {
        data.value = JSON.stringify(value);
      }
      if (this.isNew) {
        this.addKey(data);
      } else {
        this.updateKey(data);
      }
    },
    updateKey (data) {
      data.id = this.id;
      axios.post('/api/map/edit', data).then(res => {
        if (res.status === 200) {
          if (res.data.status === 0) {
            this.isEdit = false;
            this.$notify({
              type: 'success',
              message: '编辑成功'
            });
            this.node.data = Object.assign(this.node.data, data);
          } else {
            this.$notify.error(res.data.message);
          }
        }
      }, console.log)
    },
    addKey (data) {
      axios.post('/api/map/add', data).then(res => {
        if (res.status === 200) {
          if (res.data.status === 0) {
            this.isEdit = false;
            this.$notify({
              type: 'success',
              message: '添加成功'
            });
            data._id = res.data.data.id;
            data.children = [];
            this.node.data.children.push(data)
          } else {
            this.$notify.error(res.data.message);
          }
        }
      }, console.log)
    },
    download (type, lang) {
      window.open(`/api/map/download?app=${this.app}&lang=${lang}&type=${type}`)
    },
    onSubmit () {
      let error = '';
      let filepath = this.$refs['upload_file'].value;
      if (!this.upload_file_type) error = '请选择语言包格式';
      if (!this.upload_lang) error = '请选择语言';
      if (!filepath) error = '请选择上传文件';
      if (!/[\.strings|\.xml|\.json]$/.test(filepath)) error = '文件格式不支持';
      if (error) {
        this.$notify.error(error);
        return;
      }
      this.showIframe = true;
    },
    compeleteUpload () {
      location.reload();
    }
  }
}
</script>
<template>
  <section class="container">
    <div class="wrap">
      <div class="flex">
        <div class="info information">
          <p class="title">产品信息：</p>
          <div class="detail">
            <div class="img">
              <img v-if="info.icon" :src="info.icon" alt="">
              <div v-else>Icon</div>
            </div>
            <p class="name">{{info.appname}}</p>
            <p class="des">{{info.describle}}</p>
          </div>
        </div>
        <div class="info upload">
          <p class="title">上传现有语言包：</p>
          <div class="uploadbox">
            <el-form
              class="form"
              label-width="100px"
              target="iframe"
              method="post"
              action="/api/map/upload"
              enctype="multipart/form-data"
            >
              <el-form-item label="选择语言:">
                <div
                  :class="['el-tag', upload_lang === item ? 'on': '']"
                  v-for="(item, key) in info.languages"
                  :key="key"
                  @click="upload_lang=item"
                >{{item}}</div>
                <input type="hidden" name="lang" v-model="upload_lang" />
              </el-form-item>
              <el-form-item label="语言包格式:">
                <div :class="['el-tag', upload_file_type === 'xml' ? 'on': '']" @click="upload_file_type='xml'">xml</div>
                <div :class="['el-tag', upload_file_type === 'strings' ? 'on': '']" @click="upload_file_type='strings'">strings</div>
                <div :class="['el-tag', upload_file_type === 'json' ? 'on': '']" @click="upload_file_type='json'">json</div>
                <input type="hidden" name="type" v-model="upload_file_type" />
              </el-form-item>
              <el-form-item label="选择文件:">
                <div class="fileinput">
                  <input type="file" name="file" ref="upload_file" />
                </div>
              </el-form-item>
              <el-form-item>
                <div class="upload_btn">
                  <input type="hidden" name="app" v-model="app" />
                  <input type="submit" value="提交" @click="onSubmit($event)"/>
                </div>
              </el-form-item>
            </el-form>
          </div>
          <div class="iframe-flayer" v-show="showIframe">
            <div class="iframe-box">
              <iframe id="iframe" name="iframe" frameborder="0"></iframe>
              <div class="btns">
                <el-button type="primary" @click="compeleteUpload">完成</el-button>
                <span> 请等待所有任务全部完成后，再点击完成按钮！！！</span>
              </div>
            </div>
          </div>
        </div>
        <div class="info">
          <p class="title">语言文件下载:</p>
          <el-tabs v-model="activeName">
            <el-tab-pane label="Web (json)" name="web">
              <div class="tags" v-if="info.languages">
                <el-tag
                  v-for="(item, key) in info.languages"
                  :key="key"
                  @click.native="download('json', item)"
                >{{langsMap[item]}}-{{activeName}}
                </el-tag>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Ios (strings)" name="ios">
              <div class="tags" v-if="info.languages">
                <el-tag
                  v-for="(item, key) in info.languages"
                  :key="key"
                  @click.native="download('strings', item)"
                >{{langsMap[item]}}-{{activeName}}
                </el-tag>
              </div>
            </el-tab-pane>
            <el-tab-pane label="Android (xml)" name="android">
              <div class="tags" v-if="info.languages">
                <el-tag
                  v-for="(item, key) in info.languages"
                  :key="key"
                  @click.native="download('xml', item)"
                >{{langsMap[item]}}-{{activeName}}
                </el-tag>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <el-tree
        :props="maps"
        :load="loadDetail"
        lazy
        :render-content="renderContent"
      >
      </el-tree>
    </div>

    <div class="editContainer" v-show="isEdit" @click.self="isEdit=false">
      <div class="editMap">
        <p class="title">{{isNew ? '添加' : '编辑'}}</p>
        <el-form label-width="100px">
          <el-form-item label="parent_id" v-if="parent_id">
            <el-input disabled v-model="parent_id"></el-input>
          </el-form-item>
          <el-form-item label="key" v-if="isNew">
            <el-input v-model="key" placeholder="提交后不能更改 / 当前路径下命名唯一 / 字母开头 / 不能包含'.'、'_'、'/'"></el-input>
          </el-form-item>
          <el-form-item label="key" v-else>
            <el-input v-model="key" disabled></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="comment" placeholder=""></el-input>
          </el-form-item>
          <el-form-item label="语言">
            <ul class="form-languages">
              <li v-for="(item, key) in languages" :key="key">
                <span>{{langsMap[key]}}</span>
                <el-input size="middle" v-model="languages[key]"></el-input>
              </li>
            </ul>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitKey">提交</el-button>
            <el-button @click="isEdit=false">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </section>
</template>
<style lang="less" scoped>
.flex{
  .information{
    flex: 1;
    margin-right: 10px;
  }
  .info {
    .el-tag{
      cursor: pointer;
    }
  }
}
.editContainer{
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2;
  .editMap{
    background: #fff;
    width: 800px;
    padding: 20px;
    border-radius: 4px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .title{
    font-size: 20px;
    text-align: center;
    padding-bottom: 15px;
    margin-bottom: 15px;
    border-bottom: #fafafa 1px solid;
  }
}
.form-languages{
  list-style: none;
  display: flex;
  li{
    background: rgba(64, 158, 255, .1);
    border: 1px solid rgba(64, 158, 255, .2);
    border-radius: 2px;
    padding: 5px;
    width: 260px;
    margin-right: 8px;
    display: flex;
    span{
      color: #409EFF;
      margin-right: 5px;
    }
    .el-input{
      flex: 1;
    }
  }
}
.wrap{
  max-width: 1180px;
  margin: 0 auto;
  padding: 15px 0;
  .info{
    margin-top: 15px;
    border: #f1f1f1 1px solid;
    background: #fefefe;
    padding: 15px;
    .title{
      font-size: 16px;
      font-weight: bold;
    }
    .detail{
      position: relative;
      margin-top: 10px;
      padding-left: 75px;
      min-height: 60px;
      .img{
        width: 60px;
        height: 60px;
        position: absolute;
        left: 0;
        top: 0;
        img{
          width: 100%;
          height: 100%;
        }
      }
      .name{
        font-size: 15px;
        line-height: 1.8;
      }
      .des{
        padding: 8px 0;
        color: #888;
        font-size: 12px;
      }
    }
    .el-tag{
      margin-right: 8px;
    }
  }
  .upload {
    width: 300px;
    margin-right: 10px;
    .uploadbox{
      padding-top: 5px;
      .el-tag.on{
        background: #409EFF;
        color: #fff;
      }
      .el-form-item{
        margin-bottom: 5px!important;
        .upload_btn {
          input{
            display: block;
            width: 120px;
            height: 40px;
            border-radius: 4px;
            border: none;
            background: #409EFF;
            color: #fff;
            font-size: 15px;
          }
        }
      }
    }
  }
}
.el-tree{
  margin-top: 15px;
}
.iframe-flayer{
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9;
  .iframe-box{
    width: 800px;
    height: 600px;
    background: rgba(255, 255, 255, 0.5);
    position: absolute;
    left: 50%;
    top: 50%;
    margin-left: -400px;
    margin-top: -300px;
    display: flex;
    flex-direction: column;
    iframe{
      background: #000;
      flex: 1;
      color: green;
    }
    .btns{
      padding: 20px;
      text-align: center;
      span{
        color: red;
      }
    }
  }
}
</style>
