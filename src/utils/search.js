import {
  gaEvent,
  stripRelicText,
  setDocumentTitle
} from "./utils.js"

import {
  setQueryParam
} from "./querystring.js"

let sectionSearchWorker = new Worker("searchSections.js")

function searchTitle(text, dropdata) {
  let newText = stripRelicText(text).text
  let isRelic = stripRelicText(text).isRelic

  if(newText != "Nothing related") {
    return search(newText, dropdata)
  } else {
    // TODO display error
  }
}

function searchRelated(title, dropdata) {
  return new Promise((res, rej) => {
    let newText = stripRelicText(title).text
    let isRelic = stripRelicText(title).isRelic
    let includingTitles = []

    if(newText != "Nothing related") {
      // split stripped text
      let data = newText.split(" ")

      // new thread for search
      sectionSearchWorker.postMessage([dropdata.sections, data])

      // render data when search thread is complete
      sectionSearchWorker.onmessage = (e) => {
        // loop through found items
        e.data.forEach(section => {
          // ignore same name
          if(!section.section.toLowerCase().includes(newText.toLowerCase())) {
            // add title of section to array
            includingTitles.push(section.section)
          }
        })

        if(includingTitles.length>0) {
          // resolve with titles if more than 0
          res(includingTitles)
        } else {
          // resolve with nothing related
          res(["Nothing related"])
        }
      }
    } else {
      // resolve with error
      res(["Error finding related"])
    }
  })
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
