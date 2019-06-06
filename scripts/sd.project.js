if (typeof (SD) != "undefined") {
    _.cl("sd.project.js is loaded", "success");
    SD.prototype.Project = {
        Root: "/virualdirectory",
        ServiceUrl: "/services/",
        Load: () => {
            var sd = this.parent.SD, utils = sd.Utils, ui = sd.UI, e = sd.Events, project = sd.Project, me = this;

            var path = "";
            try {
                path = location.pathname.toLowerCase().replace(me.Root, "").split('/')[2].toLowerCase();
            } catch (e) {
                path = location.pathname.toLowerCase().replace("/", "").split('/')[0].toLowerCase();
            }
            if (path === undefined) {
                path = "\\";
            }
            if (path.indexOf("?") > 0) {
                path = path.substring(0, location.pathname.toLowerCase().replace(me.Root, "").split('/')[2].indexOf("?"));
            }
            var fnPage = Object.keys(SD.Project).filter(p => {
                var fn = p;
                var page = p.toLowerCase().replace("page", "") + ".html";
                if (page == path)
                    return fn;
            })
            try {
                var logic = `project.${fnPage[0]}()`;
                eval(logic);
            } catch (e) {
                _.cl(`Not logic founded to ${path}`, "error");
                project.PageIndex();
            }

            try {
                // TO DO..
                // Your custom logic...
            } catch (e) {
                _.cl(e, "error");
            }


        },
        /**
         * Page_YOUR_PAGE: all functions to page page1.aspx
         */
        PageIndex: () => {
            var sd = this.parent.SD, utils = sd.Utils, ui = sd.UI, e = sd.Events, project = sd.Project, me = project;
            alert("Welcome");
            utils.Import("#main-body","/projects/sdjavascript/index.html", () => {
                me.Projects.SDJavascript();
            });
        },
        Projects: {
            SDJavascript: () => {
                var sd = this.parent.SD, utils = sd.Utils, ui = sd.UI, e = sd.Events, project = sd.Project, me = project;
                var c = utils.LoadControls();
                var config = {
                    Title:"Basic config",
                    Data: {
                        Detail: [
                            { Id: "1", Description: "for add" },
                            { Id: "2", Description: "for modified" },
                            { Id: "3", Description: "for deleted" },
                        ]
                    },
                    ReadonlyColumns: "Id*",
                    InputHelpColumns: [{
                        Id:"txtmDescription",Help:"Help for this field"
                    }]
                };
                utils.HTMLForm(config);
                //c.txtCode.value = JSON.stringify(config);
                var editorConfig = {
                    lineNumbers: true,
                    matchBrackets: true,
                    continueComments: "Enter",
                    extraKeys: { "Ctrl-Q": "toggleComment" }
                };

                var editor = CodeMirror.fromTextArea(document.getElementById("txtCode"), editorConfig );
                CodeMirror.fromTextArea(document.getElementById("txtCode2"), editorConfig);
                CodeMirror.fromTextArea(document.getElementById("txtCode3"), editorConfig);
                CodeMirror.fromTextArea(document.getElementById("txtCode4"), editorConfig);
                
                

                _.on(c.btnRun, false, e.OnClick, () => {

                    var fnRender = (tag, item) => {
                        var a = _.ce("a");
                        a.innerHTML = item.Title;
                        a.href = "javascript:void";
                        a.onclick = (me) => {
                            var obj = JSON.parse(me.target.getAttribute("obj"));
                            txtmTitle.value = obj.Title;
                            txtmCategoryOriginal.value = obj.Category;
                            txtmCategory.value = "";
                            txtmSource.value = obj.Source;
                            txtmText.value = obj.Text;
                            txtmReference.value = obj.Link;
                            txtmImage.value = obj.Image;
                        }
                        a.setAttribute("obj", JSON.stringify(item));
                        var h2 = _.ce("h2");
                        h2.appendChild(a);
                        var p = _.ce("p");
                        p.innerHTML = item.Text;
                        var span = _.ce("span");
                        span.innerHTML = item.Category;
                        var small = _.ce("small");
                        small.innerHTML = item.Source;
                        var img = _.ce("img");
                        img.src = item.Image;
                        tag.appendChild(h2);
                        tag.appendChild(img);
                        tag.appendChild(span);
                        tag.appendChild(small);
                        tag.appendChild(p);
                        tag.setAttribute("data-source", item.Source);
                    };

                    var config = editor.getValue();
                    utils.HTMLForm(JSON.parse(config));
                });
                _.on(c.btnHelp, false, e.OnClick, () => {
                    sd.Help;
                });
            }
        },
        /**
         * Page_YOUR_PAGE: all functions to page page1.aspx
         */
        Page_YOUR_PAGE: () => {
            var sd = this.parent.SD, utils = sd.Utils, ui = sd.UI, e = sd.Events, project = sd.Project, me = this;
            // YOUR CODE....
        },
        _: function () {
            this.parent = _Window;
            this.Page_YOUR_PAGE.parent = this;
            delete this._;
            return this;
        }
    }._();
} else
    _.cl("You must include sd.core.js before sd.project.js", "warning")
