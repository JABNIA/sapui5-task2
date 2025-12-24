sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  (Controller, MessageToast) => {
    return Controller.extend("project1.controller.BaseController", {
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },
      i18n: function (sText, sIds) {
        return this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText(sText, sIds);
      },

      _validateODataModelRecord(sControlID) {
        const aAddOdataInputs = this.byId(sControlID)
          .getContent()[0]
          .getItems()
          .filter((oControl) => {
            if (oControl.getRequired()) return oControl;
          });
        let bIsValid = true;

        aAddOdataInputs.forEach((oControl) => {
          let bValidValue;
          if (oControl.isA("sap.m.Input")) {
            if (oControl.getType() === "Number") {
              bValidValue = this._validateQuantityInputs(oControl);
            } else {
              bValidValue = this._validateInput(oControl);
            }
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

        if (!sValue) {
          oControl.setValueState("Error");
        } else {
          oControl.setValueState("None");
        }
        return sValue;
      },

      _validateQuantityInputs(oControl) {
        const sValue = oControl.getValue();
        let bIsValid = true;
        if (
          oControl.getLabels()[0].getText() === this.i18n("EnterProductRating")
        ) {
          if (Number(sValue) > 0 && Number(sValue) <= 5) {
            console.log(oControl);
            oControl.setValueState("None");
          } else {
            oControl.setValueState("Error");
            bIsValid = false;
          }
        } else if (
          oControl.getLabels()[0].getText() === this.i18n("EnterProductPrice")
        ) {
          if (Number(sValue) <= 0) {
            console.log(typeof sValue);
            oControl.setValueState("Error");
            bIsValid = false;
          } else {
            oControl.setValueState("None");
          }
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
        if (oControl.getType() === "Number") {
          if (this._validateQuantityInputs(oControl)) {
            oControl.setValueState("None");
          } else {
            oControl.setValueState("Error");
          }
        } else {
          if (!this._validateInput(oControl)) {
            oControl.setValueState("Error");
          } else {
            oControl.setValueState("None");
          }
        }
      },
    });
  }
);
