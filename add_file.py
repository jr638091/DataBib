import sys
import json
import requests

def get_branches(owner : str="", repo : str="") -> [str]:
    print(owner, repo)
    req = requests.get(f'https://api.github.com/repos/{owner}/{repo}/branches')
    if "message" in req.json():
        return []
    response = req.json()
    branches = [i["name"] for i in response]
    return branches
    
def get_diff(branches : [str]) -> [str]:
    output = []
    with open("index.json") as fd:
        j = json.load(fd)
        for k in j:
            v = j[k]
            if not f'{v["url_dir"]}_latest' in branches:
                output.append(f'{v["url_dir"]}_latest')
    return output

def create_branch(branch : str, sha: str, token: str, owner: str,repo: str):
    body = {
        "ref": f'refs/heads/{branch}',
        "sha": f'{sha}'
    }
    req = requests.post(f'https://api.github.com/repos/{owner}/{repo}/git/refs',
     json=body,
     headers={
         "Authorization": f'token {token}'
    })
    print(req.json())


if __name__ == "__main__":
    owner = ""
    repo = ""
    with open("resource/config.json") as fd:
        j = json.load(fd)["data"]
        owner = j["owner"]
        repo = j["repo"]
    branches = get_branches(owner=owner, repo=repo)
    branches_to_push = get_diff(branches)
    sha = sys.argv[1]
    token = sys.argv[2]
    print(branches_to_push)
    for i in branches_to_push:
        create_branch(i,sha,token,owner,repo)
