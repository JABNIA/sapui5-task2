sap.ui.define(
  ["sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/m/MessageBox"],
  (Filter, FilterOperator, MessageBox) => {
    "use strict";
    return {
      async onOpenAddRecordDialog() {
        this.oAddRecordDialog ??= await this.loadFragment({
          name: "project1.fragment.AddRecordDialog",
        });

        this._setNewEmptyObject();

        this.oAddRecordDialog.bindElement({
          path: "/newObject",
          model: "viewModel",
        });
        this.oAddRecordDialog.open();
      },

      _setNewEmptyObject() {
        const oModel = this.getModel("viewModel");
        const oNewObject = {
          name: "",
          author: "",
          genre: "",
          releasedate: "",
          availablequantity: null,
        };

        oModel.setProperty("/newObject", oNewObject);
      },

      onAddRecordJSONmodel() {
        const oModel = this.getModel("Book");
        const aBooks = oModel.getProperty("/books");

        const oNewRow = this.getModel("viewModel").getProperty("/newObject");

        if (!this._validateDialogControls("addRecordDialog")) return;

        aBooks.push(oNewRow);
        oModel.setProperty("/books", aBooks);
        this.oAddRecordDialog.close();
      },

      onDeleteRecord() {
        const oTable = this.getView().byId("bookTable");
        const oBooks = this.getModel("Book").getProperty("/books");
        const oSelectedItemsId = oTable.getSelectedItems().map((item) => {
          return item.getBindingContext("Book").getObject().id;
        });

        if (!oSelectedItemsId.length) {
          this.oDeleteDialog.close();

          MessageBox.error(this.getI18n("deletionWhenNothingIsSelected"));

          return;
        }
        const aFilteredBooks = oBooks.filter((book) => {
          return !oSelectedItemsId.includes(book.id);
        });

        const oModel = this.getOwnerComponent().getModel("Book");

        oModel.setProperty("/books", aFilteredBooks);
        oTable.removeSelections(true);
        this.oDeleteDialog.close();
      },

      onApplyFilters() {
        const aFilter = [];
        const sTitle = this.byId("searchInput").getValue();
        const sSelectedGenre = this.byId("genreSelect").getSelectedKey();

        if (sSelectedGenre && sSelectedGenre !== "All") {
          aFilter.push(
            new Filter("genre", FilterOperator.Contains, sSelectedGenre)
          );
        }
        if (sTitle) {
          aFilter.push(new Filter("name", FilterOperator.Contains, sTitle));
        }

        const oList = this.byId("bookTable");
        const oBinding = oList.getBinding("items");

        oBinding.filter(aFilter);
      },

      onEditTitle(oEvent) {
        const sBookId = oEvent
          .getSource()
          .getBindingContext("Book")
          .getObject("id");

        this.getModel("viewModel").setProperty("/titleEdit", {
          isVisible: !this.getModel("viewModel").getProperty(
            "/titleEdit/isVisible"
          ),
          id: sBookId,
        });
      },

      async onOpenDeleteDialog() {
        this.oDeleteDialog ??= await this.loadFragment({
          name: "project1.fragment.DeleteDialog",
        });

        this.oDeleteDialog.open();
      },

      onCloseJSONModelDeleteRecordDialog() {
        this.oDeleteDialog.close();
      },

      onCloseJSONModelAddRecordDialog() {
        this.oAddRecordDialog.close();
        this._clearValueState("addRecordDialog");
      },
    };
  }
);
