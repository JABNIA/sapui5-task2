sap.ui.define(
    [
        "./BaseController", 
        "sap/ui/model/Context",
        "sap/m/MessageBox",
    ],
    (BaseController, Context, MessageBox) => {
        "use strict";

        return BaseController.extend("project1.controller.Product", {
            onInit() {
                const oRouter = this.getOwnerComponent().getRouter();

                oRouter
                    .getRoute("Product")
                    .attachPatternMatched(this._onRouteMatched, this);
                },

            _onRouteMatched(oEvent) {
                const sProductID = oEvent.getParameter("arguments").ProductId;

                this._onFetchProductDetails(sProductID);
            },

            _onFetchProductDetails(sProductId) {
                const oModel = this.getOwnerComponent().getModel("ODataV2");
                console.log(oModel)
                oModel.read(`/Products(${sProductId})`, {
                    urlParameters: {
                        "$expand": "Supplier",
                    },
                    success: (oData) => {
                        const oContext = this._getContext(
                            "Products",
                            oModel,
                            sProductId
                        );
                        console.log(oData)
                        this.getView().setBindingContext(oContext, "ODataV2");
                    },
                    error: () => {
                        MessageBox.error(this.i18n("failedTofetchProductData"));
                    },
                });
                
            },
            
            _getContext(sPath, oModel, requestedId) {
                const oContext = new Context(
                        oModel,
                        `/${sPath}(${requestedId})`
                    );
                return oContext;
                },
            onNavBack() {
                const oRouter = this.getOwnerComponent().getRouter()
                oRouter.navTo("tab", {tabKey: "V2Model"});
            },
        });
    }
);
