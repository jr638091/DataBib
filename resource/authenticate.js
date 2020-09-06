$(function () {
    $('[data-toggle="popover"]').popover({
        html: true,
        content: function () {
            return `<img src="media/${$(this).data("image")}.png" class="img-fluid"/>`
        },
        template: '<div class="popover" style="max-width: 100%"><div class="arrow"></div><div class="popover-body" style="width: 75vw"></div></div>',
        placement: 'bottom',
        trigger : "hover click"
    })
})

function save_token() {
    token = $( "#github_token" )[0].value;
    if (token !== ""){
        localStorage.setItem("GITHUB_PAT", token);
        location.href = location.origin
    }
}