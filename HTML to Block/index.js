let BLOCK = {
    id: "",
    class: "",
    type: "",
    text: "",
    level: 0,
    style: "",
    withHeadings: false,
    content: "",
    items: ""
}

function runClick() {
    let encodedHTML = document.getElementById("htmlText").value;
    let decodedHTML = decodeHtml(encodedHTML);
    document.getElementById("displayRaw").innerHTML = decodedHTML;
    var all = document.getElementById("displayRaw").childNodes;
    document.getElementById("display").textContent = convertHtml(all, true);
}

function decodeHtml(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function convertHtml(decodedHtml, stringify) {
    let blocks = [];
    let reset = true;
    let time = Date.now();
    let child = false;
    // let version = 123;

    decodedHtml.forEach((element, i) => {

        let nodeName = element.nodeName;

        if ((nodeName.includes("CLASS"))) {
            nodeNameClass = nodeName.split("CLASS");
            nodeName = nodeNameClass[0].trim();
            nodeNameClass = nodeNameClass[1].split("=")
            BLOCK.class = nodeNameClass[1];
        }

        if ((nodeName.includes("ID"))) {
            nodeNameId = nodeName.split("ID");
            nodeName = nodeNameId[0].trim();
            nodeNameId = nodeNameId[1].split("=");
            BLOCK.id = nodeNameId[1];
        }

        reset = false;
        switch (nodeName) {
            case "#text":
                BLOCK.text += element.data.trim();
                reset = false;
                break;
            case "STRONG":
                BLOCK.text += `<strong>${element.innerHTML}</strong>`
                reset = false;
                break;
            case "DIV":
                var childBlocks = convertHtml(element.childNodes);
                blocks = [...blocks, ...childBlocks];
                break;
            case "BR":
                BLOCK.text += `<br />`.trim()
                reset = false;
                break;
            default:
                reset = true;
                blocks.push(checkText());

                switch (element.nodeName) {
                    case "P":
                        BLOCK.type = "paragraph";
                        BLOCK.text += element.innerHTML.trim();
                        break;
                    case "H1":
                        BLOCK.type = "header";
                        BLOCK.level = 1;
                        break;
                    case "H2":
                        BLOCK.type = "header";
                        BLOCK.level = 2;
                        break;
                    case "H3":
                        BLOCK.type = "header";
                        BLOCK.level = 3;
                        break;
                    case "H4":
                        BLOCK.type = "header";
                        BLOCK.level = 4;
                        break;
                    case "H5":
                        BLOCK.type = "header";
                        BLOCK.level = 5;
                        break;
                    case "TABLE":
                        BLOCK.type = "table";
                        BLOCK.content = setTableContent(element.childNodes);
                        break;
                    case "TH":
                        BLOCK.withHeadings = true;
                        break;
                    case "OL":
                        BLOCK.type = "list";
                        BLOCK.style = "ordered";
                        BLOCK.items = setListContent(element.childNodes);
                        break;
                    case "UL":
                        BLOCK.type = "list";
                        BLOCK.style = "unordered";
                        BLOCK.items = setListContent(element.childNodes);
                        break;
                    default:
                        break;
                }
                break;
        }

        var lastElement = decodedHtml.length == (i + 1);

        if (BLOCK.type == "") {
            BLOCK.type = "paragraph"
        }

        if (reset || (lastElement && BLOCK.text != "")) {
            blocks.push(getBlock(BLOCK));
            resetBLOCK();
        }
    });

    let nnBlocks = [];
    blocks.forEach(element => {
        if (element != null) {
            if (nnBlocks != []) {
                nnBlocks.push(element)
            }
        }
    });

    if (stringify) {

        blockJSON = {
            time: time,
            blocks: nnBlocks
            // version: version
        }

        return JSON.stringify(blockJSON);
    }
    return nnBlocks;
}

function checkText() {
    if (BLOCK.text != "") {
        blocks = [];
        BLOCK.type = "paragraph";
        blocks = getBlock(BLOCK);
        resetBLOCK();

        return blocks;
    }
    return null;
}

function getBlock(BLOCK) {
    let bd = {};
    blockData = "";
    data = getData(BLOCK);

    if (BLOCK.id != "") {
        bd.id = BLOCK.id;
    }
    if (BLOCK.class != "") {
        bd.class = BLOCK.class;
    }
    if (BLOCK.type != "") {
        bd.type = BLOCK.type;
    }
    if (data != "") {
        bd.data = data;
    }
    return bd;
}

function getData(BLOCK) {
    let data = {};

    if (BLOCK.text != "") {
        if (BLOCK.text != " ")
            data.text = BLOCK.text;
    }
    if (BLOCK.level != 0) {
        data.level = BLOCK.level;
    }
    if (BLOCK.style != "") {
        data.style = BLOCK.style;
    }
    if (BLOCK.withHeadings) {
        data.withHeadings = true;
    }
    if (BLOCK.content != "") {
        data.content = BLOCK.content;
    }
    if (BLOCK.items != undefined) {
        if (BLOCK.items != "") {
            data.items = BLOCK.items;
        }
    }
    return data;
}

function setTableContent(tableChildren) {
    let content = [];
    let innerContent = []
    tableChildren.forEach(element => {

        switch (element.nodeName) {
            case "#text":
                break;
            case "TBODY":
                content = setTableContent(element.childNodes);
                break;
            case "TR":
                innerContent = [];
                element.childNodes.forEach(element => {

                    switch (element.nodeName) {
                        case "TH":
                            innerContent.push(element.innerText);
                            break;
                        case "TD":
                            innerContent.push(element.innerText);
                            break;
                        default:
                            break;
                    }
                });
                content.push(innerContent);
                break;
            default:
                break;
        }
    });
    return content;
}

function setListContent(listChildren) {

    let items = [];

    listChildren.forEach(element => {
        switch (element.nodeName) {
            case "LI":
                items.push(element.innerText);
                break;
            default:
                break;
        }
    });

    return items;
}

function resetBLOCK() {
    BLOCK.type = "";
    BLOCK.class = "";
    BLOCK.id = "";
    BLOCK.text = "";
    BLOCK.level = "";
    BLOCK.style = "";
    BLOCK.withHeadings = "";
    BLOCK.content = "";
    BLOCK.items = "";
}