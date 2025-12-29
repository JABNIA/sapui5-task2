sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  (Controller, MessageToast) => {
    return Controller.extend("project1.controller.BaseController", {
      getModel(sName) {
        return this.getView().getModel(sName);
      },

      getI18n(sText, sIds) {
        return this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText(sText, [sIds]);
      },

      _validateControlsOfNewRecordCreationDialogs(sControlID) {
        const aAddRecordInputs = this.byId(sControlID)
          .getContent()[0]
          .getItems()
          .filter((oControl) => {
            if (oControl.getRequired()) return oControl;
          });
        let bIsValid = true;

        aAddRecordInputs.forEach((oControl) => {
          let bValidValue;
          if (oControl.isA("sap.m.Input")) {
            bValidValue = this._validateInput(oControl);
          }
          if (oControl.isA("sap.m.DatePicker")) {
            bValidValue = this._validateInput(oControl);
          }
          if (!bValidValue) bIsValid = false;
        });
        return bIsValid;
      },

      _validateInput(oControl) {
        const sValue = oControl.getValue();
        let bIsValid = true;
        //had to add this check because date picker would trew error and brake the execution
        if (!oControl.isA("sap.m.DatePicker")) {
          if (oControl.getType() === "Number") {
            if (
              oControl.getLabels()[0].getText() ===
              this.getI18n("EnterProductRating")
            ) {
              if (Number(sValue) < 0 || Number(sValue) > 5) {
                bIsValid = false;
              }
            }
            if (
              oControl.getLabels()[0].getText() ===
                this.getI18n("EnterProductPrice") ||
              oControl.getLabels()[0].getText() ===
                this.getI18n("enterAvailableQuantity")
            ) {
              if (Number(sValue) <= 0) {
                bIsValid = false;
              }
            }
          }
        }
        console.log(oControl.getId());
        if (!sValue) bIsValid = false;

        if (!bIsValid) {
          oControl.setValueState("Error");
        } else {
          oControl.setValueState("None");
        }
        return bIsValid;
      },

      _clearValueState(sControlID) {
        const aAddOdataInputs = this.byId(sControlID)
          .getContent()[0]
          .getItems()
          .filter((oControl) => {
            if (oControl.getRequired()) return oControl;
          });
        aAddOdataInputs.forEach((oControl) => {
          oControl.setValueState("None");
        });
      },

      onInputFieldValueChange(oEvent) {
        const oControl = oEvent.getSource();

        if (this._validateInput(oControl)) {
          oControl.setValueState("None");
        } else {
          oControl.setValueState("Error");
        }
      },

      onTableItemSelected(oEvent) {
        const aTableListItems = oEvent.getSource().getSelectedItems();

        if (!aTableListItems.length) {
          this._oViewModel.setProperty("/enableDeleteBtn", false);
        } else {
          this._oViewModel.setProperty("/enableDeleteBtn", true);
        }
      },

      _showMessageForSuccessfullEvents(sMessage, aIds) {
        MessageToast.show(this.getI18n(sMessage, aIds));
      },
    });
  }
);
