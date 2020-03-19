const vuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#FF9800',
      }
    }
  }
})

const Search = { template: '#search' }
const Contact = { template: '#contact' }

const store = new Vuex.Store({
  state: {
    records: []
  },
  mutations: {
    setRecords(state, arr) {
      state.records = arr
    }
  },
  actions: {
    getRecords({commit}) {
      axios.get('./records.json').then(res => {
        commit('setRecords', res.data)
      })
    }
  },
})


const app = new Vue({
  el: '#app',
  vuetify,
  store,
  computed: {
    arrWordSplit() {
      // 全角スペースは半角スペースに置換、アルファベットはすべて小文字に置換
      const wordReplaced = this.input.word.replace(/　+/g, ' ').toLowerCase()
      // スペース連続などによって生まれる空文字を取り除く
      return wordReplaced.split(' ').filter(v => v)
    },
    countAllRecords() {
      return this.$store.state.records.length
    },
    options() {
      const categories = [... new Set(this.$store.state.records.map(r => r.category))]
      const types = [... new Set(this.$store.state.records.map(r => r.type))]

      this.input.selectedCategories = categories.slice()
      this.input.selectedTypes = types.slice()

      return {
        categories,
        types
      }
    },
    selectsAllCategory() {
      return this.input.selectedCategories.length === this.options.categories.length
    },
    selectsSomeCategory() {
      return this.input.selectedCategories.length > 0 && !this.selectsAllCategory
    },
    iconCategory() {
      if (this.selectsAllCategory) return 'mdi-close-box'
      if (this.selectsSomeCategory) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    },
    
    selectsAllType() {
      return this.input.selectedTypes.length === this.options.types.length
      
    },
    selectsSomeType() {
      return this.input.selectedTypes.length > 0 && !this.selectsAllType
    },
    iconType() {
      if (this.selectsAllType) return 'mdi-close-box'
      if (this.selectsSomeType) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    }
  },
  methods: {
    changeShowStatus(i) {
      this.show.splice(i, 1, !this.show[i])
    },
    getRecordsByButton() {
      this.$store.dispatch('getRecords')
    },
    searchRecords() {
      if (!this.input.selectedCategories.slice().length) {
        this.errorCategory = true
        return
      }
      this.showResultArea = true
      const filtered = this.$store.state.records.filter(r => {
        /* ① カテゴリ・タイプによるフィルタリング */
        // r.categoryがinput.selectedCategoriesに入っているかどうか、
        // r.typeがinput.selectedTypesに入っているかどうか、をチェック
        // (どちらか一方でも入ってなければその時点でfalseを返す)
        if (!this.input.selectedCategories.includes(r.category) || !this.input.selectedTypes.includes(r.type)) {
          return false
        }

        /* ② 入力したキーワードによるフィルタリング */
        // (マッチングが見つかった時点でtrueを返す、最後まで見つからなければfalse)
        const flag = this.arrWordSplit.every(word => {
          // レコードに指定された検索キーワードとのマッチングを判定する
          // r.keywordにinput.wordが入ってるかどうかをチェック
          const keywordLower = r.keyword.map(v => v.toLowerCase())

          if(keywordLower.includes(word)) {
            return true
          } 

          // タイトルとのマッチングを判定する
          // r.titleにinput.wordが入ってるかどうかをチェック
          const titleLower = r.title.toLowerCase()
          if(titleLower.includes(word)) {
            return true
          }

          // どこにもマッチしなかった => falseを返す
          return false
        })
        return flag
      })
      this.filteredRecords = filtered
      // this.show = filtered.map(() => false)
    },
    toggleCategory() {
      this.$nextTick(() => {
        if (this.selectsAllCategory) {
          this.input.selectedCategories = []
        } else {
          this.input.selectedCategories = this.options.categories.slice()
        }
      })
    },
    toggleType() {
      this.$nextTick(() => {
        if (this.selectsAllType) {
          this.input.selectedTypes = []
        } else {
          this.input.selectedTypes = this.options.types.slice()
        }
      })
    }
  },
  data() {
    return {
      input: {
        word: '',
        selectedCategories: [],
        selectedTypes: []
      },
      showResultArea: false,
      filteredRecords: [],

      show: []
    }
  },
  mounted() {
    this.$store.dispatch('getRecords')
  }
})



