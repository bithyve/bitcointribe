import Toast from "../components/Toast";

export var timer = function (name) {
    var start = new Date();
    return {
        stop: function () {
            var end = new Date();
            var time = end.getTime() - start.getTime();
            Toast(`Timer: ${name}, finished in ${time} ms`)
        }
    }
};