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

$(function () {
    $.getJSON(`../../resource/config.json`).done(function (config) {
        repo = config["data"]["repo"];
        owner = config["data"]["owner"];

        $.getJSON(`${base_url}/repos/${owner}/${repo}/contents/data/${dataset_name}/dataset.csv`)
            .done(function (data) {
                dataset_info = data;
                let rows = atob(data.content).split("\n")
                let headers = rows[0].split(",")
                columns = headers.length
                let headRow = $("#data_table > thead")[0]
                var headerHTML = `<tr>`
                for(let i in headers){
                    headerHTML += `
                <th scope="col"> ${ headers[i] } </th>
                `
                }
                headerHTML += "\n</tr>"
                headRow.innerHTML = headerHTML
                rows.shift()
                rows.forEach(function (i) {
                    make_a_row(i.split(","))
                })
            });
    });
})


function make_a_row(args = []) {

    var result = `\n<tr>`
    if(args.length === 0){
        for(var i = 0; i < columns; i++){
            result += `<td contenteditable="true"></td>`
        }
    }
    else if(args.length !== columns){
        return
    }
    else {
        for (i in args) {
            if(!(args[i] === "")) {
                result += `\n
                <td contenteditable="true">
                    ${args[i]}
                </td>
            `
            }
        }

    }
    result += `
        <td width="5px">
                        <button type="button" class="close" aria-label="Close" onclick="selected = this.parentNode.parentNode.remove()">
                          <span aria-hidden="true">&times;</span>
                        </button> 
                    </td>
        </tr>
    `
    let bodyRow = $("#data_table > tbody")[0]
    bodyRow.innerHTML += result
}

function read_row(row) {
    var text_res = ""
    for(i = 0; i < columns; i++){
        text_res += `${row[i].innerText}${i === columns-1 ? "" : ","}`
    }
    text_res += "\n"
    return text_res
}



function updateData() {
    var saveData = ""
    var headers_row = $("#data_table > thead").find("th")
    var body_row = $("#data_table > tbody").find("tr")
    for (var i = 0; i<columns; i++){
        saveData += `${headers_row[i].innerText}${i === columns - 1 ? "" : ","}`
    }
    saveData += "\n"
    for(var i = 0; i < body_row.length ; i++){
        saveData += read_row(body_row[i].cells)

    }
    let message = ${"#messageArea"}[0].value
    uploadChanges(saveData, repo, owner, `data/${dataset_name}/dataset.csv`, message)
}