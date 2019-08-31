import * as React from "react";
import "./../assets/scss/App.scss";

export interface AppProps {
}

interface ImageInfo {
    width: number;
    height: number;
    ratio: number;
    image: HTMLImageElement;
}

interface Book {
    id: number;
    title: string;
    link: string;
    imageUrl: string;
    bigImage: string;
    rating: number;
    image: ImageInfo;
    dateUpdated?: Date | string;
    dateAdded?: Date | string;
    dateRead?: Date | string;
}

interface GridInfo {
    screenWidth: number;
    screenHeight: number;
    columnWidth: number;
    columns: ColumnInfo[];
    hasWhitespace: boolean;
}

interface ColumnInfo {
    books: Book[];
    currentHeight: number;
    index: number;
}

function loadImageInfo(book: Book): Promise<ImageInfo> {
    return new Promise<ImageInfo>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "*";
        img.onload = function () {
            const imageInfo = {
                height: img.naturalHeight,
                width: img.naturalWidth,
                ratio: img.naturalHeight / img.naturalWidth,
                image: img
            };
            resolve(imageInfo);
        };
        img.src = "https://cors-anywhere.herokuapp.com/" + book.bigImage;
    });

}

interface ScreenInfo {
    width: number;
    height: number;
}

interface RenderOptions {
    offsetBoth: boolean;
    forceColumns: boolean;
    columns: number;
}


class GridRenderer extends React.Component<{ books: Book[], screenInfo: ScreenInfo, renderOptions: RenderOptions }, undefined> {


    private canvas: HTMLCanvasElement;
    private downloadLink: HTMLAnchorElement;
    img: HTMLImageElement;

    constructor(superProps: Readonly<{ books: Book[]; screenInfo: ScreenInfo; renderOptions: RenderOptions; }>) {
        super(superProps);
        this.calculateGrid = this.calculateGrid.bind(this);
        this.downloadToImage = this.downloadToImage.bind(this);
        this.renderBooks = this.renderBooks.bind(this);
    }

    calculateGrid(screenWidth: number, screenHeight: number, books: Book[], numberOfColumns = 1): GridInfo {
        const columnWidth = screenWidth / numberOfColumns;
        const result: GridInfo = {
            columnWidth: screenWidth / numberOfColumns,
            columns: [],
            hasWhitespace: true,
            screenWidth: screenWidth,
            screenHeight: screenHeight
        };
        for (let x = 0; x < numberOfColumns; x++) {
            result.columns.push({
                books: [],
                currentHeight: 0,
                index: x
            });
        }

        books.forEach((book) => {
            const column = result.columns.sort((a, b) => {
                const heightOff = a.currentHeight === 0 && b.currentHeight === 0;
                if (heightOff) {
                    return a.index - b.index;
                }
                return a.currentHeight - b.currentHeight;
            })[0];
            column.books.push(book);
            const bookHeight = columnWidth * book.image.ratio;
            column.currentHeight += bookHeight;
        });
        result.hasWhitespace = !result.columns.every((column => column.currentHeight >= screenHeight));

        return result;
    }

    renderBooks() {
        const width = this.props.screenInfo.width;
        const height = this.props.screenInfo.height;
        const books = this.props.books;
        const forceColumns = this.props.renderOptions.forceColumns;
        const forcedColumns = this.props.renderOptions.columns;
        const renderOptions = this.props.renderOptions;
        let columnNumbers = forceColumns ? forcedColumns : 1;
        let curGrid = this.calculateGrid(width, height, books, columnNumbers);
        let gridInfo = curGrid;
        if (!forceColumns) {
            while (!curGrid.hasWhitespace) {
                console.log("Column number: " + columnNumbers);
                columnNumbers++;
                curGrid = this.calculateGrid(width, height, books, columnNumbers);
                if (!curGrid.hasWhitespace) {
                    gridInfo = curGrid;
                }
            }
        }
        const context = this.canvas.getContext("2d");
        context.clearRect(0, 0, width, height);
        const columnWidth = gridInfo.columnWidth;
        gridInfo.columns.forEach((column, columnIndex) => {
            const cutoffOffset = renderOptions.offsetBoth ? (height - column.currentHeight) / 2 : 0;
            const offsetX = columnWidth * columnIndex;
            let offsetY = cutoffOffset;
            column.books.forEach((book) => {
                const bookHeight = columnWidth * book.image.ratio;
                context.drawImage(book.image.image, offsetX, offsetY, columnWidth, bookHeight);
                offsetY += bookHeight;
            });
        });
        this.img.src = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    }

    componentDidUpdate() {
        this.renderBooks();
    }
    componentDidMount() {
        this.renderBooks();
    }

    downloadToImage() {
        this.downloadLink.href = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    }

    render() {
        const { screenInfo } = this.props;
        const styleObj: React.CSSProperties = {
            maxWidth: "100%",
            maxHeight: "100%"
        };

        const canvasStyle: React.CSSProperties = {
            maxWidth: "100%",
            maxHeight: "100%",
            display: "none"
        };

        return <div>
            <img style={styleObj} ref={(ref) => this.img = ref}></img>
            <canvas style={canvasStyle} id="wallpapercanvas" ref={(ref) => this.canvas = ref} height={screenInfo.height} width={screenInfo.width}></canvas>
            <a ref={(ref) => this.downloadLink = ref} download="wallpaper.png" href="" onClick={(e) => this.downloadToImage()}>
                <h3>Download</h3>
            </a>
        </div>;
    }
}

export interface AppState {
    isDownloading: boolean;
    books: Book[];
    width: number;
    height: number;
    columns: number;
    forceColumns: boolean;
    username?: string;
    useOffset: boolean;
}

function ensureDate(input: string | Date): Date {
    if (typeof (input) === "string") {
        return new Date(input);
    } else {
        return input;
    }
}


export default class App extends React.Component<AppProps, AppState> {
    constructor(superProps: Readonly<AppProps>) {
        super(superProps);
        const screenHeight = window.screen.height;
        const screenWidth = window.screen.width;
        this.state = { isDownloading: false, books: [], width: screenWidth, height: screenHeight, username: "11386567", useOffset: false, columns: 16, forceColumns: false };
        this.fetchBooks = this.fetchBooks.bind(this);
    }

    async fetchBooks() {
        this.setState({ books: [], isDownloading: true });
        const username = this.state.username;
        const url = "https://bookimages.azurewebsites.net/api/CalculateColumns?user=" + username;
        let books = await fetch(url)
            .then((res) => res.json())
            .then((json) => json as Book[]);
        console.log("Found books: " + books.length);
        console.log("Loading images");
        books = await Promise.all(books.map(async (book) => {
            book.image = await loadImageInfo(book);
            return book;
        }));
        this.setState({ books: books, isDownloading: false });
    }

    render() {

        let books = this.state.books;
        books = books.sort((a, b) => b.rating - a.rating);
        const { height, width, username, useOffset, isDownloading, columns, forceColumns } = this.state;
        return (
            <div className="app">
                {isDownloading && <h1>Getting Books</h1>}
                <label>Username<input value={username} onChange={(e) => this.setState({ username: e.target.value })} ></input></label>
                <label>Width<input value={width} type="number" onChange={(e) => this.setState({ width: e.target.valueAsNumber })}></input></label>
                <label>Height<input value={height} type="number" onChange={(e) => this.setState({ height: e.target.valueAsNumber })}></input></label>
                <label>Use Offset<input type="checkbox" checked={useOffset} onChange={(e) => this.setState({ useOffset: e.target.checked })} /></label>
                <label>Columns <input type="number" value={columns} disabled={!forceColumns} onChange={(e) => this.setState({ columns: e.target.valueAsNumber })}></input></label>
                <label>Force Columns <input type="checkbox" checked={forceColumns} onChange={(e) => this.setState({ forceColumns: e.target.checked })}></input></label>
                <button onClick={(e) => this.fetchBooks()}>Get Books</button>
                {!isDownloading && books.length > 0 && <GridRenderer screenInfo={{ width: width, height: height }} books={books} renderOptions={{ offsetBoth: useOffset, forceColumns: forceColumns, columns: columns }} />}
            </div>
        );
    }
}
