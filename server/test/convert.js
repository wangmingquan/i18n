var fs = require('fs');
var parser = require('xml2json');
const knex = require('knex');

class FormateMap {
  // 初始化
  constructor ({xml, app, lang}) {
    this.xml = xml;
    this.xmlData = fs.readFileSync(this.xml);
    this.json = {};
    this.app = app;
    this.lang = lang;
    this.knex = knex({
      client: 'mysql',
      connection: {
        host: 'localhost',
        user: 'root',
        port: 3306,
        password: 'root123456',
        database: 'i18n'
      }
    });
    this.knex('languages').select().then(langs => {
      let hasLang = false;
      for (var i in langs) {
        if (langs[i].language === this.lang) {
          hasLang = true;
          break;
        }
      }
      if (!hasLang) {
        console.log(`语言${this.lang}在数据库中不存在，请先添加，本次进程失败`);
        process.exit();
      } else {
        this.formatexmljson();
      }
    });
  }

  async formatexmljson () {
    this.json = parser.toJson(this.xmlData);
    this.json = JSON.parse(this.json).resources.string;
    for (var i = 0, l = this.json.length; i < l; i++) {
      if (this.json[i].font) {
        if (!this.json[i].font.length) {
          this.json[i].$t = this.json[i].font.$t;
        } else {
          let font = this.json[i].font;
          for (var _i in font) {
            let newName = this.json[i].name + '_font' + _i;
            this.json.splice(i, 0, {
              name: newName,
              $t: font[_i].$t
            });
            l++;
            i++;
          }
        }
        delete (this.json[i].font);
      } else {
      }
    }
    this.insertAllData();
  }

  async insertAllData () {
    for (var i = 0, l = this.json.length; i < l; i++) {
      if (this.json[i].$t) {
        await this.insertItem(this.json[i], i);
      } else {
        // 空字段  直接舍弃
      }
    }
    console.log('执行完毕');
    process.exit();
  }

  async insertItem (item, i) {
    return new Promise(async (resolve, reject) => {
      let name = item.name.replace(/_/g, '.');
      let hasKey = await this.queryKey(name);
      if (hasKey.length) {
        await this.coverItem(hasKey[0], item);
      } else {
        await this.insertKey(item);
      }
      resolve();
    });
  }

  async insertKey (item) {
    return new Promise(async (resolve, reject) => {
      let name = item.name;
      let names = name.split('_');
      let full_key = '';
      let parent_id = '';
      for (var i = 0, l = names.length; i < l; i++) {
        if (i === 0) {
          full_key += names[i];
        } else {
          full_key += ('_' + names[i]);
        }
        console.log(full_key);
        let hasFull_key = await this.knex('map').select().where({full_key});
        if (hasFull_key.length) {
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
          parent_id = insert[0];
        }
      }
      resolve();
    })
  }

  // 已存在的key  合并覆盖
  coverItem (oldItem, newItem) {
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

  queryKey (name) {
    return this.knex('map')
      .select()
      .where({
        full_key: name,
        app: this.app
      })
  }
}

new FormateMap({
  xml: './strings.xml',
  app: 'oneone',
  lang: 'zh_s'
});