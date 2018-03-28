<template>
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
</template>

<script>
  export default {
    data() {
      return {
      }
    },
    props: [
      "searchText",
      "menuVisible",
      "filters",
      "toggleMenu",
      "setTheme",
      "searchBar",
      "updateCurrentFilters",
      "gaEvent",
    ],
    methods: {
    }
  }
</script>
