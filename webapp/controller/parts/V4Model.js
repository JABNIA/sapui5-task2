sap.ui.define(
  ["sap/m/MessageToast", "sap/m/MessageBox"],
  (MessageToast, MessageBox) => {
    "use strict";

    return {
      onOpenDeleteV4RecordFragment() {
        console.log(MessageBox.Action.YES);
        MessageBox.confirm(this.i18n("selectRecordToDelete"), {
          actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],

          emphasizedAction: MessageBox.Action.CANCEL,

          onClose: function (sAction) {
            if (sAction === MessageBox.Action.YES) {
              this.onClickDeleteV4Record();
            }
          }.bind(this),
        });
      },

      onClickDeleteV4Record() {
        const oTable = this.byId("V4dataTable");
        const aSelectedItems = oTable.getSelectedItems();

        const aSelectedItemIds = aSelectedItems.map((item) => {
          return item.getBindingContext("ODataV4").getObject().ID;
        });

        if (aSelectedItems.length > 1) {
          aSelectedItems.forEach((item) => {
            const oContext = item.getBindingContext("ODataV4");
            oContext.delete("Deletion");
          });
        } else {
          aSelectedItems[0].getBindingContext("ODataV4").delete();
        }

        const oModel = this.getOwnerComponent().getModel("ODataV4");
        const oViewModel = this.getModel("viewModel");

        oViewModel.setProperty("/enableDeleteBtn", false);

        oModel
          .submitBatch("Deletion")
          .then(() => {
            MessageToast.show(
              this.i18n("recordSuccessfullyDeleted", [
                aSelectedItemIds.join(", "),
              ])
            );
          })
          .catch(() => {
            MessageBox.error(this.i18n("errorMessage"));
          });
      },

      onItemTableSelected() {
        const oModel = this.getModel("viewModel");
        const oTable = this.byId("V4dataTable");
        const aSelectedItems = oTable.getSelectedItems();

        if (aSelectedItems.length === 0) {
          oModel.setProperty("/enableDeleteBtn", false);
          return;
        }

        oModel.setProperty("/enableDeleteBtn", true);
      },

      async onOpenAddV4RecordDialog(oEvent) {
        this.oAddV4RecordDialog ??= await this.loadFragment({
          name: "project1.fragment.AddV4RecordDialog",
        });

        const editMode = this.getModel("viewModel").getProperty("/editMode");

        if (editMode) {
          console.log(editMode);
          const oContext = oEvent.getSource().getBindingContext("ODataV4");
          this.oAddV4RecordDialog.setBindingContext(oContext, "ODataV4");

          this.oAddV4RecordDialog.open();
          return;
        }

        const oTable = this.getView().byId("V4dataTable");
        const oModel = oTable.getBinding("items");

        const oAddContext = oModel.create({}, false, true);

        this.oAddV4RecordDialog.setBindingContext(oAddContext, "ODataV4");
        this.oAddV4RecordDialog.open();
      },

      onAddV4ModelRecord(oEvent) {
        const oModel = this.getOwnerComponent().getModel("ODataV4");
        const oContext = oEvent
          .getSource()
          .getParent()
          .getBindingContext("ODataV4");

        if (!this._validateODataModelRecord("addV4RecordDialog")) return;

        oModel.submitBatch("newEntityCreation");
        this.oAddV4RecordDialog.close();
      },

      onEditV4ModelRecord(oEvent) {
        const viewModel = this.getModel("viewModel");

        viewModel.setProperty("/editMode", true);

        this.onOpenAddV4RecordDialog(oEvent);
      },
    };
  }
);
