export const Store = (() => {
  const stores = []
  const filter = (cbs, cb) => {
    let i = 0,
      lastIndex = cbs.length - 1

    for (; cbs[i] !== cb;) {
      if (i++ === lastIndex) return false
    }
    for (; i < lastIndex;) {
      cbs[i] = cbs[++i]
    }
    cbs.pop()

    return true
  }

  return key => {
    let foundStore = stores.find(store => store.key === key)

    let store
    if (foundStore) store = foundStore
    else {
      store = { key, callbacks: [], value: {} }
      stores.push(store)
    }

    return {
      set(value) {
        store.value = value
        store.callbacks.forEach(callback => callback(value))
      },
  
      get() {
        return store.value
      },

      update(updater) {
        this.set(updater(store.value))
      },
  
      sub(callback) {
        store.callbacks.push(callback)
        callback(store.value)

        return () => this.unsub(callback)
      },

      unsub(callback) {
        return filter(store.callbacks, callback)
      }
    }
  }
})()
