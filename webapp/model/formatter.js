sap.ui.define([], () => {
    "use strict";

    return {
        formatDate(sDate) {
            const oBundle = this.getView().getModel("i18n").getResourceBundle();

            if (sDate !== null) return oBundle.getText("published", [sDate.substring(0, 4)]);
        },
    };
});
