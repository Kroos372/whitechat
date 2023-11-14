"use strict";
function $(query, list=false){
    var res = document.querySelectorAll(query);
    if (list) return res;
    return res.length == 1 ? res[0] : res;
}
function localStorageGet(key) {
    try {
        return window.localStorage[key];
    } catch (e) { }
}
function localStorageSet(key, val) {
    try {
        window.localStorage[key] = val
    } catch (e) { }
}
const ignores = {
    "nick": "昵称",
    "trip": "识别码",
    "hash": "hash"
};
Object.keys(ignores).forEach(function (val) {
    var option = document.createElement("option");
    option.textContent = ignores[val];
    option.value = val;
    $("#ig-selector").appendChild(option);
});

// 主题选择
const schemes = [
    "android",
    "android-white",
    "atelier-dune",
    "atelier-forest",
    "atelier-heath",
    "atelier-lakeside",
    "atelier-seaside",
    "banana",
    "bright",
    "bubblegum",
    "chalk",
    "default",
    "eighties",
    "fresh-green",
    "greenscreen",
    "hacker",
    "maniac",
    "mariana",
    "military",
    "mocha",
    "monokai",
    "nese",
    "ocean",
    "omega",
    "pop",
    "railscasts",
    "solarized",
    "tk-night",
    "tomorrow",
    "carrot",
    "lax",
    "Ubuntu",
    "gruvbox-light",
    "fried-egg",
    "rainbow",
    "amoled"
];
const highlights = [
    "agate",
    "androidstudio",
    "atom-one-dark",
    "darcula",
    "github",
    "rainbow",
    "tk-night",
    "tomorrow",
    "xcode",
    "zenburn"
];

var currentScheme = "atelier-dune";
var currentHighlight = "darcula";

function setScheme(scheme) {
    currentScheme = scheme;
    $("#scheme-link").href = "https://hack.chat/schemes/" + scheme + ".css";
    if (scheme == "fried-egg") $("#my-link").href = "myScheme/" + scheme + ".css";
    else $("#my-link").href = "myScheme/" + "default" + ".css";
    localStorageSet("scheme", scheme);
}
function setHighlight(scheme) {
    currentHighlight = scheme;
    $("#highlight-link").href = "https://hack.chat/vendor/hljs/styles/" + scheme + ".css";
    localStorageSet("highlight", scheme);
}

// 将每种主题选项添加到选项
schemes.forEach(function (scheme) {
    var option = document.createElement("option");
    option.textContent = scheme;
    option.value = scheme;
    $("#scheme-selector").appendChild(option);
});
highlights.forEach(function (scheme) {
    var option = document.createElement("option");
    option.textContent = scheme;
    option.value = scheme;
    $("#highlight-selector").appendChild(option);
});

$("#scheme-selector").onchange = function (e) {
    setScheme(e.target.value);
}
$("#highlight-selector").onchange = function (e) {
    setHighlight(e.target.value);
}

// 从localStorage中读取主题
if (localStorageGet("scheme")) {
    setScheme(localStorageGet("scheme"));
}
if (localStorageGet("highlight")) {
    setHighlight(localStorageGet("highlight"));
}

$("#scheme-selector").value = currentScheme;
$("#highlight-selector").value = currentHighlight;

const buttons = {
    "clear-messages": "清除所有消息",
    "clear-last": "清除历史发送",
    "save-passwd": "保存当前密码",
    "change-color": "更改颜色"
};
const butt_funcs = {
    "clear-messages": function(e){
        var messages = $("#messages");
        messages.innerHTML = "";
        customMsg = [];
        customHistory = {};
    },
    "clear-last": function (e) {
        lastSent = [""];
        pushMessage({change: "info", text: "清除成功！"});
    },
    "save-passwd": function (e) {
        var mpwd = channels[actAnnel].myPwd;
        if (mpwd) {
            localStorage.passwd = mpwd;
            pushMessage({change: "info", text: "保存成功！"});
        } else {
            pushMessage({change: "info", text: "你还没有设置密码~"});
        }
    },
    "change-color": function (e) {
        changeColor($("#colorPicker").value);
    }
}
Object.keys(buttons).forEach(function (button) {
    var option = document.createElement("option");
    option.textContent = buttons[button];
    option.value = button;
    $("#bar-ttons").appendChild(option);
});
$("#button").onclick = function (e) {
    butt_funcs[$("#bar-ttons").value]();
}
$("#bar-ttons").onchange = function(e) {
    if (e.target.value == "change-color") {
        $("#picker").classList.remove("hidden");
        $("#picker").style.backgroundColor = $("#colorPicker").value;
    }
    else {
        $("#picker").classList.add("hidden");
    }
    $("#button").innerHTML = buttons[e.target.value];
}
$("#colorPicker").oninput = function (e) {
    $("#picker").style.backgroundColor = e.target.value;
}
$("#bar-ttons").value = "clear-messages";

// 是否是手机
function mobileJudge(){
    const mobileAgents = ["Android", "iPhone", "Windows Phone", "iPad", "iPod", "SymbianOS"];
    for (var i = 0, ua = navigator.userAgent; i < mobileAgents.length; i++) {
        if (ua.indexOf(mobileAgents[i]) != -1){
            return true;
        }
    }
    return false;
}
// 常量
const allow = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_0123456789".split("");
const holders = [
    "发送一条友善的消息~",
    "按/可以快速聚焦哦",
    "明明什么都没做，就已经hour点了..."
];
var frontpageH = [
    "┏┓━━━━━━━━━━━┏┓━━━━━━━━┏┓━━━━━━━━┏┓━",
    "┃┃━━━━━━━━━━━┃┃━━━━━━━━┃┃━━━━━━━┏┛┗┓",
    "┃┗━┓┏━━┓━┏━━┓┃┃┏┓━━┏━━┓┃┗━┓┏━━┓━┗┓┏┛",
    "┃┏┓┃┗━┓┃━┃┏━┛┃┗┛┛━━┃┏━┛┃┏┓┃┗━┓┃━━┃┃━",
    "┃┃┃┃┃┗┛┗┓┃┗━┓┃┏┓┓┏┓┃┗━┓┃┃┃┃┃┗┛┗┓━┃┗┓",
    "┗┛┗┛┗━━━┛┗━━┛┗┛┗┛┗┛┗━━┛┗┛┗┛┗━━━┛━┗━┛",
    "&emsp;",
    "欢迎来到——哪？一个基于[hack.chat](https://hack.chat/)改编，简洁（并不）、无干扰的聊天程序客户端。",
    "频道通过网址创建、加入或分享，通过改变问号后面的文字来创建你自己的频道。",
    "如果你想让你的频道叫做“your-channel”: " + location.href + "?your-channel",
    "这里不会显示频道列表，因此你可以使用秘密频道名称进行私人讨论。",
    "&emsp;",
    "以下是一些可供加入的预制频道：",
    "|名称|人数|名称|人数|",
    "|:-:|:-:|:-:|:-:|"
];
var frontpageF = [
    "| ?kt1j8rpc | \\ | ?your-channel | \\ |",
    "并且这里有一个仅为你准备的秘密频道: ?" + Math.random().toString(36).substr(2, 8),
    "&emsp;",
    "文本格式:",
    "在LaTeX语法两端用单个美元符号包围表示行内样式： \\$\\zeta(2) = \\pi^2/6\\$, 用两个美元符号包围表示区块样式： \\$\\$\\int_0^1 \\int_0^1 \\frac{1}{1-xy} dx dy = \\frac{\\pi^2}{6}\\$\\$",
    "如果需要语法高亮，将代码用这种以下格式包裹: \n\\`\\`\\`<语言> \n <代码>\n\\`\\`\\`\n 其中<语言>是任何一种已知的编程语言。",
    "&emsp;",
    "当前的GitHub: https://github.com/hack-chat",
    "过去的GitHub: https://github.com/AndrewBelt/hack.chat",
    "此客户端的GitHub：https://github.com/Kroos372/whitechat",
    "&emsp;",
    "机器人、安卓客户端、桌面客户端、浏览器扩展、docker images、编程库、服务器模块等等：",
    "https://github.com/hack-chat/3rd-party-software-list",
    "此聊天室的历史与基本功能介绍：",
    "https://hcwiki.netlify.app/",
    "&emsp;",
    "服务端和客户端在WTFPL和MIT开源许可下发布，",
    "Hack.chat*服务器*上不保留任何历史记录。"
];
var help = [
    "# 恭喜你发现这个隐藏的帮助⭐",
    "以下是几个可能帮助到你的tips：",
    "|||",
    "|-|-|",
    "|/setbg|设置背景图|",
    "|点击识别码（或名字左边的空格）|复制hash|",
    "|双击识别码|切换至该频道|",
    "|双击消息|复制该消息的历史记录|"
].join("\n");
var imgWhites = [];
const isMobile = mobileJudge();

// Markdown所需
function isWhite(link) {
    var a = document.createElement("a");
    a.href = link;
    return imgWhites.indexOf(a.hostname) != -1;
}
var markdownOptions = {
    html: false,
    xhtmlOut: false,
    breaks: true,
    langPrefix: "",
    linkify: true,
    linkTarget: "_blank\" rel=\"noreferrer",

    doHighlight: true,
    langPrefix: "hljs language-",
    highlight: function (str, lang) {
        if (!markdownOptions.doHighlight || !window.hljs) { return ""; }

        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(lang, str).value;
            } catch (__) {}
        }

        try {
            return hljs.highlightAuto(str).value;
        } catch (__) {}

        return "";
    }
};
var md = new Remarkable("full", markdownOptions);
var allowImages = true, toggle = false, autoScroll = true;
var utils = Remarkable.utils;

md.renderer.rules.image = function (tokens, idx, options) {
    var src = utils.escapeHtml(tokens[idx].src);
    var title = "", alt = "";
    if (tokens[idx].title) title = utils.escapeHtml(utils.replaceEntities(tokens[idx].title));
    if (tokens[idx].alt) alt = utils.escapeHtml(utils.replaceEntities(tokens[idx].alt));
    title = `title="${title}"`;
    alt = `alt="${alt}"`;

    if (allowImages) {
        var scrollOnload = isAtBottom() ? "onload=\"window.scrollTo(0, document.body.scrollHeight)\"" : "";
        return `<a href="${src}" target="_blank" oncontextmenu="linkToggle(event)" ${title} rel="noreferrer"><img `+
        `oncontextmenu="imageToggle(event)" ${scrollOnload} src="${src}" ${alt} referrerpolicy="no-referrer"></a>`;
    }

    return `<a href="${src}" target="_blank" oncontextmenu="linkToggle(event)" ${title} ${alt} rel="noreferrer">${src}</a>`;
};
md.renderer.rules.link_open = function (tokens, idx, options) {
    var title = tokens[idx].title ? (" title=\"" + utils.escapeHtml(utils.replaceEntities(tokens[idx].title)) + "\"") : "";
    var target = options.linkTarget ? (" target=\"" + options.linkTarget + "\"") : "";
    return "<a rel=\"noreferrer\" onclick=\"return verifyLink(event, this)\" href=\"" + utils.escapeHtml(tokens[idx].href) +
     "\"" + title + target + ">";
};
md.renderer.rules.text = function(tokens, idx) {
    tokens[idx].content = utils.escapeHtml(tokens[idx].content);

    if (tokens[idx].content.indexOf("?") !== -1) {
        tokens[idx].content = tokens[idx].content.replace(/(^|\s)(\?)\S+?(?=[,.!?:)]?\s|$)/gm, function(match) {
            var channelLink = utils.escapeHtml(utils.replaceEntities(match.trim()));
            var whiteSpace = "";
            if (match[0] !== "?") {
                whiteSpace = match[0];
            }
            return whiteSpace + "<a href=\"" + channelLink + "\" target=\"_blank\" onclick=\"verifyChannel(event, this)\">" + channelLink + "</a>";
        });
    }

  return tokens[idx].content;
};
md.use(remarkableKatex);
md.inline.ruler.disable(["katex"]);
md.block.ruler.disable(["katex"]);

function verifyLink(e, link) {
    e.stopPropagation()
    var linkHref = utils.escapeHtml(utils.replaceEntities(link.href));
    if (linkHref !== link.innerHTML) {
        return confirm("警告，请确认以下链接是你要去的地方: " + linkHref);
    }
    return true;
}
function verifyNickname(channel, nick) {
    return !(channels[channel] && channels[channel].onlines[nick]) && /^[a-zA-Z0-9_]{1,24}$/.test(nick);
}
function verifyChannel(e, link) {
    e.stopPropagation();
    var channel = link.textContent.slice(1);
    if (cLink == 1 || (cLink == 2 && confirm("是否要直接在此页面加入新频道？\n可在“更多设置”中隐藏此提示。"))) {
        e.preventDefault();
        $("#new-channelname").value = channel;
        newJoin();
    }
}
// 危险玩意，比较粗略，毕竟一般没人用乳胶干正事
function verifyLatex(text) {
    if (/\$[\s\S]*?(?:\\rule|\\begin)[\s\S]*?\$/.test(text)){
        return text.replace(/\$/g, "\\$");
    }
    return text
}
// 字符串转HTML元素
function toHTML(text){
    var div = document.createElement("div");
    div.innerHTML = text;
    return div.firstChild;
}
// 图片缩为链接
function imageToggle(e){
    if (!toggle) return;
    e.preventDefault();
    var ele = e.target;
    ele.parentElement.setAttribute("alt", ele.alt);
    ele.parentElement.textContent = ele.src;
    e.stopPropagation();
}
// 链接展为图片
function linkToggle(e){
    if (!toggle) return;
    e.preventDefault();
    var ele = e.target;
    var img = toHTML('<img oncontextmenu="imageToggle(event)" referrerpolicy="no-referrer">');
    img.alt = ele.getAttribute("alt") || "一张图片";
    try{
        img.src = ele.firstChild.textContent;
    } catch (err) {
        pushMessage({text: "暂时无法加载图片，请稍后重试！", hash: "Qm9jY2hpQ2hhbg", change: "info"});
        return;
    }
    if (isAtBottom()){
        img.onload = function(){
            window.scrollTo(0, document.body.scrollHeight);
        }
    }
    ele.firstChild.remove();
    ele.appendChild(img);
}
// 设置颜色
function colorSet(channel, nick, color){
    var user = channels[channel].onlines[nick];
    if (user) user.color = color;
}

// 从localStorage中获取设置
if (localStorageGet("pin-sidebar") == "true") {
    $("#pin-sidebar").checked = true;
    $("#sidebar-content").classList.remove("hidden");
}
if (localStorageGet("joined-left") == "false") {
    $("#joined-left").checked = false;
}
if (localStorageGet("allowImages") == "false") {
    allowImages = $("#image").checked = false;
}
if (localStorageGet("parse-latex") == "true") {
    $("#parse-latex").checked = true;
    md.inline.ruler.enable([ "katex" ]);
    md.block.ruler.enable([ "katex" ]);
}
if (localStorageGet("toggle") == "true") {
    toggle = $("#imgToggle").checked = true;
}
if (localStorageGet("sound-notify") == "true") {
    $("#sound-notify").checked = true;
}
if (localStorageGet("auto-scroll") == "false") {
    $("#auto-scroll").checked = autoScroll = false;
}
if (Number(localStorageGet("last-max"))) {
    lastMax = $("#last-max").value = Number(localStorageGet("last-max"));
}

$("#pin-sidebar").onchange = function (e) {
    localStorageSet("pin-sidebar", e.target.checked);
}

$("#joined-left").onchange = function (e) {
    localStorageSet("joined-left", e.target.checked);
}

$("#parse-latex").onchange = function (e) {
    var enabled = e.target.checked;
    localStorageSet("parse-latex", enabled);
    if (enabled) {
        md.inline.ruler.enable([ "katex" ]);
        md.block.ruler.enable([ "katex" ]);
    } else {
        md.inline.ruler.disable([ "katex" ]);
        md.block.ruler.disable([ "katex" ]);
    }
}
function usersClear() {
    var users = $("#users");
    while (users.firstChild) {
        users.removeChild(users.firstChild);
    }
}
function userEle(channel, args) {
    var user = document.createElement("a");
    var userLi = document.createElement("li");
    var nick = args.nick, achannel = channels[actAnnel];
    user.classList.add("users");
    userLi.appendChild(user);

    if (args.trip){
        var tripEl = document.createElement("span");
        tripEl.classList.add("trip");
        tripEl.textContent = " " + args.trip;
        if (args.uType == "mod"){
            tripEl.textContent = " " + String.fromCharCode(11088) + tripEl.textContent;
        }
        userLi.appendChild(tripEl);
    }

    user.textContent = nick;
    userLi.title = args.hash;
    userLi.id = "jb-" + nick;

    user.onclick = function (e) {
        invite(nick, $("#chatinput").value);
    }
    user.onmouseenter = function(e) {
        user.style.color = "#" + achannel.onlines[nick].color;
    }
    user.onmouseleave = function(e) {
        user.style.color = "";
    }
    userLi.oncontextmenu = function (e) {
        e.preventDefault();
        moveMenu(e, $("#user-ctm"));
        choiced.nick = nick;
        $("#ig-change").innerHTML = isShielded(actAnnel, nick) ? "取消屏蔽" : "屏蔽";
    }
    $("#users").appendChild(userLi);

    if (args.color){
        colorSet(channel, nick, args.color);
    }
}
function usersPrint(channel) {
    if (actAnnel == channel) return;
    var onlines = channels[channel].onlines;
    if (onlyRead) {
        hideOthers(channel);
        showMsg(channel);
    }
    actAnnel = channel;
    usersClear();
    channels[channel].nicks.forEach(function (nick) {
        userEle(channel, onlines[nick]);
    });
    updateTitle();
}
function userAdd(channel, args) {
    var nick = args.nick;
    if (!channels[channel]) initChannel(channel, channels[actAnnel].socket);
    channels[channel].onlines[nick] = {
        nick: args.nick, hash: args.hash, trip: args.trip, uType: args.uType, color: args.color
    };
    channels[channel].nicks.push(nick);
    if (channel == actAnnel) {
        userEle(channel, args);
    }
}
function userRemove(channel, nick) {
    if (channel == actAnnel) {
        $("#jb-" + nick).remove();
    }
    delete channels[channel].onlines[nick];
    var nicks = channels[channel].nicks;
    nicks.splice(nicks.indexOf(nick), 1);
}
function isAtBottom() {
    return (window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 1);
}
var lastMax = 12;
function updateTitle() {
    if (windowActive && isAtBottom()) {
        unread = 0; ated = false; lastMsg = null;
        $("#new-msg").classList.add("hidden");
    }
    var title = actAnnel ? "?" + actAnnel : "Hack.Chat";

    if (unread > 0) {
        title = `(${unread})` + title;
        if (!isAtBottom()) {
            $("#new-msg").classList.remove("hidden");
            $("#new-msg > a").textContent = `您收到了${unread}条新消息`;
        }
    }
    if (ated) {
        title = "(@)" + title;
    }
    if (lastMsg && lastMax) {
        title += lastMsg.length > lastMax ? `(${lastMsg.slice(0, lastMax)}...)` : `(${lastMsg})`;
    }
    document.title = title;
}
function hideOthers(channel) {
    var all = $(".message", true);
    all.forEach(function(ele) {
        if (!ele.classList.contains("c-" + channel)) {
            ele.classList.add("hidden");
        }
    });
}
function showMsg(channel) {
    var all = $(".messages > .hidden", true);
    var atBottom = isAtBottom();
    all.forEach(function(ele) {
        if (ele.classList.contains("c-" + channel)) {
            ele.classList.remove("hidden");
        }
    });
    if (atBottom) {
        window.scrollTo(0, document.body.scrollHeight);
    }
}

$("#chatinput").oninput = function (e) {
    if (atCont.flag){
        var pos = e.target.selectionStart || 0;
        var text = e.target.value;
        var index = text.lastIndexOf("@", pos);

        if (index != -1) {
            var ctm = $("#at-ctm");
            ctm.innerHTML = "";
            var stub = text.substring(index + 1, pos).toLowerCase();
            // 找昵称
            var nicks = channels[actAnnel].nicks.filter(function(nick) {
                return nick.toLowerCase().startsWith(stub);
            });

            if (nicks.length) {
                nicks.forEach(function(v, i){
                    var div = document.createElement("div");
                    div.textContent = v;
                    if (!i) {
                        div.classList.add("hovered");
                        atCont.index = 0;
                    }

                    var a = document.createElement("a");
                    a.appendChild(div);

                    ctm.appendChild(a);
                    ctm.classList.remove("hidden");
                });
            }
            
        }
        if (index == -1 || !nicks.length) {
            atCont.flag = false;
            $("#at-ctm").classList.add("hidden");
        }
    }
    updateInputSize();
}

var windowActive = true;

window.onfocus = function () {
    windowActive = true;
    updateTitle();
}
window.onblur = function () {
    windowActive = false;
}
window.onscroll = function () {
    if (isAtBottom()) {
        updateTitle();
    }
}
window.onkeydown = function (e) {
    if (e.keyCode == 191) {
        e.preventDefault();
        $("#chatinput").focus();
    }
}
window.addEventListener("contextmenu", window.onclick = function(e){
    var menus = $(".contextmenu", true);
    for (var i = 0; i < menus.length; i++) {
        if (!menus[i].classList.contains("hidden")) {
            menus[i].classList.add("hidden");
        }
    }
}, true);

function updateInputSize() {
    var atBottom = isAtBottom();

    var input = $("#chatinput");
    input.style.height = 0;
    input.style.height = input.scrollHeight + "px";
    document.body.style.marginBottom = $("#footer").offsetHeight + "px";

    if (atBottom) {
        window.scrollTo(0, document.body.scrollHeight);
    }
}

$("#sidebar").onmouseenter = $("#sidebar").ontouchstart = function (e) {
    $("#sidebar-content").classList.remove("hidden");
    $("#sidebar").classList.add("expand");
    e.stopPropagation();
}
$("#sidebar").onmouseleave = document.ontouchstart = function (event) {
    var e = event.toElement || event.relatedTarget;
    try {
        if (e.parentNode == this || e == this) {
         return;
      }
    } catch (e) { return; }

    if (!$("#pin-sidebar").checked) {
        $("#sidebar-content").classList.add("hidden");
        $("#sidebar").classList.remove("expand");
    }
}

function insertAtCursor(text) {
    var input = $("#chatinput");
    var start = input.selectionStart || 0;
    var before = input.value.substr(0, start);
    var after = input.value.substr(start);

    before += text;
    input.value = before + after;
    input.selectionStart = input.selectionEnd = before.length;
    input.focus();

    updateInputSize();
}
function send(data, ws) {
    if (ws && ws.readyState == ws.OPEN) {
        ws.send(JSON.stringify(data));
    }
}
// 输入框输入昵称
function inputNick(){
    var newNick = prompt("输入昵称:", localStorage.nick);
    if (newNick !== null) {
        shouldConnect = true;
    } else {
        shouldConnect = false;
        pushMessage({change: "warn", text: "你取消了输入框，再次刷新或输入`/join`进入……" });
    }
    return newNick;
}
// 检查昵称&加入频道
function checkNick(channel, fullnick){
    if (channels[actAnnel] && shouldConnect) {
        var list = fullnick.split("#"), nowAnnel = channels[channel];
        var ws = nowAnnel.socket;

        var nick = list[0] == "*" ? randomNick() : list[0];
        if (!verifyNickname(channel, nick)) return;
        else nowAnnel.myNick = nick;

        var passwd = nowAnnel.myPwd = list[1] == "*" ? localStorage.passwd : list[1];
        var color = nowAnnel.myColor = list[2] == "*" ? randomColor() : list[2];
        nowAnnel.fullnick = fullnick;
        send({cmd: "join", channel: channel, nick: nick, password: passwd}, ws);
        if (color) send({cmd: "changecolor", color: color}, ws);
        localStorage.nick = fullnick;
    }
}
// 私信
function whisper(to, msg, trace = true, ws){
    ws = ws || channels[actAnnel].socket;
    send({cmd: "whisper", nick: to, text: msg}, ws);
    if (trace) sent(`/w ${to} ${msg}`);
}
// 邀请
function invite(nick, to, ws){
    ws = ws || channels[actAnnel].socket;
    if (to) send({cmd: "invite", nick: nick, to: to}, ws);
    else send({cmd: "invite", nick: nick}, ws);
}
// 变色
function changeColor(color, ws) {
    ws = ws || channels[actAnnel].socket;
    send({cmd: "changecolor", color: color}, ws);
}
// 是否被@
function verifyAted(channel, msg) {
    return channel && RegExp("@" + channels[channel].myNick + "\\b").test(msg);
}
// 是否是数字
function verifyNum(num){
    return /^-?[1-9][0-9]*(\.[0-9]*)?$/.test(num);
}
// 随机整数，[min max)
function randint(min, max){
    return Math.floor(Math.random()*(max-min)+min);
}
// 随机选择
function choice(list){
    return list[Math.floor(Math.random()*list.length)];
}
// 净化名字
function namePure(name){
    if (name) return name.replace(/^ +| +$/g, "").replace(/^@/, "");
}
// 添加历史发送
function sent(text){
    if (lastSent[1] != text) {
        lastSent[0] = text;
        lastSent.unshift("");
    }
    lastSentPos = 0;
}
// 鼠标坐标
function getMouse(e) {
    return {
        x: e.clientX,
        y: e.clientY
    };
}
// 移动菜单
function moveMenu(e, ele) {
    var pos = getMouse(e);
    var left = pos.x, top = pos.y;
    ele.classList.remove("hidden");
    if (pos.x + ele.scrollWidth > window.innerWidth){
        left -= ele.scrollWidth;
    }
    if (pos.y + ele.scrollHeight > window.innerHeight){
        top -= ele.scrollHeight;
    }
    ele.style.left = left + "px";
    ele.style.top = top + "px";
}
// 随机颜色
function randomColor() {
    return randint(0, 0xffffff).toString(16).padStart(6, "0");
}
// 随机昵称
function randomNick() {
    var nick = "";
    for (var i = 0; i < randint(1, 25); i++){
        nick += choice(allow);
    }
    return nick;
}
// 随机costom id
function randomCustom() {
    var result = "";
    for (var i = 0; i < 6; i++) {
        result += choice(allow);
    }
    return result;
}
// 复制
function copy(text) {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
}
function isShielded(channel, nick) {
    var achannel = channels[channel];
    try {var sd = achannel.shielded, user = achannel.onlines[nick];}
    catch (err) {return false;}
    return user && (sd.nick.indexOf(nick) != -1 || sd.trip.indexOf(user.trip) != -1 || sd.hash.indexOf(user.hash) != -1);
}
function wordShielded(msg) {
    if (!msg) return false;
    for (var i of shieldWords) {
        if (RegExp(i, "g").test(msg)) {
            return true;
        }
    }
    return false;
}
// left or right
function lor(){
    var checks = $("input[type=\"checkbox\"]", true);
    for (var i = 0; i < checks.length; i++){
        checks[i].oncontextmenu = function(e){
            e.preventDefault();
            e.target.click();
        }
    }
}

lor();
console.log(Date());
$("#copy-temp").placeholder = `可选参数：$c$: 频道, $n$: 昵称, $t$: 识别码, $h$: hash, $m$: 消息。\n默认：\n?$c$: $t$ $n$\n$m$`;