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
          const oViewModel = new JSONModel({
            titleEdit: { isVisible: false, id: "" },
            editMode: false,
            selectedTab: "",
            genres: aGenresObjArray,
            newObject: {},
            enableDeleteBtn: false,
          });

          this.getView().setModel(oViewModel, "viewModel");

          const oHhashParameter = HashChanger.getInstance();

          if (oHhashParameter) {
            const tabKey = oHhashParameter.getHash().substring(4);
            oViewModel.setProperty("/selectedTab", tabKey);
          }
        },

        onCloseJSONModelDeleteRecordDialog() {
          this.oDeleteDialog.close();
        },

        onCloseJSONModelAddRecordDialog() {
          this.oAddRecordDialog.close();
          this._clearValueState("addRecordDialog");
        },

        onCloseV2ModelAddRecordDialog(oEvent) {
          const oModel = this.getModel("ODataV2");
          const oContext = oEvent.getSource().getBindingContext("ODataV2");
          const resetPath = oContext ? oContext.getPath() : null;
          const oEditMode = this.getModel("viewModel");
          oEditMode.setProperty("/editMode", false);
          oModel.resetChanges([resetPath]);

          this._clearValueState("addV2RecordDialog");
          this.oAddV2RecordDialog.close();
        },

        onCloseV4ModelAddRecordDialog() {
          const oModel = this.getOwnerComponent().getModel("ODataV4");

          oModel.resetChanges("newEntityCreation");
          this.oAddV4RecordDialog.close();
          this._clearValueState("addV4RecordDialog");
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
