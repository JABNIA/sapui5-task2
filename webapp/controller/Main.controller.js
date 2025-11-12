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
                    
                    console.log(oGenreModel);

                    this.getView().setModel(oGenreModel, "gernes");
                });
            },

            onAddRecord() {
                const oModel = this.getModel("bookData");
                const aBooks = oModel.getProperty("/books");

                const oNewRow = {
                    id: "",
                    name: "",
                    author: "",
                    genre: "",
                    releasedate: "",
                    availablequantity: 0,
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
            },

            onApplyFilters() {
                const aFilter = [];
                const sTitle = this.byId("searchInput").getValue();
                const sSelectedGenre = this.byId("genreSelect").getSelectedKey();

                console.log(sSelectedGenre, sTitle)
                if (sSelectedGenre && sSelectedGenre !== "All") {
                    aFilter.push(new Filter("genre", FilterOperator.Contains, sSelectedGenre));
                }
                if (sTitle) {
                    aFilter.push(new Filter("name", FilterOperator.Contains, sTitle));
                }

                const oList = this.byId("bookTable");
                const oBinding = oList.getBinding("items");

                oBinding.filter(aFilter);
            }
    });
    }
);
