<template>
  <section id="data" class="data-wrapper">
    <ul class="sections">
      <li class="section" v-for="section in renderedData.sections">
        <section class="title-wrapper">
          <button @click="searchTitle(section.section)" class="title-text" v-bind:title="'Search for '+section.section">{{section.section}}</button>
          <i class="fa fa-question-circle" @click="toggleRelated(section.section)"></i>
          <section class="scrolling-drops invisible" v-bind:id="section.section+'-title-drop-scroller'" v-bind:key="section.section+'-title-drop-scroller-key'">
            <p>Related:</p>
            <section class="titles-wrapper">
              <ul class="titles">
                <li class="title" v-for="title in titleDrops">
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

    <div v-infinite-scroll="addHead" infinite-scroll-disabled="busy" infinite-scroll-distance="50" @click="addHead">
    </div>

  </section>
</template>

<script>
  import {
    search,
    searchRelated,
    searchTitle
  } from "../utils/search.js"

  import {
    gaEvent,
    stripRelicText
  } from "../utils/utils.js"

  export default {
    data() {
      return {
        renderedData: {},
        renderLimits: {
          start: 0,
          end: 5
        },
        titleDrops: {},
        showTitleDrops: false
      }
    },
    props: [
      "dropdata",
      "filteredData",
      "getRelated",
      "setFilteredData",
      "setSearchText"
    ],
    watch: {
      filteredData: function (value, oldValue) {
        this.resetRenderLimit()
        this.addHead(this.filteredData) // initial items visible
      }
    },
    methods: {
      addHead() {
        this.$set(this, "renderedData", { section: [] })
        let renderedData = { sections: [] } // empty rendered data
        if(this.filteredData) {
          // if we have filtered sections
          if(this.filteredData.sections && this.filteredData.sections.length > 0) {
            // loop through until the render end limit
            for (let i=0; i<this.renderLimits.end; i++) {
              // if the section exists
              if(this.filteredData.sections[i]) {
                // push the section to the rendered data
                renderedData.sections.push(this.filteredData.sections[i])
              }
            }

            // if the filtered data has sections
            if(this.filteredData.sections.length > 0) {
              // if going over the end limit by 5 exceeds the amount of filtered sections
              if(this.renderLimits.end+5 > this.filteredData.sections.length) {
                // set the end limit to the amount of sections
                this.renderLimits.end = this.filteredData.sections.length
                if(this.renderLimits.start > this.renderLimits.end) {
                  this.renderLimits.start = this.renderLimits.end-1
                }
              } else { // if going over the end limit by 5 is still within the amount of filtered sections
                // set the start limit to the end limit
                this.renderLimits.start = this.renderLimits.end
                // add 5 to the end limit
                this.renderLimits.end += 5
              }
            }
          }

          this.$set(this, "renderedData", renderedData)
        }
      },

      toggleRelated(title) {
        let element = this.getScrollerElement(title)
        if(element.className.includes("invisible")) {
          this.updateRelated(title)
            .then((resp) => {
              element.className = element.className.replace(/ invisible/g, "")
            })
        } else {
          element.className += " invisible"
          this.resetRelated(title)
        }
        gaEvent("toggleRelated", "click", title)
      },

      resetRelated(title) {
        let element = this.getScrollerElement(title)
        if(!element.className.includes("invisible")) {
          element.className += " invisible"
        }
      },

      getScrollerElement(data) {
        return document.getElementById(`${data}-title-drop-scroller`)
      },

      searchTitle(text) {
        // search title
        this.search(text)

        gaEvent("search", "click", `title - ${text ? text : "blank"}`)
      },

      searchRelated(text) {
        // if nothing related, do nothing
        if(text.toLowerCase() === "nothing related") {
          return
        }

        this.search(text)

        gaEvent("search", "click", `related - ${text ? text : "blank"}`)
      },

      searchItem(text) {
        this.search(text)

        // fire off a ga event to save the term tracked via input bar
        gaEvent("search", "click", `item - ${text ? text : "blank"}`)
      },

      search(text) {
        // search drop data for matching data
        search(text, this.dropdata)
          .then((resp) => {
            this.setSearchText(stripRelicText(text).text) // strip relic text and set search bar and query text
            this.setFilteredData(resp) // set filtered data
          })
      },

      updateRelated(title) {
        return new Promise((res, rej) => {
          let includingTitles = []
          let element = this.getScrollerElement(title)

          this.getRelated(title)
            .then((resp) => {
              this.setTitleDrops(resp)
              res(resp)
            })
        })
      },

      setTitleDrops(data) {
        this.titleDrops = data
      },

      resetRenderLimit() {
        this.renderLimits = { start: 0, end: 10 }
        return this.renderLimits
      },
    }
  }
</script>
