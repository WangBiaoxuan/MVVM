// Step 1:

var data = { name: 'yck' }

function observe(obj) {
  // 判断类型
  if (!obj || typeof obj !== 'object') {
    return
  }
  Object.keys(data).forEach(key => {
    defineReactive(data, key, data[key])
  })
}

function defineReactive(obj, key, val) {
  // 递归子属性
  observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter() {
      console.log('get value')
      return val
    },
    set: function reactiveSetter(newVal) {
      console.log('change value')
      val = newVal
    }
  })
}

observe(data)
let name = data.name // -> get value
data.name = 'yyy' // -> change value


// 以上代码简单的实现了如何监听数据的 set 和 get 的事件，但是仅仅如此是不够的，还需要在适当的时候给属性添加发布订阅

// 在解析<div>{{name}}</div></div>模板代码时，遇到 {{name}} 就会给属性 name 添加发布订阅。






// step2

// 通过 Dep 解耦
class Dep {
    constructor() {
      this.subs = []
    }
    addSub(sub) {
      // sub 是 Watcher 实例
      this.subs.push(sub)
    }
    notify() {
      this.subs.forEach(sub => {
        sub.update()
      })
    }
}

// 全局属性，通过该属性配置 Watcher
Dep.target = null

function update(value) {
    document.querySelector('div').innerText = value
}

class Watcher {
    constructor(obj, key, cb) {
      // 将 Dep.target 指向自己
      // 然后触发属性的 getter 添加监听
      // 最后将 Dep.target 置空
      Dep.target = this
      this.cb = cb
      this.obj = obj
      this.key = key
      this.value = obj[key]
      Dep.target = null
    }
    update() {
      // 获得新值
      this.value = this.obj[this.key]
      // 调用 update 方法更新 Dom
      this.cb(this.value)
    }
}

var data = { name: 'yck' }
observe(data)
// 模拟解析到 `{{name}}` 触发的操作
new Watcher(data, 'name', update)

// 接下来,对 defineReactive 函数进行改造
function defineReactive(obj, key, val) {
    // 递归子属性
    observe(val)
    let dp = new Dep()
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        console.log('get value')
        // 将 Watcher 添加到订阅
        if (Dep.target) {
          dp.addSub(Dep.target)
        }
        return val
      },
      set: function reactiveSetter(newVal) {
        console.log('change value')
        val = newVal
        // 执行 watcher 的 update 方法
        dp.notify()
      }
    })
}
// 以上实现了一个简易的双向绑定，核心思路就是手动触发一次属性的 getter 来实现发布订阅的添加。


// update Dom innerText
data.name = 'yyy' 

