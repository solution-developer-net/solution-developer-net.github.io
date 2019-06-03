if (typeof (SD) != "undefined") {
    _.cl("sd.project.js is loaded", "success");
    SD.prototype.Objects = {
        Classes: [
            {
                Object: "HTMLForm",
                Namespace: "SD.Utils",
                Description: "Generate an HTMLForm from an JSON Object",
                State: "Active",
                Parameters: [
                    { Name: "config", Description: "An object with properties" },
                    { Name: "config.Container", Description: "Tag to render results after invoke HTMLForm" },
                    { Name: "config.Title", Description: "Title for HTMLForm" },
                    { Name: "config.Buttons", Description: "Array of buttons with three objets Master, Detail and Items" },
                    { Name: "config.Buttons.Master", Description: "Object with properties to define Button" },
                    { Name: "config.Buttons.Master[n]", Description: "Array of buttons for the Master" },
                    { Name: "config.Buttons.Master[n].Id", Description: "Id property for button" },
                    { Name: "config.Buttons.Master[n].Title", Description: "Title property for button" },
                    { Name: "config.Buttons.Master[n].FA", Description: "Icon property for button" },
                    { Name: "config.Buttons.Master[n].Click", Description: "Click event for button" },
                    { Name: "config.Buttons.Detail", Description: "Object with properties to define Button" },
                    { Name: "config.Buttons.Detail[n]", Description: "Array of buttons for Detail" },
                    { Name: "config.Buttons.Detail[n].Id", Description: "Id property for button" },
                    { Name: "config.Buttons.Detail[n].Title", Description: "Title property for button" },
                    { Name: "config.Buttons.Detail[n].FA", Description: "Icon property for button" },
                    { Name: "config.Buttons.Detail[n].Click", Description: "Click event for button" },
                    { Name: "config.Buttons.Items", Description: "Object with properties to define Button" },
                    { Name: "config.Buttons.Items[n]", Description: "Array of buttons for the Items" },
                    { Name: "config.Buttons.Items[n].Id", Description: "Id property for button" },
                    { Name: "config.Buttons.Items[n].Title", Description: "Title property for button" },
                    { Name: "config.Buttons.Items[n].FA", Description: "Icon property for button" },
                    { Name: "config.Buttons.Items[n].Click", Description: "Click event for button" },
                    { Name: "config.CurrencyColumns", Description: "Add decimals to the change of currency " },
                    { Name: "config.InputMasks", Description: "String expression, constrains user input" },
                    { Name: "config.ForeignKeyColumns", Description: "ID columns" },
                    { Name: "config.InputWithActionColumns", Description: "Fields that will handle actions" },
                    { Name: "config.InputWidthFixed", Description: "Define an image as the submit button, with height and width attributes" },
                    { Name: "config.InputHelpColumns", Description: "Array of specific columns to show dialog help" },
                    { Name: "config.CurrencyISOColumns", Description: "Array of property for columns" },
                    { Name: "config.ReadonlyColumns", Description: "Array of property for columns" },
                    { Name: "config.HiddenColumns", Description: "Array of property for columns" },
                    { Name: "config.CalculatedColumns", Description: "Array of property for columns" },
                    { Name: "config.ReadOnly", Description: "Property that allows you to choose which controls will be Read-Only" },
                    { Name: "config.Data", Description: "Property that receives an object" },
                    { Name: "config.Data.Master", Description: "Property that receives an object with Id and Description" },
                    { Name: "config.Data.Detail", Description: "Property that receives an Array with Id and Description" },
                    { Name: "config.RenderAs", Description: "Property that let you choose a type of format (Table or Custom)" },
                    { Name: "config.RenderCustom", Description: "Property that receives the Render configurations for the Custom Render." }
                ]
            },
            {
                Object: "HTMLList",
                Namespace: "SD.Utils",
                Description: "Generate an HTMLList from an JSON Object",
                State: "Active",
                Parameters: [
                    { Name: "config", Description: "An object with properties" },
                    { Name: "config.Container", Description: "Tag to render results after invoke HTMLList" },
                    { Name: "config.IncludeFilter", Description: "Allow include input to filter HTMLList" },
                    { Name: "config.PlaceHolder", Description: "Set the Placeholder attribute to field filter" },
                    { Name: "callback", Description: "Anonimous function to run after load config properties" },


                ]
            },
            {
                Object: "_.fn",
                Namespace: "SD.Utils",
                Description: "Shortcut form document.getElementeById, and set customs functions to object",
                State: "Active",
                Parameters: [
                    { Name: "Container", Description: "Tag to render results after invoke HTMLForm" },
                    { Name: "Title", Description: "Title for HTMLForm" },
                    { Name: "Buttons", Description: "Array of buttons with two objets Master and Detail" },

                ]
            },
            {
                Object: "_.ce",
                Namespace: "SD.Utils",
                Description: "Shortcut for document.createElement",
                State: "Obsolete",
                Parameters: [
                    { Name: "Container", Description: "Tag to render results after invoke HTMLForm" },
                    { Name: "Title", Description: "Title for HTMLForm" },
                    { Name: "Buttons", Description: "Array of buttons with two objets Master and Detail" },

                ]
            },
            {
                Object: "_.ne",
                Namespace: "SD.Utils",
                Description: "Shorcut for document.createElement",
                State: "Active",
                Parameters: [
                    { Name: "Container", Description: "Tag to render results after invoke HTMLForm" },
                    { Name: "Title", Description: "Title for HTMLForm" },
                    { Name: "Buttons", Description: "Array of buttons with two objets Master and Detail" },

                ]
            },
            {
                Object: "_.cl",
                Namespace: "SD.Utils",
                Description: "Shorcut for console.log, with color for actions: success, info, warning and error",
                State: "Active",
                Parameters: [
                    { Name: "Container", Description: "Tag to render results after invoke HTMLForm" },
                    { Name: "Title", Description: "Title for HTMLForm" },
                    { Name: "Buttons", Description: "Array of buttons with two objets Master and Detail" },

                ]
            }

        ]
    };
    Object.defineProperty(SD.prototype, "Help", {
        get: function () {
            var me = this;
            var topics = me.Objects.Classes;
            var ul = _.ne({ tag: "ul", id: "sdHelp" });
            topics.jData().ForEach((topic) => {
                var li = _.ne({ tag: "li" });
                var keys = Object.entries(topic);
                var iter = 0;
                var obj = "";
                keys.jData().ForEach((kv) => {
                    var tag = null;

                    if (kv[0] != "Parameters")
                        if (iter == 0) {
                            obj = kv[1];
                            tag = _.ne({ tag: "h6", innerHTML: `<b>${kv[0]}</b>: '${kv[1]}'` });
                        }
                        else
                            tag = _.ne({ tag: "p", innerHTML: `<b>${kv[0]}</b>: '${kv[1]}', member of ${obj}` });
                    else {
                        var ulSub = _.ne({ tag: "ul" });
                        var infoSub = "";
                        var parameters = kv[1];
                        parameters.jData().ForEach((param) => {
                            var liSub = _.ne({ tag: "li", innerHTML: `<b>${param.Name}:</b> '${param.Description}, member of ${obj}'` });
                            ulSub.appendChild(liSub);
                        });
                        tag = _.ne({ tag: "p", innerHTML: `<b>Parameters</b>:<ul>${ulSub.innerHTML}</ul>` });
                    }
                    li.appendChild(tag);
                    iter++;
                });
                ul.appendChild(li);
            });
            var body = _.fn("body");
            var jHelp = _.fn("#jHelp");
            if (jHelp != null)
                jHelp.parentElement.removeChild(jHelp);
            if (jHelp == null) {
                jHelp = document.createElement("div");
                jHelp.id = "jHelp";
            }
            var div = _.ne({ tag: "div" });
            var filtro = _.ne({ tag: "input", type: "text", id: "jFilter", placeHolder: "type any work to find..", cssClass: "form-control" });
            var btnClose = _.ne({ tag: "span", innerHTML: "<b class='fa fa-times'></b>Close", });
            var title = _.ne({ tag: "h3", innerHTML: "Help for SD.Javascript " + _Version, });

            div.appendChild(ul);
            jHelp.appendChild(btnClose);
            jHelp.appendChild(title);
            jHelp.appendChild(filtro);
            jHelp.appendChild(div);

            _.on(btnClose, false, "click", () => {
                var jHelp = _.fn("#jHelp");
                jHelp.parentElement.removeChild(jHelp);
            });

            filtro.onkeyup = (e) => {
                filter = e.target.value.toUpperCase();
                ul = _.fn("#jHelp>div>ul");
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

            body.appendChild(jHelp);
        }
    });
} else
    _.cl("You must include sd.help.js before sd.project.js", "warning")