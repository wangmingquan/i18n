class InsertToMap {
  // 初始化
  constructor({ json, app, lang, knex, writeInfo, resolve }) {
    this.writeInfo = writeInfo;
    this.json = json;
    this.app = app;
    this.lang = lang;
    this.knex = knex;
    this.resolve = resolve;
    this.checkLangExist();
  }

  checkLangExist () {
    this.knex('languages').select().then(langs => {
      let hasLang = false;
      for (var i in langs) {
        if (langs[i].language === this.lang) {
          hasLang = true;
          break;
        }
      }
      if (!hasLang) {
        this.writeInfo(`语言${this.lang}在数据库中不存在，请先添加，本次进程失败`);
        process.exit();
      } else {
        this.insertAllData();
      }
    });
  }

  async insertAllData() {
    for (var i = 0, l = this.json.length; i < l; i++) {
      if (this.json[i].$t) {
        await this.insertItem(this.json[i], i);
      } else {
        this.writeInfo(`字段[${this.json[i]}]为空字段，直接舍弃`)
      }
    }
    this.writeInfo('执行完毕');
    this.resolve();
  }

  async insertItem(item, i) {
    return new Promise(async (resolve, reject) => {
      let name = item.name.replace(/_/g, '.');
      let hasKey = await this.queryKey(name);
      if (hasKey.length) {
        this.writeInfo(`${name}已存在，进行覆盖`)
        await this.coverItem(hasKey[0], item);
      } else {
        await this.insertKey(item);
      }
      resolve();
    });
  }

  async insertKey(item) {
    return new Promise(async (resolve, reject) => {
      let name = item.name;
      let names = name.split('_');
      let full_key = '';
      let parent_id = '';
      for (var i = 0, l = names.length; i < l; i++) {
        if (i === 0) {
          full_key += names[i];
        } else {
          full_key += ('.' + names[i]);
        }
        
        let hasFull_key = await this.queryKey(full_key);
        if (hasFull_key.length) {
          this.writeInfo(`${full_key} 已经存在，略过`);
          parent_id = hasFull_key[0]._id;
        } else {
          let data = {
            app: this.app,
            key: names[i],
            full_key
          };
          if (parent_id) {
            data.parent_id = parent_id;
          }
          if (i + 1 === l) {
            let value = {};
            value[this.lang] = item.$t;
            data.value = JSON.stringify(value);
          }
          let insert = await this.knex('map').insert(data);
          this.writeInfo(`正在插入${full_key}`);
          parent_id = insert[0];
        }
      }
      resolve();
    })
  }

  // 已存在的key  合并覆盖
  coverItem(oldItem, newItem) {
    if (oldItem.value) {
      oldItem.value = JSON.parse(oldItem.value);
    } else {
      oldItem.value = {};
    }
    oldItem.value[this.lang] = newItem.$t;

    return this.knex('map').update({
      value: JSON.stringify(oldItem.value)
    }).where({
      full_key: oldItem.full_key,
      app: this.app
    })
  }

  queryKey(name) {
    return this.knex('map')
      .select()
      .where({
        full_key: name,
        app: this.app
      })
  }
}
module.exports = ({json, app, lang, knex, writeInfo}) => {
  writeInfo = writeInfo || function (info) {
    console.log(info + '\n');
  }
  return new Promise((resolve, reject) => {
    new InsertToMap({json, app, lang, knex, writeInfo, resolve});
  });
}