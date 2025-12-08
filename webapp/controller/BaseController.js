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
                    this.byId("ProductName").setValueState("Error");
                    this.byId("ProductName").setValueStateText(
                        this.i18n("ProductNameRequired")
                    );
                    return false;
                } else if (!obj.Description) {
                    MessageToast.show(
                        this.i18n("pleaseEnterProductDescription")
                    );
                    this.byId("ProductDescription").setValueState("Error");
                    this.byId("ProductDescription").setValueStateText(
                        this.i18n("ProductDescriptionRequired")
                    );
                    this.byId("ProductName").setValueState("None");
                    return false;
                } else if (obj.ReleaseDate === null) {
                    MessageToast.show(
                        this.i18n("pleaseEnterProductReleaseDate")
                    );
                    this.byId("ProductReleaseDate").setValueState("Error");
                    this.byId("ProductReleaseDate").setValueStateText(
                        this.i18n("ProductReleaseDateRequired")
                    );
                    this.byId("ProductDescription").setValueState("None");
                    return false;
                } else if (obj.Rating === null || obj.Rating === "") {
                    MessageToast.show(this.i18n("pleaseEnterProductRating"));
                    this.byId("ProductRating").setValueState("Error");
                    this.byId("ProductRating").setValueStateText(
                        this.i18n("ProductRatingRequired")
                    );
                    this.byId("ProductReleaseDate").setValueState("None");
                    return false;
                } else if (obj.Rating > 5 || obj.Rating < 0) {
                    MessageToast.show(this.i18n("pleaseEnterCorrectRating"));
                    this.byId("ProductRating").setValueState("Error");
                    this.byId("ProductRating").setValueStateText(
                        this.i18n("pleaseEnterCorrectRating")
                    );
                    return false;
                } else if (!obj.Price === "0" || obj.Price < 0) {
                    MessageToast.show(this.i18n("pleaseEnterProductPrice"));
                    this.byId("ProductPrice").setValueState("Error");
                    this.byId("ProductPrice").setValueStateText(
                        this.i18n("ProductPriceRequired")
                    );
                    this.byId("ProductRating").setValueState("None");
                    return false;
                } else if (obj.Price === null || obj.Price === "0") {
                    MessageToast.show(this.i18n("priceCanNotBeZero"));
                    this.byId("ProductPrice").setValueState("Error");
                    this.byId("ProductPrice").setValueStateText(
                        this.i18n("priceCanNotBeZero")
                    );
                    this.byId("ProductRating").setValueState("None");
                    return false;
                } else {
                    this.byId("ProductName").setValueState("None");
                    this.byId("ProductDescription").setValueState("None");
                    this.byId("ProductReleaseDate").setValueState("None");
                    this.byId("ProductRating").setValueState("None");
                    this.byId("ProductPrice").setValueState("None");
                    return true;
                }
            },
        });
    }
);
