
const api_GitHub = "https://api.github.com"

function uploadChanges(content, repo, owner, path, message_pull) {
    let token = localStorage.getItem("GITHUB_PAT");
    if (token == null){
        return false
    }
    $.ajax(`${api_GitHub}/repos/${owner}/${repo}/forks`, {
        method: "POST",
        headers: {
            Authorization: `token ${token}`
        },
    }).done(function (forkData) {
        let fork_name = forkData["full_name"]
        $.ajax(`${api_GitHub}/repos/${fork_name}/branches`,
            {
                method: "GET",
                headers: {
                    Authorization: `token ${token}`
                }
            })
            .done(function (branches) {
                let length = branches.length
                var sha = ""
                for(let i in branches){
                    if(branches[i]["name"] === "master"){
                        sha = branches[i]["commit"]["sha"]
                    }
                }
                // console.log(branches)
                let branch = `patch-${length}`
                let ref = `refs/heads/${branch}`
                let body = JSON.stringify({
                    "ref": ref,
                    "sha": sha
                })
                console.log(body)
                $.ajax(`${api_GitHub}/repos/${fork_name}/git/refs`,{
                    method: "POST",
                    headers: {
                        Authorization: `token ${token}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                    dataType: "json",
                    data: body
                })
                .done(function (refData) {
                    console.log(refData)
                    $.ajax(`${api_GitHub}/repos/${fork_name}/contents/${path}?ref=${branch}`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `token ${token}`
                            }
                        }).done(function (contentData) {
                        $.ajax(`${api_GitHub}/repos/${fork_name}/contents/${path}`,
                            {
                                method: "PUT",
                                headers: {
                                    Authorization: `token ${token}`
                                },
                                dataType: "json",
                                data: JSON.stringify({
                                    "content": btoa(content),
                                    "message": `${path} edited at ${Date.now()}`,
                                    "sha": contentData["sha"],
                                    "branch": branch
                                })
                            })
                            .done(function (commitData) {
                                console.log(commitData)
                                $.ajax(`${api_GitHub}/repos/${owner}/${repo}/pulls`,{
                                    method: "POST",
                                    headers: {
                                        Authorization: `token ${token}`
                                    },
                                    contentType: "Application/json",
                                    data: JSON.stringify({
                                        "title": `Pull Request from ${forkData["owner"]["login"]} on ${path}`,
                                        "body": message_pull,
                                        "head": `${forkData["owner"]["login"]}:${branch}`,
                                        "base": "master"
                                })
                            })
                        })
                    })
                })
            })

    })
}