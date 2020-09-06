// import GitHub from 'github-api';
// This is the starting value for the editor
// We will use this to seed the initial editor 
// and to provide a "Restore to Default" button.
repoUrl = "";

const base_url = "https://api.github.com"
var repo;
var owner;
var editor;
var dataset_info;
var url_string = window.location.href
var url = new URL(url_string);
var dataset_name = url.searchParams.get("name");

$.getJSON(`/resource/config.json`).done(function (config) {
  repo = config["data"]["repo"];
  owner = config["data"]["owner"];

  $.getJSON(`${base_url}/repos/${owner}/${repo}/contents/data/${dataset_name}/dataset.json?ref=${dataset_name}_latest`).done(function (data) {
    dataset_info = data;
    // Initialize the editor
    editor = new JSONEditor(document.getElementById('editor_holder'), {
      // Enable fetching schemas via ajax
      ajax: true,
      theme: 'bootstrap4',
      // The schema for the editor
      schema: {
        type: "array",
        title: "People",
        format: "tabs",
        items: {
          title: "Person",
          headerTemplate: "{{i}} - {{self.name}}",
          oneOf: [
            {
              $ref: `/data/${dataset_name}/schema.json`,
              title: "Complex Person"
            }
          ]
        }
      },

      // Seed the form with a starting value
      startval: JSON.parse(atob(data.content)),

      // Disable additional properties
      no_additional_properties: true,

      // Require all properties by default
      required_by_default: true
    });
    // Hook up the validation indicator to update its
    // status whenever the editor changes
    editor.on('change', function () {
      // Get an array of errors from the validator
      var errors = editor.validate();

      var indicator = document.getElementById('valid_indicator');

      // Not valid
      if (errors.length) {
        indicator.style.color = 'red';
        indicator.textContent = "not valid";
      }
      // Valid
      else {
        indicator.style.color = 'green';
        indicator.textContent = "valid";
      }
    });
  });

  document.getElementById('submit').addEventListener('click', updateData);

  document.getElementById('enable_disable').addEventListener('click', function () {
    // Enable form
    if (!editor.isEnabled()) {
      editor.enable();
    }
    // Disable form
    else {
      editor.disable();
    }
  });
});








function updateData() {
  var saveData = editor.getValue();
  let access_token = localStorage.getItem("GITHUB_PAT")
  var myJSON = JSON.stringify(saveData);
  var encodedString = btoa(myJSON);
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