// 保存在localStorage的键值对的key
const SEARCH_KEY = "__search__";
// 最大保存的列表长度
const SEARCH_MAX_LENGTH = 10;

// 一个保存get()和set()的变量storage，用于操作本地存储
const storage = {
  get<T>(key: string, def: T) {
    // 取出缓存中的内容
    const data = window.localStorage.getItem(key);
    // 返回默认值
    if (!data) return def;
    try {
      // json格式解析，因为localStorage只能保存string，所以需要JSON格式化为JSON对象
      const result = JSON.parse(data);
      return result as T;
    } catch (error) {
      return def;
    }
  },
  // 保存
  set<T>(key: string, val: T) {
    try {
      // 保存前需要序列化为字符串
      const str = JSON.stringify(val);
      window.localStorage.setItem(key, str);
    } catch (error) {
      // nothing
    }
  }
};

// 搜索缓存类
class SearchCache {
  // 缓存列表
  private searchList: string[];

  // 构造器
  constructor() {
    // 初始化时，将localStorage中保存的数据缓存
    this.searchList = storage.get<string[]>(SEARCH_KEY, []);
  }

  getAll() {
    return this.searchList;
  }

  addOne(query: string) {
    const list = [...this.searchList];
    const index = list.findIndex(s => s === query);
    if (index > -1) {
      list.splice(index, 1);
    }
    list.unshift(query);
    if (list.length > SEARCH_MAX_LENGTH) {
      list.pop();
    }

    return this.resetList(list);
  }

  removeOne(query: string) {
    const list = this.searchList.filter(s => s !== query);
    return this.resetList(list);
  }

  clearAll() {
    return this.resetList([]);
  }

  private resetList(list: string[]) {
    this.searchList = list;
    storage.set(SEARCH_KEY, list);
    return this.searchList;
  }
}

// 暴露给外部操作，不直接操作本地存储localStorage
export default new SearchCache();
