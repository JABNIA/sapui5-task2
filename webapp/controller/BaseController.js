sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
    (Controller, MessageToast) => {
        return Controller.extend("project1.controller.BaseController", {
            getModel: function (sName) {
                return this.getView().getModel(sName);
            },
            i18n: function (sText) {
                return this.getView()
                    .getModel("i18n")
                    .getResourceBundle()
                    .getText(sText);
            },
            validateV2Record: function (obj) {
                if (!obj.Name) {
                    MessageToast.show(this.i18n("pleaseEnterProductName"));
                    return false;
                } else if (!obj.Description) {
                    MessageToast.show(
                        this.i18n("pleaseEnterProductDescription")
                    );
                    return false;
                } else if (obj.ReleaseDate === "/Date(0)/") {
                    MessageToast.show(
                        this.i18n("pleaseEnterProductReleaseDate")
                    );
                    return false;
                } else if (obj.Rating === "") {
                    MessageToast.show(this.i18n("pleaseEnterProductRating"));
                    return false;
                } else if (obj.Rating > 5 || obj.Rating < 0) {
                    MessageToast.show(this.i18n("pleaseEnterCorrectRating"));
                    return false;
                } else if (!obj.Price) {
                    MessageToast.show(this.i18n("pleaseEnterProductPrice"));
                    return false;
                } else if (obj.Price === "0") {
                    MessageToast.show(this.i18n("priceCanNotBeZero"));
                    return false;
                } else {
                    return true;
                }
            },
        });
    }
);
