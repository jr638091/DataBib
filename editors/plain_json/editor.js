// import GitHub from 'github-api';
// This is the starting value for the editor
// We will use this to seed the initial editor
// and to provide a "Restore to Default" button.
repoUrl = "";

const base_url = "https://api.github.com"
var repo;
var owner;
var editor;
var columns;
var dataset_info;
var url_string = window.location.href
var url = new URL(url_string);
var dataset_name = url.searchParams.get("name");

$.getJSON(`/resource/config.json`).done(function (config) {
    repo = config["data"]["repo"];
    owner = config["data"]["owner"];

    $.getJSON(`${base_url}/repos/${owner}/${repo}/contents/data/${dataset_name}/dataset.json?ref=${dataset_name}_latest`)
        .done(function (data) {
            dataset_info = data;
            let j = atob(data.content)
            $("#text_editor")[0].innerText = j
        });
});

function updateData() {
    var saveData = $("#text_editor")[0].innerText
    let access_token = localStorage.getItem("GITHUB_PAT")
    var encodedString = btoa(saveData);
    json = {
        "content": encodedString,
        "message": `${repo} by ${owner} at ${Date.now()}`,
        "sha": dataset_info.sha,
        "branch": `${dataset_name}_latest`
    };
    save = $.ajax({
        method: 'PUT',
        url: `${base_url}/repos/${owner}/${repo}/contents/data/${dataset_name}/dataset.json`,
        beforeSend: function (x) {
            if (x && x.overrideMimeType) {
                x.overrideMimeType("application/j-son;charset=UTF-8");
            }
        },
        headers: {
            Authorization: `Token ${access_token}`
            // sha: dataset_info.sha
        },
        dataType: "json",
        data: JSON.stringify(json)
    });
    save.fail(function (err) {
        console.log(err);
    });
}