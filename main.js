$(document).ready(function () {
    $(".menu-icon-wrapper").on("click",function () {
       if ($(".menu").hasClass("menu-show")) {
           $(".menu").removeClass("menu-show");
           $(".menu-icon-wrapper").removeClass("menu-icon-wrapper-active");
           $(".menu").addClass("menu-hide");
       } else {
           $(".menu").addClass("menu-show");
           $(".menu-icon-wrapper").addClass("menu-icon-wrapper-active");
           $(".menu").removeClass("menu-hide");
       }
    });

    $("#login").click(function(){
        $("#login-modal").modal();
    });

});


