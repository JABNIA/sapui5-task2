sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/m/MessageToast",
        "sap/m/MessageBox",
        "sap/ui/model/Sorter",
    ],
    (
        BaseController,
        JSONModel,
        Filter,
        FilterOperator,
        MessageToast,
        MessageBox,
        Sorter
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
                const viewModel = new JSONModel({isVisible: false, id: ""});

                this.getView().setModel(viewModel, "viewModel");

                const oEditModel = new JSONModel({edit:{ isEditMode: false, editableId: 0 }});

                this.getView().setModel(oEditModel, "EditMode");

                const hashParameter = window.location.hash;

                if(hashParameter) {
                    const tabKey = hashParameter.substring(6);
                    const oTabModel = new JSONModel({ selectedTab: tabKey });

                    this.getView().setModel(
                        oTabModel, "Selected"
                    )
                }else{
                    const oTabModel = new JSONModel({ selectedTab: "" });

                    this.getView().setModel(
                        oTabModel, "Selected"
                    )
                }

                const oDialogModel= new JSONModel({
                    record: {
                        Name: "",
                        Description: "",
                        ReleaseDate: "",
                        DiscontinuedDate: "",
                        Rating: 0,
                        Price: 0
                    }
                }) 

                this.getView().setModel(oDialogModel, "V2DialogObjectModel")
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

                // this.byId("bookName").setValue("");
                // this.byId("bookAuthor").setValue("");
                // this.byId("bookGenre").setValue("");
                // this.byId("bookReleaseDate").setValue("");
                // this.byId("bookAvailableQuantity").setValue("");

                // aBooks.push(oNewRow);
                // oModel.setProperty("/books", aBooks);
                // this.getView().setModel(oModel, "bookData");
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

                this.getView().setModel(oModel, "bookData");

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
                    "/isVisible",
                    !this.getModel("viewModel").getProperty("/isVisible")
                );
                this.getModel("viewModel").setProperty("/id", bookId);
                console.log(this.getModel("viewModel").getData());
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
                    this.AddV2RecordDialog.close();
                }
            },

            async onOpenAddRecordDialog() {
                this.AddRecordDialog ??= await this.loadFragment({
                    name: "project1.view.AddRecordDialog",
                });

                this.AddRecordDialog.open();
            },

            async onOpenAddV2RecordFragment() {
                this.AddV2RecordDialog ??= await this.loadFragment({
                    name: "project1.view.AddV2RecordDialog",
                });

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

            async onAddV2Record() {
                const oBundle = this.getModel("i18n").getResourceBundle();
                const oModel = this.getModel("ODataV2");
                const oEditModel = this.getModel("EditMode")
                const {isEditMode, editableId} = oEditModel.getProperty("/edit");
                
                if (isEditMode) {
                    const oDialogObjectModel = this.getModel("V2DialogObjectModel");
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

                    if (this.validateV2Record(updatedData) !== true) return;

                    oModel.update(`/Products(${editableId})`, updatedData, {
                        success: () => {
                            MessageToast.show("Product updated successfully");

                            oEditModel.setProperty("/edit", {isEditMode: false, editableId: 0})
                            this.getView().setModel(
                                oEditModel,
                                "EditMode"
                            );
                            oDialogObjectModel.setProperty("/record", {
                                Name: "",
                                Description: "",
                                ReleaseDate: "",
                                DiscontinuedDate: "",
                                Rating: 0,
                                Price: 0
                            });

                            this.getView().setModel(oDialogObjectModel, "V2DialogObjectModel")

                            this.AddV2RecordDialog.close();
                        },
                        error: () => {
                            MessageBox.error("Product Update Failed");
                        },
                    });

                    return;
                }
                const newEntityObj = {
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

                if (this.validateV2Record(newEntityObj) !== true) return;

                oModel.read("/Products", {
                    success: (oData) => {
                        console.log(oData.results[0].ReleaseDate);
                        const length = oData.results.length;

                        oModel.create("/Products", newEntityObj, {
                            success: (oData, oResponse) => {
                                const msg = oBundle.getText(
                                    "recordSuccessfullyAdded"
                                );
                                MessageToast.show(`${msg}`);
                            },
                        });
                        oModel.submitChanges();

                        const fieldArr = [
                            this.byId("ProductName"),
                            this.byId("ProductReleaseDate"),
                            this.byId("ProductDiscontinuedDate"),
                            this.byId("ProductDescription"),
                            this.byId("ProductRating"),
                            this.byId("ProductPrice"),
                        ];

                        fieldArr.forEach((field) => field.setValue(""));

                        this.AddV2RecordDialog.close();
                    },
                    error: () => {
                        MessageBox.error(`${oBundle.getText("errorMessage")}`);
                    },
                });

                console.log(newEntityObj);
            },

            async onOpenEditV2Record(oEvent) {
                const elementId = oEvent.getSource().data("recordId");
                const editModeModel= this.getModel("EditMode");
                editModeModel.setProperty("/edit", { isEditMode: true, editableId: elementId });

                this.getView().setModel(editModeModel, "EditMode");
                const oModel = this.getModel("ODataV2");

                await oModel.read(`/Products(${elementId})`, {
                    success: (oData) => {
                        const formatDate = (date) => {

                            const formatedDate = new Date(date)
                                .toDateString()
                                .substring(4)
                                .split("");
                            formatedDate.splice(6, 0, ",");
                            return formatedDate.join("");
                        };

                        const modelObject = {
                            Name: oData.Name,
                            Description: oData.Description,
                            ReleaseDate: formatDate(oData.ReleaseDate),
                            DiscontinuedDate: formatDate(oData.DiscontinuedDate),
                            Rating: oData.Rating,
                            Price: oData.Price
                        }

                        const oObjectModel = this.getModel("V2DialogObjectModel")
                        oObjectModel.setProperty("/record", modelObject)
                        this.getView().setModel(oObjectModel, "V2DialogObjectModel")
                        console.log(oObjectModel.getProperty("/record"))
                        
                    },
                    error: () => {
                        MessageBox.error(this.i18n("productDataCanNotLoad"));
                    },
                });
                await this.onOpenAddV2RecordFragment();
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
                const oModelSelect = this.getView().getModel("Selected");
                const sTab = oModelSelect.getProperty("/selectedTab");
                oModelSelect.setProperty("/selectedTab", sTabKey);
                
                this.getView().setModel(oModelSelect, "Selected");
            }
        });
    }
);
