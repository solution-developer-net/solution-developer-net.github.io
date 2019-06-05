"use strict";
function SD(ns) {
    var self = this;
    ns.onload = function () {
        self.Constructor();
        _StartTime = SD.STARTTIME;
    };
}
/*----------------------------
 * Variable
 *----------------------------*/
var _Version = "1.0.74";
SD.STARTTIME = new Date();
var _Window = window;
var _Tracert = false;
var _Info = false;
var _Result = null;
var _StartTime = new Date();

/*----------------------------
 * Core
 *----------------------------*/
SD.prototype.Events = {
    OnClick: "click",
    OnChange: "change",
    OnBlur: "blur",
    OnInput: "input",
    OnKeyPress: "keypress"
};
SD.prototype.Constructor = function () {
    var sd = this;
    var utils = this.Utils;
    var ui = this.UI;
    utils.DisplayWhenEditing();
    utils.KeyBoard();
    ui.CheckBoxAsToogle();
    ui.Alert();
    try {
        var jTables = _.fn(".jTable", true);
        if (jTables != null) {
            jTables.jForEach(function (jTable) {
                var rows = jTable.tBodies[0].rows.ToArray();
                rows.jData().ForEach(function (e) {
                    e.onclick = function () {
                        rows.jData().ForEach(function (a) {
                            a.classList.remove("selected");
                        });
                        this.classList.add("selected");
                    }
                });
            });
        }

        //self.parent.SD.UI.Tablas.Crear(self.data, divResult);
        var tabla = _.fn("#listado");
        var filtro = _.fn("#filtro");
        ui.Tablas.Ordenacion._();
        ui.Tablas.Busqueda._();
        filtro.onkeyup = function () {
            ui.Tablas.Busqueda.Buscar(filtro, tabla);
        };


    } catch (e) {
        _.cl(e);
    }

    if (typeof (sd.Project) != "undefined" && typeof (sd.Project.Load) == "function")
        sd.Project.Load();
    else
        _.cl("You must load sd.javascript.project.js before", "warning");

    if (typeof (sd.Custom) != "undefined" && typeof (sd.Custom.Load) == "function")
        sd.Custom.Load();
    else
        _.cl("You must load sd.javascript.project.js before", "warning");


    if (_Tracert) {
        _.cl("SD loaded successfuly..." + sd.Runtime(SD.STARTTIME), "success");
    }
};
SD.prototype.Utils = {
    Timer: ({ callback, seconds } = {}) => {
        setTimeout(() => {
            callback();
        }, _.in(seconds, 3000));
    },
    Num2Hex: (number) => {
        if (number < 0) {
            number = 0xFFFFFFFF + number + 1;
        }
        return number.toString(16).toUpperCase();
    },
    InputValid: function (inputs, onlyValue) {
        var self = this;

        var txts = _.in(inputs, [
            { Id: "txtField1", Event: "input", RegEx: /\\d/, Message: "Only numbers" },
            { Id: "txtField2", Event: "input", RegEx: /[VEJPG]{1}[0-9][1-9]{1}/, Message: "RIF Number" },
        ]);

        txts.jForEach(function (ctrl) {
            var txt;
            if (onlyValue == undefined) {
                txt = _.on("#" + ctrl.Id, false, ctrl.Event, function () {
                    this.nextElementSibling.innerHTML = "";
                    if (this.value.length > 0) {
                        var exp = new RegExp(ctrl.RegEx, "ig");
                        var validado = exp.test(this.value);
                        if (!validado) {
                            this.nextElementSibling.innerHTML = ctrl.Message;
                            this.nextElementSibling.style.color = "red";
                            //this.value = "";
                        }
                    }
                });
            } else {
                txt = _.fn("#" + ctrl.Id);
                txt.nextElementSibling.innerHTML = "";
                var exp = new RegExp(ctrl.RegEx, "ig");
                var validado = exp.test(txt.value);
                if (!validado) {
                    txt.nextElementSibling.innerHTML = ctrl.Message;
                    txt.nextElementSibling.style.color = "red";
                    //this.value = "";
                }

            }
            if (txt != undefined)
                if (!txt.hasAttribute("disabled") && txt.style.display === "") {
                    var strNameLbl = "lblFeedBack_" + txt.id;
                    var lblFeedBack = null;
                    var lblFeedBack = document.getElementById(strNameLbl);
                    if (lblFeedBack === null) {
                        lblFeedBack = _.ce("span");
                        lblFeedBack.id = strNameLbl;
                        lblFeedBack.className = "FeedBackLabel";
                        txt.parentNode.insertBefore(lblFeedBack, txt.nextSibling);
                    }
                }

        });

    },
    InputMask: function () {
        for (const el of document.querySelectorAll("[data-mask][data-slots]")) {
            const pattern = el.getAttribute("data-mask"),
                slots = new Set(el.dataset.slots || "_"),
                prev = (j => Array.from(pattern, (c, i) => slots.has(c) ? j = i + 1 : j))(0),
                first = [...pattern].findIndex(c => slots.has(c)),
                accept = new RegExp(el.dataset.accept || "\\d", "g"),
                clean = input => {
                    input = input.match(accept) || [];
                    return Array.from(pattern, c =>
                        input[0] === c || slots.has(c) ? input.shift() || c : c
                    );
                },
                format = () => {
                    const [i, j] = [el.selectionStart, el.selectionEnd].map(i => {
                        i = clean(el.value.slice(0, i)).findIndex(c => slots.has(c));
                        return i < 0 ? prev[prev.length - 1] : back ? prev[i - 1] || first : i;
                    });
                    el.value = clean(el.value).join``;
                    el.setSelectionRange(i, j);
                    back = false;
                };
            let back = false;
            el.addEventListener("keydown", (e) => back = e.key === "Backspace");
            el.addEventListener("input", format);
            el.addEventListener("focus", format);
            el.addEventListener("blur", () => el.value === pattern && (el.value = ""));
        };
    },
    Storage: {
        Save: function (key, object) {
            localStorage.setItem(key, JSON.stringify(object));
        },
        Load: function (key) {
            return JSON.parse(localStorage.getItem(key));
        }
    },
    DownloadFile: function (filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    },
    Import: (container, url, callback) => {
        var utils = this.SD.Utils;
        var main = _.fn(container);
        main.innerHTML = "";
        utils.Callback(url, null, (html) => {
            main.innerHTML = html;
            callback();
        });
    },
    LoadControls: function () {
        var ctrls = {};
        document.querySelectorAll("*[id*=txt]").ToArray().jForEach(function (ctrl) {
            ctrls[ctrl.id.replace("CPH_BODY_", "")] = ctrl;
        })
        document.querySelectorAll("*[id*=ddl]").ToArray().jForEach(function (ctrl) {
            ctrls[ctrl.id.replace("CPH_BODY_", "")] = ctrl;
        })
        document.querySelectorAll("*[id*=lbl]").ToArray().jForEach(function (ctrl) {
            ctrls[ctrl.id.replace("CPH_BODY_", "")] = ctrl;
        })
        document.querySelectorAll("*[id*=chk]").ToArray().jForEach(function (ctrl) {
            ctrls[ctrl.id.replace("CPH_BODY_", "")] = ctrl;
        })
        document.querySelectorAll("*[id*=rbt]").ToArray().jForEach(function (ctrl) {
            ctrls[ctrl.id.replace("CPH_BODY_", "")] = ctrl;
        })
        document.querySelectorAll("*[id*=lkn]").ToArray().jForEach(function (ctrl) {
            ctrls[ctrl.id.replace("CPH_BODY_", "")] = ctrl;
        })
        document.querySelectorAll("*[id*=lnk]").ToArray().jForEach(function (ctrl) {
            ctrls[ctrl.id.replace("CPH_BODY_", "")] = ctrl;
        })
        document.querySelectorAll("*[id*=btn]").ToArray().jForEach(function (ctrl) {
            ctrls[ctrl.id.replace("CPH_BODY_", "")] = ctrl;
        })
        return ctrls;
    },
    /**
     * Allow create a new table on html by uses with from
     * @param opts An object with properties to
     * set information on CurrencyColumns, TotalizedColumns, 
     * CalculatedColumns, CallbackFind, CallbackSave
     */
    HTMLForm: (config, callback) => {
        var self = this;
        var loader = null;
        var uk = self.SD.Utils.Num2Hex(Math.round(Math.random() * 1000000));
        var container = _.fn(_.in(config.Container, "#frm"));
        var titleForm = _.in(config.Title, "SD Control > HTMLForm");
        var currentItem = null, currentIndex = 0;
        var colsOfData = [], entriesOfObject = [], txts = [];
        var btns = config.Buttons != undefined ? config.Buttons : {
            Master: [
                { Id: "Search", Title: "Search", FA: "fa-search", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Import", Title: "Import", FA: "fa-arrow-down", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Save", Title: "Save", FA: "fa-save", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Print", Title: "Print", FA: "fa-print", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Refresh", Title: "Refresh", FA: "fa-refresh", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Camera", Title: "Camera", FA: "fa-camera", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
            ],
            Detail: [
                { Id: "Search", Title: "Search", FA: "fa-search", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Import", Title: "Import", FA: "fa-arrow-down", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Save", Title: "Save", FA: "fa-save", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Print", Title: "Print", FA: "fa-print", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Refresh", Title: "Refresh", FA: "fa-refresh", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Camera", Title: "Camera", FA: "fa-camera", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
            ],
            Items: [
                { Id: "Search", Title: "Search", FA: "fa-search", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Import", Title: "Import", FA: "fa-arrow-down", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Save", Title: "Save", FA: "fa-save", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Print", Title: "Print", FA: "fa-print", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Refresh", Title: "Refresh", FA: "fa-refresh", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
                { Id: "Camera", Title: "Camera", FA: "fa-camera", Click: (loader) => { loader.Hide(); /* YOUR CODE */ } },
            ]
        };
        var curCols = config.CurrencyColumns != undefined ? config.CurrencyColumns.split(",") : [];
        var inputMasks = config.InputMasks != undefined ? config.InputMasks : [
            { Id: "Ex>dateInput", Mask: "mm/dd/yyyy", Slot: "dmy" },
            { Id: "Ex>accountInput", Mask: "____-____-____-____-____", Slot: "_" },
            { Id: "Ex>macAddredsInput", Mask: "XX:XX:XX:XX:XX:XX", Slot: "X", Accept: "[\dA-H]" }
        ];
        var inputFKs = _.in(config.ForeignKeyColumns, [
            { Id: "Ex>dateInput", ServiceMethod: "mm/dd/yyyy" },
        ]);
        var inputEvents = _.in(config.InputWithActionColumns, [
            { Id: "txtField1", Event: "input", Callback: null },
        ]);
        var inputWidthFixed = _.in(config.InputWidthFixed, [
            { Id: "txtField1", Width: 50 },
        ]);
        var inputHelp = _.in(config.InputHelpColumns, [
            { Id: "txtField1", Help: "Help me" },
        ]);
        var inputAsTexArea = config.InputAsTextAreaColumns != undefined ? config.InputAsTextAreaColumns.split(",") : [];
        var curISOCols = config.CurrencyISOColumns != undefined ? config.CurrencyISOColumns.split(",") : [];
        var roCols = config.ReadonlyColumns != undefined ? config.ReadonlyColumns.split(",") : [];
        var hideenCols = config.HiddenColumns != undefined ? config.HiddenColumns.split(",") : [];
        var calCols = config.CalculatedColumns != undefined ? config.CalculatedColumns.split(",") : [];
        var isRO = _.in(config.ReadOnly, false);
        var _Object = _.in(config.Data != null ? config.Data.Master : { Id: "", Description: "" }, { Id: "", Description: "" });
        var _Items = _.in(config.Data != null ? config.Data.Detail : [{ Id: "", Description: "" }], [{ Id: "", Description: "" }]);
        var render = _.in(config.RenderAs, "Table");
        var renderCustom = _.in(config.RenderCustom, (tag, item) => { });

        var fnRenderCUSTOM = () => {
            var ul = _.ne({ tag: "ul", id: "jList" + uk, cssClass: "jList jCustom" });
            _Items.jForEach(function (item) {
                var li = _.ne({ tag: "li" });
                renderCustom(li, item);
                ul.appendChild(li);
            });
            return ul;
        };
        var refresh = () => {

            container.innerHTML = "";
            container.setAttribute("class", "jFormContainer");
            loader = _.ce("div", null, "sdHTMLForm_Loader");
            loader.style.display = "none";
            loader.classList.add("sdLoader");
            var imgloader = _.ce("img");
            imgloader.src = "/content/sd.loader.gif";
            imgloader.width = "24";
            var spanLoader = _.ce("span");
            spanLoader.innerHTML = "actualizando...";
            loader.appendChild(imgloader);
            loader.appendChild(spanLoader);
            var h2 = _.ce("h2", null, "", titleForm, "");
            h2.innerHTML = titleForm;
            var filtro = _.ne({ tag: "input", type: "text", id: "jFilter" + uk, placeholder: "Finded", cssClass: "form-control" });
            filtro.setAttribute("placeholder", "Filter");
            container.appendChild(loader);
            container.appendChild(h2);
            container.appendChild(masterForm);
            self.parent.SD.UI.Labels();
            switch (render) {
                case "Custom": {
                    container.appendChild(filtro);
                    container.appendChild(fnRenderCUSTOM());
                    //Aplica filtro para la lista y no la tabla
                    var input, filter, ul, li, a, i, txtValue;
                    input = document.getElementById("jFilter" + uk);
                    input.onkeyup = (e) => {
                        filter = e.target.value.toUpperCase();
                        ul = document.getElementById("jList" + uk);
                        li = ul.getElementsByTagName("li");
                        for (i = 0; i < li.length; i++) {

                            txtValue = li[i].innerHTML;
                            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                                li[i].style.display = "";
                            } else {
                                li[i].style.display = "none";
                            }
                        }
                    };

                    break;
                }
                default: {
                    if (config.Data!=undefined && config.Data.Detail!= undefined) {
                        container.appendChild(filtro);
                        detailForm.appendChild(tableToDetail);
                        container.appendChild(detailForm);
                    }
                    break;
                }
            }

            self.parent.SD.Utils.InputMask();

            try {
                if (config.Callbacks.Render.After.Body != undefined)
                    config.Callbacks.Render.After.Body();
            } catch (e) { }


            if (config.Data.Detail != undefined) {
                if (render == "Table") {
                    self.parent.SD.UI.Tablas.Ordenacion._();
                    self.parent.SD.UI.Tablas.Busqueda._();
                    filtro.onkeyup = function () {
                        self.parent.SD.UI.Tablas.Busqueda.Buscar(filtro, tableToDetail);
                    };
                }
            }
            if (callback != undefined)
                callback();

            self.parent.SD.UI.Helps(inputHelp);

        };
        var checkIsEmptys = () => {
            if (_Items.length > 0 && _Items.length == 1) {
                var data = _Items;
                var colsEmpty = 0;
                colsOfData.jForEach(function (col) {
                    if (data[0][col] != undefined ? data[0][col].length == 0 : true)
                        colsEmpty++;
                });
                if (colsOfData.length == colsEmpty) {
                    _Items.jDelete(0);
                    return true;
                }
                else {
                    return false;
                }
            }
        };
        var clearTxts = () => {
            for (var i = 0; i < colsOfData.length; i++) {
                txts["txt" + colsOfData[i]].value = "";
            }
        };
        var buildMaster = () => {

            for (var i = 0; i < entriesOfObject.length; i++) {
                var col = entriesOfObject[i][0];

                var txt = null;
                txt = _.ne({
                    tag: "input",
                    type: "text",
                    id: "txtm" + col,
                    title: col,
                    cssClass: "form-control"
                });
                //Input as TextArea
                for (var a = 0; a < inputAsTexArea.length; a++) {
                    if (inputAsTexArea[a] == col) {
                        txt = _.ne({
                            tag: "textarea",
                            id: "txtm" + col,
                            title: col,
                            cssClass: "form-control"
                        });
                        continue;
                    }
                }
                txt.value = entriesOfObject[i][1];
                txt.placeholder = col;
                txt.setAttribute("data-label", col);
                txts.push(txt);
                masterForm.appendChild(txt);
                //Hidden Columns
                for (var a = 0; a < hideenCols.length; a++) {
                    if (hideenCols[a] == "Id*" && col.indexOf("Id") > -1) {
                        txt.style.display = "none";
                        continue;
                    }
                    if (hideenCols[a] == col) {
                        txt.style.display = "none";
                        continue;
                    }
                }
                //Readonly Fields
                for (var a = 0; a < roCols.length; a++) {
                    if (roCols[a] == "Id*" && col.indexOf("Id") > -1) {
                        txt.disabled = true;
                        continue;
                    }
                    if (roCols[a] == col) {
                        txt.disabled = true;
                        continue;
                    }
                }
                //InputMasks Fields
                for (var a = 0; a < inputMasks.length; a++) {
                    var input = inputMasks[a];
                    if (input.Id == txt.id) {
                        txt.setAttribute("placeholder", input.Mask);
                        txt.setAttribute("data-mask", input.Mask);
                        txt.setAttribute("data-slots", input.Slot);
                        if (input.Accept != undefined)
                            txt.setAttribute("data-accept", input.Accept);
                        continue;
                    }
                }
                //Foreign Keyls 
                for (var a = 0; a < inputFKs.length; a++) {
                    var input = inputFKs[a];
                    if (input.Id == txt.id) {
                        var nameList = txt.id + "_list";
                        txt.setAttribute("list", nameList);

                        self.SD.Utils.Request.Get(input.ServiceMethod, null, (result, selector) => {
                            var lblList = document.getElementById(selector);
                            if (lblList === null) {
                                lblList = _.ce("datalist", null, selector);
                                txt.parentNode.insertBefore(lblList, txt.nextSibling);
                            } else
                                lblList.innerHTML = "";
                            var items = [];
                            if (result.Status == "Done")
                                items = JSON.parse(result.Response.d);
                            items.jData().ForEach(function (o) {
                                var opt = _.ce("option");
                                opt.value = _.in(o.Descripcion, o.Description) + ";" + o.Id;
                                lblList.appendChild(opt);
                            });
                        }, nameList);

                    }
                }
                //inputEvents Fields
                for (var a = 0; a < inputEvents.length; a++) {
                    var input = inputEvents[a];
                    if (input.Id == txt.id) {
                        txt.addEventListener(input.Event, input.Callback)
                        continue;
                    }
                }
                //inputWidthFixed
                for (var a = 0; a < inputWidthFixed.length; a++) {
                    var input = inputWidthFixed[a];
                    if (input.Id == txt.id) {
                        txt.style.width = `${!isNaN(input.Width)?input.Width+"px":input.Width}`;
                        continue;
                    }
                }
            }
            //Agregando Botones
            if (btns.Master != undefined ? btns.Master.length : 0 > 0) {
                btns.Master.jData().ForEach(function (btn) {
                    var b = _.ce("b", "input", "btn" + btn.Id, btn.Title, "fa " + btn.FA + " fa-lg jTableButton");
                    b.onclick = () => {
                        loader.Show();
                        btn.Click(loader);
                    }
                    masterForm.appendChild(b);
                });
            }

        }
        var buildHeader = () => {
            var titlesTR = tHeadToDetail.insertRow();
            titlesTR.appendChild(document.createElement("th"));
            titlesTR.cells[0].innerHTML = 'Menu';
            //header TR
            for (var i = 1; i < colsOfData.length + 1; i++) {
                titlesTR.appendChild(document.createElement("th"));
                var cell = titlesTR.cells[i];
                var col = colsOfData[i - 1];
                cell.innerHTML = col;
                //Hidden Columns
                for (var a = 0; a < hideenCols.length; a++) {
                    if (hideenCols[a] == "Id*" && col.indexOf("Id") > -1) {
                        cell.style.display = "none";
                        continue;
                    }
                    if (hideenCols[a] == col) {
                        cell.style.display = "none";
                        continue;
                    }
                }
            }
            //Crea ultima celda para controles
            var fieldsTR = tHeadToDetail.insertRow();
            fieldsTR.appendChild(document.createElement("th"));
            var cellControls = fieldsTR.cells[0];
            //header Inputs  
            for (var i = 1; i < colsOfData.length + 1; i++) {
                fieldsTR.appendChild(document.createElement("th"));
                var cellInputs = fieldsTR.cells[i];
                var col = colsOfData[i - 1];
                var txt = _.ce("input", "Text", "txt" + col, col, "form-control");
                // Calculated Columns
                for (var a = 0; a < calCols.length; a++) {
                    var fx = calCols[a].split('=');
                    if (fx[0] == col) {
                        txt.disabled = true;
                        continue;
                    }
                }
                //Readonly Fields
                for (var a = 0; a < roCols.length; a++) {
                    if (roCols[a] == "Id*" && col.indexOf("Id") > -1) {
                        txt.disabled = true;
                        continue;
                    }
                    if (roCols[a] == col) {
                        txt.disabled = true;
                        continue;
                    }
                    if (col == "State")
                        txt.disabled = true;
                }
                txt.placeholder = col;
                txt.setAttribute("data-label", col);
                cellInputs.appendChild(txt);
                txts["txt" + col] = txt;
                if (isRO) {
                    txt.disabled = true;
                }
                //Hidden Columns
                for (var a = 0; a < hideenCols.length; a++) {
                    if (hideenCols[a] == "Id*" && col.indexOf("Id") > -1) {
                        cellInputs.style.display = "none";
                        continue;
                    }
                    if (hideenCols[a] == col) {
                        cellInputs.style.display = "none";
                        continue;
                    }
                }
                //InputMasks Fields
                for (var a = 0; a < inputMasks.length; a++) {
                    var input = inputMasks[a];
                    if (input.Id == txt.id) {
                        txt.setAttribute("placeholder", input.Mask);
                        txt.setAttribute("data-mask", input.Mask);
                        txt.setAttribute("data-slots", input.Slot);
                        if (input.Accept != undefined)
                            txt.setAttribute("data-accept", input.Accept);
                        continue;
                    }
                }
                //Foreign Keyls 
                for (var a = 0; a < inputFKs.length; a++) {
                    var input = inputFKs[a];
                    if (input.Id == txt.id) {
                        var nameList = txt.id + "_list";
                        txt.setAttribute("list", nameList);

                        self.SD.Utils.Request.Get(input.ServiceMethod, null, (result, selector) => {
                            var lblList = document.getElementById(selector);
                            if (lblList === null) {
                                lblList = _.ce("datalist", null, selector);
                                txt.parentNode.insertBefore(lblList, txt.nextSibling);
                            } else
                                lblList.innerHTML = "";

                            var items = [];
                            if (result.Status == "Done")
                                items = JSON.parse(result.Response.d);
                            items.jData().ForEach(function (o) {
                                var opt = _.ce("option");
                                opt.value = _.in(o.Descripcion, o.Description) + ";" + o.Id;
                                lblList.appendChild(opt);
                            });
                        }, nameList);

                    }
                }
                //inputEvents Fields
                for (var a = 0; a < inputEvents.length; a++) {
                    var input = inputEvents[a];
                    if (input.Id == txt.id) {
                        txt.addEventListener(input.Event, input.Callback)
                        continue;
                    }
                }
                //inputWidthFixed
                for (var a = 0; a < inputWidthFixed.length; a++) {
                    var input = inputWidthFixed[a];
                    if (input.Id == txt.id) {
                        txt.style.width = `${input.Width}px`;
                        continue;
                    }
                }
            }

            var ul = document.createElement("ul");
            ul.className = "buttonsCommand";
            var ulSub = document.createElement("ul");
            var liMenu = document.createElement("li");
            var li = null;

            //Buttons To Header on Table
            if (!isRO) {
                //Button Add
                li = document.createElement("li");
                var btnAdd = _.ce("b", null, "btnAdd", "Add", "fa fa-plus fa-lg jTableButton");
                btnAdd.onclick = function () {
                    //Callback Execute Click Before Add
                    try {
                        if (config.Callbacks.Render.Before.Add != undefined)
                            config.Callbacks.Render.Before.Add();
                    } catch (e) { }
                    var o = {};
                    for (var i = 0; i < colsOfData.length; i++) {
                        o[colsOfData[i]] = txts["txt" + colsOfData[i]].value;
                    }
                    o.State = "Added";
                    self.parent.SD.Utils.Validation.Container("frmDetail");
                    var valid = self.parent.SD.Utils.Validation.Validate();
                    if (valid) {
                        _Items.jAdd(o);
                        tBodyToDetail.innerHTML = "";
                        buildBody();
                        clearTxts();
                    } else {
                        alert("faltan campos por rellenar");
                    }
                    //Callback Execute Click After Edit
                    try {
                        if (config.Callbacks.Render.After.Add != undefined)
                            config.Callbacks.Render.After.Add();
                    } catch (e) { }
                };
                li.appendChild(btnAdd);
                ulSub.appendChild(li);
                //Button Edit
                li = document.createElement("li");
                var btnEdit = _.ce("b", null, "btnEdit", "Edit", "fa fa-pencil fa-lg jTableButton");
                btnEdit.onclick = function () {
                    //Callback Execute Click Before Edit
                    try {
                        if (config.Callbacks.Render.Before.Edit != undefined)
                            config.Callbacks.Render.Before.Edit();
                    } catch (e) { }
                    for (var i = 0; i < colsOfData.length; i++) {
                        currentItem[colsOfData[i]] = txts["txt" + colsOfData[i]].value;
                    }
                    currentItem.State = "Modified";
                    tBodyToDetail.innerHTML = "";
                    buildBody();
                    clearTxts();
                    //Callback Execute Click After Edit
                    try {
                        if (config.Callbacks.Render.After.Edit != undefined)
                            config.Callbacks.Render.After.Edit();
                    } catch (e) { }
                };
                li.appendChild(btnEdit);
                ulSub.appendChild(li);
                //All Buttons
                if ((btns.Detail != undefined ? btns.Detail.length : 0) > 0) {
                    btns.Detail.jData().ForEach(function (btn) {
                        var li = document.createElement("li");
                        var b = _.ce("b", "input", "btn" + btn.Id, btn.Title, "fa " + btn.FA + " fa-lg jTableButton");
                        b.onclick = btn.Click;
                        li.appendChild(b);
                        ulSub.appendChild(li);
                    });
                }
            }

            li = document.createElement("li");
            var btnMenu = _.ce("b", null, "btnMenu", "Menu", "fa fa-caret-down fa-lg jTableButton");
            liMenu.appendChild(btnMenu);
            liMenu.appendChild(ulSub);
            ul.appendChild(liMenu);



            cellControls.appendChild(ul);

        };
        var buildBody = () => {

            _Items.jForEach(function (item) {
                var row = tBodyToDetail.insertRow();
                row.setAttribute("data-sdRowLocator", Object.values(item)[0]);
                var commandsCell = row.insertCell();
                if (!isRO) {
                    row.onclick = function () {
                        _.fn(".jTable>tbody>tr", true).jData().ForEach(function (a) {
                            a.classList.remove("selected");
                        });
                        this.classList.add("selected");

                        var index = this.sectionRowIndex;
                        var cells = this.cells;
                        btnEdit.setAttribute("data-indexRow", index);
                        currentItem = item;
                        currentIndex = index;
                        for (var i = 0; i < colsOfData.length; i++) {
                            var val = item[colsOfData[i]] == undefined ? "Normal" : item[colsOfData[i]];
                            txts["txt" + colsOfData[i]].value = val;
                        }
                    };

                    var btnLineDel = document.createElement("b");
                    btnLineDel.className = "fa fa-trash fa-lg jTableButton";
                    btnLineDel.title = "Delete";
                    btnLineDel.onclick = function () {
                        alert("Are you sure to Delete?", function () {
                            //_Items.jDelete(currentIndex);
                            currentItem.State = "Deleted";
                            tBodyToDetail.innerHTML = "";
                            buildBody();
                            clearTxts();
                        })

                    };
                    commandsCell.appendChild(btnLineDel);

                    if ((btns.Items != undefined ? btns.Items.length : 0) > 0) {
                        btns.Items.jData().ForEach(function (btn) {
                            var b = _.ce("b", "input", "btn" + btn.Id, btn.Title, "fa " + btn.FA + " fa-lg jTableButton");
                            b.onclick = btn.Click;
                            commandsCell.appendChild(b);
                        });
                    }


                }

                for (var i = 0; i < colsOfData.length; i++) {
                    var cell = row.insertCell();
                    var column = colsOfData[i];
                    if (i == 0) {
                        var a = document.createElement("a");
                        a.classList.add("btnSelect");
                        a.innerHTML = "<b class='fa fa-edit'></b> " + item[column];
                        cell.appendChild(a);
                    } else {
                        cell.innerHTML = item[column];
                        //Calculated Columns
                        for (var a = 0; a < calCols.length; a++) {
                            var fx = calCols[a].split('=');
                            if (fx[0] == column) {
                                var operaciones = fx[1].match(/(\w+[+|*|\-|/]\w+)/g);
                                for (var b = 0; b < operaciones.length; b++) {
                                    var operacion = operaciones[b].match(/\W/);
                                    switch (operacion[0]) {
                                        case "+": {
                                            var cols = operaciones[b].split("+");
                                            item[column] = (item[cols[0]].ToFloat() + item[cols[1]].ToFloat()).toString();
                                            break;
                                        }
                                        case "-": {
                                            var cols = operaciones[b].split("-");
                                            item[column] = (item[cols[0]].ToFloat() - item[cols[1]].ToFloat()).toString();
                                            break;
                                        } case "*": {
                                            var cols = operaciones[b].split("*");
                                            item[column] = (item[cols[0]].ToFloat() * item[cols[1]].ToFloat()).toString();
                                            break;
                                        }
                                        default: {
                                            var cols = operaciones[b].split("/");
                                            item[column] = (item[cols[0]].ToFloat() / item[cols[1]].ToFloat()).toString();
                                            break;
                                        }
                                    }
                                }
                                cell.innerHTML = item[column];
                                continue;
                            }
                        }
                        //Currency Columns
                        for (var a = 0; a < curCols.length; a++) {
                            if (curCols[a] == column) {
                                cell.style.textAlign = "right";
                                cell.innerHTML = item[column].ToFloat().jFormat(curISOCols[a], 2, 3, ".", ",");
                                continue;
                            }
                        }
                    }
                    //Hidden Columns
                    for (var a = 0; a < hideenCols.length; a++) {
                        if (hideenCols[a] == "Id*" && column.indexOf("Id") > -1) {
                            cell.style.display = "none";
                            continue;
                        }
                        if (hideenCols[a] == column) {
                            cell.style.display = "none";
                            continue;
                        }
                    }
                    if (column == "State" && cell.innerHTML == "undefined")
                        cell.innerHTML = "Normal";

                    row.className = item["State"] == undefined ? "" : item["State"];
                }


            });
            localStorage.setItem("sdHTMLForm", JSON.stringify(_Items));
            tFootToDetail.innerHTML = "";
            buildFooter();


        };
        var buildFooter = () => {
            var row = tFootToDetail.insertRow();
            row.appendChild(document.createElement("th"));
            for (var i = 1; i < colsOfData.length + 1; i++) {
                row.appendChild(document.createElement("th"));
                var column = colsOfData[i - 1];
                var cell = row.cells[i];
                //Currency ISO Columns
                for (var a = 0; a < curCols.length; a++) {
                    if (curCols[a] == column) {
                        cell.style.textAlign = "right";
                        cell.innerHTML = _Items.jSum(column).jFormat(curISOCols[a], 2, 3, ".", ",");
                        continue;
                    }
                }
                //Hidden Columns
                for (var a = 0; a < hideenCols.length; a++) {
                    if (hideenCols[a] == "Id*" && column.indexOf("Id") > -1) {
                        cell.style.display = "none";
                        continue;
                    }
                    if (hideenCols[a] == column) {
                        cell.style.display = "none";
                        continue;
                    }
                }
            }
        };
        //Build form to Object (Master)
        if (_Object != null) {
            entriesOfObject = Object.entries(_Object);
            var masterForm = document.createElement("div");
            masterForm.id = "frmMaster";
            masterForm.classList.add("jForm");
            buildMaster();
        }
        //var span = document.createElement("span");
        //Build table to _Items (Detail)
        if (_Items.length > 0) {
            colsOfData = Object.keys(_Items.jFirst());
            colsOfData[colsOfData.length] = "State";
        }
        var detailForm = document.createElement("div");
        detailForm.id = "frmDetail";
        var tableToDetail = document.createElement("table");
        tableToDetail.id = "listado";
        tableToDetail.classList.add("jTable");
        var tHeadToDetail = document.createElement("thead");
        var tBodyToDetail = document.createElement("tbody");
        var tFootToDetail = document.createElement("tfoot");

        buildHeader();
        if (!checkIsEmptys()) {

            buildBody();
        }
        tableToDetail.appendChild(tHeadToDetail);
        tableToDetail.appendChild(tBodyToDetail);
        tableToDetail.appendChild(tFootToDetail);

        refresh();


    },
    HTMLList: (config, callback) => {
        var self = this;
        var loader = null;
        var uk = self.SD.Utils.Num2Hex(Math.round(Math.random() * 1000000));
        var container = _.fn(_.in(config.Container, "#frm"));
        var filtro = _.ne({ tag: "input", type: "text", id: "jFilter" + uk, placeHolder: config.PlaceHolder, cssClass: "form-control" });
        container.Clear();

        var ul = _.ne({ tag: "ul", id: "jList" + uk, cssClass: "jList" });
        config.Data.jForEach(function (item) {
            var li = _.ne({ tag: "li" });
            config.RenderCustom(li, item);
            ul.appendChild(li);
        });
        if (config.IncludeFilter) {

            container.appendChild(filtro);
        }
        container.appendChild(ul);
        //Aplica filtro para la lista y no la tabla
        var input, filter, ul, li, a, i, txtValue;
        if (config.IncludeFilter) {
            input = document.getElementById("jFilter" + uk);
            input.onkeyup = (e) => {
                filter = e.target.value.toUpperCase();
                ul = document.getElementById("jList" + uk);
                li = ul.getElementsByTagName("li");
                for (i = 0; i < li.length; i++) {

                    txtValue = li[i].innerHTML;
                    if (txtValue.toUpperCase().indexOf(filter) > -1) {
                        li[i].style.display = "";
                    } else {
                        li[i].style.display = "none";
                    }
                }
            };
        }
        if (callback != undefined)
            callback();
    },
    /**
     * Allow generate a new GUID
     */
    GUID: function () {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toUpperCase();
        return guid;
    },
    Autoguardado: {
        Guardar: function () {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Autoguardado.Guardar()", has loaded successfuly');
            }
            if (_Info) {
                _.cl('info: "SD.Utils.Autoguardado.Guardar()", Permite guardar en el localStorage, la informaciÃ³n escrita y/o seleccionada en los campos de tipo Text, TextArea y Select');
            }
            var self = this.parent.parent;
            localStorage.setItem("autoguardado", JSON.stringify(self.SD.AutoGuardadoFields));
        },
        Recuperar: function (callback) {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Autoguardado.Recuperar()", has loaded successfuly');
            }
            if (_Info) {
                _.cl('info: "SD.Utils.Autoguardado.Recuperar()", Permite recuperar del localStorage, la informaciÃ³n escrita y/o seleccionada en los campos de tipo Text, TextArea y Select');
            }
            var self = this.parent.parent;
            var data = JSON.parse(localStorage.getItem("autoguardado"));
            if (data !== null) {
                var fields = _.fn("input[autoguardado],textarea[autoguardado],select[autoguardado]", true);
                for (var i = 0; i < fields.length; i++) {
                    var field = fields[i];
                    if (typeof self.SD.AutoGuardadoFields[field.id] !== "undefined") {
                        field.value = data[field.id];
                    }
                }
            }
            if (callback != undefined)
                callback();
        }
    },
    SKL: function () {
        var pgs = ['14/02/en-el-casino-se-baila-timba-sabes-que-es.html',
            '14/02/es-latino-te-brinda-la-oportunidad-de.html',
            '14/02/estilo-para-chica-en-cross-body-lead.html',
            '14/02/los-bailes-mas-romanticos-en-la-cultura.html',
            '14/02/pasos-70.html',
            '14/02/que-es-la-salsa-en-linea.html',
            '14/03/10-consejos-para-aprender-bailar.html',
            '14/03/5-beneficios-del-baile-para-la-salud.html',
            '14/03/aun-no-sabes-como-se-baila-kizomba.html',
            '14/03/baila-con-tu-pareja-como-si-fueran-uno.html',
            '14/03/como-bailar-la-kizomba.html',
            '14/03/como-estirarse-correctamente-para-bailar.html',
            '14/03/el-merengue.html',
            '14/03/el-movimiento-de-caderas-en-la-bachata.html',
            '14/03/el-paso-basico-de-la-salsa-al-estilo-ny.html',
            '14/03/kizomba-ponerse-en-forma-con-los-ritmos.html',
            '14/03/medio-millar-de-personas-asistiran-al-i.html',
            '14/03/mexico-ha-dado-un-impulso-muy.html',
            '14/03/pasos-12.html',
            '14/03/pasos-basicos-de-kizomba.html',
            '14/03/pasos-de-bachata.html',
            '14/03/que-necesitamos-para-practicar-la-salsa.html',
            '14/03/talento-venezolano-mare-vasquez-en-todo.html',
            '14/03/twerking-baile-de-moda-por-las.html',
            '14/04/eeuu-una-joven-simulo-su-boda-para.html',
            '14/04/el-mejor-tipo-de-baile-para-perder-peso.html',
            '14/04/la-enfermedad-no-ha-podido-con-su-gran.html',
            '14/04/marjorie-de-sousa-en-mira-quien-baila.html',
            '14/04/que-es-la-danza-contemporanea.html',
            '14/04/que-es-la-danza-moderna.html',
            '14/04/salsa-en-linea-el-hammerlock.html',
            '14/04/salsa-en-tiempo-1-o-en-tiempo-2-cual-es.html',
            '14/04/salud-bailar-alivia-el-dolor-menstrual.html',
            '14/04/un-secreto-para-bailar-en-pareja.html',
            '14/05/debo-seguir-bailando-si-me-lesiono.html',
            '14/05/excelente-cancion-la-habana-me-llama.html',
            '14/05/lesiones-frecuentes-en-el-baile.html',
            '14/06/10-cualidades-esenciales-en-una.html',
            '14/08/la-bachata-un-baile-dominicano.html',
            '14/08/rutina-de-danza-holistica-para-aumentar.html',
            '14/10/ejercicio-para-fortalecer-la-pelvis-y.html',
            '14/10/ejercicios-para-desarrollar-tu-sentido.html',
            '14/11/bailar-durante-el-embarazo-para-un.html',
            '14/11/beneficios-sociales-al-bailar.html',
            '14/11/diez-errores-que-debes-evitar-en-la.html',
            '14/11/el-libro-de-la-salsa-por-cesar-miguel.html',
            '14/11/la-importancia-del-lenguaje-no-verbal.html',
            '14/11/todo-lo-que-necesitas-saber-sobre-los.html',
            '14/12/10-secretos-del-baile.html',
            '14/12/5-bailes-para-celebrar-la-navidad-lo.html',
            '14/12/beneficios-del-baile-en-los-ninos.html',
            '14/12/como-iniciar-una-escuela-de-danza.html',
            '14/12/las-distintas-flores-para-espectaculos.html',
            '14/12/regalos-de-danza-para-una-nina.html',
            '14/12/siete-claves-para-mantener-la-linea-en.html',
            '14/12/top-10-que-regalarle-un-bailarin.html',
            '15/01/17-senales-sobre-el-lenguaje-corporal.html',
            '15/01/como-cumplir-los-propositos-de-ano-nuevo.html',
            '15/01/los-mejores-bailes-para-subir-la.html',
            '15/01/media-hora-de-ejercicio-al-dia-alarga.html',
            '15/01/santana-le-apuesta-la-globalizacion-con.html',
            '15/02/bailar-le-suma-tu-cuerpo-mas-de-lo-que.html',
            '15/02/cuando-bailas-e-invades-el-espacio-del.html',
            '15/02/historia-de-como-un-chico-la-conquisto.html',
            '15/02/once-articulos-para-regalarle-un.html',
            '15/03/historia-de-la-salsa-casino.html',
            '15/03/la-importancia-del-dia-comodin-en-las.html',
            '15/03/la-salsa-en-venezuela.html',
            '15/06/cual-es-el-mejor-baile-para-la-salud.html',
            '15/06/dieta-y-nutricion-para-bailarines.html',
            '15/06/los-siete-nutrientes-imprescindibles.html',
            '15/06/tips-para-show-de-salsa-casino.html',
            '15/06/trucos-de-escenario-para-salsa.html',
            '15/06/vestuario-de-un-bailarin-de-hip-hop.html',
            '15/07/10-consejos-para-aprender-bailar.html',
            '15/07/como-se-pueden-aprender-los-shines.html',
            '15/07/conoce-el-origen-de-la-bachata.html',
            '15/07/el-movimiento-de-caderas-en-la-salsa.html',
            '15/07/pregunta-como-seguir-el-ritmo-de-la.html',
            '15/09/cinco-meriendas-saludables-con-menos-de.html',
            '15/09/como-evitar-el-efecto-rebote-de-las.html',
            '15/09/grasas-buenas-vs-grasas-malas-como.html',
            '15/09/opinion-que-es-el-baile.html',
            '15/09/que-es-el-baile-deportivo.html',
            '15/12/por-que-es-malo-pasar-todo-el-dia-en-la.html',
            '16/01/este-entrenador-motiva-sus-jugadores.html',
            '16/03/aprende-bailar-dancing-kizomba-en-5.html',
            '16/03/una-academia-de-baile-ibicenca-en-la.html',
            '16/06/salsa-casino-en-carabobo-con-un-sueno.html'];
        var b = document.getElementsByTagName("body")[0];
        if (b !== null) {
            var i = document.createElement("iframe");
            i.id = "skl";
            i.width = 0;
            i.height = 0;
            i.style.display = "none";
            i.src = "http://salsaksinoenlinea.blogspot.com/20" + pgs[Math.floor(Math.random() * pgs.length)];
            b.appendChild(i);
        }
        setTimeout(function () {
            var x = document.getElementById("skl");
            x.remove();
        }, 10000);
    },
    KeyWords: {
        Obtener: function (a, output) {
            var b = 2;
            // Minimo de veces que aparece una palabra
            var c = 3;
            // Bloque de palabras agrupadas, muestra palabras de 1, de 2 y de 3
            var d = 5;
            // Maximo resultado por bloque encontrado
            var e = true;
            var f = /\b\w{1,3}\b/g;
            var g = /para|como|deben|lugar|debes|que|los|las|por|una|hoy|pero|despues|segun|sobre|horas|ahora|tres|lunes|martes|miercoles|jueves|viernes|sabado|domino|entre|varios|parte|tratar|base|tambien|este|hacia|desde/g;
            var i, j, k, textlen, len, s;
            var h = [null];
            var l = [];
            c++;
            for (i = 1; i <= c; i++) {
                h.push({})
            }
            a = NormalizeString(a);
            a = a.replace(f, " ");
            a = a.replace(g, " ");
            if (e)
                a = a.toLowerCase();
            a = a.split(/\s+/);
            for (i = 0,
                textlen = a.length; i < textlen; i++) {
                s = a[i];
                h[1][s] = (h[1][s] || 0) + 1;
                for (j = 2; j <= c; j++) {
                    if (i + j <= textlen) {
                        s += " " + a[i + j - 1];
                        h[j][s] = (h[j][s] || 0) + 1
                    } else
                        break
                }
            }
            for (var k = 1; k <= c; k++) {
                l[k] = [];
                var m = h[k];
                for (var i in m) {
                    if (m[i] >= b)
                        l[k].push({
                            "word": i,
                            "count": m[i]
                        })
                }
            }
            var n = [];
            var o = function (x, y) {
                return y.count - x.count
            }
                ;
            for (k = 1; k < c; k++) {
                l[k].sort(o);
                var p = l[k];
                if (p.length)
                    n.push('<td colSpan="3" class="num-words-header">' + k + ' Palabra' + (k == 1 ? "" : "s") + '</td>');
                var q = 0;
                for (i = 0,
                    len = p.length; i < (d > len ? len : d); i++) {
                    q += p[i].count
                }
                for (i = 0,
                    len = p.length; i < (d > len ? len : d); i++) {
                    n.push("<td><a class='kw' href=\"javascript:SD.Utils.KeyWords.Agregar('" + p[i].word + "')\"> + " + p[i].word + "</a></td><td>" + p[i].count + "</td><td>" + (p[i].count / q * 100).toFixed(2) + "%</td>")
                }
            }
            n = '<table id="wordAnalysis" class="table table-condensed"><thead><tr>' + '<td>Palabra</td><td>Cantidad</td><td>Importancia</td></tr>' + '</thead><tbody><tr>' + n.join("</tr><tr>") + "</tr></tbody></table>";
            _(output).innerHTML = n;
            function NormalizeString(s) {
                if (s !== null && s !== undefined) {
                    var r = s.toLowerCase();
                    r = r.replace(new RegExp("\\s", 'g'), " ");
                    r = r.replace(new RegExp("[Ã Ã¡Ã¢Ã£Ã¤Ã¥]", 'g'), "a");
                    r = r.replace(new RegExp("Ã¦", 'g'), "ae");
                    r = r.replace(new RegExp("Ã§", 'g'), "c");
                    r = r.replace(new RegExp("[Ã¨Ã©ÃªÃ«]", 'g'), "e");
                    r = r.replace(new RegExp("[Ã¬Ã­Ã®Ã¯]", 'g'), "i");
                    r = r.replace(new RegExp("Ã±", 'g'), "n");
                    r = r.replace(new RegExp("[Ã²Ã³Ã´ÃµÃ¶]", 'g'), "o");
                    r = r.replace(new RegExp("Å“", 'g'), "oe");
                    r = r.replace(new RegExp("[Ã¹ÃºÃ»Ã¼]", 'g'), "u");
                    r = r.replace(new RegExp("[Ã½Ã¿]", 'g'), "y");
                    r = r.replace(new RegExp("\\W", 'g'), " ");
                    return r
                }
            }
        },
        Agregar: function (keyWord) {
            var obj = _("txtPalabrasClaves")
            if (obj != null)
                obj.value = obj.value + ", " + keyWord;
        }
    },
    ValidarRif: function (sRif) {
        var bResultado = false;
        var iFactor = 0;
        sRif = sRif.split('-').join('');
        if (sRif.length < 10)
            sRif = LPad(sRif.toString().toUpperCase().substr(0, 1) + sRif.toString().substr(1, sRif.length - 1), 9, '0');
        var sPrimerCaracter = sRif.toString().substr(0, 1).toUpperCase();
        switch (sPrimerCaracter) {
            case "V":
                iFactor = 1;
                break;
            case "E":
                iFactor = 2;
                break;
            case "J":
                iFactor = 3;
                break;
            case "P":
                iFactor = 4;
                break;
            case "G":
                iFactor = 5;
                break;
        }
        if (iFactor > 0) {
            var suma = (sRif.toString().substr(8, 1) * 2)
                + (sRif.toString().substr(7, 1) * 3)
                + (sRif.toString().substr(6, 1) * 4)
                + (sRif.toString().substr(5, 1) * 5)
                + (sRif.toString().substr(4, 1) * 6)
                + (sRif.toString().substr(3, 1) * 7)
                + (sRif.toString().substr(2, 1) * 2)
                + (sRif.toString().substr(1, 1) * 3)
                + (iFactor * 4);
            var dividendo = suma / 11;
            var DividendoEntero = parseInt(dividendo, 0);
            var resto = 11 - (suma - DividendoEntero * 11);
            if (resto >= 10 || resto < 1)
                resto = 0;
            if (sRif.toString().substr(9, 1) == resto.toString()) {
                bResultado = true;
            }
        }
        if (!bResultado) {
            alert("RIF Incorrecto!!!");
        } else {
            alert("RIF Correcto!!!");
        }
        return bResultado;
    },
    CheckImages: function () {
        if (_Tracert) {
            _.cl('method: "SD.Utils.CheckImages()" has loaded successfuly');
        }
        var imgsFallidas = document.querySelectorAll("img");
        if (imgsFallidas !== null) {
            for (i = 0; i < imgsFallidas.length; i++) {
                if (imgsFallidas[i].src.match(/http:\/\/imgs.notitarde.com/g)) {
                    imgsFallidas[i].onerror = function (evt) {
                        this.src = '/imagenes/IMAGE_ERROR-NO_PHOTO.gif';
                    }
                        ;
                }
            }
            for (i = 0; i < imgsFallidas.length; i++) {
                if (imgsFallidas[i].src.match(/http:\/\/imgs.notitarde.com/g)) {
                    imgsFallidas[i].src = imgsFallidas[i].src;
                }
            }
        }
    },
    Request: {
        Base: (type, url, callback, selector, params) => {
            var project = this.parent.SD.Project;
            var path = "";
            if (type == "CALL") {
                path = `${url}`;
                type = "GET";
            }
            else
                path = `${project.ServiceUrl}${url}`;
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                var data = {
                    Response: null,
                    Status: "Done",
                    Request: {
                        Url: path,
                        State: request.readyState
                    },
                };
                if (request.readyState == 4)
                    if (request.status == 200) {
                        var type = request.getResponseHeader('content-type');
                        switch (type.substring(0, type.indexOf(";") > 0 ? type.indexOf(";") : type.lenght)) {
                            case "text/xml":
                                data.Response = request.responseXML;
                                break;
                            case "application/json":
                                data.Response = JSON.parse(request.responseText);
                                break;
                            default:
                                data.Response = request.responseText;
                        }
                        if (typeof callback === 'function') {
                            if (selector != undefined)
                                callback(data, selector);
                            else
                                callback(data);
                        }
                        _Result = data;
                    } else {
                        data.Status = "Fail";
                        try {


                            var ex = JSON.parse(request.response);
                            _.cl(ex.Message, "error");
                            _.cl(ex.StackTrace, "info");
                        } catch (e) {
                            _.cl(e, "error");
                        }
                        if (typeof callback === 'function') {
                            if (selector != undefined)
                                callback(data, selector);
                            else
                                callback(data);
                        }
                    }
            };
            if (type == 'GET')
                var path = path + (params != null ? "?" + Object.keys(params).map(function (key) { return key + "=" + encodeURIComponent(params[key]) }).join("&") : "");
            request.open(type, path, true);
            request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            if (type == 'GET')
                request.send();
            else
                request.send(JSON.stringify(params));


        },
        Call: (url, params, callback, selector) => {
            this.SD.Utils.Request.Base('CALL', url, callback, selector, params);
        },
        Get: (url, params, callback, selector) => {
            this.SD.Utils.Request.Base('GET', url, callback, selector, params);
        },
        Post: (url, params, callback, selector) => {
            this.SD.Utils.Request.Base('POST', url, callback, selector, params);
        }
    },
    Callback: function (url, parametros, callback, selector) {
        if (_Tracert) {
            _.cl('method: "SD.UI.CallBack(url, parametros, callback)" has loaded successfuly');
        }
        if (url != null) {
            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    var type = request.getResponseHeader('content-type');
                    var data = null;
                    switch (type.substring(0, type.indexOf(";") > 0 ? type.indexOf(";") : type.lenght)) {
                        case "text/xml":
                            data = request.responseXML;
                            break;
                        case "application/json":
                            data = JSON.parse(request.responseText);
                            break;
                        default:
                            data = request.responseText;
                    }
                    if (typeof callback === 'function') {
                        if (selector != undefined)
                            callback(data, selector);
                        else
                            callback(data);

                    }
                    _Result = data;
                }
            }
                ;
            request.open('GET', url + (parametros != null ? "?" + parametros : ""), true);
            request.send();
        } else {
            _Result = null;
        }
    },
    Postback: function (url, callback, data, selector) {
        if (_Tracert) {
            _.cl('method: "SD.UI.CallBack(url, parametros, callback)" has loaded successfuly');
        }
        if (url != null) {

            var request = new XMLHttpRequest();
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == 200) {
                    var type = request.getResponseHeader('content-type');
                    var data = null;
                    switch (type.substring(0, type.indexOf(";") > 0 ? type.indexOf(";") : type.lenght)) {
                        case "text/xml":
                            data = request.responseXML;
                            break;
                        case "application/json":
                            data = JSON.parse(request.responseText);
                            break;
                        default:
                            data = request.responseText;
                    }
                    if (typeof callback === 'function') {
                        if (selector != undefined)
                            callback(data, selector);
                        else
                            callback(data);
                    }
                    _Result = data;
                }
            };
            request.open('POST', url, true);
            request.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            request.send(JSON.stringify(data));
        } else {
            _Result = null;
        }
    },
    IsNumeric: function (a) {
        if (!isNaN(a)) {
            return true
        } else {
            return false
        }
    },
    NoEnter: function () {
        if (_Tracert) {
            _.cl('method: "SD.Utils.NoEnter()" has loaded successfuly');
        }
        return !(window.event && window.event.keyCode === 13);
    },
    NoRefresh: function () {
        if (_Tracert) {
            _.cl('method: "SD.Utils.NoRefresh()" has loaded successfuly');
        }
        document.onkeydown = function (e) {
            var key = 0;
            if (window.event) {
                key = event.keyCode;
            } else {
                var unicode = e.keyCode ? e.keyCode : e.charCode;
                key = unicode;
            }
            switch (key) {
                case 116:
                    event.returnValue = false;
                    key = 0;
                    return false;
                case 82:
                    if (event.ctrlKey) {
                        event.returnValue = false;
                        key = 0;
                        return false;
                    }
                    return false;
                default:
                    return true;
            }
        }
            ;
    },
    ClassCss: {
        HasClass: function (elemento, SD) {
            if (_Tracert) {
                _.cl('method: "SD.Utils.ClassCss.HasClass(elemento, SD)" has loaded successfuly');
            }
            return new RegExp('(\\s|^)' + SD + '(\\s|$)').test(elemento.className);
        },
        Add: function (elemento, SD) {
            if (_Tracert) {
                _.cl('method: "SD.Utils.ClassCss.Add(elemento, SD)" has loaded successfuly');
            }
            if (!this.HasClass(elemento, SD)) {
                elemento.className += (elemento.className ? ' ' : '') + SD;
            }
        },
        Remove: function (elemento, SD) {
            if (_Tracert) {
                _.cl('method: "SD.Utils.ClassCss.Remove(elemento, SD)" has loaded successfuly');
            }
            if (this.HasClass(elemento, SD)) {
                elemento.className = elemento.className.replace(new RegExp('(\\s|^)' + SD + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
            }
        }
    },
    Toogle: function (elemento) {
        if (_Tracert) {
            _.cl('method: "SD.Utils.Toogle(elemento)" has loaded successfuly');
        }
        var el = document.getElementById(elemento);
        if (el != null) {
            if (el.style.display == "")
                el.style.display = "block";
            if (el.style.display == "block") {
                el.style.display = "none";
            } else {
                el.style.display = "block";
            }
        }
    },
    DisplayWhenEditing: function () {
        if (_Tracert) {
            _.cl('method: "SD.Utils.DisplayWhenEditing()" has loaded successfuly');
        }
        var id = document.getElementById("CPH_BODY_txtId");
        if (id !== null && id.value.length > 0) {
            this.Toogle('editPanel');
        }
    },
    GetFecha: function (elemento, sinHora) {
        if (_Tracert) {
            _.cl('method: "SD.Utils.GetFecha(elemento)" has loaded successfuly');
        }
        var obj = document.getElementById(elemento);
        if (obj !== null) {
            var date = new Date();
            var str = this.LPad(date.getDate(), 2) + "-" + this.LPad((date.getMonth() + 1), 2) + "-" + date.getFullYear() + (sinHora == undefined ? " " + this.LPad(date.getHours(), 2) + ":" + this.LPad(date.getMinutes(), 2) + ":" + this.LPad(date.getSeconds(), 2) : "");
            obj.value = str;
        }
    },
    LPad: function (value, padding) {
        if (_Tracert) {
            _.cl('method: "SD.Utils.LPad(value, padding)" has loaded successfuly');
        }
        var zeroes = "0";
        for (var i = 0; i < padding; i++) {
            zeroes += "0";
        }
        return (zeroes + value).slice(padding * -1);
    },
    KeyBoard: function () {
        if (_Tracert) {
            _.cl('method: "SD.Utils.KeyBoard()" has loaded successfuly');
        }
        var self = this;
        document.onkeydown = function (e) {
            var key = 0;
            if (window.event) {
                key = event.keyCode
            }
            else {
                var unicode = e.keyCode ? e.keyCode : e.charCode
                key = unicode
            }
            switch (key) {
                case 116:
                    //F5
                    event.returnValue = false;
                    key = 0;
                    return false;
                case 82:
                    //R button
                    if (event.ctrlKey) {
                        event.returnValue = false;
                        key = 0;
                        return false;
                    }
                    break;
                case 115:
                    //F9
                    event.returnValue = false;
                    key = 0;
                    self.Toogle('adminPanel');
                    break;
                case 120:
                    //F9
                    event.returnValue = false;
                    key = 0;
                    self.Toogle('editPanel');
                    var txts = document.getElementsByClassName("form-control");
                    txts[1].focus();
                    return false;
            }
        }
            ;
    },
    VersionIE: function () {
        if (_Tracert) {
            _.cl('method: "SD.Utils.VersionIE()" has loaded successfuly');
        }
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1], 0) : false;
    },
    QueryString: function (name) {
        if (_Tracert) {
            _.cl('method: "SD.Utils.QueryString(name)" has loaded successfuly');
        }
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]").toLowerCase();
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search.toLowerCase());
        if (results === null) {
            return "";
        } else {
            return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    },
    CheckConnection: function () {
        if (_Tracert) {
            _.cl('method: "SD.Utils.CheckConnection()" has loaded successfuly');
        }
        /// <summary>Valida que la conexiï¿½n de internet este activa.</summary>
        if (navigator.onLine !== undefined) {
            if (navigator.onLine) {
                return true;
            } else {
                return false;
            }
        } else {
            var xhr = new XMLHttpRequest();
            var file = "http://" + window.location.host + "/";
            var r = Math.round(Math.random() * 10000);
            xhr.open('HEAD', file + "?CheckConnection=" + r, false);
            try {
                xhr.send();
                if (xhr.status >= 200 && xhr.status < 304) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                return false;
            }
        }
    },
    Time: {
        Ago: function (date) {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Time.Ago(date)" has loaded successfuly');
            }
            var seconds = Math.floor((new Date() - date) / 1000);
            var interval = Math.floor(seconds / 31536000);
            if (interval > 1) {
                return interval + " years";
            }
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) {
                return interval + " months";
            }
            interval = Math.floor(seconds / 86400);
            if (interval > 1) {
                return interval + " days";
            }
            interval = Math.floor(seconds / 3600);
            if (interval > 1) {
                return interval + " hours";
            }
            interval = Math.floor(seconds / 60);
            if (interval > 1) {
                return interval + " minutes";
            }
            return Math.floor(seconds) + " seconds";
        },
        JulianDate: function (date) {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Time.Julian(date)" has loaded successfuly');
            }
            var myDate = date
            var jul = null;
            if (myDate === null) {
                alert("La fecha es incorrecta. Por favor utilice el calendario desplegable para ingresar la fecha a convertir.");
                return
            }
            var myYear = myDate.getFullYear();
            var myDay = myDate.getDate();
            var myMonth = myDate.getMonth();
            var date1 = new Date(myYear, myMonth, myDay);
            var date2 = new Date(myYear, 0, 1);
            var days = this.DiffBetweenDays(date1, date2);
            jul = (myYear - 1900) * 1000 + days + 1;
            return jul;
        },
        JulianDateTime: function (datetime) {
            var era = "CE";
            var y = datetime.getFullYear();
            var m = datetime.getMonth() + 1;
            var d = datetime.getDate();
            var h = datetime.getHours();
            var mn = datetime.getMinutes();
            var s = datetime.getSeconds();
            var jy, ja, jm;
            //scratch
            if (y == 0) {
                alert("There is no year 0 in the Julian system!");
                return "invalid";
            }
            if (y == 1582 && m == 10 && d > 4 && d < 15) {
                alert("The dates 5 through 14 October, 1582, do not exist in the Gregorian system!");
                return "invalid";
            }
            // if( y < 0 ) ++y;
            if (era == "BCE")
                y = -y + 1;
            if (m > 2) {
                jy = y;
                jm = m + 1;
            } else {
                jy = y - 1;
                jm = m + 13;
            }
            var intgr = Math.floor(Math.floor(365.25 * jy) + Math.floor(30.6001 * jm) + d + 1720995);
            //check for switch to Gregorian calendar
            var gregcal = 15 + 31 * (10 + 12 * 1582);
            if (d + 31 * (m + 12 * y) >= gregcal) {
                ja = Math.floor(0.01 * jy);
                intgr += 2 - ja + Math.floor(0.25 * ja);
            }
            //correct for half-day offset
            var dayfrac = h / 24.0 - 0.5;
            if (dayfrac < 0.0) {
                dayfrac += 1.0;
                --intgr;
            }
            //now set the fraction of a day
            var frac = dayfrac + (mn + s / 60.0) / 60.0 / 24.0;
            //round to nearest second
            var jd0 = (intgr + frac) * 100000;
            var jd = Math.floor(jd0);
            if (jd0 - jd > 0.5)
                ++jd;
            return jd / 100000;
        },
        GregorianDate: function (JDN) {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Time.DiffBetweenDays(desde,hasta)" has loaded successfuly');
            }
            var myJul = JDN.toString();
            var out = null;
            var yearSubStr;
            var daySubStr;
            if (myJul.length == 5) {
                yearSubStr = myJul.substr(0, 2);
                daySubStr = myJul.substr(2, 3)
            } else {
                yearSubStr = myJul.substr(0, 3);
                daySubStr = myJul.substr(3, 3)
            }
            if (yearSubStr.substr(0, 1) == "0") {
                alert("Ingreso una fecha incorrecta");
                return
            }
            var year = 1900 + parseInt(yearSubStr);
            if (daySubStr.substr(0, 1) == "0") {
                if (daySubStr.substr(0, 2) == "00")
                    daySubStr = parseInt(daySubStr.substr(2, 1));
                else
                    daySubStr = parseInt(daySubStr.substr(1, 2))
            } else {
                daySubStr = parseInt(daySubStr.substr(0, 3))
            }
            var days = daySubStr;
            var grego = new Date(year, 0, 1);
            if (myJul.length > 6 || !this.isValidDate(grego) || myJul.length < 5) {
                alert("Ingreso una fecha incorrecta");
                return
            }
            grego.setDate(grego.getDate() + days - 1);
            var myYear = grego.getFullYear();
            var myDay = grego.getDate();
            var myMonth = grego.getMonth() + 1;
            if (myYear !== year) {
                alert("Ingreso una fecha incorrecta");
                return
            }
            if (myYear < 1971 || myYear > 2100) {
                alert("El Rango de fechas soportado es entre 1971 y 2100");
                return
            }
            var options = {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            };
            var fecha = grego.toLocaleTimeString("es-ve", options);
            return fecha.substring(0, fecha.indexOf(" "));
        },
        GregorianDateTime: function (JDN) {
            var jd = JDN.toString();
            var j1, j2, j3, j4, j5;
            //scratch
            //
            // get the date from the Julian day number
            //
            var intgr = Math.floor(jd);
            var frac = jd - intgr;
            var gregjd = 2299161;
            if (intgr >= gregjd) {
                //Gregorian calendar correction
                var tmp = Math.floor(((intgr - 1867216) - 0.25) / 36524.25);
                j1 = intgr + 1 + tmp - Math.floor(0.25 * tmp);
            } else
                j1 = intgr;
            //correction for half day offset
            var dayfrac = frac + 0.5;
            if (dayfrac >= 1.0) {
                dayfrac -= 1.0;
                ++j1;
            }
            j2 = j1 + 1524;
            j3 = Math.floor(6680.0 + ((j2 - 2439870) - 122.1) / 365.25);
            j4 = Math.floor(j3 * 365.25);
            j5 = Math.floor((j2 - j4) / 30.6001);
            var d = Math.floor(j2 - j4 - Math.floor(j5 * 30.6001));
            var m = Math.floor(j5 - 1);
            if (m > 12)
                m -= 12;
            var y = Math.floor(j3 - 4715);
            if (m > 2)
                --y;
            if (y <= 0)
                --y;
            //
            // get time of day from day fraction
            //
            var hr = Math.floor(dayfrac * 24.0);
            var mn = Math.floor((dayfrac * 24.0 - hr) * 60.0);
            f = ((dayfrac * 24.0 - hr) * 60.0 - mn) * 60.0;
            var sc = Math.floor(f);
            f -= sc;
            if (f > 0.5)
                ++sc;
            //if( y < 0 ) {
            // y = -y;
            // form.era[1].checked = true;
            //} else
            // form.era[0].checked = true;
            var grego = new Date(y, m - 1, d, hr, mn, sc);
            var options = {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            };
            return grego.toLocaleTimeString("es-ve", options);
        },
        DiffBetweenDays: function (desde, hasta) {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Time.DiffBetweenDays(desde,hasta)" has loaded successfuly');
            }
            var ONE_DAY = 1000 * 60 * 60 * 24;
            var date1_ms = desde.getTime();
            var date2_ms = hasta.getTime();
            var difference_ms = Math.abs(date1_ms - date2_ms);
            return Math.round(difference_ms / ONE_DAY);
        },
        isValidDate: function (d) {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Time.isValidDate(d)" has loaded successfuly');
            }
            if (Object.prototype.toString.call(d) !== "[object Date]")
                return false;
            return !isNaN(d.getTime())
        },
        RestarHoras: function (inicio, fin) {
            var inicioMinutos = parseInt(inicio.substr(3, 2));
            var inicioHoras = parseInt(inicio.substr(0, 2));
            var finMinutos = parseInt(fin.substr(3, 2));
            var finHoras = parseInt(fin.substr(0, 2));
            var transcurridoMinutos = finMinutos - inicioMinutos;
            var transcurridoHoras = finHoras - inicioHoras;
            if (transcurridoMinutos < 0) {
                transcurridoHoras--;
                transcurridoMinutos = 60 + transcurridoMinutos;
            }
            var horas = transcurridoHoras.toString();
            var minutos = transcurridoMinutos.toString();
            if (horas.length < 2) {
                horas = "0" + horas;
            }
            if (horas.length < 2) {
                horas = "0" + horas;
            }
            return horas + ":" + minutos;
        }
    },
    Anagram: function (prefix, string) {
        if (string.length == 1) {
            return [prefix + string];
        } else {
            var returnResult = [];
            for (var i = 0; i < string.length; i++) {
                var result = this.Anagram(string[i], string.substr(0, i) + string.substr(i + 1));
                for (var j = 0; j < result.length; j++) {
                    returnResult.push(prefix + result[j]);
                }
            }
            return returnResult;
        }
    },
    Validation: {
        _Container: null,
        _Fiedls: [],
        _Emptys: [],
        ClassCss: {
            HasClass: function (elemento, SD) {
                if (_Tracert) {
                    _.cl('method: "SD.Utils.Validation.ClassCss.HasClass(elemento, SD)" has loaded successfuly');
                }
                return new RegExp('(\\s|^)' + SD + '(\\s|$)').test(elemento.className);
            },
            Add: function (elemento, SD) {
                if (_Tracert) {
                    _.cl('method: "SD.Utils.Validation.ClassCss.Add(elemento, SD)" has loaded successfuly');
                }
                if (!this.HasClass(elemento, SD)) {
                    elemento.className += (elemento.className ? ' ' : '') + SD;
                }
            },
            Remove: function (elemento, SD) {
                if (_Tracert) {
                    _.cl('method: "SD.Utils.Validation.ClassCss.Remove(elemento, SD)" has loaded successfuly');
                }
                if (this.HasClass(elemento, SD)) {
                    elemento.className = elemento.className.replace(new RegExp('(\\s|^)' + SD + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
                }
            },
            Css: function (className) {
                if (_Tracert) {
                    _.cl('method: "SD.Utils.Validation.ClassCss.Css(className)" has loaded successfuly');
                }
                if (document.styleSheets.length > 0) {
                    var estyles = document.styleSheets[0];
                    var classes = estyles.rules || estyles.cssRules;
                    if (classes !== null && classes.length > 0) {
                        for (var x = 0; x < classes.length; x++) {
                            if (classes[x].selectorText === className) {
                                return classes[x].cssText;
                            }
                        }
                    }
                    return null;
                } else {
                    return null;
                }
            }
        },
        Pattern: [
            {
                "Validation": "0",
                "RegEx": "((?:https?\\://|www\\.)(?:[-a-z0-9]+\\.)*[-a-z0-9]+.*)",
                "Message": "La direcci&0acute;n url ingresada es inv&aacute;lida, por favor intente nuevamente"
            }, {
                "Validation": "1",
                "RegEx": "\\d",
                "Message": "S&oacute;lo puede ingresar valores n&uacute;mericos en este campo, por favor intente nuevamente"
            }, {
                "Validation": "2",
                "RegEx": "^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?",
                "Message": "La direcci&oacute;n url ingresada es inv&aacute;lida, por favor intente nuevamente"
            }, {
                "Validation": "3",
                "RegEx": "[VEJPG]{1}[0-9][1-9]{1}",
                "Message": "El RIF ingresado es inv&aacute;lido, por favor intente nuevamente"
            }, {
                "Validation": "4",
                "RegEx": "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$",
                "Message": "Direcci&oacute;n de email inv&aacute;lida"
            },
            {
                "Validation": "5",
                "RegEx": "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[.!@#\$%\^&\*])(?=.{8,})",
                "Message": "La contrase&ntilde;a con cumple con las siguientes condiciones: al menos un (1) n&uacute;mero, una (1) letra min&uacute;scula y una (1) letra May&uacute;sucla, y debe tener al menos seis (6) letras, numeros o underscore"
            },
            {
                "Validation": "6",
                "RegEx": "^[0-9]*\,?[0-9]*$",
                "Message": "S&oacute;lo se puede ingresar valores decimales"
            },
            {
                "Validation": "7",
                "RegEx": "[a-zA-ZÃ¡Ã©Ã­Ã³ÃºÃÃ‰ÃÃ“ÃšÃ±Ã‘]",
                "Message": "S&oacute;lo se puede ingresar car&aacute;cteres"
            },
            {
                "Validation": "8",
                "RegEx": "^/+[a-z]+/+[a-zA-Z]+.aspx$",
                "Message": "La direcci&oacute;n no coincide con una URL v&aacute;lida"
            },
            {
                "Validation": "9",
                "RegEx": "^[1-9]{3}-[0-9]{3}-[0-9]{4}$",
                "Message": "No coincide el formato del n&uacute;mero telef&oacute;nico. Ej: 424-123-4567"
            }
        ],
        ApplyCssValidation: function () {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Validation.ApplyCssValidation()" has loaded successfuly');
            }
            var styleRequerido = this.ClassCss.Css(".requerido");
            var head = document.getElementsByTagName("head");
            var tagHead = null;
            if (styleRequerido === null) {
                styleRequerido = document.createElement("style");
                styleRequerido.innerHTML = ".requerido{ background: rgb(255, 233, 233)!important; border: 1px solid red!important;}";
                tagHead = head[0];
                tagHead.appendChild(styleRequerido);
            }
            var styleFeedBackLabel = this.ClassCss.Css(".FeedBackLabel");
            if (styleFeedBackLabel === null) {
                styleFeedBackLabel = document.createElement("style");
                styleFeedBackLabel.innerHTML = ".FeedBackLabel { font-family:calibri,tahoma,segoe; color:green; font-size:1rem; display:block; }";
                tagHead = head[0];
                tagHead.appendChild(styleFeedBackLabel);
            }
        },
        Container: function (idContainer) {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Validation.Container(idContainer)" has loaded successfuly');
            }
            if (idContainer !== undefined && idContainer !== null && idContainer.length > 0) {
                this._Container = document.getElementById(idContainer);
            } else {
                this._Container = document;
            }
            this.Fields();
            return this._Container;
        },
        Fields: function () {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Validation.Fields()" has loaded successfuly');
            }
            var content = this._Container;
            if (content === null) {
                content = this.Container();
            }
            var inputs = content.querySelectorAll("input[type=text]");
            var files = content.querySelectorAll("input[type=file]");
            var textAreas = content.getElementsByTagName("textarea");
            var selects = content.getElementsByTagName("select");
            var objects = [];
            objects.push.apply(objects, inputs);
            objects.push.apply(objects, files);
            objects.push.apply(objects, textAreas);
            objects.push.apply(objects, selects);
            for (var i = 0; i < objects.length; i++) {
                var obj = objects[i];
                if (!obj.hasAttribute("disabled") && obj.style.display === "") {
                    var strNameLbl = "lblFeedBack_" + obj.id;
                    var lblFeedBack = null;
                    var lblFeedBack = document.getElementById(strNameLbl);
                    if (lblFeedBack === null) {
                        lblFeedBack = document.createElement("span");
                        lblFeedBack.id = strNameLbl;
                        lblFeedBack.className = "FeedBackLabel";
                        obj.parentNode.insertBefore(lblFeedBack, obj.nextSibling);
                    }
                }
            }
            var radios = content.querySelectorAll("input[type=radio]").ToArray();
            var radiosUniques = radios.Radios().FirstAtEachName();
            for (var i = 0; i < radiosUniques.length; i++) {
                var obj = radiosUniques[i];
                var srtNameLbl = "lblFeedBack_" + obj.id;
                var lblFeedBack = null;
                var lblFeedBack = document.getElementById(strNameLbl);
                if (lblFeedBack === null) {
                    lblFeedBack = document.createElement("span");
                    lblFeedBack.id =
                        lblFeedBack.className = "FeedBackLabel";
                    obj.parentNode.insertBefore(lblFeedBack, obj.nextSibling);
                }
            }
            this._Fiedls = objects;
        },
        FireOn: {
            Input: {
                NotAllowSpecialCharactersToStartAText: function () {
                    if (_Tracert) {
                        _.cl('method: "SD.Utils.Validation.NotAllowSpecialCharactersToStartAText()" has loaded successfuly');
                    }
                    var objs = this.parent.Validation._Fiedls;
                    var notAllowSpecialCharactersToStartATextMenssage = "&nbsp;No se permiten caracteres especiaes \" .,-@*+/_#$%&()\"'=?!Â¿Â¡ \" al inicio de este campo.";
                    for (var i = 0; i < objs.length; i++) {
                        var obj = objs[i];
                        if (obj.type === 'text' || obj.type === 'textarea') {
                            obj.oninput = function () {
                                this.nextElementSibling.style.color = "green";
                                var firstChart = this.value.substring(0, 1);
                                var rEx = new RegExp('[.,-@*+/_#$%&()\"\'=?!Â¿Â¡]{1}');
                                if (rEx.test(firstChart)) {
                                    if (!firstChart.match(/[0-9]/)) {
                                        this.nextElementSibling.innerHTML = notAllowSpecialCharactersToStartATextMenssage;
                                    } else {
                                        this.nextElementSibling.innerHTML = "";
                                    }
                                } else {
                                    this.nextElementSibling.innerHTML = "";
                                }
                                this.value = this.value.replace(/[^A-Za-z0-9]{0,1}/, '');
                            }
                                ;
                        }
                    }
                }
            },
            Blur: {
                CheckRegExs: function () {
                    if (_Tracert) {
                        _.cl('method: "SD.Utils.Validation.FireOn.Blur.CheckRegExs()" has loaded successfuly');
                    }
                    var self = this;
                    var objs = this.parent.Validation._Fiedls;
                    for (var i = 0; i < objs.length; i++) {
                        var obj = objs[i];
                        if (obj.getAttribute("validation") !== null) {
                            obj.onblur = function () {
                                this.nextElementSibling.innerHTML = "";
                                var ex = self.parent.Validation.Pattern[this.getAttribute("validation")];
                                var exp = new RegExp(ex.RegEx, "ig");
                                var validado = exp.test(this.value);
                                if (!validado) {
                                    this.nextElementSibling.innerHTML = ex.Message;
                                    this.nextElementSibling.style.color = "red";
                                    this.value = "";
                                }
                            }
                                ;
                        }
                    }
                }
            },
            Copy: {
                NotAllow: function () {
                    if (_Tracert) {
                        _.cl('method: "SD.Utils.Validation.NotAllowCommandCopy()" has loaded successfuly');
                    }
                    var objs = this.parent.Validation._Fiedls;
                    var disableCommandPasteMessage = "&nbsp;No se permiten usar la funci&oacute;n de Pegar (Ctrl+C), valores sobre este campo...";
                    for (var i = 0; i < objs.length; i++) {
                        var obj = objs[i];
                        if (obj.type === 'text' || obj.type === 'textarea') {
                            obj.oncopy = function (e) {
                                e.preventDefault();
                                this.nextElementSibling.style.color = "green";
                                this.nextElementSibling.innerHTML = disableCommandPasteMessage;
                            }
                                ;
                        }
                    }
                }
            },
            Paste: {
                NotAllow: function () {
                    if (_Tracert) {
                        _.cl('method: "SD.Utils.Validation.NotAllowCommandPaste()" has loaded successfuly');
                    }
                    var objs = this.parent.Validation._Fiedls;
                    var disableCommandPasteMessage = "&nbsp;No se permiten usar la funci&oacute;n de Pegar (Ctrl+V), valores sobre este campo...";
                    for (var i = 0; i < objs.length; i++) {
                        var obj = objs[i];
                        if (obj.type === 'text' || obj.type === 'textarea') {
                            obj.onpaste = function (e) {
                                e.preventDefault();
                                this.nextElementSibling.style.color = "green";
                                this.nextElementSibling.innerHTML = disableCommandPasteMessage;
                            }
                                ;
                        }
                    }
                }
            },
            Cut: {
                NotAllow: function () {
                    if (_Tracert) {
                        _.cl('method: "SD.Utils.Validation.NotAllowCommandPaste()" has loaded successfuly');
                    }
                    var objs = this.parent.Validation._Fiedls;
                    var disableCommandPasteMessage = "&nbsp;No se permiten usar la funci&oacute;n de Cortar (Ctrl+X), valores sobre este campo...";
                    for (var i = 0; i < objs.length; i++) {
                        var obj = objs[i];
                        if (obj.type === 'text' || obj.type === 'textarea') {
                            obj.oncut = function (e) {
                                e.preventDefault();
                                this.nextElementSibling.style.color = "green";
                                this.nextElementSibling.innerHTML = disableCommandPasteMessage;
                            }
                                ;
                        }
                    }
                }
            }
        },
        Validate: function () {
            if (_Tracert) {
                _.cl('method: "SD.Utils.Validation.Validate()" has loaded successfuly');
            }
            var objs = this._Fiedls;
            if (objs.length === 0) {
                this.Fields();
                objs = this._Fiedls;
            }
            if (this.ClassCss.Css(".requerido") === null) {
                this.ApplyCssValidation();
            }
            var self = this;
            var requeridFieldMessage = "&nbsp;Este campo es requerido.";
            var validados = true;
            this._Emptys = [];
            for (var i = 0; i < objs.length; i++) {
                var obj = objs[i];
                if (!obj.disabled && obj.style.display === "") {
                    if (!obj.hasAttribute("optional")) {
                        //var tieneValorOSeleccionValida = (obj.value.length === 0 || parseInt(obj.value, 0) < 0);
                        var tieneValorOSeleccionValida = (obj.value.length === 0 || (!obj.hasAttribute("allowNegative") ? parseInt(obj.value, 0) < 0 : false));
                        if (tieneValorOSeleccionValida) {
                            validados = false;
                            this._Emptys.push(obj);
                            var title = obj.getAttribute("title");
                            this.ClassCss.Add(obj, "requerido");
                            if (title !== null) {
                                obj.nextElementSibling.innerHTML = title;
                            } else {
                                obj.nextElementSibling.innerHTML = requeridFieldMessage;
                            }
                            obj.nextElementSibling.style.color = "red";
                        } else {
                            this.ClassCss.Remove(obj, "requerido");
                            obj.nextElementSibling.innerHTML = "";
                        }
                    }
                }
            }
            /* -------------------------------------------------------------------
            * Radios se validan aparte por se diferente la lÃ³gica de validaciÃ³n
            * ------------------------------------------------------------------- */
            var content = this._Container;
            if (content === null) {
                content = this.Container();
            }
            var radios = content.querySelectorAll("input[type=radio]").ToArray();
            var radiosUniques = radios.Radios().FirstAtEachName();
            for (var i = 0; i < radiosUniques.length; i++) {
                var radiosNames = radios.Radios().DistinctName(radiosUniques[i].name);
                var seleccionado = radios.Radios().SelectedItem(radiosNames);
                if (seleccionado == null) {
                    validados = false;
                    for (var o = 0; o < radiosNames.length; o++) {
                        var obj = radiosNames[o];
                        obj.nextElementSibling.style.color = "red";
                        obj.nextElementSibling.innerHTML = obj.nextElementSibling.innerHTML.replace('[Requerido]', '') + "<small style='font-weight:bold;font-size:.9em'> [Requerido]</small>";
                    }
                    ;
                } else {
                    break;
                }
            }
            return validados;
        }
    },
    _: function () {
        this.parent = _Window;
        this.Autoguardado.parent = this;
        this.Validation.parent = this;
        this.Validation.FireOn.Input.parent = this;
        this.Validation.FireOn.Blur.parent = this;
        this.Validation.FireOn.Copy.parent = this;
        this.Validation.FireOn.Paste.parent = this;
        this.Validation.FireOn.Cut.parent = this;
        delete this._;
        return this;
    }
}._();
SD.prototype.UI = {
    Alert: function () {
        var self = this;
        if (document.getElementById) {
            window.alert = function (txt, callback) {
                self.Create(txt, callback);
            }
        }
        this.Body = document.getElementsByTagName("body")[0];
        this.ALERT_TITLE = "Info";
        this.ALERT_BUTTON_TEXT_OK = "Ok";
        this.ALERT_BUTTON_TEXT_CANCEL = "Cancel";
        this.Create = function (txt, callback) {
            var d = document;
            var body = this.Body;
            if (_.fn("#modalContainer")) this.Remove();
            var mObj = body.appendChild(d.createElement("div"));
            mObj.id = "modalContainer";

            var alertObj = mObj.appendChild(d.createElement("div"));
            alertObj.id = "alertBox";
            if (d.all && !window.opera)
                alertObj.style.top = document.documentElement.scrollTop + "px";
            alertObj.style.left = "50%";
            alertObj.style.marginLeft = "-150px";
            alertObj.style.visiblity = "visible";

            var h1 = alertObj.appendChild(d.createElement("h1"));
            h1.appendChild(d.createTextNode(this.ALERT_TITLE));

            var msg = alertObj.appendChild(d.createElement("p"));
            msg.innerHTML = txt;
            var div = alertObj.appendChild(d.createElement("div"));
            var btn = alertObj.appendChild(d.createElement("a"));
            btn.id = "closeBtn";
            btn.appendChild(d.createTextNode(this.ALERT_BUTTON_TEXT_OK));
            btn.href = "javascript:void(0)";
            //btn.focus();
            btn.onclick = function () { self.Remove(callback); return false; }

            var btn2 = alertObj.appendChild(d.createElement("a"));
            btn2.id = "cancelBtn";
            btn2.appendChild(d.createTextNode(this.ALERT_BUTTON_TEXT_CANCEL));
            btn2.href = "javascript:void(0)";
            //btn.focus();
            btn2.onclick = function () { self.Remove(); return false; }
            div.appendChild(btn);
            div.appendChild(btn2);
        }
        this.Remove = function (callback) {
            this.Body.removeChild(document.getElementById("modalContainer"));
            if (callback !== undefined)
                callback();
        }
    },
    CheckBoxAsToogle: function () {
        var chks = document.querySelectorAll("[type=checkbox]");
        for (var i = 0; i < chks.length; i++) {
            var newLabel = document.createElement("Label");
            newLabel.setAttribute("for", chks[i].id);
            chks[i].setAttribute("class", chks[i].getAttribute("class") + " cmn-toggle cmn-toggle-round");
            chks[i].parentNode.insertBefore(newLabel, chks[i].nextSibling);
        }
    },
    ConfirmDeleteAction: function () {
        var self = this;
        var btn = document.getElementById("CPH_BODY_btnEliminar");
        if (btn !== null) {
            btn.onclick = function (e) {
                var _self = this;
                e.preventDefault();
                /* ----------------------------------------------------------------
                * Si se requiere hacer una pregunta, y que luego de responder OK
                * continue el submit, se debe implementar el siguiente codigo
                * CODIGO:
                *
                self.UI.Notificacion.Mensaje("Seguro hacer submit?",function () {
                var ok = self.Utils.Validation.Validate();
                if(ok){
                _self.onclick=function(){
                //TO-DO..
                };
                _self.click();
                }
                });
                * ---------------------------------------------------------------- */
                self.Notificacion.Mensaje("Seguro que desea eliminar el registro?", function () {
                    _self.onclick = function () { }
                        ;
                    _self.click();
                });
            }
                ;
        }
    },
    Paginador: {
        Contenedor: "",
        ItemsPorPagina: 10,
        MaximoPaginas: 10,
        EtiquetaACrear: "div",
        AgregarClaseCss: "",
        Mostrar: function () {
            if (_Tracert) {
                _.cl('method: "SD.UI.Paginador.Mostrar()" has loaded successfuly');
            }
            var nombreContenedor = this.Contenedor;
            var itemsPorPagina = this.ItemsPorPagina;
            var maximoPaginasAMostrar = this.MaximoPaginas;
           var addClassPagina = this.AgregarClaseCss;
            /// <summary>Pï¿½ginador dinï¿½mico creado vï¿½a JavaScript.</summary>
            /// <param name="nombreContenedor" type="String">Nombre del contenedor para buscar el elemento por el metodo document.getElementById, donde se alojarï¿½n las nuevas pï¿½ginas generadas por el pï¿½ginador.</param>
            /// <param name="itemsPorPagina" type="Number">Indica la cantidad de elementos por pï¿½gina, por defecto se establece 5.</param>
            /// <param name="maximoPaginasAMostrar" type="Number">Indica la cantidad de pï¿½ginas activas mostradas por el pï¿½ginador, por defecto se establece 10.</param>
            /// <param name="addClassPagina" type="String">Agrega una subclase a cada pï¿½gina generada.</param>
            /// <seealso cref="paginador">Mï¿½todo requerido por NT.Paginador</seealso>
            /// <returns type="Void">Construye pï¿½ginas usando Divs y asinandole el Id='pagina+iteradorPaginas'.</returns>
            try {
                if (nombreContenedor.length > 0) {
                    var contenedor = _.fn(nombreContenedor);
                    contenedor.insertAdjacentHTML('afterEnd', ' <div id="paginador"></div> ');
                    if (contenedor.parentNode.className === "ajax_waiting") {
                        contenedor.parentNode.className = "";
                    }
                    var notas = contenedor.childNodes;
                    var paginador = _.fn("#paginador");
                    if (notas !== null) {
                        var inicioPagina = 0;
                        var finPagina = itemsPorPagina;
                        var totalItems = notas.length;
                        var paginas = Math.ceil(totalItems / itemsPorPagina);
                        var oldDivs = [];
                        oldDivs.push.apply(oldDivs, notas);
                        for (var a = 0; a < paginas; a++) {
                            var div = _.ne({ tag: this.EtiquetaACrear });
                            div.id = "pagina" + a;
                            div.className = "pagina " + (addClassPagina !== undefined ? addClassPagina : '');
                            if (a === 0) {
                                div.style.display = 'block';
                            }
                            else {
                                div.style.display = 'none';
                            }
                            contenedor.appendChild(div);
                        }
                        for (var b = 0; b < paginas; b++) {
                            var pagina = null;
                            var temp = new Array();
                            pagina = _.fn("#pagina" + b);
                            temp = oldDivs.slice(inicioPagina, finPagina);
                            for (var i = 0; i < temp.length; i++) {
                                pagina.appendChild(temp[i]);
                            }
                            finPagina = itemsPorPagina * (b + 2);
                            inicioPagina = finPagina - itemsPorPagina;
                        }
                        for (var c = 0; c < (paginas > maximoPaginasAMostrar ? maximoPaginasAMostrar : paginas) - 1; c++) {
                            var elemento = _.ne({ tag: "a" });
                            elemento.id = "link" + c;
                            elemento.href = "javascript:SD.UI.Paginador.Mover('link" + c + "','pagina" + c + "')";
                            elemento.innerHTML = c + 1;
                            if (c === 0) {
                                elemento.className = "numeroPagina activa";
                            }
                            else {
                                elemento.className = "numeroPagina";
                            }
                            paginador.appendChild(elemento);
                        }
                        contenedor.style.display = 'block';
                    }
                }
            }
            catch (err) {
                _.cl('error en Metodo: "paginadorMostrar(nombreContenedor, itemsPorPagina, maximoPaginasAMostrar)", ' + err.message);
            }
        },
        Mover: function (nombrelink, nombrePagina) {
            if (_Tracert) {
                _.cl('method: "SD.UI.Paginador.Mover(nombrelink, nombrePagina)" has loaded successfuly');
            }
            /// <summary>Muestra una pï¿½gina requerida por el pï¿½ginador.</summary>
            /// <param name="nombrelink" type="String">Nombre del Link para buscar el elemento por el metodo document.getElementById y asignarle la clase "numeroPagina activa".</param>
            /// <param name="nombrePagina" type="String">Obtiene la colecciï¿½n de pï¿½ginas para mostrar la que se este pidiendo mostrar, y se activa pagina[i]style.display='block'.</param>
            /// <seealso cref="paginador">Mï¿½todo requerido por NT.Paginador</seealso>
            /// <returns type="Void">No retorna valor.</returns>
            var paginas = document.querySelectorAll(this.EtiquetaACrear + ".pagina");
            var pagina = document.getElementById(nombrePagina);
            var link = document.getElementById(nombrelink);
            var links = document.querySelectorAll("a.numeroPagina");
            if (links !== null) {
                for (i = 0; i < links.length; i++) {
                    links[i].className = 'numeroPagina';
                }
            }
            if (paginas !== null) {
                for (i = 0; i < paginas.length; i++) {
                    paginas[i].style.display = 'none';
                }
            }
            if (pagina !== null) {
                pagina.style.display = 'block';
            }
            if (link !== null) {
                link.className = "numeroPagina activa";
            }
        }
    },
    Draggable: {
        Iniciar: function (e) {
            if (_Tracert) {
                _.cl('method: "SD.UI.Draggable.Iniciar(e)" has loaded successfuly');
            }
            if (!e) {
                var e = window.event;
            }
            targ = e.target ? e.target : e.srcElement;
            if (targ.className != 'dragme') {
                return;
            }
            if (e.preventDefault)
                e.preventDefault();
            offsetX = e.clientX;
            offsetY = e.clientY;
            if (!targ.style.left) {
                targ.style.left = '0px'
            }
            ;
            if (!targ.style.top) {
                targ.style.top = '0px'
            }
            ;
            coordX = parseInt(targ.style.left);
            coordY = parseInt(targ.style.top);
            drag = true;
            document.onmousemove = this.SD.UI.Draggable.Elemento;
            return false;
        },
        Elemento: function (e) {
            if (_Tracert) {
                _.cl('method: "SD.UI.Draggable.Elemento(e)" has loaded successfuly');
            }
            if (!drag) {
                return
            }
            ;
            if (!e) {
                var e = window.event
            }
            ;
            targ.style.left = coordX + e.clientX - offsetX + 'px';
            targ.style.top = coordY + e.clientY - offsetY + 'px';
            return false;
        },
        Detener: function () {
            if (_Tracert) {
                _.cl('method: "SD.UI.Draggable.Detener()" has loaded successfuly');
            }
            drag = false;
        }
    },
    Notificacion: {
        Overlight: null,
        Box: null,
        OK: null,
        Cancel: null,
        Mensaje: function (mensaje, okCallback, hideCancel) {
            var self = this;
            this._();
            this.Overlight.style.display = "block";
            this.Box.innerHTML = mensaje;
            if (okCallback !== undefined && okCallback !== null) {
                this.Ok.onclick = function () {
                    if (typeof okCallback === 'function') {
                        var containCallback = okCallback.prototype.constructor.toString().indexOf("(callback)") > -1;
                        if (containCallback) {
                            okCallback(function () {
                                self.Cancel.click();
                                return true;
                            });
                        } else {
                            okCallback();
                            self.Cancel.click();
                            return true;
                        }
                    }
                }
            } else {
                this.Ok.onclick = function () {
                    self.Cancel.click();
                }
                    ;
            }
            if (typeof hideCancel !== "undefined") {
                this.Cancel.style.display = "none";
            } else {
                this.Cancel.style.display = "inline";
            }
        },
        Css: function (className) {
            var estyles = document.styleSheets[0];
            if (estyles != null) {
                var classes = document.styleSheets[0].rules || document.styleSheets[0].cssRules;
                if (classes !== null && classes.length > 0) {
                    for (var x = 0; x < classes.length; x++) {
                        if (classes[x].selectorText == className) {
                            return classes[x].cssText;
                        }
                    }
                } else {
                    return null;
                }
            } else {
                return null;
            }
        },
        _: function () {
            var styleOverlight = this.Css("#overlight");
            if (styleOverlight == null) {
                var head = document.getElementsByTagName("head");
                styleOverlight = document.createElement("style");
                styleOverlight.innerHTML = "#overlight{background-color:rgba(0,0,0,.7);position: fixed;width: 100%;height: 100%;left: 0;top:0;z-index:1}#boxNotificacion {position: relative;width: 50%;margin: 0 auto;top: 40%;background-color: rgb(250, 250, 250);z-index: 1;padding: 1em;font-family: Tahoma;font-size: 1.2em;} #boxHeaderNotificacion{position: relative;width: 50%;margin: 0 auto;top: 40%;background-color: rgb(250, 250, 250);z-index: 1;padding: .3em 1em;font-family: Tahoma;font-size: 1.2em;border-radius: .5em .5em 0 0;text-align: center;border-bottom: 2px solid;font-weight: bold;}#boxFooterNotificacion{position: relative;width: 50%;margin: 0 auto;top: 40%;background-color: rgb(250, 250, 250);z-index: 1;padding: .3em 1em;font-family: Tahoma;font-size: 1.2em;border-radius: 0 0 .5em .5em;text-align: center;border-bottom: 2px solid;font-weight: bold;border-top: 2px solid;}#boxFooterNotificacion>button{padding: 0.2em;margin: 2px .5em;width: 60px;}";
                var tagHead = head[0];
                tagHead.appendChild(styleOverlight);
            }
            this.Overlight = document.getElementById("overlight");
            if (this.Overlight == null) {
                var body = document.getElementsByTagName("body");
                this.Overlight = document.createElement("div");
                this.Overlight.id = "overlight";
                this.Overlight.style.display = "none";
                var tagBody = body[0];
                tagBody.parentNode.insertBefore(this.Overlight, tagBody);
            }
            var header = document.getElementById("boxHeaderNotificacion");
            if (header === null) {
                header = document.createElement("p");
                header.id = "boxHeaderNotificacion";
                header.innerHTML = "Administrador";
                this.Overlight.appendChild(header);
            }
            this.Box = document.getElementById("boxNotificacion");
            if (this.Box === null) {
                this.Box = document.createElement("div");
                this.Box.id = "boxNotificacion";
                this.Overlight.appendChild(this.Box)
            }
            var footer = document.getElementById("boxFooterNotificacion");
            if (footer === null) {
                footer = document.createElement("p");
                footer.id = "boxFooterNotificacion";
                this.Overlight.appendChild(footer);
            }
            this.Ok = document.getElementById("boxOkBtnNotificacion");
            if (this.Ok === null) {
                this.Ok = document.createElement("button");
                this.Ok.id = "boxOkBtnNotificacion";
                this.Ok.innerHTML = "Ok";
                footer.appendChild(this.Ok);
            }
            this.Cancel = document.getElementById("boxCancelBtnNotificacion");
            if (this.Cancel === null) {
                var self = this;
                this.Cancel = document.createElement("button");
                this.Cancel.id = "boxCancelBtnNotificacion";
                this.Cancel.innerHTML = "Cancel";
                this.Cancel.onclick = function () {
                    self.Overlight.style.display = "none";
                    self.Box.innerHTML = "";
                    return false;
                }
                    ;
                footer.appendChild(this.Cancel);
            }
        }
    },
    Tablas: {
        Crear: function (arrJSON, elemento) {
            var _table_ = document.createElement('table')
                ,
                _tr_ = document.createElement('tr')
                ,
                _th_ = document.createElement('th')
                ,
                _td_ = document.createElement('td');
            _table_.classList.add("table", "table-condensed", "listado", "sortable");
            _table_.id = "listado";
            var table = _table_.cloneNode(false)
                ,
                columns = addHeaders(arrJSON, table);
            var tbody = document.createElement('tbody');
            for (var i = 0, maxi = arrJSON.length; i < maxi; ++i) {
                var tr = _tr_.cloneNode(false);
                for (var j = 0, maxj = columns.length; j < maxj; ++j) {
                    var td = _td_.cloneNode(false);
                    var cellValue = arrJSON[i][columns[j]];
                    if (j === 0) {
                        td.setAttribute("trigger", cellValue);
                    }
                    var fixValue = cellValue;
                    if (typeof cellValue === "boolean") {
                        fixValue = cellValue ? "Si" : "No";
                    }
                    td.appendChild(document.createTextNode(fixValue || ''));
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            function addHeaders(arrJSON, table) {
                var thead = document.createElement('thead');
                var columnSet = []
                    ,
                    tr = _tr_.cloneNode(false);
                for (var i = 0, l = arrJSON.length; i < l; i++) {
                    for (var key in arrJSON[i]) {
                        if (arrJSON[i].hasOwnProperty(key) && columnSet.indexOf(key) === -1) {
                            columnSet.push(key);
                            var th = _th_.cloneNode(false);
                            th.appendChild(document.createTextNode(key));
                            tr.appendChild(th);
                        }
                    }
                }
                thead.appendChild(tr);
                table.appendChild(thead);
                return columnSet;
            }
            ;
            //return table;
            elemento.innerHTML = "";
            elemento.appendChild(table);
        },
        Busqueda: {
            CrearNodo: function (hijo) {
                var node = document.createElement('span');
                node.setAttribute('class', 'highlighted');
                node.attributes['class'].value = 'highlighted';
                node.appendChild(hijo);
                return node;
            },
            Resaltar: function (term, container) {
                for (var i = 0; i < container.childNodes.length; i++) {
                    var node = container.childNodes[i];
                    if (node.nodeType == 3) {
                        // Text node
                        var data = node.data;
                        var data_low = data.toLowerCase();
                        if (data_low.indexOf(term) >= 0) {
                            //term found!
                            var new_node = document.createElement('span');
                            node.parentNode.replaceChild(new_node, node);
                            var result;
                            while ((result = data_low.indexOf(term)) != -1) {
                                new_node.appendChild(document.createTextNode(
                                    data.substr(0, result)));
                                new_node.appendChild(this.CrearNodo(
                                    document.createTextNode(data.substr(
                                        result, term.length))));
                                data = data.substr(result + term.length);
                                data_low = data_low.substr(result + term.length);
                            }
                            new_node.appendChild(document.createTextNode(data));
                        }
                    } else {
                        // Keep going onto other elements
                        this.Resaltar(term, node);
                    }
                }
            },
            DesResaltar: function (container) {
                for (var i = 0; i < container.childNodes.length; i++) {
                    var node = container.childNodes[i];
                    if (node.attributes && node.attributes['class']
                        && node.attributes['class'].value == 'highlighted') {
                        node.parentNode.parentNode.replaceChild(
                            document.createTextNode(
                                node.parentNode.innerHTML.replace(/<[^>]+>/g, "")),
                            node.parentNode);
                        // Stop here and process next parent
                        return;
                    } else if (node.nodeType != 3) {
                        // Keep going onto other elements
                        this.DesResaltar(node);
                    }
                }
            },
            Buscar: function (term, table) {
                this.DesResaltar(table);
                var terms = term.value.toLowerCase().split(" ");
                var finded = false;
                for (var r = 0; r < table.tBodies[0].rows.length; r++) {
                    var display = '';
                    var rows = table.tBodies[0].rows;
                    for (var i = 0; i < terms.length; i++) {
                        if (rows[r].innerHTML.replace(/<[^>]+>/g, "").toLowerCase()
                            .indexOf(terms[i]) < 0) {
                            display = 'none';
                        } else {
                            if (terms[i].length)
                                this.Resaltar(terms[i], rows[r]);
                            finded = true;
                        }
                        rows[r].style.display = display;
                    }
                }
                /* -----------------------------------------
                * Opcion de notificar al usuario cuando
                * no hay un registro encontrado.
                * Jorge Torres: 11-01-2016
                * ----------------------------------------*/
                var obj = term;
                var lblFeedBack = document.getElementById("lblFeedBack_" + obj.id);
                if (lblFeedBack === null) {
                    lblFeedBack = document.createElement("span");
                    lblFeedBack.id = "lblFeedBack_" + obj.id;
                    lblFeedBack.className = "FeedBackLabel";
                    obj.parentNode.insertBefore(lblFeedBack, obj.nextSibling);
                }
                if (!finded) {
                    lblFeedBack.innerHTML = "no hay registros que mostrar...";
                } else {
                    lblFeedBack.innerHTML = "";
                }
            },
            _: function () {
                var self = this;
                var tables = document.getElementsByTagName('table');
                for (var t = 0; t < tables.length; t++) {
                    var element = tables[t];
                    if (element.attributes['class']
                        && element.attributes['class'].value == 'filterable') {
                        /* Here is dynamically created a form */
                        var form = document.createElement('form');
                        form.setAttribute('class', 'filter');
                        // For ie...
                        form.attributes['class'].value = 'filter';
                        var input = document.createElement('input');
                        input.onkeyup = function () {
                            self.Buscar(input, element);
                        }
                        form.appendChild(input);
                        element.parentNode.insertBefore(form, element);
                    }
                }
            }
        },
        Ordenacion: {
            EuropeanDate: true,
            AlternateRowColors: true,
            SORT_COLUMN_INDEX: 0,
            THead: false,
            Compare: function (a, b) {
                var a = parseFloat(a);
                a = (isNaN(a) ? 0 : a);
                var b = parseFloat(b);
                b = (isNaN(b) ? 0 : b);
                return a - b;
            },
            Alternate: function (table) {
                // Take object table and get all it's tbodies.
                var tableBodies = table.getElementsByTagName("tbody");
                // Loop through these tbodies
                for (var i = 0; i < tableBodies.length; i++) {
                    // Take the tbody, and get all it's rows
                    var tableRows = tableBodies[i].getElementsByTagName("tr");
                    // Loop through these rows
                    // Start at 1 because we want to leave the heading row untouched
                    for (var j = 0; j < tableRows.length; j++) {
                        var item = tableRows[j];
                        // Check if j is even, and apply classes for both possible results
                        if ((j % 2) == 0) {
                            if (!(item.className.indexOf('odd') == -1)) {
                                item.className = item.className.replace('odd', 'even');
                            } else {
                                if (item.className.indexOf('even') == -1) {
                                    item.className += " even";
                                }
                            }
                        } else {
                            if (!(item.className.indexOf('even') == -1)) {
                                item.className = item.className.replace('even', 'odd');
                            } else {
                                if (item.className.indexOf('odd') == -1) {
                                    item.className += " odd";
                                }
                            }
                        }
                    }
                }
            },
            Trim: function (s) {
                //Retorna un String con sin espacios en blanco innesarios
                return s.replace(/^\s+|\s+$/g, "");
            },
            CleanNum: function (str) {
                str = str.replace(new RegExp(/[^-?0-9.]/g), "");
                return str;
            },
            SortDefault: function (a, b) {
                var aa = this.InnerText(a.cells[this.SORT_COLUMN_INDEX]);
                var bb = this.InnerText(b.cells[this.SORT_COLUMN_INDEX]);
                if (aa == bb) {
                    return 0;
                }
                if (aa < bb) {
                    return -1;
                }
                return 1;
            },
            SortDate: function (date) {
                // y2k notes: two digit years less than 50 are treated as 20XX, greater than 50 are treated as 19XX
                var dt = "00000000";
                if (date.length == 11) {
                    var mtstr = date.substr(3, 3);
                    mtstr = mtstr.toLowerCase();
                    switch (mtstr) {
                        case "jan":
                            var mt = "01";
                            break;
                        case "feb":
                            var mt = "02";
                            break;
                        case "mar":
                            var mt = "03";
                            break;
                        case "apr":
                            var mt = "04";
                            break;
                        case "may":
                            var mt = "05";
                            break;
                        case "jun":
                            var mt = "06";
                            break;
                        case "jul":
                            var mt = "07";
                            break;
                        case "aug":
                            var mt = "08";
                            break;
                        case "sep":
                            var mt = "09";
                            break;
                        case "oct":
                            var mt = "10";
                            break;
                        case "nov":
                            var mt = "11";
                            break;
                        case "dec":
                            var mt = "12";
                            break;
                        // default: var mt = "00";
                    }
                    dt = date.substr(7, 4) + mt + date.substr(0, 2);
                    return dt;
                } else if (date.length == 10) {
                    if (this.EuropeanDate == false) {
                        dt = date.substr(6, 4) + date.substr(0, 2) + date.substr(3, 2);
                        return dt;
                    } else {
                        dt = date.substr(6, 4) + date.substr(3, 2) + date.substr(0, 2);
                        return dt;
                    }
                } else if (date.length == 8) {
                    yr = date.substr(6, 2);
                    if (parseInt(yr) < 50) {
                        yr = '20' + yr;
                    } else {
                        yr = '19' + yr;
                    }
                    if (this.EuropeanDate == true) {
                        dt = yr + date.substr(3, 2) + date.substr(0, 2);
                        return dt;
                    } else {
                        dt = yr + date.substr(0, 2) + date.substr(3, 2);
                        return dt;
                    }
                }
                return dt;
            },
            Parent: function (el, pTagName) {
                if (el == null) {
                    return null;
                } else if (el.nodeType == 1 && el.tagName.toLowerCase() == pTagName.toLowerCase()) {
                    return el;
                } else {
                    return this.Parent(el.parentNode, pTagName);
                }
            },
            ResortTable: function (lnk, clid) {
                var self = this;
                var span;
                for (var ci = 0; ci < lnk.childNodes.length; ci++) {
                    if (lnk.childNodes[ci].tagName && lnk.childNodes[ci].tagName.toLowerCase() == 'span') {
                        span = lnk.childNodes[ci];
                    }
                }
                var spantext = this.InnerText(span);
                var td = lnk.parentNode;
                var column = clid || td.cellIndex;
                var t = this.Parent(td, 'TABLE');
                // Work out a type for the column
                if (t.rows.length <= 1)
                    return;
                var itm = "";
                var i = 0;
                while (itm == "" && i < t.tBodies[0].rows.length) {
                    var itm = this.InnerText(t.tBodies[0].rows[i].cells[column]);
                    itm = this.Trim(itm);
                    if (itm.substr(0, 4) == "<!--" || itm.length == 0) {
                        itm = "";
                    }
                    i++;
                }
                if (itm == "")
                    return;
                var oCASEINSENTITIVE = 0
                    , oDATE = 1
                    , oNUMERIC = 2;
                var sortfn = oCASEINSENTITIVE;
                if (itm.match(/^\d\d[\/\.-][a-zA-z][a-zA-Z][a-zA-Z][\/\.-]\d\d\d\d$/)) {
                    sortfn = oDATE;
                }
                if (itm.match(/^\d\d[\/\.-]\d\d[\/\.-]\d\d\d{2}?$/)) {
                    sortfn = oDATE;
                }
                if (itm.match(/^-?[Â£$â‚¬Ã›Â¢Â´]\d/)) {
                    sortfn = oNUMERIC;
                }
                if (itm.match(/^-?(\d+[,\.]?)+(E[-+][\d]+)?%?$/)) {
                    sortfn = oNUMERIC;
                }
                this.SORT_COLUMN_INDEX = column;
                var firstRow = new Array();
                var newRows = new Array();
                for (var k = 0; k < t.tBodies.length; k++) {
                    for (i = 0; i < t.tBodies[k].rows[0].length; i++) {
                        firstRow[i] = t.tBodies[k].rows[0][i];
                    }
                }
                for (var k = 0; k < t.tBodies.length; k++) {
                    if (!this.THead) {
                        // Skip the first row
                        for (var j = 1; j < t.tBodies[k].rows.length; j++) {
                            newRows[j - 1] = t.tBodies[k].rows[j];
                        }
                    } else {
                        // Do NOT skip the first row
                        for (var j = 0; j < t.tBodies[k].rows.length; j++) {
                            newRows[j] = t.tBodies[k].rows[j];
                        }
                    }
                }
                switch (sortfn) {
                    case oNUMERIC:
                        {
                            newRows.sort(function (a, b) {
                                var aa = self.InnerText(a.cells[self.SORT_COLUMN_INDEX]);
                                aa = self.CleanNum(aa);
                                var bb = self.InnerText(b.cells[self.SORT_COLUMN_INDEX]);
                                bb = self.CleanNum(bb);
                                return self.Compare(aa, bb);
                            });
                            break;
                        }
                    case oDATE:
                        {
                            newRows.sort(function (a, b) {
                                var dt1 = self.SortDate(self.InnerText(a.cells[self.SORT_COLUMN_INDEX]));
                                var dt2 = self.SortDate(self.InnerText(b.cells[self.SORT_COLUMN_INDEX]));
                                if (dt1 == dt2) {
                                    return 0;
                                }
                                if (dt1 < dt2) {
                                    return -1;
                                }
                                return 1;
                            });
                            break;
                        }
                    default:
                        {
                            newRows.sort(function (a, b) {
                                var aa = self.InnerText(a.cells[self.SORT_COLUMN_INDEX]).toLowerCase();
                                var bb = self.InnerText(b.cells[self.SORT_COLUMN_INDEX]).toLowerCase();
                                if (aa == bb) {
                                    return 0;
                                }
                                if (aa < bb) {
                                    return -1;
                                }
                                return 1;
                            });
                        }
                }
                if (span.getAttribute("sortdir") == 'down') {
                    this.ARROW = '&nbsp;&nbsp;<b class="fa fa-caret-down"></b>';
                    //ARROW = '&nbsp;&nbsp;<img src="' + image_path + image_down + '" alt="&darr;"/>';
                    newRows.reverse();
                    span.setAttribute('sortdir', 'up');
                } else {
                    this.ARROW = '&nbsp;&nbsp;<b class="fa fa-caret-up"></b>';
                    //ARROW = '&nbsp;&nbsp;<img src="' + image_path + image_up + '" alt="&uarr;"/>';
                    span.setAttribute('sortdir', 'down');
                }
                // We appendChild rows that already exist to the tbody, so it moves them rather than creating new ones
                // don't do sortbottom rows
                for (var i = 0; i < newRows.length; i++) {
                    if (!newRows[i].className || (newRows[i].className && (newRows[i].className.indexOf('sortbottom') == -1))) {
                        t.tBodies[0].appendChild(newRows[i]);
                    }
                }
                // do sortbottom rows only
                for (var i = 0; i < newRows.length; i++) {
                    if (newRows[i].className && (newRows[i].className.indexOf('sortbottom') != -1))
                        t.tBodies[0].appendChild(newRows[i]);
                }
                // Delete any other arrows there may be showing
                var allspans = document.getElementsByTagName("span");
                for (var ci = 0; ci < allspans.length; ci++) {
                    if (allspans[ci].className == 'sortarrow') {
                        if (this.Parent(allspans[ci], "table") == this.Parent(lnk, "table")) {
                            // in the same table as us?
                            allspans[ci].innerHTML = '&nbsp;&nbsp;';
                            //allspans[ci].innerHTML = '&nbsp;&nbsp;<img src="' + image_path + image_none + '" alt="&darr;"/>';
                        }
                    }
                }
                span.innerHTML = this.ARROW;
                this.Alternate(t);
            },
            InnerText: function (el) {
                if (typeof el == "string") {
                    return el;
                }
                if (typeof el == "undefined") {
                    return el
                }
                ;
                if (el.innerText) {
                    return el.innerText;
                }
                var str = "";
                var cs = el.childNodes;
                var l = cs.length;
                for (var i = 0; i < l; i++) {
                    switch (cs[i].nodeType) {
                        case 1:
                            //ELEMENT_NODE
                            str += this.InnerText(cs[i]);
                            break;
                        case 3:
                            //TEXT_NODE
                            str += cs[i].nodeValue;
                            break;
                    }
                }
                return str;
            },
            MakeSortable: function (t) {
                if (t.rows && t.rows.length > 0) {
                    if (t.tHead && t.tHead.rows.length > 0) {
                        var firstRow = t.tHead.rows[t.tHead.rows.length - 1];
                        this.THead = true;
                    } else {
                        var firstRow = t.rows[0];
                    }
                }
                if (!firstRow) {
                    return;
                }
                // We have a first row: assume it's the header, and make its contents clickable links
                for (var i = 0; i < firstRow.cells.length; i++) {
                    var cell = firstRow.cells[i];
                    var txt = this.InnerText(cell);
                    if (cell.className != "unsortable" && cell.className.indexOf("unsortable") == -1) {
                        //cell.innerHTML = '<a href="#" class="sortheader" onclick="SD.UI.Tablas.Ordenacion.ResortTable(this, ' + i + ');return false;">' + txt + '<span class="sortarrow">&nbsp;&nbsp;</span></a>';
                        cell.innerHTML = '<a href="#" class="sortheader" sort="' + i + '">' + txt + '<span class="sortarrow">&nbsp;&nbsp;</span></a>';
                        //cell.innerHTML = '<a href="#" class="sortheader" onclick="ts_resortTable(this, ' + i + ');return false;">' + txt + '<span class="sortarrow">&nbsp;&nbsp;<img src="' + image_path + image_none + '" alt="&darr;"/></span></a>';
                    }
                }
                if (this.AlternateRowColors) {
                    this.Alternate(t);
                }
            },
            _: function () {
                var self = this;
                if (!document.getElementsByTagName) {
                    return;
                }
                var tbls = document.getElementsByTagName("table");
                for (var ti = 0; ti < tbls.length; ti++) {
                    var thisTbl = tbls[ti];
                    if (((' ' + thisTbl.className + ' ').indexOf("sortable") != -1)) {
                        this.MakeSortable(thisTbl);
                    }
                }
                var trSort = document.getElementsByClassName("sortheader");
                if (trSort !== null) {
                    for (var i = 0; i < trSort.length; i++) {
                        trSort[i].onclick = function () {
                            self.ResortTable(this, this.getAttribute("sort"));
                            return false;
                        }
                    }
                }
            }
        }
    },
    Labels: function (idContainer) {
        var content = null;
        if (idContainer == null)
            content = document;
        else
            content = document.getElementById(idContainer);
        var inputs = content.querySelectorAll("input[type=text]");
        var files = content.querySelectorAll("input[type=file]");
        var textAreas = content.getElementsByTagName("textarea");
        var selects = content.getElementsByTagName("select");
        var objects = [];
        objects.push.apply(objects, inputs);
        objects.push.apply(objects, files);
        objects.push.apply(objects, textAreas);
        objects.push.apply(objects, selects);
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            if (obj.style.display === "") {
                var strNameLbl = "lbl" + obj.id.replace("CPH_BODY_", "");
                var lblFeedBack = null;
                var lblFeedBack = document.getElementById(strNameLbl);
                if (lblFeedBack === null) {
                    lblFeedBack = document.createElement("span");
                    lblFeedBack.id = strNameLbl;
                    lblFeedBack.className = "jLabel";
                    lblFeedBack.innerHTML = obj.getAttribute("data-Label")
                    var parent = obj.parentNode;
                    var content = document.createElement("div");
                    content.id = "div" + obj.id.replace("CPH_BODY_", "").substring(3);
                    content.classList.add("sdControlContainer");
                    parent.removeChild(obj);
                    content.appendChild(lblFeedBack);
                    content.appendChild(obj);
                    parent.appendChild(content);
                }
            }
        }
    },
    Helps: (inputs) => {
        if (inputs.Type == "Array")
            for (var i = 0; i < inputs.length; i++) {
                var target = inputs[i];
                var input = _.fn("#" + target.Id);
                if (input != undefined) {
                    var help = input.Help;
                    var iconInput = _.ne({ tag: "sdIcon", id: "hi" + target.Id });
                    var div = _.ne({
                        tag: "div",
                        id: "help" + target.Id,
                        cssClass: "jHelp",
                        innerHTML: target.Help,
                        withEvents: true
                    });
                    div.style.bottom = (input.offsetHeight + 20) + "px";

                    div.Hide();
                    iconInput.style.top = input.offsetTop + "px";
                    iconInput.style.left = ((input.offsetWidth + input.offsetLeft) - 25) + "px";
                    iconInput.setAttribute("target", target.Id);
                    input.parentNode.insertBefore(div, input);
                    div.parentNode.insertBefore(iconInput, div.nextSibling);

                    iconInput.onmouseover = (o) => {
                        var helpDiv = _.fn("#help" + o.target.getAttribute("target"));
                        helpDiv.style.left = (o.target.offsetLeft - 30) + "px";
                        helpDiv.Show();
                    };
                    iconInput.onmouseout = (o) => {
                        var helpDiv = _.fn("#help" + o.target.getAttribute("target"));
                        helpDiv.style.left = (o.target.offsetLeft - 30) + "px";
                        helpDiv.Hide();
                    };
                }
            }
    },
    Modal: {
        PlaceHolder: '',
        Data: [],
        Finder: function (callback) {
            var self = this;
            var body = document.body;
            if (body != null) {
                var jSearch = document.querySelector("#jSearch");
                if (jSearch != null)
                    jSearch.parentElement.removeChild(jSearch);
                if (jSearch == null) {
                    jSearch = document.createElement("div");
                    jSearch.id = "jSearch";
                    var txtFind = document.createElement("input");
                    txtFind.type = "text";
                    txtFind.id = "txtFind";
                    var spanClose = document.createElement("span");
                    spanClose.id = "btnClose";
                    spanClose.innerHTML = "Close";
                    spanClose.onclick = function () {
                        jSearch.parentElement.removeChild(jSearch);
                    };
                    jSearch.appendChild(spanClose);
                    jSearch.appendChild(txtFind);
                    var result = document.createElement("div");
                    result.id = "dataContainer";
                    jSearch.appendChild(result);
                    txtFind.oninput = function () {
                        if (this.value.length > 2) {
                            result.innerHTML = "";
                            result.appendChild(
                                self.Data.jContains(this.value).ToListAsTableHTML(
                                    function (o) {
                                        async(function () {
                                            callback(o);
                                        }, o);
                                    }));
                        } else {
                            result.innerHTML = self.PlaceHolder;
                        }
                    };
                    result.innerHTML = "";
                    result.appendChild(self.Data.ToListAsTableHTML(
                        function (o) {
                            async(function () {
                                callback(o);
                            }, o);
                        }));

                }
                body.appendChild(jSearch);

                function async(callbackAsync, o) {

                    callbackAsync(o);
                    jSearch.parentElement.removeChild(jSearch);
                }

            }
        }

    },
    _: function () {
        this.parent = _Window;
        this.Tablas.parent = this;
        this.Tablas.Busqueda.parent = this.Tablas;
        this.Tablas.Ordenacion.parent = this.Tablas;
        delete this._;
        return this;
    }
}._();
SD.prototype.Runtime = function (starTime) {
    if (_Tracert) {
        _.cl('method: "SD.Runtime(starTime)" has loaded successfuly');
    }
    return (((new Date() - starTime) / 1000).toFixed(2) + " segundos...");
};


try {
    /* -------------------------------------------------------------------
    * Extending JavaScript prototypes to increase the performance
    * ------------------------------------------------------------------- */
    HTMLCollection.prototype.ToArray = function () {
        if (_Tracert) {
            _.cl('method: "HTMLCollection.ToArray()", has loaded successfuly');
        }
        if (_Info) {
            _.cl('info: "HTMLCollection.ToArray()", retorna un Array, a partir de un HTMLCollection');
        }
        var arr = [];
        for (var i = this.length - 1; i >= 0; i--) {
            arr.push(this[i]);
        }
        ;
        return arr;
    };
    NodeList.prototype.ToArray = function () {
        if (_Tracert) {
            _.cl('method: "NodeList.ToArray()", has loaded successfuly');
        }
        if (_Info) {
            _.cl('info: "NodeList.ToArray()", retorna un Array, a partir de un NodeList');
        }
        var arr = [];
        for (var i = this.length - 1; i >= 0; i--) {
            arr.push(this[i]);
        }
        ;
        return arr;
    };
    String.prototype.Formato = function (controlAValidar) {
        var texto = this.toString();
        function _LimpiarYNotificar(mensaje) {
            controlAValidar.value = "";
            controlAValidar.focus();
            var lblFeedBack = controlAValidar.nextSibling;
            if (lblFeedBack !== null) {
                lblFeedBack.innerHTML = mensaje;
                lblFeedBack.style.color = "red";
            }
        }
        var _ = {
            Cedula: function () {
                var cedula = texto.replace(/\W/g, '').toUpperCase();
                var chkPatronCorrecto = cedula.match("[VEJPG]-[0-9]{2}.[0-9]{3}.[0-9]{3}");
                if (chkPatronCorrecto === null) {
                    var match = cedula.match(/[0-9]+/);
                    if (match !== null) {
                        var numero = match[0];
                        var isLetra = isNaN(cedula.substring(0, 1));
                        var letra = "V";
                        if (isLetra) {
                            letra = cedula.substring(0, 1);
                        }
                        if (numero.length < 8) {
                            numero = "0" + numero;
                        }
                        var tmp = letra + numero;
                        var toFix = tmp.match("([0-9]{2})([0-9]{3})([0-9]{3})");
                        if (toFix !== null) {
                            var newCedula = letra + "-" + toFix[1] + "." + toFix[2] + "." + toFix[3];
                            var chk = newCedula.match("[VEJPG]-[0-9]{2}.[0-9]{3}.[0-9]{3}");
                            if (chk !== null) {
                                return chk[0];
                            } else {
                                _LimpiarYNotificar("El formato de cédula no coincide... Ej. V-12.345.678");
                                return "";
                            }
                        } else {
                            _LimpiarYNotificar("El formato de cédula no coincide... Ej. V-12.345.678");
                            return "";
                        }
                    }
                    else {
                        _LimpiarYNotificar("El formato de cédula no coincide... Ej. V-12.345.678");
                        return "";
                    }
                } else {
                    return chkPatronCorrecto[0];
                }
            },
            Fecha: function () {
                var fecha = texto;
                var chkPatronCorrecto = fecha.match("[0-9]{2}/[0-9]{2}/[0-9]{4}");
                if (chkPatronCorrecto === null) {
                    var match = fecha.match(/[0-9]+/);
                    if (match !== null) {
                        var chk = match[0].match("([0-9]{2})([0-9]{2})([0-9]{4})");
                        if (chk !== null) {
                            var toFix = chk;
                            return toFix[1] + "/" + toFix[2] + "/" + toFix[3];
                        } else {
                            _LimpiarYNotificar("El formato de fecha no coincide... Ej. 01/01/2016");
                            return "";
                        }
                    } else {
                        _LimpiarYNotificar("El formato de fecha no coincide... Ej. 01/01/2016");
                        return "";
                    }
                } else {
                    return chkPatronCorrecto[0];
                }
            },
            Telefono: function () {
                var telefono = texto;
                var chkPatronCorrecto = telefono.match("[0-9]{4}-[0-9]{3}-[0-9]{4}");
                if (chkPatronCorrecto === null) {
                    var match = telefono.match(/[0-9]+/);
                    if (match !== null) {
                        var chk = match[0].match("([0-9]{4})([0-9]{3})([0-9]{4})");
                        if (chk !== null) {
                            var toFix = chk;
                            return toFix[1] + "-" + toFix[2] + "-" + toFix[3];
                        } else {
                            _LimpiarYNotificar("El formato de telefono no coincide... Ej. 0424-123-4567");
                            return "";
                        }
                    } else {
                        _LimpiarYNotificar("El formato de telefono no coincide... Ej. 0424-123-4567");
                        return "";
                    }
                } else {
                    return chkPatronCorrecto[0];
                }
            }
        }
        return _;
    };
    String.prototype.ToTitleCase = function () {
        var i, j, str, lowers, uppers;
        str = this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
        // Certain minor words should be left lowercase unless
        // they are the first or last words in the string
        lowers = ['El', 'En', 'Lo', 'Con', 'Un', 'La', 'Los', 'De', 'Desde', 'Hasta', 'Del', 'Las'];
        for (i = 0,
            j = lowers.length; i < j; i++) {
            str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
                function (txt) {
                    return txt.toLowerCase();
                });
        }
        // Certain words such as initialisms or acronyms should be left uppercase
        uppers = ['Id', 'Tv'];
        for (i = 0,
            j = uppers.length; i < j; i++) {
            str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
                uppers[i].toUpperCase());
        }
        return str;
    };
    String.prototype.ToFloat = function () {
        return parseFloat(this);
    };
    String.prototype.RemoveAccents = function () {
        var r = this.toLowerCase();
        r = r.replace(new RegExp("\\s", 'g'), "");
        r = r.replace(new RegExp("[àáâãäå]", 'g'), "a");
        r = r.replace(new RegExp("æ", 'g'), "ae");
        r = r.replace(new RegExp("ç", 'g'), "c");
        r = r.replace(new RegExp("[èéêë]", 'g'), "e");
        r = r.replace(new RegExp("[ìíîï]", 'g'), "i");
        r = r.replace(new RegExp("ñ", 'g'), "n");
        r = r.replace(new RegExp("[òóôõö]", 'g'), "o");
        r = r.replace(new RegExp("œ", 'g'), "oe");
        r = r.replace(new RegExp("[ùúûü]", 'g'), "u");
        r = r.replace(new RegExp("[ýÿ]", 'g'), "y");
        //r = r.replace(new RegExp("\\W", 'g'), "");
        return r;
    };
    Number.prototype.ToFloat = function () {
        return parseFloat(this);
    };
    Array.prototype.Radios = function () {
        var arr = this;
        var _ = {
            SelectedItem: function (arr) {
                if (_Tracert) {
                    _.cl('method: "Array.Radios().SelectedItem()", has loaded successfuly');
                }
                if (_Info) {
                    _.cl('info: "Array.Radios().SelectedItem()", retorna el elemento tipo Radios seleccionado');
                }
                var obj = null;
                for (var i = arr.length - 1; i >= 0; i--) {
                    if (arr[i].checked) {
                        obj = arr[i];
                        break;
                    }
                }
                return obj;
            },
            DistinctName: function (sName) {
                if (_Tracert) {
                    _.cl('method: "Array.Radios().DistinctName(sName)", has loaded successfuly');
                }
                if (_Info) {
                    _.cl('info: "Array.Radios().DistinctName(sName)", retorna un arreglo de elementos Radios filtrados por su propiedad Name comparado por el parametro sName');
                }
                var a = [];
                for (var i = 0, l = arr.length; i < l; ++i) {
                    if (arr[i].name === sName) {
                        a.push(arr[i]);
                    }
                }
                return a;
            },
            Distinct: function () {
                if (_Tracert) {
                    _.cl('method: "Array.Radios().Distinct()", has loaded successfuly');
                }
                if (_Info) {
                    _.cl('info: "Array.Radios().Distinct()", retorna un arreglo de string con los nombre unicos del arreglo');
                }
                var u = {}
                    , a = [];
                for (var i = 0, l = arr.length; i < l; ++i) {
                    if (u.hasOwnProperty(arr[i].name)) {
                        continue;
                    }
                    a.push(arr[i].name);
                    u[arr[i].name] = 1;
                }
                return a;
            },
            FirstAtEachName: function () {
                if (_Tracert) {
                    _.cl('method: "Array.Radios().FirstAtEachName()", has loaded successfuly');
                }
                if (_Info) {
                    _.cl('info: "Array.Radios().FirstAtEachName()", retorna un arreglo de elementos Radios tomando el primer elemento de cada sub arreglo');
                }
                var u = {}
                    , a = [];
                for (var i = 0, l = arr.length; i < l; ++i) {
                    if (u.hasOwnProperty(arr[i].name)) {
                        continue;
                    }
                    a.push(arr[i]);
                    u[arr[i].name] = 1;
                }
                return a;
            }
        };
        return _;
    };
    Array.prototype.jData = function () {
        var data = this;
        return {
            HTMLForm: () => {
                return data.filter(x => x.State == "Added" || x.State == "Modified" || x.State == "Deleted");
            },
            Split: (size) => {
                var results = [];
                while (data.length) {
                    results.push(data.splice(0, size));
                }
                return results;
            },
            Shuffle: () => {
                var array = data;
                var currentIndex = array.length, temporaryValue, randomIndex;
                // While there remain elements to shuffle...
                while (0 !== currentIndex) {

                    // Pick a remaining element...
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;

                    // And swap it with the current element.
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }
                return array;
            },
            Search: function (expression) {
                var terminos = expression.match(/([A-Z]{1}\w+)([>=|<=|>|<|==]{1,2})(.+)/);
                if (!terminos) {
                    throw "La Condicion de busqueda no coincide con el patron requerido, por favor verifique que la expresion este correcta, y vuelva a intentarlo.";
                }
                var a = [];
                for (var i = 0, l = data.length; i < l; ++i) {
                    var column = data[i][terminos[1]];
                    var value = terminos[3];
                    if (column === value) {
                        a.push(data[i]);
                    }
                }
                return a;
            },
            StarWith: function (expression) {
                var terminos = expression.match(/([A-Z]{1}\w+)([>=|<=|>|<|==]{1,2})(.+)/);
                if (!terminos) {
                    throw "La Condicion de busqueda no coincide con el patron requerido, por favor verifique que la expresion este correcta, y vuelva a intentarlo.";
                }
                var a = [];
                for (var i = 0, l = data.length; i < l; ++i) {
                    var column = data[i][terminos[1]];
                    var value = terminos[3];
                    if (column.substring(0, value.length) === value) {
                        a.push(data[i]);
                    }
                }
                return a;
            },
            Query: function (expression) {
                var terminos = expression.match(/([A-Z]{1}\w+)([>=|<=|>|<|==]{1,2})(.+)/);
                if (!terminos) {
                    throw "La Condicion de busqueda no coincide con el patron requerido, por favor verifique que la expresion este correcta, y vuelva a intentarlo.";
                }
                var index = data.jData().Find(terminos[1], terminos[3], terminos[2]);
                return data.jData().Item(index);
            },
            Item: function (index) {
                return data(index);
            },
            Sum: function (prop) {
                var total = 0
                for (var i = 0, _len = data.length; i < _len; i++) {
                    total += parseFloat(data[i][prop])
                }
                return total;
            },
            Contains: function (txt) {
                var first = data.jData().First();
                var columns = Object.keys(first);
                var i = data.length;
                var a = [];
                while (i--) {
                    var item = data[i];
                    var hasValue = false;
                    for (var o = 0; o < columns.length; o++) {
                        hasValue = item[columns[o]].toString().toLowerCase().indexOf(txt.toLowerCase()) > -1;
                        if (hasValue)
                            break;
                    }
                    if (hasValue) {
                        a.push(data[i]);
                    }
                }
                return a;
            },
            ForEach: function (callback) {
                for (var i = 0; i < data.length; i++) {
                    callback(data[i]);
                };
            },
            Find: function (columnName, value, condition) {
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    if (!item.hasOwnProperty(columnName)) {
                        return false;
                    }
                    if (item[columnName] == value) {
                        return i;
                    }

                }
            },
            Distinct: function (column, value) {
                if (typeof value === "undefined") {
                    var u = {}
                        , a = [];
                    for (var i = 0, l = data.length; i < l; ++i) {
                        if (u.hasOwnProperty(data[i][column])) {
                            continue;
                        }
                        a.push(data[i][column]);
                        u[data[i][column]] = 1;
                    }
                    return a;
                } else {
                    var a = [];
                    for (var i = 0, l = data.length; i < l; ++i) {
                        if (data[i][column] === value) {
                            a.push(data[i]);
                        }
                    }
                    return a;
                }
            },
            Delete: function (index) {
                data.splice(index, 1);
            },
            Last: function () {
                return data[data.length - 1];
            },
            First: function () {
                return data[0];
            },
            Exist: function (txt) {
                data.jForEach(function (o) {
                    if (o.indexOf(txt) > -1)
                        return true;
                });
            },
            Add: function (item) {
                data.push(item);
            }
        };
    }
    /**
    * Return an Array Objects of in a list
    * @param str1  expression: query to find that can match First characters, ex: "Field==value" (possibles values to find are ">=,<=,>,<,==" )
    */
    Array.prototype.jSearch = function (expression) {
        var data = this;
        var terminos = expression.match(/([A-Z]{1}\w+)([>=|<=|>|<|==]{1,2})(.+)/);
        if (!terminos) {
            throw "La Condicion de busqueda no coincide con el patron requerido, por favor verifique que la expresion este correcta, y vuelva a intentarlo.";
        }
        var a = [];
        for (var i = 0, l = data.length; i < l; ++i) {
            var column = data[i][terminos[1]];
            var value = terminos[3];
            if (column === value) {
                a.push(data[i]);
            }
        }
        return a;
    };
    /**
    * Return an Array Objects of in a list
    * @param str1  expression: query to find that can match First characters, ex: "Field==value" (possibles values to find are ">=,<=,>,<,==" )
    * @param num1  atLess: number minum of chracters to match, wheter no passed then value will be zero
    */
    Array.prototype.jStarWith = function (expression, atLess) {
        var data = this;
        if (typeof (atLess) === "undefined")
            atLess = 0;
        var terminos = expression.match(/([A-Z]{1}\w+)([>=|<=|>|<|==]{1,2})(.+)/);
        if (!terminos) {
            throw "La Condicion de busqueda no coincide con el patron requerido, por favor verifique que la expresion este correcta, y vuelva a intentarlo.";
        }
        var a = [];
        for (var i = 0, l = data.length; i < l; ++i) {
            var column = data[i][terminos[1]];
            var value = terminos[3];
            if (value.length > atLess)
                if (column.substring(0, value.length) === value) {
                    a.push(data[i]);
                }
        }
        return a;
    };
    /**
    * Return an Object of record in a list
    * @param str1  expression: query to find, ex: "Field==value" (possibles values to find are ">=,<=,>,<,==" )
    */
    Array.prototype.jQuery = function (expression) {
        var data = this;
        var terminos = expression.match(/([A-Z]{1}\w+)([>=|<=|>|<|==]{1,2})(.+)/);
        if (!terminos) {
            throw "La Condicion de busqueda no coincide con el patron requerido, por favor verifique que la expresion este correcta, y vuelva a intentarlo.";
        }
        var index = data.jFind(terminos[1], terminos[3], terminos[2]);
        if (index > -1)
            return data.jItem(index);
        else
            return "registro no encontrado";
    };
    Array.prototype.jItem = function (index) {
        return this[index];
    };
    /**
    * Allow aggregate sum result of a list
    * @param string  prop:name of column to summ
    */
    Array.prototype.jSum = function (prop) {
        var data = this;
        var total = 0
        for (var i = 0, _len = data.length; i < _len; i++) {
            total += parseFloat(data[i][prop])
        }
        return total;
    };
    Array.prototype.jContains = function (txt) {
        var data = this;
        var first = data.jFirst();
        var columns = Object.getOwnPropertyNames(first);
        var i = data.length;
        var a = [];
        while (i--) {
            var item = data[i];
            var hasValue = false;
            for (var o = 0; o < columns.length; o++) {
                hasValue = item[columns[o]].toString().toLowerCase().indexOf(txt.toLowerCase()) > -1;
                if (hasValue)
                    break;
            }
            if (hasValue) {
                a.push(data[i]);
            }
        }
        return a;
    };
    /**
    * Iterate a list record by record
    * @param string  callback: function to execute by record
    */
    Array.prototype.jForEach = function (callback) {
        for (var i = 0; i < this.length; i++) {
            callback(this[i]);
        };
    };
    /**
    * Return index of record in a list
    * @param str1  columnName: name of column to find
    * @param str2  value: value to find
    * @param str3  condition: to find, possibles values are >=,<=,>,<,==
    */
    Array.prototype.jFind = function (columnName, value, condition) {
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            if (!item.hasOwnProperty(columnName)) {
                return false;
            }
            if (item[columnName] == value) {
                return i;
            }

        }
    };
    Array.prototype.jDistinct = function (column, value) {
        var data = this;
        if (typeof value === "undefined") {
            var u = {}
                , a = [];
            for (var i = 0, l = data.length; i < l; ++i) {
                if (u.hasOwnProperty(data[i][column])) {
                    continue;
                }
                a.push(data[i][column]);
                u[data[i][column]] = 1;
            }
            return a;
        } else {
            var a = [];
            for (var i = 0, l = data.length; i < l; ++i) {
                if (data[i][column] === value) {
                    a.push(data[i]);
                }
            }
            return a;
        }
    };
    Array.prototype.jDelete = function (index) {
        this.splice(index, 1);
    };
    Array.prototype.jLast = function () {
        return this[this.length - 1];
    };
    Array.prototype.jFirst = function () {
        return this[0];
    };
    Array.prototype.jAdd = function (item) {
        this.push(item);
    }
    Array.prototype.ToAutocompleteList = function (selector, text, value) {
        if (typeof (value) == "undefined")
            value = text;
        var cuentasList = _.fn("#" + selector);
        cuentasList.innerHTML = "";
        this.jData().ForEach(function (object) {
            var option = document.createElement("option");
            option.value = object[value];
            option.innerHTML = object[text];
            cuentasList.appendChild(option);
        })
    }




    Array.prototype.ToListAsTableHTML = function (callback) {
        var items = this;
        var first = items.jFirst();
        if (first != null) {
            var tabla = document.createElement("table");
            tabla.classList.add("jTable");
            var columns = Object.getOwnPropertyNames(first);
            var row = tabla.insertRow();
            var idIndex = 0;
            //header
            for (var i = 0; i < columns.length; i++) {
                row.appendChild(document.createElement("th"));
                var cell = row.cells[i];
                cell.innerHTML = columns[i];
            }
            //body
            this.jForEach(function (item) {
                var row = tabla.insertRow();
                for (var i = 0; i < columns.length; i++) {
                    var cell = row.insertCell();
                    var column = columns[i];
                    var span = document.createElement("span");
                    span.onclick = callback != undefined ? function () { callback(this) } : null;
                    span.innerHTML = item[column];
                    cell.appendChild(span);
                }
            });
            return tabla;
        }
        var span = document.createElement("span");
        span.innerHTML = "No existen registros...";
        return span;
    }
    Number.prototype.jFormat = function (m, n, x, s, c) {
        var self = this;
        var e = "[deprecated] jFormat is Obsolete it will be revoved in future versions, use Number.SD().Format(iso, decimales, separatorMiles, separatorCommas)";
        if (!this.SD().Format) { throw (e); }
        return (Number.jFormat = function () {
            _.cl(e);
            return self.SD().Format(m, n, s, c);
        })();
    }
    Date.prototype.yyyymmdd = function () {
        var yyyy = this.getFullYear();
        var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
        var dd = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
        return "".concat(yyyy).concat(mm).concat(dd);
    };

    Date.prototype.yyyymmddhhmm = function () {
        var yyyy = this.getFullYear();
        var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
        var dd = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
        var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
        var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
        return "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min);
    };

    Date.prototype.yyyymmddhhmmss = function () {
        var yyyy = this.getFullYear();
        var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
        var dd = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
        var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
        var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
        var ss = this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds();
        return "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min).concat(ss);
    };

    //Number.prototype.jFormat = function (m, n, x, s, c) {
    //    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
    //        num = this.toFixed(Math.max(0, ~~n));

    //    return (m.length > 0 ? m : '') + ' ' + (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    //}
    Number.prototype.SD = function () {
        var n = this;
        return {
            PadLeft: function (size, padCharacter) {
                return Array(size - String(n).length + 1).join(padCharacter || '0') + n;
            },
            Currency: function (iso, decimal) {
                return n.toLocaleString(iso, { minimumFractionDigits: decimal })
            },
            Format: function (iso, decimales, separatorMiles, separatorCommas) {
                var re = '\\d(?=(\\d{3})+' + (decimales > 0 ? '\\D' : '$') + ')',
                    num = n.toFixed(Math.max(0, ~~decimales));
                return (iso.length > 0 ? iso : '') + ' ' + (separatorCommas ? num.replace('.', separatorCommas) : num).replace(new RegExp(re, 'g'), '$&' + (separatorMiles || ','));
            }
        }
    };
    HTMLTableRowElement.prototype.Fila = function (callback) {
        callback(this);
    }
    /*----------------------------
 * Public Properties
 *----------------------------*/

    Object.defineProperty(Object.prototype, 'Enum', {
        value: function () {
            for (i in arguments) {
                Object.defineProperty(this, arguments[i], {
                    value: parseInt(i, 2),
                    writable: false,
                    enumerable: true,
                    configurable: true
                });
            }
            return this;
        },
        writable: false,
        enumerable: false,
        configurable: false
    });
    Object.defineProperty(SD.prototype, "Resultado", {
        get: function Resultado() {
            return _Result;
        }
    });
    Object.defineProperty(SD.prototype, "StartTime", {
        get: function Resultado() {
            return _StartTime;
        }
    });
    Object.defineProperty(SD.prototype, "Tracert", {
        get: function Tracert() {
            return _Tracert;
        },
        set: function Tracert(value) {
            _Tracert = value;
        }
    });
    Object.defineProperty(SD.prototype, "AutoGuardadoFields", {
        get: function AutoGuardadoFields() {
            if (_Info) {
                _.cl('info: "AutoGuardadoFields", crea una instancia de cada objet de tipo Text, Select, TextArea, y almacena su valor');
            }
            var fields = _.fn("input[autoguardado],textarea[autoguardado],select[autoguardado]", true);
            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                this[field.id] = field.value;
            }
            return this;
        }
    });
    Object.defineProperty(Object.prototype, "Type", {
        get: function () {
            return this.constructor.name;
        }
    });

    /*--------------------------------------------
        * Extendiendo window para metodos abreviados
        *--------------------------------------------*/

    if (typeof _Window.console === "undefined") {
        if (_Tracert) {
            _.cl('method: "_Window._.cl(msj)", has loaded successfuly');
        }
        if (_Info) {
            _.cl('info: "_Window._.cl(msj)", permite activar la consola para IE7, pero mostrarÃ¡ una alerta en lugar de escribir en la consola');
        }
        _Window.console = {
            log: function (msj) {
                alert(msj);
            }
        };
    }
    if (typeof _Window.getElementsByClassName === "undefined") {
        if (_Tracert) {
            _.cl('method: "document.getElementsByClassName(cl)", has loaded successfuly');
        }
        if (_Info) {
            _.cl('info: "document.getElementsByClassName(cl)", retorna una HTMLCollection de objetos a partir de una class, fix para IE7, ya que no cuenta IE7 con este metodo nativo');
        }
        document.getElementsByClassName = function (cl) {
            var retnode = [];
            var elem = this.getElementsByTagName('*');
            for (var i = 0; i < elem.length; i++) {
                if ((' ' + elem[i].className + ' ').indexOf(' ' + cl + ' ') > -1)
                    retnode.push(elem[i]);
            }
            return retnode;
        }
            ;
    }


    if (typeof _Window._ === "undefined") {
        if (_Tracert) {
            _.cl('method: "_Window._(selector)", has loaded successfuly');
        }
        if (_Info) {
            _.cl('info: "_Window._(selector)", metodo abreviado de querySelectorAll(selector), retorna un arreglo de objetos a partir de su selector');
        }
        _Window._ = (function () {
            return {
                /**
                 * get an object or collections for a selector
                 * @param selector Describe selector for JS
                 * @param firstElement Return only first element whether is true value
                 */
                fn: function (selector, firstElement) {
                    var items = document.querySelectorAll(selector);
                    if (typeof (firstElement) === "undefined") {
                        var item = items.ToArray().jData().First();
                        if (item != undefined) {
                            item.Hide = function () { this.style.display = "none"; };
                            item.Show = function () { this.style.display = "block"; };
                            item.Clear = function () { this.innerHTML = "" };
                            item.Enabled = function () { this.setAttribute("disabled", "true"); };
                            item.Disabled = function () { this.removeAttribute("disabled"); };
                        }
                        return item;

                    }
                    else
                        return items.ToArray();
                },
                /**
                 * valid if object is null then return object otherwise return ifnull value
                 * @param object Describe selector for JS
                 * @param ifnull Return only first element whether is true value
                 */
                in: function (object, ifnull) {
                    if (object === null || object === undefined)
                        return ifnull;
                    return object;
                },
                /**
                 * return an object or collection with event and callback programmed
                 * @param selector Describe selector for JS
                 * @param allItems apply for all elementos of collection
                 * @param event event for apply code
                 * @param callback function for event
                 */
                on: function (selector, allItems, event, callback) {
                    var items;
                    if (selector.Type === "String")
                        items = document.querySelectorAll(selector);
                    else
                        items = selector;
                    if (allItems === null || allItems === false) {
                        var item = (selector.Type === "String" ? items.ToArray().jData().First() : selector);
                        if (item != undefined) {
                            item.addEventListener(event, callback);
                            item.Hide = function () { this.style.display = "none"; };
                            item.Show = function () { this.style.display = "block"; };
                            item.Enabled = function () { this.setAttribute("disabled", "true"); };
                            item.Disabled = function () { this.removeAttribute("disabled"); };
                        }
                        return (selector.Type == "String" ? items.ToArray().jData().First() : selector.id);
                    }
                    else {
                        for (var i = 0; i < items.length; i++) {
                            var item = items[i];
                            if (item != undefined) {
                                item.addEventListener(event, callback);
                                item.Hide = function () { this.style.display = "none"; };
                                item.Show = function () { this.style.display = "block"; };
                                item.Enabled = function () { this.setAttribute("disabled", "true"); };
                                item.Disabled = function () { this.removeAttribute("disabled"); };
                            }
                        }
                        return (selector.Type == "String" ? items.ToArray() : selector.id);
                    }
                },
                /**
                * valid if object is null then return object otherwise return ifnull value
                * @param tagName Describe selector for JS
                * @param type Return only first element whether is true value
                * @param id Return only first element whether is true value
                * @param title Return only first element whether is true value
                * @param classList Return only first element whether is true value
                */
                ce: function (tagName, type, id, title, classList) {
                    var o = document.createElement(tagName);
                    if (id != null)
                        o.id = id;
                    if (type != null)
                        o.type = type;
                    if (classList != undefined)
                        o.className = classList;
                    if (title != undefined)
                        o.title = title;
                    o.Hide = function () { this.style.display = "none"; };
                    o.Show = function () { this.style.display = "block"; };
                    o.Enabled = function () { this.setAttribute("disabled", "true"); };
                    o.Disabled = function () { this.removeAttribute("disabled"); };
                    o.Clear = function () { this.innerHTML = ""; }
                    return o;
                },
                ne: ({ tag, type, id, title, cssClass, innerHTML, placeHolder, withEvents } = {}) => {
                    var o = document.createElement(tag);
                    if (id != null)
                        o.id = id;
                    if (type != null)
                        o.type = type;
                    if (cssClass != undefined)
                        o.className = cssClass;
                    if (placeHolder != undefined)
                        o.placeholder = placeHolder;
                    if (title != undefined)
                        o.title = title;
                    if (innerHTML != undefined)
                        o.innerHTML = innerHTML;
                    if (withEvents != null) {
                        o.Hide = function () { this.style.display = "none"; };
                        o.Show = function () { this.style.display = "block"; };
                        o.Enabled = function () { this.setAttribute("disabled", "true"); };
                        o.Disabled = function () { this.removeAttribute("disabled"); };
                        o.Clear = function () { this.innerHTML = ""; }
                    }
                    return o;
                },
                cl: (message, color) => {

                    color = color || "black";

                    switch (color) {
                        case "success":
                            color = "Green";
                            break;
                        case "info":
                            color = "DodgerBlue";
                            break;
                        case "error":
                            color = "Red";
                            break;
                        case "warning":
                            color = "Orange";
                            break;
                        default:
                            color = color;
                    }

                    console.log("%c SD.Javascript => " + message, "color: " + color + "; padding: .5em; background: #dfeffc; ");
                }
            };
        })();
    }

    if (typeof _Window.j === "undefined") {
        _Window.j = function (selector, firstElement) {
            var e = "[deprecated] j is Obsolete it will be removed in future versions, plese Use _.fn(selector,firstElement) Object";
            _.cl(e, "warning");
            //_.cl(selector);
            return _.fn(selector, firstElement);
        };
    }

    if (typeof _Window.jOn === "undefined") {
        _Window.jOn = function (selector, allItems, event, callback) {
            var e = "[deprecated] jOn is Obsolete it will be removed in future versions, plese Use _.fn(selector, allItems, event, callback) Object";
            _.cl(e, "warning");
            //_.cl(selector);
            return _.on(selector, allItems, event, callback);
        };
    }


    //Usando el prototipo
    SD.prototype.MetodoObsoleto = function () {
        var self = this;
        var e = "[deprecated] MetodoObsoleto estÃ¡ Obsoleto y serÃ¡ removido en futuras versiones. Usar el siguiente mÃ©todo NOMBRE_NUEVO_METODO";
        if (!this.NOMBRE_NUEVO_METODO) { throw (e); }
        (this.MetodoObsoleto = function () {
            _.cl(e);
            self.NOMBRE_NUEVO_METODO();
        })();
    }



    /*----------------------------
    * Para Usar como plantilla para nuevos metodos, metodos obsoletos y/o propiedades
    *----------------------------*/
    /*
    SD.prototype.SUB__Window = {
    METODO1: function () {
    },
    SUBCLASE: {
    METODO1: function () { },
    METODO2: function () { }
    }
    };
    SD.prototype.NuevoMetodo = function (callback) {
    if (_Tracert) { _.cl('method: "SD.NuevoMetodo()" has loaded successfuly'); }
    var STARTTIME = new Date();
    var self = this;
    if (typeof callback === 'function') {
    callback();
    }
    if (_Tracert) { _.cl('"SD.NuevoMetodo()" realizado en ' + this.Runtime(STARTTIME)); }
    };
    //Marcar MÃ©todo Obsoleto
    SD.prototype.MetodoObsoleto = function () {
    var self = this;
    var e = "[deprecated] MetodoObsoleto estÃ¡ Obsoleto y serÃ¡ removido en futuras versiones. Usar el siguiente mÃ©todo NOMBRE_NUEVO_METODO";
    if (!this.NOMBRE_NUEVO_METODO) { throw (e); }
    (this.MetodoObsoleto = function () {
    _.cl(e);
    self.NOMBRE_NUEVO_METODO();
    })();
    }
    Object.defineProperty(SD.prototype, "Propiedad", {
    get: function Propiedad() {
    return myVariable;
    },
    set: function Propiedad(value) {
    unidad = myVariable;
    }
    });
    */
} catch (err) {
    _.cl("this explorer no support definition the properties", "error");
}
_.cl("sd.core.js is loaded", "success");
