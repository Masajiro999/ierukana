var log = function (msg) {
    var dt = new Date();
    var now = '[' + formatNowTime(dt.getHours(), dt.getMinutes(), dt.getSeconds()) + ']';
    msg = now + ' ' + msg + "\n";
    console.log(msg);
    $("#log").append(msg);
    //$("#log").scrollTop($("#log")[0].scrollHeight);
};

var formatNowTime = function (h, m, s) {
    if (h < 10) {
        h = "0" + h;
    }
    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }
    return h + ':' + m + ':' + s;
};
