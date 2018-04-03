function doLocalStorage(type, item, data) {
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
}

let gaLoaded = false
function gaEvent(category, action, label, filterString) {
  // make sure ga is loaded and working before doing anything else
  if(!gaLoaded) {
    ga(
      () => {
        gaLoaded = true
        gaEvent(category, action, label)
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
      ga('set', 'dimension1', filterString)
      // send the ga event
      ga('send', 'event', category, action, label)
    })
  }
}

function getData(name) {
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

      xmlHttp.open("GET", `https://wf-drops-data.xinchronize.com/${name}.json`, true) // true for asynchronous
      xmlHttp.send(null)
    } else {
      reject("No name to fetch.")
    }
  })
}

function getDataList(filters) {
  let allSections = []

  return new Promise((resolve, reject) => {
    if(filters.length > 0 ) {
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
    }
  })
}

function arrayFromString(arrayStr, filters) {
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
    filters.forEach((ele, i) => {
      arr.push(i+1)
    })

    return arr // if no string, return full array
  }
}

function stripRelicText(text) {
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
}

function getCurrentFiltersString(filters) {
  let filterString = ""

  filters.forEach(filter=>{
    if(filter.on) filterString += `${filter.id},`
  })
  filterString = filterString.slice(0,-1)

  return filterString
}

function setDocumentTitle(text) {
  document.title = `${text} - Warframe Drops`
}

function getCheckbox(id) {
  return document.getElementById(id)
}

export {
  arrayFromString,
  doLocalStorage,
  gaEvent,
  getCheckbox,
  getCurrentFiltersString,
  getData,
  getDataList,
  setDocumentTitle,
  stripRelicText
}
