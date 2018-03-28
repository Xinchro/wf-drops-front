<template>
  <section id="vue-wrapper">
    <header class="header">
      <section class="search-wrapper">
        <input class="search-bar" type="text" v-model="searchText" placeholder="Search..." @input="searchBar(searchText)">
        <button class="search-button" @click="searchBar(searchText)">
          <i class="fa fa-search" aria-hidden="true"></i>
        </button>
      </section>
      <section class="dark-light">
        <button class="dark" @click="setTheme('dark');gaEvent('themeSwitch', 'click', 'dark')"></button>
        <button class="light" @click="setTheme('light');gaEvent('themeSwitch', 'click', 'light')"></button>
      </section>
      <section class="filter-menu">
        <ul class="menu" v-bind:class="{ invisible: !menuVisible }">
          <li>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdrC1O7WbsAnX8NOrnFukwLigsaaca17fI_oZpXyn-zcVvKkA/viewform" target="_none" class="filter-checkbox-box"><i class="fa fa-globe"></i></a>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSdrC1O7WbsAnX8NOrnFukwLigsaaca17fI_oZpXyn-zcVvKkA/viewform" target="_none" class="list-label">Feedback</a>
          </li>
          <li class="title">Filters</li>
          <li v-for="filter in filters" @click.prevent="updateCurrentFilters(filter.id)">
            <input v-bind:id="filter.id" v-bind:name="filter.name" type="checkbox" class="filter-checkbox invisible" v-bind:checked="filter.on">
            <label v-bind:for="filter.id" class="filter-checkbox-box">
              <i v-if="filters[filter.id].on" class="fa fa-check"></i>
              <i v-if="!filters[filter.id].on" class="fa fa-times"></i>
            </label>
            <label v-bind:for="filter.id" class="filter-name list-label">{{filter.label}}</label>
          </li>
        </ul>
        <button class="menu-button" @click="toggleMenu">
          <span>info</span>
          <span v-if="menuVisible"><i class="fa fa-chevron-up" aria-hidden="true"></i></span>
          <span v-else><i class="fa fa-chevron-down" aria-hidden="true"></i></span>
        </button>
      </section>
    </header>

    <section id="data" class="data-wrapper">
      <ul class="sections">
        <li class="section" v-for="section in renderedData.sections">
          <section class="title-wrapper">
            <button @click="resetRelated(section.section);searchTitle(section.section)" class="title-text" v-bind:title="'Search for '+section.section">{{section.section}}</button>
            <i class="fa fa-question-circle" @click="toggleRelated(section.section)"></i>
            <section class="scrolling-drops invisible" v-bind:id="section.section+'-title-drop-scroller'" v-bind:key="section.section+'-title-drop-scroller-key'">
              <p>Related:</p>
              <section class="titles-wrapper">
                <ul class="titles">
                  <li class="title" v-for="title in titleDrops.data">
                    <button class="title-button" @click="searchRelated(title)">{{title}}</button>
                  </li>
                </ul>
              </section>
            </section>
          </section>
          <ul class="subSections">
            <li class="subSection" v-if="section.subSections" v-for="subSection in section.subSections">
              <section class="title-wrapper">
                <p class="title-text">{{subSection.subSection}}</p>
              </section>

              <ul class="subSubSections">
                <li class="subSubSection" v-if="subSection.subSubSections" v-for="subSubSection in subSection.subSubSections">
                  <section class="title-wrapper">
                    <p class="title-text">{{subSubSection.subSubSection}}</p>
                  </section>

                  <ul class="items">
                    <li class="item" v-if="subSubSection.items">
                      <p class="column-1 column">Name</p>
                      <p class="column-2 column">Item drop chance (if applicable)</p>
                      <p class="column-3 column">Drop rate</p>
                    </li> <!-- item -->
                    <li class="item highlight" v-if="subSubSection.items" v-for="item in subSubSection.items" @click="searchItem(item.name.toLowerCase())">
                      <p class="column-1 column">{{item.name}}</p>
                      <p class="column-2 column">{{item.itemchance}}</p>
                      <p class="column-3 column">{{item.droprate}}</p>
                    </li> <!-- item -->
                  </ul> <!-- items -->

                </li> <!-- subsection -->
              </ul> <!-- subsections -->

              <ul class="items">
                <li class="item" v-if="subSection.items && !subSection.subSubSections">
                  <p class="column-1 column">Name</p>
                  <p class="column-2 column">Item drop chance (if applicable)</p>
                  <p class="column-3 column">Drop rate</p>
                </li> <!-- item -->
                <li class="item highlight" v-if="subSection.items" v-for="item in subSection.items" @click="searchItem(item.name.toLowerCase())">
                  <p class="column-1 column">{{item.name}}</p>
                  <p class="column-2 column">{{item.itemchance}}</p>
                  <p class="column-3 column">{{item.droprate}}</p>
                </li> <!-- item -->
              </ul> <!-- items -->

            </li> <!-- subsection -->
          </ul> <!-- subsections -->

          <ul class="items">
            <li class="item" v-if="section.items">
              <p class="column-1 column">Name</p>
              <p class="column-2 column">Item drop chance (if applicable)</p>
              <p class="column-3 column">Drop rate</p>
            </li> <!-- item -->
            <li class="item highlight" v-if="section.items" v-for="item in section.items" @click="searchItem(item.name.toLowerCase())">
              <p class="column-1 column">{{item.name}}</p>
              <p class="column-2 column">{{item.itemchance}}</p>
              <p class="column-3 column">{{item.droprate}}</p>
            </li> <!-- item -->
          </ul> <!-- items -->
        </li> <!-- section -->
      </ul> <!-- sections -->

      <div v-infinite-scroll="addHead" infinite-scroll-disabled="busy" infinite-scroll-distance="50">
      </div>

    </section> <!-- data-wrapper -->

    <footer class="footer">
      <span class="cookie-policy">By using this website, you acknowledge our <a href="/policy" target="_blank">Cookie Policy.</a></span>
    </footer> <!-- footer -->
  </section>
</template>

<script>
  let renderStart = 0
  let renderEnd = 10

  let sectionSearchWorker = new Worker("searchSections.js")

  export default {
    data() {
      return {
        filters: [],
        menuVisible: false,
        dropdata: {},
        filteredData: {},
        renderedData: {},
        searchText: "",
        busy: false,
        titleDrops: {},
        showTitleDrops: false,
        crumbs: [],
        typingTimeout: {},
        usedBreadcrumb: false,
        gaLoaded: false,
      }
    },
    beforeCreate: function () {
      this.$nextTick(function () {
        this.start()
      })
    },
    watch: {
    },
    methods: {
      start() {
        // watcher for when user hits "back" on browser, or equiv.
        window.onpopstate = () => {
          this.loadParams()
          // make sure we can go back far enough
          if(!this.gotoCrumb(this.crumbs.length-2)) {
            // if not, default to first crumb and reset array and query params
            this.searchText = this.crumbs[0]
            this.crumbs = []
            this.addCrumb(this.searchText)
            this.setQueryParam("q", this.searchText)
          }
        }

        // generate filter list based on the index endpoint
        this.genFilters()
          // set prefered filters first, then apply query params (if they exist)
          // query overwrites for link sharing purposes
          .then(this.setFilters(this.arrayFromString(this.doLocalStorage("get", "filters"))))
          .then(() => {
            this.loadParams()
            this.updateCurrentFilters()
          })

        // set preferred theme
        this.setTheme(this.doLocalStorage("get", "theme"))

        // ga startup
        ga(() => {
          ga('create', 'UA-52457968-4', 'auto')
          ga('send', 'pageview')
        })
      },

      getData(name) {
        return new Promise((resolve, reject) => {
          if(name) {
            const xmlHttp = new XMLHttpRequest()

            xmlHttp.onreadystatechange = () => {
              if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                resolve(JSON.parse(xmlHttp.responseText))
              } else if (xmlHttp.status == 404) {
                reject(name)
                console.error(`Could not get ${name}. Tweet @xinchronize this error and tell him he's bad at Javascript.`)
              }
            }

            xmlHttp.open("GET", `https://wf-drops-data.xinchronize.com/${name}.json?=${new Date(new Date().getTime()).toLocaleString()}`, true) // true for asynchronous
            xmlHttp.send(null)
          } else {
            reject("No name to fetch.")
          }
        })
      },

      getDataList(list) {
        let allSections = []

        return new Promise((resolve, reject) => {
          let filters = this.filters
          let getData = this.getData

          // start loop function
          a(0)

          // setup loop function
          function a(index) {
            // set current filter
            let filter = filters[index]

            // get data only if current filter is on
            getData(
              filter.on ? filter.name : ""
            )
            .then(data => {
              // if filter is on, push to filtered sections
              if(filter.on) {
                data.sections.forEach(section => {
                  allSections.push(section)
                })
              }

              // increment loop function index
              index++

              // if index is smaller than filters, call again
              // if not, resolve function and return filtered sections
              if(index < filters.length) {
                a(index)
              } else {
                resolve({ sections: allSections })
              }
            }, data => {
              console.error(`${data} - Rejected`)
              // increment loop function index
              index++

              // if index is smaller than filters, call again
              // if not, resolve function and return filtered sections
              if(index < filters.length) {
                a(index)
              } else {
                resolve({ sections: allSections })
              }
            })
          }
        })

      },

      updateSearchResults() {
        this.$set(this.filteredData, "sections", {})

        this.getDataList(this.filters)
        .then((data) => {
          this.updateData(data)
        })
      },

      searchBar(text) {
        // wait a while before committing to a search, while typing
        clearTimeout(this.typingTimeout)
        this.typingTimeout = setTimeout(()=>{
          this.search(text)
          // fire off a ga event to save the term tracked via input bar
          this.gaEvent("search", "input", `bar - ${text ? text : "blank"}`)
        }, 500)
      },

      searchItem(text) {
        // update search bar text and search
        this.searchText = text
        this.search(text)
        // fire off a ga event to save the term tracked via input bar
        this.gaEvent("search", "click", `item - ${text ? text : "blank"}`)
      },

      searchTitle(text) {
        let newText = this.stripRelicText(text).text
        let isRelic = this.stripRelicText(text).isRelic

        if(newText != "Nothing related") {
          this.searchText = newText
          this.search(newText)
          // fire off a ga event to save the term tracked via input bar
          // this.addCrumb(this.searchText)
        } else {
          // TODO display error
        }

        // fire off a ga event for relics
        this.gaEvent("search", "click", `title - ${isRelic ? "relic - " : "" }${newText ? newText : "blank"}`)
      },

      searchRelated(text) {
        let newText = this.stripRelicText(text).text
        let isRelic = this.stripRelicText(text).isRelic

        if(newText != "Nothing related") {
          this.searchText = newText
          this.search(newText)
          // fire off a ga event to save the term tracked via input bar
          // this.addCrumb(this.searchText)
        } else {
          // TODO display error
        }

        // fire off a ga event for relics
        this.gaEvent("search", "click", `related - ${isRelic ? "relic - " : "" }${newText ? newText : "blank"}`)
      },

      stripRelicText(text) {
        // array of text to strip
        let relicRanks = ["(Intact)","(Exceptional)","(Flawless)","(Radiant)"]

        let stripped = false

        // stripping loop
        relicRanks.forEach(rank => {
          // strip text if it matches and say we've stripped at least one thing
          if(text.toLowerCase().includes(rank.toLowerCase())) {
            text = text.replace(rank, "").toLowerCase()
            stripped = true
          }
        })

        // return obj with both the stripped text and if it has had to be stripped
        return { "text": text, "isRelic": stripped }
      },

      search(text) {
        let searchTerms = text.split(" ")

        renderStart = 0
        renderEnd = 10

        if(!this.filteredData.sections) {
          this.$set(this.filteredData, "sections", [])
          this.addHead()
        }
        if(!this.dropdata.sections) {
          this.$set(this.filteredData, "sections", this.dropdata)
          this.addHead()
        } else {

          // new thread for search
          sectionSearchWorker.postMessage([this.dropdata.sections, searchTerms])

          // render data when search thread is complete
          sectionSearchWorker.onmessage = (e) => {
            this.$set(this.filteredData, "sections", e.data)
            this.addHead()
          }
        }

        this.setQueryParam("q", this.searchText)

        if(!this.usedBreadcrumb) {
          this.addCrumb(this.searchText)
        }

        this.setDocumentTitle(this.searchText)
        this.usedBreadcrumb = false
      },

      updateData(newData) {
        this.$set(this, "dropdata", newData)
        this.search(this.searchText)
      },

      toggleMenu() {
        this.menuVisible = !this.menuVisible
      },

      checkbox(id) {
        return document.getElementById(id)
      },

      updateCurrentFilters(filterID) {
        if(filterID != undefined) {
          this.filters[filterID].on = this.checkbox(filterID).checked = !this.checkbox(filterID).checked
          this.gaEvent("toggleFilter", "click", this.filters[filterID].name)
        }

        renderStart = 0
        renderEnd = 10

        this.updateSearchResults()

        let filterString = this.getCurrentFiltersString()

        this.setQueryParam("filters", filterString)
        this.doLocalStorage("set", "filters", filterString)
      },

      getCurrentFiltersString() {
        let filterString = ""

        this.filters.forEach(filter=>{
          if(filter.on) filterString += `${filter.id},`
        })
        filterString = filterString.slice(0,-1)

        return filterString
      },

      addHead() {
        this.renderedData = {sections:[]}

        if(this.filteredData.sections && this.filteredData.sections.length > 0) {
          for (let i=0; i<renderEnd; i++) {
            if(this.filteredData.sections[i]) {
              this.renderedData.sections.push(this.filteredData.sections[i])
            }
          }

          if(this.filteredData.sections.length > 0) {
            if(renderEnd+5 > this.filteredData.sections.length) {
              renderEnd = this.filteredData.sections.length
            } else {
              renderStart = renderEnd
              renderEnd += 5
            }
          }
        }

        this.$set(this, "renderedData", this.renderedData)
      },

      setTheme(theme) {
        let element = document.getElementById("vue-wrapper")
        if(element) {
          element.className = theme

          if (theme === "dark") {
            element.className = ""
          }
        }

        this.doLocalStorage("set", "theme", theme)

        return theme
      },


      resetRelated(data) {
        let element = this.getScrollerElement(data)

        element.className += " invisible"
      },

      getScrollerElement(data) {
        return document.getElementById(`${data}-title-drop-scroller`)
      },

      toggleRelated(data) {
        let element = this.getScrollerElement(data)
        if(element.className.includes("invisible")) {
          this.updateRelated(data)
        } else {
          this.resetRelated(data)
        }
        this.gaEvent("toggleRelated", "click", data)
      },

      updateRelated(data) {
        let relicRanks = ["(Intact)","(Exceptional)","(Flawless)","(Radiant)"]
        let includingTitles = []

        let element = this.getScrollerElement(data)

        let title = data.replace("", "").toLowerCase()

        this.$set(this.titleDrops, "data", "")

        relicRanks.forEach(rank => {
          if(data.toLowerCase().includes(rank.toLowerCase())) {
            data = data.replace(rank, "").toLowerCase()
          }
        })

        data = data.split(" ")

        // new thread for search
        sectionSearchWorker.postMessage([this.dropdata.sections, data])

        // render data when search thread is complete
        sectionSearchWorker.onmessage = (e) => {
          e.data.forEach(section => {
            if(!section.section.toLowerCase().includes(title.toLowerCase())) {
              includingTitles.push(section.section)
            }
          })

          if(includingTitles.length>0) {
            this.$set(this.titleDrops, "data", includingTitles)
          } else {
            this.$set(this.titleDrops, "data", ["Nothing related"])
          }

          setTimeout(()=>{
            element.className = element.className.replace(/ invisible/g, "")
            if(includingTitles.length>0) {
              element.children[1].children[0].style.animationDuration = `${element.offsetWidth/10}s` // picking titles in titles-wrapper
            } else {
              element.children[1].children[0].style.animationDuration = "0s"
            }
          },10)
        }
      },

      getQueryParams() {
        let queries = ""
        let queryParams = []

        queries = window.location.search.split("?")[1] // remove question mark

        if(queries) {
          queries = queries.split("&") // split each query up

          queries.forEach(query => {
            // let ob = {}
            let ob = {
              "key": query.split("=")[0],
              "value": query.split("=")[1]
            } //construct object

            ob.value = decodeURIComponent(ob.value)

            // check if value is an array
            if(query.split("=")[1].includes(",")) {
              ob.value = this.arrayFromString(ob.value) // split array at comma
            }

            queryParams.push(ob) // push query object to array
          })
        }

        return queryParams
      },

      arrayFromString(arrayStr) {
        // check if string is empty
        if(arrayStr != undefined && arrayStr != "") {
          let array = arrayStr.split(",")

          array.forEach((num, i) => {
            array[i] = parseInt(num)
          })

          return array // return array
        } else {
          let arr = []

          // fill array with numbers
          this.filters.forEach((ele, i) => {
            arr.push(i+1)
          })

          return arr // if no string, return full array
        }
      },

      setQueryParam(key, value) {
        let queryStr = "/?" // set up query string

        let params = this.getQueryParams() // get current params

        let paramExists = false

        // loop through params and check for matches
        params.forEach(query => {
          if(key === query.key) {
            // if param to change is already in url bar, change it
            query.value = value
            // make sure we know it's been changed
            paramExists = true
          }
        })

        // if nothing matched in url, add to url
        if(!paramExists) {
          params.push({
            "key": key,
            "value": value
          })
        }

        // look throught the param array with new values and add to the query string
        params.forEach((param, index) => {
          index > 0 ? queryStr += "&" : "" // only prepend ampersand after first instance
          queryStr += `${param.key}=${param.value}`
        })

        // add to history/url
        if (history.pushState) {
          let state = {}
          let title = this.searchText
          let path  = `${queryStr}`

          history.pushState(state, title, path);
        }
      },

      loadParams() {
        let params = this.getQueryParams() //get params

        // loop through params and assign variables their values
        params.forEach(param => {
          switch(param.key) {
            case "q":
              this.searchText = param.value
              break
            case "filters":
              this.setFilters(param.value)
              break
            default:
              console.error(`${param.key} is not a valid param`)
              break
          }
        })
      },

      genFilters() {
        // get index
        return this.getData("index")
          .then((response) =>{
            // get endpoint array
            const endpoints = response.endpoints

            this.filters = endpoints.map((endpoint, index) => {
              // create filters
              return {
                name: endpoint.name.replace(".json", ""),
                label: endpoint.displayName,
                id: index,
                on: true
              }
            })
          })
      },

      setFilters(array) {
        return new Promise((resolve, reject)=>{
          if(typeof(array) === 'object') {
            // clear filters
            this.filters.forEach(filter => {
              filter.on = false
            })

            // loop through and set filters
            array.forEach(filterID => {
              // js is stupid and thinks NaN is a number, so check for that
              if(typeof(filterID) === 'number' && !isNaN(filterID)) {
                if(this.filters[filterID]) this.filters[filterID].on = true
              }
            })
          }

          resolve()
        })
      },

      addCrumb(crumb) {
        if(crumb != "") this.crumbs.push(crumb) // add crumb if not empty
      },

      gotoCrumb(crumbNo) {
        this.usedBreadcrumb = true // used a breadcrumb
        if(this.crumbs.length > 0
          && (this.crumbs.length - Math.abs(crumbNo)) > 0
          && (this.crumbs.slice(0, crumbNo).length) >= 0) {
          // checks to not break anything if values are exceeded

          this.searchText = this.crumbs[crumbNo]
          this.crumbs = this.crumbs.slice(0, crumbNo+1)

          this.setQueryParam("q", this.searchText)

          return true
        }
        return false
      },

      setDocumentTitle(text) {
        document.title = `${text} - Warframe Drops`
      },

      doLocalStorage(type, item, data) {
        try {
          switch(type.toLowerCase()) {
            case "set":
              return window.localStorage.setItem(item, data)
              break
            case "get":
              if(window.localStorage.getItem(item)) {
                return window.localStorage.getItem(item)
              } // else return nothing
              break
            case "remove":
              return window.localStorage.removeItem(item)
              break
            default:
              console.error("local storage supported, but no action type specified")
          }
        } catch(e) {
          console.error("Local storage not supported!")
          console.error(e)
        }
      },

      gaEvent(category, action, label) {
        // make sure ga is loaded and working before doing anything else
        if(!this.gaLoaded) {
          ga(
            () => {
              this.gaLoaded=true
              this.gaEvent(category, action, label)
            }
          )
        } else {
          // make sure we have all the mandatory args we need, if not just don't do anything
          if(
              (category == undefined || category == "") ||
              (action == undefined || action == "")
            ) {
            console.error("failed to send ga event", category, action, label)
            return
          }
          // check if a label has been set and warn if not
          if(label == undefined || label == "") {
            console.warn("no label set for this ga event", category, action, label)
          } else {
            // event.label = ""
          }

          ga(() => {
            ga('set', 'dimension1', this.getCurrentFiltersString())
            // send the ga event
            ga('send', 'event', category, action, label)
          })
        }
      }
    }
  }

</script>
