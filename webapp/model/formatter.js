sap.ui.define([], () => {
  "use strict";

  return {
    formatDate(sDate) {
      const oBundle = this.getView().getModel("i18n").getResourceBundle();
      const nPublishedYear = new Date(sDate).getFullYear();

      if (!sDate) return;

      return oBundle.getText("published", [`${nPublishedYear}`]);
    },
  };
});
