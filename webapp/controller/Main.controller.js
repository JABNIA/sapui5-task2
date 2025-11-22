sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/ui/model/resource/ResourceModel",
    ],
    (BaseController, JSONModel, Filter, FilterOperator, ResourceModel) => {
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

                    this.getView().setModel(
                        new JSONModel({
                            isVisible: false,
                            id: "",
                        }),
                        "viewModel"
                    );
                });
                // const i18nModel = new ResourceModel({
                //     bundlename: "project1.i18n.i18n",
                // })

                // this.getView().setModel(i18nModel, "i18n");
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
                    availablequantity: this.byId("bookAvailableQuantity").getValue(),
                };
                if(
                    !oNewRow.name ||
                    !oNewRow.author ||
                    !oNewRow.genre ||
                    !oNewRow.releasedate ||
                    !oNewRow.availablequantity
                ) return;

                
                aBooks.push(oNewRow);
                oModel.setProperty("/books", aBooks);
                this.getView().setModel(oModel, "bookData");
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
            },

            async onOpenAddRecordDialog() {
                this.AddRecordDialog ??= await this.loadFragment({
                    name: "project1.view.AddRecordDialog",
                });

                this.AddRecordDialog.open();
            },
        });
    }
);