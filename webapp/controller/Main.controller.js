sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/model/Sorter",
        "sap/ui/core/routing/HashChanger"

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
                const oBookModel = new JSONModel();

                oBookModel.loadData("model/books.json");

                this.getView().setModel(oBookModel, "bookData");
                
                oBookModel.attachRequestCompleted(() => {
                    const genres = new Set(
                        oBookModel.getData().books.map((book) => book.genre)
                    );

                    const genresArray = Array.from(["All", ...genres]);

                    const oGenreModel = new JSONModel({
                        bookGenres: genresArray.map((genre) => {
                            return { key: genre, text: genre };
                        }),
                    });
                    this.getView().setModel(oGenreModel, "gernes");
                });

                // this is for example then ill put here other models too))

                const viewModel = new JSONModel(
                    {
                        titleEdit: {isVisible: false, id: ""},
                        editMode: false,
                        selectedTab: "",
                    }
                );

                this.getView().setModel(viewModel, "viewModel");
                const hashParameter = HashChanger.getInstance();
                console.log(hashParameter.getHash())

                if(hashParameter) {
                    const tabKey = hashParameter.getHash().substring(4);
                    viewModel.setProperty("/selectedTab", tabKey)
                }
            },

            onAddRecord() {
                const oModel = this.getModel("bookData");
                const aBooks = oModel.getProperty("/books");

                const oNewRow = {
                    id: `B0${aBooks.length + 1}`,
                    name: this.byId("bookName").getValue(),
                    author: this.byId("bookAuthor").getValue(),
                    genre: this.byId("bookGenre").getValue(),
                    releasedate: this.byId("bookReleaseDate").getValue(),
                    availablequantity: this.byId(
                        "bookAvailableQuantity"
                    ).getValue(),
                };

                if (
                    !oNewRow.name ||
                    !oNewRow.author ||
                    !oNewRow.genre ||
                    !oNewRow.releasedate ||
                    !oNewRow.availablequantity
                ) {
                    const oBundle = this.getView()
                        .getModel("i18n")
                        .getResourceBundle();

                    if (oNewRow.name === "") {
                        const msg = oBundle.getText("warningNameField");
                        console.log(msg);
                        MessageToast.show(`${msg}`);
                    }
                    if (oNewRow.author === "") {
                        const msg = oBundle.getText("warningAuthorField");
                        MessageToast.show(`${msg}`);
                    }
                    if (oNewRow.genre === "") {
                        const msg = oBundle.getText("warningGenreField");
                        MessageToast.show(`${msg}`);
                    }
                    if (oNewRow.releasedate === "") {
                        const msg = oBundle.getText("warningReleaseDateField");
                        MessageToast.show(`${msg}`);
                    }
                    if (oNewRow.availablequantity === "") {
                        const msg = oBundle.getText(
                            "warningAvailableQuantityField"
                        );
                        MessageToast.show(`${msg}`);
                    }
                    return;
                }

                this.byId("bookName").setValue("");
                this.byId("bookAuthor").setValue("");
                this.byId("bookGenre").setValue("");
                this.byId("bookReleaseDate").setValue("");
                this.byId("bookAvailableQuantity").setValue("");

                aBooks.push(oNewRow);
                oModel.setProperty("/books", aBooks);
                this.AddRecordDialog.close();
            },

            onDeleteRecord() {
                const oTable = this.getView().byId("bookTable");
                const oBooks = this.getModel("bookData").getProperty("/books");
                const oSelectedItemsId = oTable
                    .getSelectedItems()
                    .map((item) => {
                        return item.getBindingContext("bookData").getObject()
                            .id;
                    });
                console.log(oSelectedItemsId);

                if (oSelectedItemsId.length === 0) {
                    this.oDeleteDialog.close();

                    alert("First please select Record You want to delete");

                    return;
                }
                const filteredBooks = oBooks.filter((book) => {
                    return !oSelectedItemsId.includes(book.id);
                });

                const oModel = new JSONModel();

                oModel.setProperty("/books", filteredBooks);

                this.oDeleteDialog.close();
            },

            onApplyFilters() {
                const aFilter = [];
                const sTitle = this.byId("searchInput").getValue();
                const sSelectedGenre =
                    this.byId("genreSelect").getSelectedKey();

                console.log(sSelectedGenre, sTitle);
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
                    .getBindingContext("bookData")
                    .getObject().id;

                this.getModel("viewModel").setProperty(
                    "/titleEdit",{
                        isVisible: !this.getModel("viewModel").getProperty("/titleEdit/isVisible"),
                        id: bookId
                    }
                );
            },

            async onOpenDeleteDialog() {
                this.oDeleteDialog ??= await this.loadFragment({
                    name: "project1.view.DeleteDialog",
                });

                this.oDeleteDialog.open();
            },

            onCloseDialog(oEvent) {
                const dyalogType = oEvent.getSource().data("dialogType");

                if (dyalogType === "Delete") {
                    this.oDeleteDialog.close();
                }
                if (dyalogType === "AddRecord") {
                    this.AddRecordDialog.close();
                }
                if (dyalogType === "AddV2Record") {
                    const oEditMode = this.getModel("viewModel");
                    oEditMode.setProperty("/editMode", false)

                    this.AddV2RecordDialog.close();
                }
            },

            async onOpenAddRecordDialog() {
                this.AddRecordDialog ??= await this.loadFragment({
                    name: "project1.view.AddRecordDialog",
                });

                this.AddRecordDialog.open();
            },

            async onOpenAddV2RecordFragment(oEvent) {
                const oContext = oEvent.getSource().getBindingContext("ODataV2");
                const oEditMode = this.getModel("viewModel").getProperty("/editMode");

                this.AddV2RecordDialog ??= await this.loadFragment({
                    name: "project1.view.AddV2RecordDialog",
                });

                if(oContext && oEditMode){
                    this.AddV2RecordDialog.setBindingContext(oContext, "ODataV2")
                    this.AddV2RecordDialog.open();
                    return;
                }

                const oModel = this.getModel("ODataV2")
                const oNewContext = oModel.createEntry("/Products", {properties: {
                    Name: "", Description: "", ReleaseDate: null, DiscontinuedDate: null, Rating: 0, Price: 0
                }})
                oModel.submitChanges({
                    success: () => console.log("entry created"),
                    error: () => console.log("something went wrong")
                }
                )
                oNewContext.created().then(() => {    
                    this.AddV2RecordDialog.setBindingContext(oNewContext, "ODataV2")
                    this.AddV2RecordDialog.open();
                }
                )
                console.log(oNewContext);
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

            async onAddV2Record(oEvent) {
                const oBundle = this.getModel("i18n").getResourceBundle();
                const oModel = this.getModel("ODataV2");
                const oEditModel = this.getModel("viewModel")
                const {isEditMode} = oEditModel.getProperty("/editMode");
                
                if (isEditMode) {
                    const oContext = oEvent.getSource().getBindingContext("ODataV2")

                    const updatedData = {
                        Name: this.byId("ProductName").getValue(),
                        ReleaseDate: `/Date(${new Date(
                            this.byId("ProductReleaseDate").getDateValue()
                        ).getTime()})/`,
                        DiscontinuedDate: `/Date(${new Date(
                            this.byId("ProductDiscontinuedDate").getDateValue()
                        ).getTime()})/`,
                        Description: this.byId("ProductDescription").getValue(),
                        Rating: this.byId("ProductRating").getValue(),
                        Price: this.byId("ProductPrice").getValue(),
                    };

                    if (this.validateV2Record(updatedData) !== true) {
                        return
                    }else {
                        console.log("enters here")
                        oModel.update(oContext.getPath(), updatedData)
                        oEditModel.setProperty("/editMode", false)
                        this.AddV2RecordDialog.close()
                        return;
                    };
                }
                const newEntityObj = {
                    Name: this.byId("ProductName").getValue(),
                    ReleaseDate: this.byId("ProductReleaseDate").getDateValue(),
                    DiscontinuedDate:this.byId("ProductDiscontinuedDate").getDateValue(),
                    Description: this.byId("ProductDescription").getValue(),
                    Rating: this.byId("ProductRating").getValue(),
                    Price: this.byId("ProductPrice").getValue(),
                };

                if (this.validateV2Record(newEntityObj) !== true) return;
                
                const oContext = oEvent.getSource().getBindingContext("ODataV2")
                oContext.setProperty("Name", newEntityObj.Name)
                oContext.setProperty("Description", newEntityObj.Description)
                oContext.setProperty("ReleaseDate", newEntityObj.ReleaseDate)
                oContext.setProperty("DiscontinuedDate", newEntityObj.DiscontinuedDate)
                oContext.setProperty("Rating", newEntityObj.Rating)
                oContext.setProperty("Price", newEntityObj.Price)
                console.log(oContext.getProperty(""))
                
                this.AddV2RecordDialog.close();
            },

            onOpenEditV2Record(oEvent) {
                const oContext = oEvent.getSource().getBindingContext("ODataV2");

                const editModeModel= this.getModel("viewModel");
                editModeModel.setProperty("/editMode", true);

                const oModel = this.getModel("ODataV2");

                this.onOpenAddV2RecordFragment(oEvent)

            },

            onInputSearch() {
                const aFilter = []
                const searchValue = this.byId("searchField").getValue();

                if (searchValue) {
                    aFilter.push(new Filter({
                        path: "Name", 
                        operator: FilterOperator.Contains, 
                        value1: searchValue, 
                        caseSensitive: false
                    }))
                }
                console.log(aFilter)
                const oList = this.byId("productTable");
                const oBindign = oList.getBinding("items");

                oBindign.filter(aFilter)
            },

            onSorterSelect() {
                const oTable = this.byId("productTable");
                const comboBoxValue = this.byId("sorterSelection").getValue()
                let sorterValue = "";
                
                switch (comboBoxValue){
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

                const oSorter = new Sorter({path: sorterValue, descending: true})

                oTable.getBinding("items").sort(oSorter)
            },
            
            onTabPress(oEvent) {
                
                const sTabKey = oEvent.getParameters().key
                const oRouter = this.getOwnerComponent().getRouter().navTo("tab", 
                    {
                        tabKey: sTabKey
                    })
                const oModelSelect = this.getView().getModel("viewModel");
                oModelSelect.setProperty("/selectedTab", sTabKey);
            }
        });
    }
);
