sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/HashChanger",
    "./parts/JSONModelParts",
    "./parts/V2Model",
    "./parts/V4Model",
  ],
  (
    BaseController,
    JSONModel,
    HashChanger,
    JSONModelParts,
    V2Model,
    V4Model
  ) => {
    "use strict";

    return BaseController.extend(
      "project1.controller.Main",
      Object.assign(JSONModelParts, V2Model, V4Model, {
        onInit() {
          //JSONModel for books
          const oBookModel = this.getOwnerComponent().getModel("Book");
          //Genres for select control
          const aGenresSet = new Set(
            oBookModel.getData().books.map((book) => book.genre)
          );

          const aGenresArray = Array.from(["All", ...aGenresSet]);
          const aGenresObjArray = aGenresArray.map((genre) => {
            return { key: genre, text: genre };
          });

          //add new model values here
          this._oViewModel = new JSONModel({
            titleEdit: { isVisible: false, id: "" },
            editMode: false,
            selectedTab: "",
            genres: aGenresObjArray,
            newObject: {},
            enableDeleteBtn: false,
          });

          this.getView().setModel(this._oViewModel, "viewModel");

          this.getOwnerComponent()
            .getRouter()
            .attachRouteMatched(this._onPatternMatched, this);
        },

        _onPatternMatched(oEvent) {
          this._oViewModel.setProperty(
            "/selectedTab",
            oEvent.getParameter("arguments")?.tabKey
          );
        },

        onChangeTabIconTabBar(oEvent) {
          const sTabKey = oEvent.getParameters().key;
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("tab", { tabKey: sTabKey });

          const oModelSelect = this.getView().getModel("viewModel");
          oModelSelect.setProperty("/selectedTab", sTabKey);
        },

        onNavigateToProductPage(oEvent) {
          const oRow = oEvent.getSource();
          const oRouter = this.getOwnerComponent().getRouter();
          const sProductId = oRow.getBindingContext("ODataV2").getObject().ID;

          oRouter.navTo("Product", {
            ProductId: window.encodeURIComponent(sProductId),
          });
        },
      })
    );
  }
);
