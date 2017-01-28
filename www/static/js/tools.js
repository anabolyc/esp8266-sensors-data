// DEBUG
window.getRandomColor = function() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

Date.prototype.add = function(days) {
    var dayValue = 24 * 60 * 60 * 1000;
    return new Date(this.valueOf() + dayValue * days)
};

Date.from = function(num) {
    return new Date(num * 1000);
};

Date.prototype.to = function() {
    return Math.round(this.valueOf() / 1000);
};

Date.prototype.formatTime = function(withSeconds) {
    var hrs = this.getHours();
    var mins = this.getMinutes()
    var result =  {
        hours: (hrs < 10 ? "0" : "") + hrs,
        minutes: (mins < 10 ? "0" : "") + mins,
        asString: (hrs < 10 ? "0" : "") + hrs 
            + (withSeconds ? ":" : " ")
            + (mins < 10 ? "0" : "") + mins 
    };
    return result;
};