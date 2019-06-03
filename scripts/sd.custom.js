if (typeof (SD) != "undefined") {
    _.cl("sd.custom.js is loaded", "success");
    SD.prototype.Custom = {
        Load: () => {
            var sd = this.parent.SD, utils = sd.Utils, ui = sd.UI, e = sd.Events, project = sd.Project, me = project;

        },
        _: function () {
            this.parent = _Window;;
            delete this._;
            return this;
        }
    }._();
} else
    _.cl("You must include sd.core.js before sd.custom.js", "warning")