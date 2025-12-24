sap.ui.define(
  [
    "sap/ui/model/Sorter",
    "sap/ui/model/Filter",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  (Sorter, Filter, MessageToast, MessageBox) => {
    "use strict";

    return {
      async onOpenAddV2RecordFragment(oEvent) {
        const oContext = oEvent.getSource().getBindingContext("ODataV2");
        const oEditModel = this.getModel("viewModel");
        const oEditMode = oEditModel.getProperty("/editMode");

        this.oAddV2RecordDialog ??= await this.loadFragment({
          name: "project1.fragment.AddV2RecordDialog",
        });

        if (oContext && oEditMode) {
          this.oAddV2RecordDialog.setBindingContext(oContext, "ODataV2");
          this.oAddV2RecordDialog.open();
          oEditModel.setProperty("/editMode", false);

          return;
        }

        const oModel = this.getModel("ODataV2");

        const oNewContext = oModel.createEntry("/Products");

        this.oAddV2RecordDialog.setBindingContext(oNewContext, "ODataV2");
        this.oAddV2RecordDialog.open();
      },

      onDeleteRecordButtonClick() {
        MessageBox.confirm("Are you sure you want to remove this Record?", {
          title: "Confirm Deletion",
          onClose: (sAction) => {
            if ((sAction = sap.m.MessageBox.Action.YES)) this._deleteV2Record();
          },
          actions: [
            sap.m.MessageBox.Action.YES,
            sap.m.MessageBox.Action.CANCEL,
          ],
        });
      },

      _deleteV2Record() {
        const oTable = this.byId("productTable");
        const itemIdArr = oTable.getSelectedItems().map((item) => {
          return item.getBindingContext("ODataV2").getObject()["ID"];
        });
        const oModel = this.getModel("ODataV2");

        itemIdArr.forEach((id) => {
          const sPath = `/Products(${id})`;

          oModel.remove(sPath, {
            success: () => {
              const oBundle = this.getView()
                .getModel("i18n")
                .getResourceBundle();
              const msg = oBundle.getText("successMessage");
              MessageToast.show(`${msg}`);
            },
            error: () => {
              const oBundle = this.getView()
                .getModel("i18n")
                .getResourceBundle();
              const msg = oBundle.getText("errorMessage");
              MessageBox.error(`${msg}`);
            },
          });
        });
      },

      onAddV2ModelRecord(oEvent) {
        const oBundle = this.getModel("i18n").getResourceBundle();
        const oModel = this.getModel("ODataV2");
        const oContext = oEvent.getSource().getBindingContext("ODataV2");

        if (!this._validateODataModelRecord("addV2RecordDialog")) return;

        oModel.submitChanges({
          success: () =>
            MessageToast.show(oBundle.getText("recordSuccessfullyAdded")),
          error: () => MessageBox.error(oBundle.getText("errorMessage")),
        });

        this.oAddV2RecordDialog.close();
      },

      onOpenEditV2ModelRecord(oEvent) {
        const editModeModel = this.getModel("viewModel");
        editModeModel.setProperty("/editMode", true);

        this.onOpenAddV2RecordFragment(oEvent);
      },

      onInputSearch() {
        const aFilter = [];
        const searchValue = this.byId("searchField").getValue();

        if (searchValue) {
          aFilter.push(
            new Filter({
              path: "Name",
              operator: FilterOperator.Contains,
              value1: searchValue,
              caseSensitive: false,
            })
          );
        }
        const oList = this.byId("productTable");
        const oBindign = oList.getBinding("items");

        oBindign.filter(aFilter);
      },

      onSorterSelect() {
        const oTable = this.byId("productTable");
        const comboBoxValue = this.byId("sorterSelection").getValue();
        let sorterValue = "";

        switch (comboBoxValue) {
          case this.i18n("products"):
            sorterValue = "Name";
            break;
          case this.i18n("description"):
            sorterValue = "Description";
            break;
          case this.i18n("releaseDate"):
            sorterValue = "ReleaseDate";
            break;
          case this.i18n("discontinuedDate"):
            sorterValue = "DiscontinuedDate";
            break;
          case this.i18n("rating"):
            sorterValue = "Rating";
            break;
          case this.i18n("price"):
            sorterValue = "Price";
            break;
          default:
            sorterValue = "";
            break;
        }

        const oSorter = new Sorter({
          path: sorterValue,
          descending: true,
        });

        oTable.getBinding("items").sort(oSorter);
      },
    };
  }
);
