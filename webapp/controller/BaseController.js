sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    return Controller.extend("project1.controller.BaseController", {

        getModel: function(sName) {
            return this.getView().getModel(sName)
        },
        i18n: function(sText){
            return this.getView().getModel("i18n").getResourceBundle().getText(sText);
        }
    })
})