sap.ui.define(
    [
        "./BaseController",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
    ],
    (BaseController, JSONModel, Filter, FilterOperator) => {
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
            },

            onAddRecord() {
                const oModel = this.getModel("bookData");
                const aBooks = oModel.getProperty("/books");

                const oNewRow = {
                    id: `B0${aBooks.length + 1}`,
                    name: "",
                    author: "",
                    genre: "",
                    releasedate: "",
                    availablequantity: "",
                };

                aBooks.push(oNewRow);
                oModel.setProperty("/books", aBooks);
                this.getView().setModel(oModel, "bookData");
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
                this.oDialog.close();
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

            async onOpenDialog() {
                this.oDialog ??= await this.loadFragment({
                    name: "project1.view.DeleteDialog",
                });

                this.oDialog.open();
            },

            onCloseDialog() {
                this.oDialog.close();
            },
        });
    }
);
