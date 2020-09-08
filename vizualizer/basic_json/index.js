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

$(function ()
{
    var t = $("#title")[0]
    t.innerText = dataset_name
})

$.getJSON(`../../resource/config.json`).done(function (config) {
    repo = config["data"]["repo"];
    owner = config["data"]["owner"];

    $.getJSON(`${base_url}/repos/${owner}/${repo}/contents/data/${dataset_name}/dataset.json`)
        .done(function (data) {
            dataset_info = data;
            let j = atob(data.content)
            $("#text_editor")[0].innerText = j
        });
});