// 快捷获取元素
function $(query, list = false) {
    var res = document.querySelectorAll(query);
    if (!res[0]) return false;
    if (list) return res;
    return res.length == 1 ? res[0] : res;
}
// 复制文本
function copy(text) {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
}
var mdtext, fill = "&emsp;", draw, reverse = false;
var col = 10, row = 10;

function init() {
    var input, p, main = $("#paint");
    main.innerHTML = "";
    for (var i = 0; i < col; i++) {
        p = document.createElement("p");
        for (var j = 0; j < row; j++) {
            input = document.createElement("input");
            input.type = "checkbox";
            p.appendChild(input);
        }
        main.appendChild(p);
    }
}
init();
function getPixels() {
    return $("input[type='checkbox']", true);
}

$("#generate").onclick = function(e) {
    var result = $("#result"), index = 0;
    fill = $("#fill").value || "&emsp;", draw = $("#draw").value;
    result.innerHTML = mdtext = "";

    for (var i = 0; i < col; i++) {
        var pixels = getPixels();
        var p = document.createElement("p");
        var p2 = document.createElement("p");

        for (var j = 0; j < row; j++) {
            if (pixels[index].checked) {
                p.innerHTML += draw || `<mark>${fill}</mark>`;
                p2.textContent += draw || `==${fill}==`;
            } else {
                p.innerHTML += fill;
                p2.textContent += fill;
            }
            index++;
        }
        result.appendChild(p);
        if (!draw) p2.textContent = p2.textContent.replace(/====/g, "");
        mdtext += p2.textContent + "\n";
    }
}

$("#clear").onclick = function(e) {
    var pixels = $("input[type='checkbox']:checked", true);
    for (var i = 0; i < pixels.length; i++) {
        pixels[i].checked = false;
    }
}
$("#copy").onclick = function(e) {
    copy(mdtext);
}

$("#reverse").onclick = function(e) {
    for (let i of $("input[type='checkbox']")) {
        i.click();
    }
    reverse = !reverse;
}

function appPixel(p) {
    input = document.createElement("input");
    input.type = "checkbox";
    p.appendChild(input);
    if (reverse) input.click();
}

$("#submit").onclick = function(e) {
    newr = Number($("#row").value) || 10;
    newc = Number($("#col").value) || 10;
    if (newr < 1 || newc < 1) return;
    var input, p, main = $("#paint");
    var ps = $("#paint > p", true);
    if (newc > col) {
        for (var i = 0; i < newc - col; i++) {
            p = document.createElement("p");
            for (var j = 0; j < row; j++) {
                appPixel(p);
            }
            main.appendChild(p);
        }
    } else {
        for (var i = 0; i < col - newc; i++) {
            main.removeChild(ps[col - 1 - i]);
        }
    }
    col = newc, ps = $("#paint > p", true);
    if (newr > row) {
        for (var i = 0; i < col; i++) {
            p = ps[i];
            for (var j = 0; j < newr - row; j++) {
                appPixel(p);
            }
            main.appendChild(p);
        }
    } else {
        for (var i = 0, cs; i < col; i++) {
            p = ps[i];
            cs = p.children;
            for (var j = 0; j < row - newr; j++) {
                p.removeChild(cs[row - 1 - j]);
            }
        }
    }
    row = newr;
}

$("#auto").onclick = function(e) {
    ;
}