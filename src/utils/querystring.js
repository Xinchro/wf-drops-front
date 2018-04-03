function getQueryParams() {
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

      queryParams.push(ob) // push query object to array
    })
  }

  return queryParams
}

function setQueryParam(key, value) {
  let queryStr = "/?" // set up query string

  let params = getQueryParams() // get current params

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
    let title = "test" // TODO fix this, should be page title
    let path  = `${queryStr}`

    history.pushState(state, title, path);
  }
}

export {
  getQueryParams,
  setQueryParam
}
