(() => {
  const getUser = (user) => fetch(`https://api.github.com/users/${user}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  })
    .then(resp => resp.json())
    .then(user => ({
      name: `${user.login} - ${user.name}`,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
    }))

  const getLinks = (resp) => {
    const links = resp.headers.get('Link')
    return links
      ? links
        .split(', ')
        .reduce((accumulator, x) => {
          const regex = (/<(.+)>; rel="(.+)"/)
          const match = regex.exec(x)
          if (match) {
            const url = match[1]
            const type = match[2]
            accumulator[type] = url
          }
          return accumulator
        }, {})
      : {}
  }

  const getRepos = (user) => {
    const query = 'sort=updated&direction=desc&type=owner'
    return fetch(`https://api.github.com/users/${user}/repos?${query}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    })
      .then(resp => Promise.all([
        getLinks(resp),
        resp.json(),
      ]))
  }

  const img = document.getElementById('img')
  const username = document.getElementById('username')
  const name = document.getElementById('name')
  const button = document.getElementById('button')
  const repoList = document.getElementById('repoList')

  let repoLinks

  const simplifyRepo = (repo) => repo.name

  button.addEventListener('click', () => {
    const user = name.value
    if (user) {
      getUser(user)
        .then(userObj => {
          img.setAttribute('src', userObj.avatar_url)
          username.innerText = userObj.name
        })
        .then(() => {
          return getRepos(user)
            .then(values => {
              repoLinks = values[0]
              if (values[1]) {
                const repos = values[1].map(simplifyRepo)
                repoList.innerText = JSON.stringify(repos, null, 2)
              }
            })
        })
    }
  })
})()
