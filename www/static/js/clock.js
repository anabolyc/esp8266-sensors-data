$(document).ready(function () {
    var getSupportedTransform = function () {
        var prefixes = 'animation'.split(' ');
        var div = document.createElement('div');
        for(var i = 0; i < prefixes.length; i++) {
            if(div && div.style[prefixes[i]] !== undefined) {
                return prefixes[i];
            }
        }
        return false;
    };
    console.log(getSupportedTransform());

    var updateClock = function() {
        console.time("updating analog clock;")
        var date = new Date;
        var seconds = date.getSeconds();
        var minutes = date.getMinutes();
        var hours = date.getHours();

        var hands = [{
            hand: 'hours',
            angle: (hours * 30) + (minutes / 2)
        },
        {
            hand: 'minutes',
            angle: (minutes * 6)
        },
        {
            hand: 'seconds',
            angle: (seconds * 6)
        }];

        for (var j = 0; j < hands.length; j++) {
            var elements = document.querySelectorAll('.' + hands[j].hand);
            for (var k = 0; k < elements.length; k++) {
                elements[k].style.webkitTransform = 'rotateZ('+ hands[j].angle +'deg)';
                elements[k].style.transform = 'rotateZ('+ hands[j].angle +'deg)';
                if (hands[j].hand === 'minutes')  
                    elements[k].parentNode.setAttribute('data-second-angle', hands[j + 1].angle);
            }
        }
        console.timeEnd("updating analog clock;")
    };
    
    updateClock();
    if (!getSupportedTransform()) {
        console.log("animation is not supported, starting clock update using js");
        window.setInterval(updateClock, 1000);
    }
    // 
});

