((namespace)=>{
    "use strict";
    if (typeof (SD) != "undefined") {
        namespace.SD = new SD(namespace);
        _.cl("sd.js "+ _Version +" is loaded","success");
    }
    else
        _.cl("You must include sd.core.js before sd.js","warning")
})(window || {});