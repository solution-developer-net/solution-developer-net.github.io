if (typeof (SD) != "undefined") {
    console.log("sd.extensions.js is loaded");
    SD.prototype.MCSD = {
        Noticias: function () {
            var self = this.parent;
            var lblStatus = document.getElementById("lblStatus");
            var desde = new Date();
            this.parent.SD.Utils.Callback("http://webservice.notitarde.com/site/binary/json.aspx?idcat=20&cantidad=5", null, function (datos) {
                try {
                    var data = datos;
                    // self.SD.Resultado;
                    var datos = [];
                    var categorias = data.noticias.Distinct("categoria");
                    for (var i = 0; i < categorias.length; i++) {
                        var categoria = categorias[i];
                        var obj = {
                            "categoria": categoria,
                            "noticias": data.noticias.Distinct("categoria", categoria)
                        };
                        datos.push(obj);
                    };
                    //self.SD.JSource.UL(datos);
                    self.SD.JSource.UL(datos, {
                        "MaxLenght": 1000
                    });
                    __("h2[item]").ForEach(function (e) {
                        e.onclick = function () {
                            var item = data.noticias.Item(data.noticias.Find("id", parseInt(e.getAttribute("item"))));
                            self.SD.UI.Notificacion.Mensaje(item.texto);
                        };
                    });
                    var hasta = new Date();
                    if (desde != null && hasta != null) {
                        var c = ((desde - hasta) / 1000);
                        lblStatus.innerHTML = "Tiempo empleado " + c;
                    }
                }
                catch (ex) {
                }
            })
        },
        _: function () {
            this.parent = _Window;
            this.Noticias.parent = this;
            delete this._;
            return this;
        }
    }._();
    SD.prototype.CurriculumVitae = {
        Perfil: {
            InfoUsuario: function () {
                var fields = { "firstName": "Jorge L.", "lastName": "Torres A.", "specialty": "Desarrollador FrontEnd", "profile": "Perfil", "profil-description": "El Tipo que tal", "workExperience": "Experiencia Laboral", "workExperience-company-1": "Gerente de Tecnología de Información", "workExperience-companyName-1": "Editorial Notitarde, C.A.", "workExperience-period-1": "Agosto de 2016 – actualidad (6 meses)" };

                var htmlfields = document.body.innerHTML.toString().match(/@{.+}/g);

                for (var i = 0; i < htmlfields.length; i++) {
                    var htmlField = htmlfields[i];
                    var item = htmlField.replace(/@|{|}/g, '');
                    if (fields[item] !== undefined) {
                        document.body.innerHTML = document.body.innerHTML.toString().replace(htmlField, fields[item]);
                    }
                };

            }
        },
        _: function () {
            this.parent = _Window;
            this.Perfil.parent = this;
            delete this._;
            return this;
        }
    }._();
    SD.prototype.NAMESPACE_PROJECT_PERSONAL = {
        Sitio: function () {
            var items = ['0078D7', '5C2D91', '008272', '107C10', '00188F', 'A80000', '002050', '004B50', '004B1C'];
            var bg = items[Math.floor(Math.random() * items.length)];
            var body = document.getElementsByTagName("body")[0];
            body.style.backgroundColor = "#" + bg;
            body.style.color = "white";
        }
    };
    SD.prototype.JSource = {
        UL: function (datos, opciones) {
            var ulP = document.querySelectorAll("ul[JSource]")[0];
            var liP = ulP.children[0];
            ulP.innerHTML = "";
            var ulC = liP.querySelectorAll("ul[JDesendant]")[0];
            var liC = null;
            if (typeof ulC !== "undefined") {
                liC = ulC.children[0];
                ulC.innerHTML = "";
            }
            for (var i = 0; i < datos.length; i++) {
                var item = datos[i];
                var targets = liP.innerHTML.match(/{[a-zA-Z]+}/g);
                var string = liP.innerHTML;
                var iData = [];
                for (var o = 0; o < targets.length; o++) {
                    var columna = targets[o].replace(/{|}/g, "");
                    var object = item[columna];
                    if (typeof object !== "undefined" && object.constructor.name === "Array") {
                        iData = object;
                    }
                    if (typeof opciones !== "undefined" && typeof opciones["MaxLenght"] !== "undefined") {
                        string = string.replace(columna, item[columna]).substring(0, parseInt(opciones["MaxLenght"])) + "...";
                    } else {
                        string = string.replace(columna, item[columna]);
                    }
                }
                ;
                var newLiP = document.createElement("li");
                if (iData.length > 0) {
                    var newUlC = document.createElement("ul");
                    newLiP.innerHTML = string.replace(/{|}/g, "");
                    for (var a = 0; a < iData.length; a++) {
                        var internalItem = iData[a];
                        var internalTargets = liC.innerHTML.match(/{[a-zA-Z]+}/g);
                        var internalString = liC.innerHTML;
                        for (var b = 0; b < internalTargets.length; b++) {
                            var internalColumna = internalTargets[b].replace(/{|}/g, "");
                            var object = internalItem[internalColumna];
                            if (typeof opciones !== "undefined" && typeof opciones["MaxLenght"] !== "undefined") {
                                internalString = internalString.replace(internalColumna, internalItem[internalColumna]).substring(0, parseInt(opciones["MaxLenght"])) + "...";
                            } else {
                                internalString = internalString.replace(internalColumna, internalItem[internalColumna]);
                            }
                        }
                        ;
                        var newLiC = document.createElement("li");
                        newLiC.innerHTML = internalString.replace(/{|}/g, "");
                        newUlC.appendChild(newLiC);
                    }
                    ;
                    newLiP.appendChild(newUlC);
                } else {
                    newLiP.innerHTML = string.replace(/{|}/g, "");
                }
                ulP.appendChild(newLiP);
            }
            ;
            ulP.removeAttribute("JSource");
            var uls = document.querySelectorAll("ul[JDesendant]");
            for (var c = 0; c < uls.length; c++) {
                uls[c].remove(this);
            }
            ;
        }
    };
    SD.prototype.Projects = {
        Github: function () {
            var items = ['0078D7', '5C2D91', '008272', '107C10', '00188F', 'A80000', '002050', '004B50', '004B1C'];
            var bg = items[Math.floor(Math.random() * items.length)];
            var body = document.getElementsByTagName("body")[0];
            body.style.backgroundColor = "#" + bg;
            body.style.color = "white";
        },
        WebTimeline: function () {
            this.data = [];
            var self = this;
            var btnAgregar = _("btnAgregar");
            var btnGuardar = _("btnGuardar");
            var btnEliminar = _("btnEliminar");
            var btnLimpiar = _("btnLimpiar");
            var btnBorrarBBDD = _("btnBorrarBBDD");
            var txtId = _("txtId");
            var txtFecha = _("txtFecha");
            var txtProyecto = _("txtProyecto");
            var txtObservacion = _("txtObservacion");
            var lblLeyenda = _("lblLeyenda");
            var divResult = _("result");
            var filtro = _("filtro");
            btnEliminar.style.display = "none";
            btnGuardar.style.display = "none";
            var guardarDatos = function () {
                if (localStorage.getItem("bbdd_webtimeline") != null) {
                    var datos = JSON.parse(localStorage.getItem("bbdd"));
                    if (self.data.length > datos.length) {
                        localStorage.setItem("bbdd_webtimeline", JSON.stringify(self.data));
                    } else {
                        self.data = datos;
                    }
                } else {
                    localStorage.setItem("bbdd_webtimeline", JSON.stringify(self.data));
                }
            }
                ;
            var limpiarCampos = function () {
                txtId.value = "";
                txtFecha.value = "";
                txtProyecto.value = "";
                txtObservacion.value = "";
            }
                ;
            var llenarCampos = function (item) {
                txtId.value = item.Id;
                txtFecha.value = item.Dia + "/" + item.Mes + "/" + item.Anio + " " + item.Horas + ":" + item.Minutos;
                txtProyecto.value = item.Proyecto;
                txtObservacion.value = item.Observacion;
            }
                ;
            var activarBotones = function () {
                if (txtId.value.length !== 0) {
                    btnAgregar.style.display = "none";
                    btnEliminar.style.display = "inline";
                    btnGuardar.style.display = "inline";
                } else {
                    btnAgregar.style.display = "inline";
                    btnEliminar.style.display = "none";
                    btnGuardar.style.display = "none";
                }
            }
                ;
            var actualizarListado = function () {
                self.parent.SD.UI.Tablas.Crear(self.data, divResult);
                var tabla = _("listado");
                self.parent.SD.UI.Tablas.Ordenacion._();
                self.parent.SD.UI.Tablas.Busqueda._();
                filtro.onkeyup = function () {
                    self.parent.SD.UI.Tablas.Busqueda.Buscar(filtro, tabla);
                }
                    ;
                guardarDatos();
                var items = document.querySelectorAll("td[trigger]");
                for (var i = items.length - 1; i >= 0; i--) {
                    var trigger = items[i];
                    trigger.onclick = function () {
                        var selectedItem = self.data.Query("Id==" + this.innerHTML);
                        llenarCampos(selectedItem);
                        activarBotones();
                    }
                        ;
                }
                ;
                activarBotones();
                var desde = self.data.First();
                var hasta = self.data.Last();
                if (desde != null && hasta != null) {
                    desde = self.parent.SD.Utils.LPad(desde.Horas, 2) + ":" + self.parent.SD.Utils.LPad(desde.Minutos, 2);
                    hasta = self.parent.SD.Utils.LPad(hasta.Horas, 2) + ":" + self.parent.SD.Utils.LPad(hasta.Minutos, 2);
                    var tiempoTotal = self.parent.SD.Utils.Time.RestarHoras(desde, hasta);
                    lblLeyenda.innerHTML = "Tiempo empleado " + tiempoTotal + " horas";
                }
            }
                ;
            guardarDatos();
            if (btnLimpiar !== null) {
                btnLimpiar.onclick = function () {
                    limpiarCampos();
                    activarBotones();
                    actualizarListado();
                }
                    ;
            }
            if (btnBorrarBBDD !== null) {
                btnBorrarBBDD.onclick = function () {
                    self.parent.SD.UI.Notificacion.Mensaje("Â¿Seguro de eliminar la BBDD?", function () {
                        localStorage.clear();
                        self.data = [];
                    });
                }
                    ;
            }
            if (btnGuardar !== null) {
                btnGuardar.onclick = function () {
                    var item = self.data.Query("Id==" + txtId.value);
                    if (item !== null) {
                        var date = new Date();
                        item.Id = txtId.value;
                        item.Anio = date.getFullYear();
                        item.Mes = date.getMonth() + 1;
                        item.Dia = date.getDate();
                        item.Horas = date.getHours();
                        item.Minutos = date.getMinutes();
                        item.Proyecto = txtProyecto.value;
                        item.Observacion = txtObservacion.value;
                        self.parent.SD.UI.Notificacion.Mensaje("El registro se ha actualizado correctamente...", function () {
                            limpiarCampos();
                            actualizarListado();
                        }, false);
                    }
                }
                    ;
            }
            if (btnEliminar !== null) {
                btnEliminar.onclick = function () {
                    var index = self.data.Find("Id", txtId.value);
                    if (index > -1) {
                        self.parent.SD.UI.Notificacion.Mensaje("Â¿Seguro de eliminar el registro?", function () {
                            self.data.Delete(index);
                            self.parent.SD.UI.Notificacion.Mensaje("El registro se ha eliminado correctamente...", function (callback) {
                                limpiarCampos();
                                actualizarListado();
                                callback();
                            }, true);
                        });
                    }
                }
                    ;
            }
            if (btnAgregar !== null) {
                btnAgregar.onclick = function () {
                    var validado = self.parent.SD.Utils.Validation.Validate();
                    if (validado) {
                        var sinHora = undefined;
                        var date = new Date();
                        var fecha = self.LPad(date.getDate(), 2) + "-" + self.LPad((date.getMonth() + 1), 2) + "-" + date.getFullYear() + (sinHora == undefined ? " " + self.LPad(date.getHours(), 2) + ":" + self.LPad(date.getMinutes(), 2) + ":" + self.LPad(date.getSeconds(), 2) : "");
                        var item = {
                            "Id": Math.floor((Math.random() * 9999) + 1),
                            "Proyecto": txtProyecto.value,
                            "Observacion": txtObservacion.value,
                            "Anio": date.getFullYear(),
                            "Mes": date.getMonth() + 1,
                            "Dia": date.getDate(),
                            "Horas": date.getHours(),
                            "Minutos": date.getMinutes()
                        };
                        self.data.Add(item);
                        actualizarListado();
                    } else {
                        self.parent.SD.UI.Notificacion.Mensaje("No puede ingresar registros en blanco", function () {
                            txtObservacion.focus();
                        }, false);
                    }
                    limpiarCampos();
                }
                    ;
            }
            actualizarListado();
        },
        CheckList: function () {
            //Reescritura de Distinct y DistinctName, solo para este project
            Array.prototype.Distinct = function () {
                if (_Tracert) {
                    console.log('metodo: "Array.Radios().Distinct()", ha cargado exitosamente');
                }
                if (_Info) {
                    console.log('info: "Array.Radios().Distinct()", retorna un arreglo de string con los nombre unicos del arreglo');
                }
                var u = {}
                    , a = [];
                for (var i = 0, l = this.length; i < l; ++i) {
                    if (u.hasOwnProperty(this[i].Categoria)) {
                        continue;
                    }
                    a.push(this[i].Categoria);
                    u[this[i].Categoria] = 1;
                }
                return a;
            }
                ;
            Array.prototype.DistinctName = function (sName) {
                if (_Tracert) {
                    console.log('metodo: "Array.Radios().DistinctName(sName)", ha cargado exitosamente');
                }
                if (_Info) {
                    console.log('info: "Array.Radios().DistinctName(sName)", retorna un arreglo de elementos Radios filtrados por su propiedad Name comparado por el parametro sName');
                }
                var a = [];
                for (var i = 0, l = this.length; i < l; ++i) {
                    if (this[i].Categoria === sName) {
                        a.push(this[i]);
                    }
                }
                return a;
            }
                ;
            this.data = [];
            this.evaluacion = [];
            var self = this;
            var btnAgregar = _("btnAgregar");
            var btnGuardar = _("btnGuardar");
            var btnEliminar = _("btnEliminar");
            var btnLimpiar = _("btnLimpiar");
            var btnBorrarBBDD = _("btnBorrarBBDD");
            var txtId = _("txtId");
            var txtFecha = _("txtFecha");
            var txtCategoria = _("txtCategoria");
            var txtObservacion = _("txtObservacion");
            var chkCompletada = _("chkCompletada");
            var ddlCategorias = _("ddlCategorias");
            var divResult = _("result");
            var filtro = _("filtro");
            btnEliminar.style.display = "none";
            btnGuardar.style.display = "none";
            var guardarDatos = function () {
                if (localStorage.getItem("bbdd_checklist") != null) {
                    var datos = JSON.parse(localStorage.getItem("bbdd_checklist"));
                    if (self.data.length > datos.length) {
                        localStorage.setItem("bbdd_checklist", JSON.stringify(self.data));
                    } else {
                        self.data = datos;
                    }
                } else {
                    localStorage.setItem("bbdd_checklist", JSON.stringify(self.data));
                }
            }
                ;
            var actualizarDatos = function () {
                if (localStorage.getItem("bbdd_checklist") != null) {
                    var datos = JSON.parse(localStorage.getItem("bbdd"));
                    localStorage.setItem("bbdd_checklist", JSON.stringify(self.data));
                } else {
                    localStorage.setItem("bbdd_checklist", JSON.stringify(self.data));
                }
            }
                ;
            var limpiarCampos = function () {
                txtId.value = "";
                txtFecha.value = "";
                txtCategoria.value = "";
                txtObservacion.value = "";
                chkCompletada.checked = false;
            }
                ;
            var llenarCampos = function (item) {
                txtId.value = item.Id;
                txtFecha.value = item.Fecha;
                txtCategoria.value = item.Categoria;
                txtObservacion.value = item.Observacion;
                chkCompletada.checked = item.Completada;
            }
                ;
            var activarBotones = function () {
                if (txtId.value.length !== 0) {
                    btnAgregar.style.display = "none";
                    btnEliminar.style.display = "inline";
                    btnGuardar.style.display = "inline";
                } else {
                    btnAgregar.style.display = "inline";
                    btnEliminar.style.display = "none";
                    btnGuardar.style.display = "none";
                }
            }
                ;
            var actualizarListado = function () {
                self.parent.SD.UI.Tablas.Crear(self.data, divResult);
                var tabla = _("listado");
                self.parent.SD.UI.Tablas.Ordenacion._();
                self.parent.SD.UI.Tablas.Busqueda._();
                filtro.onkeyup = function () {
                    self.parent.SD.UI.Tablas.Busqueda.Buscar(filtro, tabla);
                }
                    ;
                guardarDatos();
                //self.parent.SD.JSource.UL(self.data);
                var items = document.querySelectorAll("td[trigger]");
                for (var i = items.length - 1; i >= 0; i--) {
                    var trigger = items[i];
                    trigger.onclick = function () {
                        var selectedItem = self.data.Query("Id==" + this.innerHTML);
                        llenarCampos(selectedItem);
                        activarBotones();
                    }
                        ;
                }
                ;
                activarBotones();
                graficar();
            }
                ;
            var graficar = function () {
                ddlCategorias.innerHTML = "";
                var evaluacion = new Array(self.data.length);
                var categorias = self.data.Distinct();
                for (var i = 0; i < categorias.length; i++) {
                    var categoria = categorias[i];
                    var itemsPorCategoria = self.data.DistinctName(categoria);
                    for (var o = 0; o < itemsPorCategoria.length; o++) {
                        var item = itemsPorCategoria[o];
                        if (item.Completada)
                            evaluacion[i] = evaluacion[i] === undefined ? 1 : evaluacion[i] + 1;
                    }
                    evaluacion[i] = !isNaN(parseFloat(evaluacion[i])) ? (parseFloat(evaluacion[i]) / itemsPorCategoria.length) * 100 : 0;
                    var option = document.createElement('option');
                    option.value = categoria;
                    ddlCategorias.appendChild(option);
                }
                ;
                var dataEvaluacion = evaluacion;
                $(function () {
                    $('#grafico').highcharts({
                        chart: {
                            polar: true,
                            type: 'line'
                        },
                        title: {
                            text: 'EvaluaciÃ³n',
                            x: -80
                        },
                        pane: {
                            size: '80%'
                        },
                        xAxis: {
                            categories: categorias,
                            tickmarkPlacement: 'on',
                            lineWidth: 0
                        },
                        yAxis: {
                            gridLineInterpolation: 'polygon',
                            lineWidth: 0,
                            min: 0
                        },
                        tooltip: {
                            shared: true,
                            pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.2f}%</b><br/>'
                        },
                        legend: {
                            align: 'right',
                            verticalAlign: 'top',
                            y: 70,
                            layout: 'vertical'
                        },
                        series: [{
                            name: 'Resultado',
                            data: dataEvaluacion,
                            pointPlacement: 'on'
                        }]
                    });
                });
            }
                ;
            guardarDatos();
            if (btnLimpiar !== null) {
                btnLimpiar.onclick = function () {
                    limpiarCampos();
                    activarBotones();
                    actualizarListado();
                }
                    ;
            }
            if (btnBorrarBBDD !== null) {
                btnBorrarBBDD.onclick = function () {
                    self.parent.SD.UI.Notificacion.Mensaje("Â¿Seguro de eliminar la BBDD?", function () {
                        localStorage.clear();
                        self.data = [];
                    });
                }
                    ;
            }
            if (btnGuardar !== null) {
                btnGuardar.onclick = function () {
                    var item = self.data.Query("Id==" + txtId.value);
                    if (item !== null) {
                        var date = new Date();
                        item.Id = txtId.value;
                        item.Fecha = txtFecha.value;
                        item.Categoria = txtCategoria.value;
                        item.Observacion = txtObservacion.value;
                        item.Completada = chkCompletada.checked;
                        self.parent.SD.UI.Notificacion.Mensaje("El registro se ha actualizado correctamente...", function () {
                            limpiarCampos();
                            actualizarDatos();
                            actualizarListado();
                        }, false);
                    }
                }
                    ;
            }
            if (btnEliminar !== null) {
                btnEliminar.onclick = function () {
                    var index = self.data.Find("Id", txtId.value);
                    if (index > -1) {
                        self.parent.SD.UI.Notificacion.Mensaje("Â¿Seguro de eliminar el registro?", function () {
                            self.data.Delete(index);
                            self.parent.SD.UI.Notificacion.Mensaje("El registro se ha eliminado correctamente...", function (callback) {
                                limpiarCampos();
                                actualizarListado();
                                callback();
                            }, true);
                        });
                    }
                }
                    ;
            }
            if (btnAgregar !== null) {
                btnAgregar.onclick = function () {
                    var validado = self.parent.SD.Utils.Validation.Validate();
                    if (validado) {
                        var sinHora = undefined;
                        var date = new Date();
                        var fecha = self.parent.SD.Utils.LPad(date.getDate(), 2) + "-" + self.parent.SD.Utils.LPad((date.getMonth() + 1), 2) + "-" + date.getFullYear() + (true == undefined ? " " + self.parent.SD.Utils.LPad(date.getHours(), 2) + ":" + self.parent.SD.Utils.LPad(date.getMinutes(), 2) + ":" + self.parent.SD.Utils.LPad(date.getSeconds(), 2) : "");
                        var item = {
                            "Id": Math.floor((Math.random() * 9999) + 1),
                            "Fecha": txtFecha.value,
                            "Categoria": txtCategoria.value,
                            "Observacion": txtObservacion.value,
                            "Completada": chkCompletada.checked
                        };
                        self.data.Add(item);
                        actualizarListado();
                    } else {
                        self.parent.SD.UI.Notificacion.Mensaje("No puede ingresar registros en blanco", function () {
                            txtObservacion.focus();
                        }, false);
                    }
                    limpiarCampos();
                }
                    ;
            }
            var date = new Date();
            txtFecha.value = self.parent.SD.Utils.LPad(date.getDate(), 2) + "-" + self.parent.SD.Utils.LPad((date.getMonth() + 1), 2) + "-" + date.getFullYear() + (true == undefined ? " " + self.parent.SD.Utils.LPad(date.getHours(), 2) + ":" + self.parent.SD.Utils.LPad(date.getMinutes(), 2) + ":" + self.parent.SD.Utils.LPad(date.getSeconds(), 2) : "");
            actualizarListado();
        },
        _: function () {
            this.parent = _Window;
            this.WebTimeline.parent = this;
            this.CheckList.parent = this;
            delete this._;
            return this;
        }
    }._();
} else
    console.log("You must include sd.core.js before sd.extensions.js")