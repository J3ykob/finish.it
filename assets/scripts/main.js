$(".menu-button").click(
    function(event)
    {
        var self = event.target.id;
        console.log(self);
        $("#wrapper").removeClass();
        $("#wrapper").addClass(self);
    }
)