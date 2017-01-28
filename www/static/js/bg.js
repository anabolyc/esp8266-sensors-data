$(document).ready(function(){
    var INTERVAL_TIME = 10000;
    window.setInterval(function() {
        var newcolor = ["0", "1", "2"].sort(function(a, b) {
            return Math.random() > Math.random();
        }).join("");
        console.log("new background color: ", newcolor);
        $("body").animate({"background-color": "#" + newcolor}, INTERVAL_TIME);    
    }, INTERVAL_TIME);
});