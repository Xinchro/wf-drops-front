<template>
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

  </section>
</template>

<script>
  export default {
    data() {
      return {
      }
    },
    props: [
      "renderedData",
      "resetRelated",
      "searchTitle",
      "toggleRelated",
      "titleDrops",
      "addHead",
    ],
    methods: {
    }
  }
</script>
