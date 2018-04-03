<template>
  <section id="vue-wrapper">
    <wf-header
      :dropdata="dropdata"
      :filters="filters"
      :load-params="loadParams"
      :render-boundries="renderBoundries"
      :set-search-text="setSearchText"
      :set-filters="setFilters"
      :set-filter-states="setFilterStates"
      :set-filtered-data="setFilteredData"
      :update-drop-data="updateDropData"
    >
    </wf-header>

    <data-list
      :filtered-data="filteredData"
      :reset-related="resetRelated"
      :search-text="searchText"
      :toggle-related="toggleRelated"
      :title-drops="titleDrops"
    ></data-list>

    <wf-footer></wf-footer>
  </section>
</template>

<script>
  import {
    doLocalStorage,
    gaEvent,
    getData,
    getDataList,
    arrayFromString,
    stripRelicText,
    getCurrentFiltersString
  } from "../utils/utils.js"

  import {
    getQueryParams,
    setQueryParam
  } from "../utils/querystring.js"

  export default {
    data() {
      return {
        filters: [],
        dropdata: {},
        filteredData: { sections: [] },
        searchText: "",
        busy: false,
        titleDrops: {},
        showTitleDrops: false,
        crumbs: [],
        usedBreadcrumb: false,
        renderBoundries: {
          start: 0,
          end: 10
        }
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
          // if(!this.gotoCrumb(this.crumbs.length-2)) {
          //   // if not, default to first crumb and reset array and query params
          //   this.searchText = this.crumbs[0]
          //   this.crumbs = []
          //   this.addCrumb(this.searchText)
          //   setQueryParam("q", this.searchText)
          // }
        }

        // ga startup
        ga(() => {
          ga('create', 'UA-52457968-4', 'auto')
          ga('send', 'pageview')
        })
      },

      updateDropData(newData) {
        this.$set(this, "dropdata", newData)
      },

      setFilteredData(newData) {
        this.$set(this, "filteredData", newData)
      },

      resetRelated(data) {
        let element = this.getScrollerElement(data)

        element.className += " invisible"
      },

      getScrollerElement(data) {
        return document.getElementById(`${data}-title-drop-scroller`)
      },

      setSearchText(text) {
        this.$set(this, "searchText", text)
        return text
      },

      toggleRelated(data) {
        let element = this.getScrollerElement(data)
        if(element.className.includes("invisible")) {
          this.updateRelated(data)
        } else {
          this.resetRelated(data)
        }
        gaEvent("toggleRelated", "click", data, this.getCurrentFiltersString(this.filters))
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

      loadParams() {
        let params = getQueryParams() //get params

        // turn filters string into number array
        params.map((element) => {
          if(element.key === "filters") {
            element.value = arrayFromString(element.value, this.filters)
          }
        })

        // loop through params and assign variables their values
        params.forEach(param => {
          switch(param.key) {
            case "q":
              this.searchText = param.value
              break
            case "filters":
              this.setFilterStates(param.value)
              break
            default:
              console.error(`${param.key} is not a valid param`)
              break
          }
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

          setQueryParam("q", this.searchText)

          return true
        }
        return false
      },

      setFilters(filters) {
        this.filters = filters
        return filters
      },

      setFilterStates(array) {
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
    }
  }

</script>
