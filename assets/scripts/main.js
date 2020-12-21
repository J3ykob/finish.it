$(".menu-button").click(
    function(event)
    {
        var self = event.target.id;
        console.log(self);
        $("#wrapper").removeClass();
        $("#wrapper").addClass(self);
    }
)

$(".menu-side-button").click(
    function(event)
    {
        var self = event.target.id + "-tab";
        console.log(self);
        $(".tab").addClass("hidden");
        $("#"+self).removeClass("hidden");
    }
)