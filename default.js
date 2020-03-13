const vuetify = new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#FF9800',
        // brand: '#03A9F4',
        unanswered: '#999999',
        correct: '#0288d1',
        wrong: '#e57373'
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
    categories() {
      const arr = !!this.countAllRecords
        ? this.$store.state.records.map(r => r.category)
        : []
      return [... new Set(arr)]
    },

    selectsAllCategory() {
      return this.input.selectedCategories.length === this.categories.length
    },
    selectsSomeCategory() {
      return this.input.selectedCategories.length > 0 && !this.selectsAllCategory
    },
    icon() {
      if (this.selectsAllCategory) return 'mdi-close-box'
      if (this.selectsSomeCategory) return 'mdi-minus-box'
      return 'mdi-checkbox-blank-outline'
    }
  },
  methods: {
    changeShowStatus(x) {
      console.log(x)
      this.show.splice(x, 1, !this.show[x])
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
        /* カテゴリによるフィルタリング */
        // r.categoryがinput.selectedCategoriesに入ってるかどうかをチェック
        // (入ってなければその時点でfalseを返す)
        if(!this.input.selectedCategories.includes(r.category)) {
          return false
        }

        /* 入力したキーワードによるフィルタリング */
        // (マッチングが見つかった時点でtrueを返す、最後まで見つからなければfalse)
        const flag = this.arrWordSplit.every(word => {
          // 質問に指定された検索キーワードとのマッチングを判定する
          // r.keywordにinput.wordが入ってるかどうかをチェック
          const keywordLower = r.keyword.map(v => v.toLowerCase())

          if(keywordLower.includes(word)) {
            return true
          } 

          // 質問文とのマッチングを判定する
          // r.titleにinput.wordが入ってるかどうかをチェック
          const titleLower = r.title.toLowerCase()
          if(titleLower.includes(word)) {
            return true
          }

          // // 回答文とのマッチングを判定する
          // // r.answerにinput.wordが入ってるかどうかをチェック
          // const answerLower = r.answer.toLowerCase()
          // if(answerLower.includes(word)) {
          //   return true
          // }

          // どこにもマッチしなかった = falseを返す
          return false
        })
        return flag
      })
      this.filteredRecords = filtered
    },
    toggle() {
      this.$nextTick(() => {
        if (this.selectsAllCategory) {
          this.input.selectedCategories = []
        } else {
          this.input.selectedCategories = this.categories.slice()
        }
      })
    }
  },
  data() {
    return {
      drawer: {
        show: false,
        selected: ''
      },
      input: {
        word: '',
        selectedCategories: [],
      },
      showResultArea: false,
      filteredRecords: [],
      panel: [],
      overlay: true,


      show: [false, false, false]
    }
  },
  mounted() {
    this.$store.dispatch('getRecords')
  }
})
