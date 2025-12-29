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
        MessageBox.confirm(this.getI18n("deleteRecordWarningMessage"), {
          title: this.getI18n("confirmDeletion"),
          onClose: (sAction) => {
            if ((sAction = MessageBox.Action.YES)) this._deleteV2Record();
          },
          actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
        });
      },

      _deleteV2Record() {
        const oTable = this.byId("productTable");
        const aItemId = oTable.getSelectedItems().map((item) => {
          return item.getBindingContext("ODataV2").getObject()["ID"];
        });
        const oModel = this.getModel("ODataV2");

        aItemId.forEach((id) => {
          const sPath = `/Products(${id})`;

          oModel.remove(sPath, {
            success: () => {
              this._showMessageForSuccessfullEvents(
                "recordSuccessfullyDeleted",
                aItemId.join(", ")
              );
            },
            error: () => {
              MessageBox.error(this.getI18n("errorMessage"));
            },
          });
        });
      },

      onAddV2ModelRecord(oEvent) {
        const oBundle = this.getModel("i18n").getResourceBundle();
        const oModel = this.getModel("ODataV2");
        const oContext = oEvent.getSource().getBindingContext("ODataV2");

        if (
          !this._validateControlsOfNewRecordCreationDialogs("addV2RecordDialog")
        )
          return;

        oModel.submitChanges({
          success: () =>
            _showMessageForSuccessfullEvents("recordSuccessfullyAdded"),
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
        const sSelectedKey = this.byId("sorterSelection").getSelectedKey();

        const oSorter = new Sorter({
          path: sSelectedKey,
          descending: true,
        });

        oTable.getBinding("items").sort(oSorter);
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
    };
  }
);
