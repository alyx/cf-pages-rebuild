async function getLastCommit(headers) {
    const response = await fetch("https://api.github.com/repos/" + REPO + "/commits?page=1&per_page=1", headers)
    const data = await response.json()

    return { "sha": data[0].sha, "tree": data[0].commit.tree.sha }
}

async function makeNewCommit(oldCommit, headers) {
    const response = await fetch("https://api.github.com/repos/" + REPO + "/git/commits", {
        headers: headers.headers,
        method: "POST",
        body: JSON.stringify({
            "message": "Rebuild Requested (CF Pages Autoupdate)",
            "tree": oldCommit.tree,
            "parents": [oldCommit.sha]
        })
    })
    const data = await response.json()

    return {"sha": data.sha}
}

async function updateMainTree(newCommit, headers) {
    const response = await fetch("https://api.github.com/repos/" + REPO + "/git/refs/heads/main", {
        headers: headers.headers,
        method: "POST",
        body: JSON.stringify({
            "sha": newCommit.sha
        })
    })
    const data = await response.json()
    return data.object.sha
}

async function handleRequest(req) {
    const psk = req.headers.get("X-AW-Token")
    if (psk != TOKEN) {
        return new Response(JSON.stringify({completed: false}), {status: 403})
    }
    const init = {
        headers: {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": "Basic " + btoa(USERNAME + ":" + PAT),
            "user-agent": "alyx-updater node.js"
        }
    }
    const lastCommit = await getLastCommit(init)
    const newCommit = await makeNewCommit(lastCommit, init)
    const updatedTree = await updateMainTree(newCommit, init)

    return new Response(JSON.stringify({completed: true}), {headers: {"content-type": "application/json;charset=UTF-8",}})
}

async function checkHeaders(req) {
    return new Response(JSON.stringify({completed: true}), {headers: {"content-type": "application/json;charset=UTF-8",}})
}

addEventListener("fetch", event => {
    let request = event.request
    return event.respondWith(handleRequest(request))
})
