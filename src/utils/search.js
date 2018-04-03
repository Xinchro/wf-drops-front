import {
  gaEvent,
  stripRelicText,
  setDocumentTitle
} from "./utils.js"

import {
  setQueryParam
} from "./querystring.js"

let sectionSearchWorker = new Worker("searchSections.js")

function searchTitle(text) {
  let newText = stripRelicText(text).text
  let isRelic = stripRelicText(text).isRelic

  if(newText != "Nothing related") {
    return search(newText)
  } else {
    // TODO display error
  }
}

function searchRelated(text) {
  let newText = stripRelicText(text).text
  let isRelic = stripRelicText(text).isRelic

  if(newText != "Nothing related") {
    return search(newText)
  } else {
    // TODO display error
  }
}

function search(text, dropdata) {
  return new Promise((res, rej) => {
    let searchTerms = text.split(" ")

    let filteredData = { sections: [{ section: "Error", items: {} }] }

    if(!dropdata) {
      res(filteredData)
    }

    if(!dropdata.sections) {
      filteredData.sections = dropdata
    } else {

      // new thread for search
      sectionSearchWorker.postMessage([dropdata.sections, searchTerms])

      // render data when search thread is complete
      sectionSearchWorker.onmessage = (e) => {
        filteredData.sections = e.data
        res(filteredData)
      }
    }

    setQueryParam("q", text)

    setDocumentTitle(text)
  })
}

export {
  search,
  searchRelated,
  searchTitle
}
