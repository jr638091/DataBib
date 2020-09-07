
var request = $.ajax({
    url: "index.json",
    method : "GET"
});

token = localStorage.getItem("GITHUB_PAT")

$(
    function () {
        if(token != null){
            var auth = $("#auth")[0]
            auth.hidden = true
            var rem = $("#rem")[0]
            rem.hidden = false
        }

        request.done(function(data){
            for(doc in data)
            {
                var html = `<div class="card mx-3 mt-3 pt-2">
            <div class="d-flex flex-row justify-content-around">
                <div class="col-1" style="font-size: 1.2rem">${data[doc].dataset_type}</div>
                <div class="col-4">
                    <small class="col">Nombre del Dataset</small>
                    <label class="col">${data[doc].name}</label>
                </div>
                <div class="col-4">
                    <small class="col">Creador</small>
                    <label class="col">${data[doc].publishers}</label>
                </div>
                
                ${
                    data[doc].editable && token != null ?
                        `<a href="editors/${data[doc].dataset_type.toLowerCase() === "json" ? ( data[doc].schema ? "schema_json" : "plain_json") : "csv"}/editor.html?name=${data[doc].url_dir}" class="col-1 text-center" target="_blank">
                            <i class="fas fa-edit" style="font-size: 1.5rem;"></i>
                            <br>
                            <label class="" style="font-size: 12px" >Contribuir<label>

                            
                    </a>` : ""
                }
                    
                
                ${
                    data[doc].visualizer.Count > 0 ? data[doc].visualable.forEach(i => {
                        `<a href="" class="col-1 text-center text-decoration-none">
                            <i class="fas fa-eye" style="font-size: 1.5rem;"></i>
                            <br>
                            <label class="" style="font-size: 12px" >Visualizar</label>
                    </a>`
                    }) : `<a href="vizualizer/basic_${data[doc].dataset_type.toLowerCase()}?name=${data[doc].url_dir}" class="col-1 text-center">
                            <i class="fas fa-eye" style="font-size: 1.5rem;"></i>
                            <br>
                            <label class="" style="font-size: 12px" >Visualizar</label>
                    </a>`
                }
                   
                <div class="col-1">
                    <div class="row justify-content-end">
                        <i class="fas fa-angle-down mr-2" style="font-size: 2rem;" data-toggle="collapse" data-target="#${doc}" aria-expanded="false"></i>
                    </div>
                    
                </div>
                
                </div>
                <div id="${doc}" class="collapse container-fluid">
                    
                    <p class="">
                        ${data[doc].description}
                    </p>
                    <button class="btn btn-primary col my-2" onclick="download('${data[doc].url_dir}', '${data[doc].dataset_type.toLowerCase()}', ${data[doc].schema});"> Descargar </button>
                </div>
            </div>`
                $( "#dataBib" ).append(html)
            }
        })
    }
)

function remove_token() {
    localStorage.removeItem("GITHUB_PAT")
    window.location.reload()
}

function download(data_name, format = "json", schema = false) {
    var zip = new JSZip()
    $.getJSON("resource/config.json")
        .done(function (conf) {
            const base_url = "https://api.github.com"
            $.ajax(`${base_url}/repos/${conf.data.owner}/${conf.data.repo}/contents/data/${data_name}/dataset.${format}`)
                .done(function (data) {
                        zip.file(`${data_name}.${format}`, format === "json" ? JSON.stringify(atob(data.content)) : atob(data.content))
                        zip.generateAsync({type:"base64"}).then(function (base64) {
                            window.location = "data:application/zip;base64," + base64;
                        }, function (err) {
                            console.log(err)
                        })
                    }
                )
        }
    )

}

