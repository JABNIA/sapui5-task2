sap.ui.define(
  ["sap/ui/model/Filter", "sap/ui/model/FilterOperator"],
  (Filter, FilterOperator) => {
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

      validateJSONModelRecord() {
        const aDialogInputs = this.byId("addRecordDialog")
          .getContent()[0]
          .getItems()
          .filter((oControl) => {
            if (oControl.getRequired()) return oControl;
          });
        let bIsValid = true;

        aDialogInputs.forEach((oControl) => {
          let bIsControlValid;
          if (oControl.isA("sap.m.Input")) {
            if (
              oControl.getLabels()[0].getText() ===
              this.i18n("enterAvailableQuantity")
            ) {
              bIsControlValid = this._validateQuantityField(oControl);
            }
            bIsControlValid = this._validateInputField(oControl);
          }
          if (oControl.isA("sap.m.DatePicker")) {
            bIsControlValid = this._validateInputField(oControl);
          }
          console.log(bIsControlValid);

          if (!bIsControlValid) bIsValid = false;
        });

        return bIsValid;
      },

      _validateInputField(oControl) {
        const bValid = oControl.getValue();
        if (!bValid) {
          oControl.setValueState("Error");
        } else {
          oControl.setValueState("None");
        }
        return bValid;
      },

      _validateQuantityField(oControl) {
        const bValid = oControl.getValue();

        if (!bValid) {
          oControl.setValueState("Error");
        } else {
          oControl.setValueState("None");
        }
        return bValid;
      },

      onEnterInputValueChange(oEvent) {
        const sInputValue = oEvent.getSource().getValue();

        if (!sInputValue) {
          oEvent.getSource().setValueState("Error");
        } else {
          oEvent.getSource().setValueState("None");
        }
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

        if (!this.validateJSONModelRecord()) return;

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

        if (oSelectedItemsId.length === 0) {
          this.oDeleteDialog.close();

          alert("First please select Record You want to delete");

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
        const bookId = oEvent
          .getSource()
          .getBindingContext("Book")
          .getObject().id;

        this.getModel("viewModel").setProperty("/titleEdit", {
          isVisible: !this.getModel("viewModel").getProperty(
            "/titleEdit/isVisible"
          ),
          id: bookId,
        });
      },

      async onOpenDeleteDialog() {
        this.oDeleteDialog ??= await this.loadFragment({
          name: "project1.fragment.DeleteDialog",
        });

        this.oDeleteDialog.open();
      },
    };
  }
);
