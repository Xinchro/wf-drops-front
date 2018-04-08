<template>
  <header class="header">
    <section class="search-wrapper">
      <input class="search-bar" type="text" v-model="searchBarText" placeholder="Search..." @input="searchBar(searchBarText, dropdata)">
      <button class="search-button" @click="searchBar(searchBarText, dropdata)">
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
</template>

<script>
  import {
    arrayFromString,
    doLocalStorage,
    gaEvent,
    getCheckbox,
    getCurrentFiltersString,
    getData,
    getDataList
  } from "../utils/utils.js"

  import {
    search,
    searchRelated,
    searchTitle
  } from "../utils/search.js"

  import {
    setQueryParam
  } from "../utils/querystring.js"

  export default {
    data() {
      return {
        menuVisible: false,
        searchBarText: "",
        typingTimeout: {},
      }
    },
    props: [
      "dropdata",
      "filters",
      "getCurrentFiltersString",
      "loadParams",
      "searchText",
      "setFilters",
      "setFilterStates",
      "setFilteredData",
      "setSearchText",
      "updateDropData"
    ],
    mounted: function () {
      // initiate header
      this.$nextTick(function () {
        // set preferred theme
        this.setTheme(doLocalStorage("get", "theme"))

        // generate filter list based on the index endpoint
        this.genFilters()
          .then(this.setFilters)
          // set prefered filters first, then apply query params (if they exist)
          // query overwrites for link sharing purposes
          .then((filters) => {
            this.setFilterStates(arrayFromString(doLocalStorage("get", "filters"), filters))} // last state
          )
          .then(() => {
            this.loadParams() // load params from url
            this.updateCurrentFilters() // update current filters to match params
          })
      })
    },
    watch: {
      dropdata: function (value, oldValue) {
        this.search(this.searchText, value) // initial search to fill out array
      },
      searchText: function (value, oldValue) {
        this.searchBarText = value
      }
    },
    methods: {
      searchBar(text, dropdata) {
        console.log(text)
        // wait a while before committing to a search, while typing
        clearTimeout(this.typingTimeout)
        this.typingTimeout = setTimeout(()=>{
          this.search(text, dropdata)
          // fire off a ga event to save the term tracked via input bar
          gaEvent("search", "input", `bar - ${text ? text : "blank"}`)
        }, 500)
      },

      setTheme(theme) {
        // get wrapper
        let element = document.getElementById("vue-wrapper")

        // if we actually got it
        if(element) {
          // set the class to the theme
          element.className = theme

          // if the theme is dark, make it blank(light theme)
          if (theme === "dark") {
            element.className = ""
          }
        }

        // save theme to storage
        doLocalStorage("set", "theme", theme)

        return theme
      },

      toggleMenu() {
        this.menuVisible = !this.menuVisible
      },

      updateSearchResults() {
        this.setFilteredData({ sections: [] }) // empty filtered data

        getDataList(this.filters) // get fresh data
          .then((data) => {
            this.updateDropData(data) // update with fresh data
          })
      },

      genFilters() {
        return new Promise((res, rej) => {
          // get index
          return getData("index")
            .then((response) =>{
              // get endpoint array
              const endpoints = response.endpoints

              const structured = endpoints.map((endpoint, index) => {
                // create filters
                return {
                  name: endpoint.name.replace(".json", ""),
                  label: endpoint.displayName,
                  id: index,
                  on: true
                }
              })

              res(structured)
            })
        })
      },

      searchTitle(text, dropdata) {
        searchTitle(text, dropdata)
          .then(this.setFilteredData(searched))

        // fire off a ga event for relics
        gaEvent("search", "click", `title - ${isRelic ? "relic - " : "" }${newText ? newText : "blank"}`, getCurrentFiltersString(this.filters))
      },

      searchRelated(text, dropdata) {
        searchRelated(text, dropdata)
          .then(this.setFilteredData(searched))

        // fire off a ga event for relics
        gaEvent("search", "click", `related - ${isRelic ? "relic - " : "" }${newText ? newText : "blank"}`, getCurrentFiltersString(this.filters))
      },

      search(text, dropdata) {
        search(text, dropdata)
          .then(this.setFilteredData)
      },

      updateCurrentFilters(filterID) {
        if(filterID != undefined) {
          this.filters[filterID].on = getCheckbox(filterID).checked = !getCheckbox(filterID).checked
          gaEvent("toggleFilter", "click", this.filters[filterID].name)
        }

        this.updateSearchResults()

        let filterString = getCurrentFiltersString(this.filters)

        setQueryParam("filters", filterString)
        doLocalStorage("set", "filters", filterString)
      },
    }
  }
</script>
