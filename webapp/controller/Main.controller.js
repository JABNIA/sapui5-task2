sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/model/Sorter",
        "sap/ui/core/routing/HashChanger",
    ],
    (
        BaseController,
        JSONModel,
        Filter,
        FilterOperator,
        MessageToast,
        MessageBox,
        Sorter,
        HashChanger
    ) => {
        "use strict";

        return BaseController.extend("project1.controller.Main", {
            onInit() {
                //JSONModel for books
                const oBookModel = this.getOwnerComponent().getModel("Book");
                //Genres for select control
                const genres = new Set(
                    oBookModel.getData().books.map((book) => book.genre)
                );

                const genresArray = Array.from(["All", ...genres]);
                const genresObjArray = genresArray.map((genre) => {
                    return { key: genre, text: genre };
                });

                //add new model values here
                const viewModel = new JSONModel({
                    titleEdit: { isVisible: false, id: "" },
                    editMode: false,
                    selectedTab: "",
                    genres: genresObjArray,
                    newObject: {},
                    enableDeleteBtn: false,
                });

                this.getView().setModel(viewModel, "viewModel");

                const hashParameter = HashChanger.getInstance();

                if (hashParameter) {
                    const tabKey = hashParameter.getHash().substring(4);
                    viewModel.setProperty("/selectedTab", tabKey);
                }
            },

            _setNewEmptyObject() {
                const oModel = this.getModel("viewModel");
                const newObjcet = {
                    name: "",
                    author: "",
                    genre: "",
                    releasedate: "",
                    availablequantity: null,
                };

                oModel.setProperty("/newObject", newObjcet);
            },

            onAddRecord() {
                const oModel = this.getModel("Book");
                const aBooks = oModel.getProperty("/books");

                const oNewRow =
                    this.getModel("viewModel").getProperty("/newObject");

                if (this.validateJSONModelRecord(oNewRow) !== true) return;

                aBooks.push(oNewRow);
                oModel.setProperty("/books", aBooks);
                this.AddRecordDialog.close();
            },

            onDeleteRecord() {
                const oTable = this.getView().byId("bookTable");
                const oBooks = this.getModel("Book").getProperty("/books");
                const oSelectedItemsId = oTable
                    .getSelectedItems()
                    .map((item) => {
                        return item.getBindingContext("Book").getObject().id;
                    });

                if (oSelectedItemsId.length === 0) {
                    this.oDeleteDialog.close();

                    alert("First please select Record You want to delete");

                    return;
                }
                const filteredBooks = oBooks.filter((book) => {
                    return !oSelectedItemsId.includes(book.id);
                });

                const oModel = this.getOwnerComponent().getModel("Book");

                oModel.setProperty("/books", filteredBooks);
                oTable.removeSelections(true);
                this.oDeleteDialog.close();
            },

            onApplyFilters() {
                const aFilter = [];
                const sTitle = this.byId("searchInput").getValue();
                const sSelectedGenre =
                    this.byId("genreSelect").getSelectedKey();

                if (sSelectedGenre && sSelectedGenre !== "All") {
                    aFilter.push(
                        new Filter(
                            "genre",
                            FilterOperator.Contains,
                            sSelectedGenre
                        )
                    );
                }
                if (sTitle) {
                    aFilter.push(
                        new Filter("name", FilterOperator.Contains, sTitle)
                    );
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

            onCloseDialog(oEvent) {
                const dyalogType = oEvent.getSource().data("dialogType");
                const oModel = this.getModel("ODataV2");
                const oContext = oEvent
                    .getSource()
                    .getBindingContext("ODataV2");
                const resetPath = oContext ? oContext.getPath() : null;

                if (dyalogType === "Delete") {
                    this.oDeleteDialog.close();
                }
                if (dyalogType === "AddRecord") {
                    this.AddRecordDialog.close();
                }
                if (dyalogType === "AddV2Record") {
                    const oEditMode = this.getModel("viewModel");
                    oEditMode.setProperty("/editMode", false);
                    oModel.resetChanges([resetPath]);

                    this.AddV2RecordDialog.close();
                }
                if (dyalogType === "DeleteV4") {
                    this.DeleteV4RecordDialog.close();
                }
                this.byId("ProductName").setValueState("None");
                this.byId("ProductDescription").setValueState("None");
                this.byId("ProductReleaseDate").setValueState("None");
                this.byId("ProductRating").setValueState("None");
                this.byId("ProductPrice").setValueState("None");
            },

            async onOpenAddRecordDialog() {
                this.AddRecordDialog ??= await this.loadFragment({
                    name: "project1.fragment.AddRecordDialog",
                });

                this._setNewEmptyObject();

                this.AddRecordDialog.bindElement({
                    path: "/newObject",
                    model: "viewModel",
                });
                this.AddRecordDialog.open();
            },

            async onOpenAddV2RecordFragment(oEvent) {
                const oContext = oEvent
                    .getSource()
                    .getBindingContext("ODataV2");
                const oEditModel = this.getModel("viewModel");
                const oEditMode = oEditModel.getProperty("/editMode");

                this.AddV2RecordDialog ??= await this.loadFragment({
                    name: "project1.fragment.AddV2RecordDialog",
                });

                if (oContext && oEditMode) {
                    this.AddV2RecordDialog.setBindingContext(
                        oContext,
                        "ODataV2"
                    );
                    this.AddV2RecordDialog.open();
                    oEditModel.setProperty("/editMode", false);

                    return;
                }

                const oModel = this.getModel("ODataV2");

                const oNewContext = oModel.createEntry("/Products", {
                    groupId: "changes",
                    properties: {
                        Name: "",
                        Description: "",
                        ReleaseDate: null,
                        DiscontinuedDate: null,
                        Rating: null,
                        Price: null,
                    },
                });

                this.AddV2RecordDialog.setBindingContext(
                    oNewContext,
                    "ODataV2"
                );
                this.AddV2RecordDialog.open();
            },

            onDeleteV2Record() {
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

            onAddV2Record(oEvent) {
                const oBundle = this.getModel("i18n").getResourceBundle();
                const oModel = this.getModel("ODataV2");
                const oContext = oEvent
                    .getSource()
                    .getBindingContext("ODataV2");

                if (this.validateV2Record(oContext.getObject()) !== true)
                    return;
                oModel.submitChanges({
                    success: () =>
                        MessageToast.show(
                            oBundle.getText("recordSuccessfullyAdded")
                        ),
                    error: () =>
                        MessageBox.error(oBundle.getText("errorMessage")),
                });

                this.AddV2RecordDialog.close();
            },

            onOpenEditV2Record(oEvent) {
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

            onTabPress(oEvent) {
                const sTabKey = oEvent.getParameters().key;
                const oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("tab", { tabKey: sTabKey });

                const oModelSelect = this.getView().getModel("viewModel");
                oModelSelect.setProperty("/selectedTab", sTabKey);
            },

            onProductPage(oEvent) {
                const oRow = oEvent.getSource();
                const oRouter = this.getOwnerComponent().getRouter();
                const sProductId = oRow
                    .getBindingContext("ODataV2")
                    .getObject().ID;

                oRouter.navTo("Product", {
                    ProductId: window.encodeURIComponent(sProductId),
                });
            },
            
            onOpenDeleteV4RecordFragment() {
                MessageBox.confirm(this.i18n("selectRecordToDelete"), {

                    actions: [MessageBox.Action.YES, MessageBox.Action.CANCEL],
                    
                    emphasizedAction: MessageBox.Action.CANCEL,
                    
                    onClose: function(sAction) {
                        if(sAction === MessageBox.Action.YES){
                            this.onClickDeleteV4Record()
                        }
                    }.bind(this)
                });
            },

            onClickDeleteV4Record() {
                const oTable = this.byId("V4dataTable");
                const aSelectedItems = oTable.getSelectedItems();
            
                const aSelectedItemIds = aSelectedItems.map((item) => {
                    return item.getBindingContext("ODataV4").getObject().ID;
                });
                
                if(aSelectedItems.length > 1){
                    aSelectedItems.forEach((item) => {
                        const oContext = item.getBindingContext("ODataV4");
                        oContext.delete("Deletion");
                    });
                }else{
                    aSelectedItems[0].getBindingContext("ODataV4").delete();
                }
                
                const oModel = this.getOwnerComponent().getModel("ODataV4");
                const oViewModel = this.getModel("viewModel");

                oViewModel.setProperty("/enableDeleteBtn", false)

                oModel
                    .submitBatch("Deletion")
                    .then(() => {
                        MessageToast.show(this.i18n('recordSuccessfullyDeleted', [aSelectedItemIds.join(", ")]));
                    })
                    .catch(() => {
                        MessageBox.error(this.i18n("errorMessage"));
                    });
            },

            onTableItemSelected() {
                const oModel = this.getModel("viewModel");
                const oTable = this.byId("V4dataTable");
                const aSelectedItems = oTable.getSelectedItems();
                
                if(aSelectedItems.length === 0){
                    oModel.setProperty("/enableDeleteBtn", false)
                    return;
                }

                oModel.setProperty("/enableDeleteBtn", true)
            }
        });
    }
);
