var time = {
  hc: function (h) {
    return (h === 0 || h === 24) ? '12:00am' : (h === 12) ? '12:00pm' : (h % 12) + ':00' + (h > 12 ? 'pm' : 'am')
  }
}

// ls

var ls = {
  get: (key, type) => {
    var item = window.localStorage.getItem(key)

    if (type === 'Object') item = JSON.parse(item)

    return item
  },
  set: (key, val, type) => {
    if (type === 'Object') val = JSON.stringify(val)

    window.localStorage.setItem(key, val)
  },
  remove: (key) => {
    window.localStorage.removeItem(key)
  },
  empty: (key) => {
    return window.localStorage.getItem(key) === null
  }
}

var str = {
  split: (str, parts) => {
    const arr = []

    if (parts < 2) return [str]

    const slice = Math.floor(str.length / parts)

    for (let i = 0; i < str.length; i += slice) {
      if (arr.length >= parts - 1) {
        arr.push(str.slice(i, str.length))

        break
      }

      arr.push(str.slice(i, i + slice))
    }

    return arr
  },
  rand: (length) => {
    if (length === undefined) length = 8
    // )!@$^*(
    const pick = '0123456789abcdefghjklmnopqrstuvwzyz'
    let str = ''
    for (let i = 0; i < length; i++) {
      str += pick[Math.floor(Math.random() * pick.length)]
    }

    return str
  },
  html: (str) => {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  }
}

// arr

var arr = {
  split: (arr, size) => {
    if (size <= 0) size = 1

    var multiArr = []

    for (var i = 0; i < arr.length; i += size) {
      multiArr.push(arr.slice(i, i + size))
    }

    return multiArr
  },
  index: (arr, val) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === val) return i
    }

    return -1
  },
  indexByKey: (arr, key, val) => {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][key] === val) return i
    }

    return -1
  }
}

// obj

var obj = {
  clone: (o) => {
    return JSON.parse(JSON.stringify(o))
  },
  merge (o, o1) {
    for (const i in o1) if (o[i] !== undefined) o1[i] = o[i]
    return o1
  }
}

var user = {}
user.instance = () => {
  return {
    id: 0,
    eComLogins: '',
    customerID: '',
    email: '',
    staff: 'No',
    admin: 'No'
  }
}
user.lsKey = 'Auth-User'
user.fn = {
  get: () => {
    if (!ls.empty(user.lsKey)) {
      return ls.get(user.lsKey, 'Object')
    }

    return user.instance()
  },
  role (role) {
    return user.fn.get()[role] === 'Yes'
  },
  getRole () {
    if (user.fn.role('admin')) return 'admin'

    if (user.fn.role('staff')) return 'staff'

    return 'guest'
  },
  lsStore: (store) => {
    const instsance = user.instance()

    instsance.id = store.id
    instsance.email = store.email
    instsance.customerID = store.customerID
    instsance.eComLogins = store.eComLogins
    instsance.staff = store.staff
    instsance.admin = store.admin

    ls.set(user.lsKey, instsance, 'Object')
  },
  lsRemove: () => {
    ls.remove(user.lsKey)
  },
  loggedIn: () => {
    return !ls.empty(user.lsKey)
  },
  getEmailDomain () {
    const domain = user.fn.get().email.split('@')

    if (domain.length > 0) return domain[domain.length - 1]

    return ''
  }
}

// tree

const tree = {}
tree.treeData = []

tree.root = (treeData, id) => {
  return treeData.filter((root) => {
    return root.ID === id
  })
}

tree.children = (root, parentId) => {
  return root.filter((node) => {
    return node.ParentID === parentId
  })
}

tree.reset = () => {
  tree.parentNodes = []
  tree.childNodes = []
}

tree.parentNodes = []
tree.getParents = (treeData, node) => {
  const aparent = tree.root(treeData, node[0].ParentID)

  if (aparent.length > 0) {
    tree.parentNodes.unshift(aparent[0])

    tree.getParents(treeData, aparent)
  } else {
    return []
  }

  return tree.parentNodes
}

tree.childNodes = []
tree.getChildren = (treeData, node) => {
  const aparent = tree.children(treeData, node[0].ID)

  if (aparent.length > 0) {
    tree.childNodes.push(aparent[0])

    tree.getChildren(treeData, aparent)
  } else {
    return []
  }

  return tree.childNodes
}

tree.build = (treeChildren) => {
  if (treeChildren.length === 0) return []

  for (const key in treeChildren) {
    treeChildren[key].id = treeChildren[key].ID
    treeChildren[key].label = treeChildren[key].Description

    const getChildren = tree.children(tree.treeData, treeChildren[key].id)

    const child = tree.build(getChildren)

    // No leaf node stored
    if (child.length > 0) {
      treeChildren[key].children = child
    }
  }

  return treeChildren
}

// cart

const cart = {}
cart.lsKey = 'Cart-Items'
cart.lsVehicleKey = 'Cart-Item-Vehicle'
cart.get = () => {
  return (!ls.empty(cart.lsKey)) ? ls.get(cart.lsKey, 'Object') : []
}
cart.insert = (item) => {
  const items = cart.get()

  items.push(item)

  ls.set(cart.lsKey, items, 'Object')
}
cart.find = (item) => {
  const items = cart.get()

  for (let i = 0; i < items.length; i++) {
    if (items[i].ItemNo === item.ItemNo) {
      return i
    }
  }

  return -1
}
cart.remove = (item) => {
  const items = cart.get()
  const index = cart.find(item)

  if (index !== -1) items.splice(index, 1)

  ls.set(cart.lsKey, items, 'Object')
}
cart.empty = () => {
  ls.remove(cart.lsKey)
  return cart.get()
}
cart.serVehicle = (vehicle) => {
  ls.set(cart.lsVehicleKey, vehicle)
}

// orders

const orders = {}
orders.lsKey = 'Order-Items'
orders.get = () => {
  return (!ls.empty(orders.lsKey)) ? ls.get(orders.lsKey, 'Object') : []
}
orders.insert = (item) => {
  const items = orders.get()

  items.push(item)

  ls.set(orders.lsKey, items, 'Object')
}
orders.remove = (item) => {
  const items = orders.get()

  for (let i = 0; i < items.length; i++) {
    if (items[i].ItemNo === item.ItemNo) {
      items.splice(i, 1)
      break
    }
  }

  ls.set(orders.lsKey, items, 'Object')
}
orders.empty = () => {
  ls.remove(orders.lsKey)
  return orders.get()
}
orders.serVehicle = (vehicle) => {
  ls.set(orders.lsVehicleKey, vehicle)
}

// date

import moment from 'moment'
import { date as qDate } from 'quasar'

const date = {
  qdate: (date) => {
    return moment(date).format('YYYY/MM/DD')
  },
  idate: (date) => {
    return moment(date).format('DD/MM/YYYY')
  },
  yearDays: (year, weekEnds) => {
    const cYear = year

    const dates = []
    for (let i = 1; i < 13; i++) {
      const monthStr = (i < 10) ? '0' + i : i
      const month = new Date(cYear + '/' + monthStr + '/01')

      const days = qDate.daysInMonth(month)

      for (let j = 1; j <= days; j++) {
        const dayStr = (j < 10) ? '0' + j : j
        const gdate = cYear + '/' + monthStr + '/' + dayStr
        const gWeekDay = qDate.getDayOfWeek(gdate)

        if (gWeekDay !== 6 && gWeekDay !== 7 && !weekEnds) dates.push(gdate)
      }
    }

    return dates
  }
}

// notify

const notify = {
  s: (that, message) => {
    that.$q.notify({
      group: false,
      position: 'top',
      color: 'green',
      message
    })
  },
  e: (that, message) => {
    that.$q.notify({
      group: false,
      position: 'top',
      color: 'red',
      message
    })
  }
}

// http

import axios from 'axios'

const http = {}
http.loading = false
http.get = (url, onSuccess, onError, onFinal) => {
  http.loading = true

  return new Promise((resolve, reject) => {
    axios.get(url).then((r) => {
      onSuccess(r)
      resolve(r)
    }).catch((e) => {
      onError(e.response)
      reject(e.response)
    }).then((r) => {
      http.loading = false
      onFinal(r)
      resolve(r)
    })
  })
}

// router

const router = {
  to: (router, to) => {
    router.push(to)
  },
  tor: (router, to) => {
    window.location.href = '#' + to
    window.location.reload()
  }
}

// misc

const misc = {
  alert: (arg) => {
    alert(arg)
  },
  objsSum (objs, key) {
    let sum = 0
    objs.map((obj) => {
      sum += parseFloat(obj[key])
    })

    return sum
  }
}

export default {
  time,
  ls,
  str,
  arr,
  obj,
  user,
  tree,
  date,
  notify,
  misc,
  router,
  http,
  cart,
  orders
}
