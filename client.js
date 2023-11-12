"use strict";
//自定义变量
var actAnnel = window.location.search.replace(/^\?/, "");
var channels = {}, kchannel, Kcmd = [".m kick"];
var lastMsg, shouldConnect, mults = {}, multf = false;
var copyTemplate = localStorageGet("copy-template") || "?$c$: $t$ $n$\n$m$\n";
var msgTemplate = localStorageGet("msg-template");
var shieldWords = [];
const anwz = {
    2: "nask",
    0: "nblank",
    1: "nchannel"
};
const WARN = "!", INFO = "*";
// 自定义命令，return true代表不继续发送消息
const CMDS = {
    "/k ": function(msg) {
        whisper(namePure(msg.slice(3)), "$\\begin{pmatrix}qaq\\\\[999999999em]\\end{pmatrix}$");
        return true;
    },
    "/zw ": function(msg) {
        whisper(channels[actAnnel].myNick, msg.slice(4));
        return true;
    },
    "/nick": function(msg) {
        var newNick = msg.split(" ")[1];
        if (newNick) newNick = namePure(newNick);
        else return false;
        if (verifyNickname(actAnnel, newNick.split("#")[0])) {
            if (newNick.indexOf("#") != -1) {
                pushMessage({ text: "正在更换昵称……", channel: actAnnel, change: "info" });
                rejoin(actAnnel, newNick);
                return true;
            } else {
                channels[actAnnel].myNick = newNick;
            }
        }
        return false;
    },
    "/atall": function(msg) {
        var users = channels[actAnnel].nicks;
        sendMsg(msg.replace(/\/atall */, `@${users.join(" @")} `));
        return true;
    },
    "/kcmd": function(msg) {
        var kd = msg.slice(6), index = Kcmd.indexOf(kd);
        if (!kd) {
            pushMessage({ text: "目前的检测Kick命令有：" + Kcmd.join(", "), change: "info" });
        } else if (index == -1) {
            Kcmd.push(kd);
            pushMessage({ text: `Kick检测列表添加"${kd}"！`, change: "info" });
        } else {
            Kcmd.splice(index, 1);
            pushMessage({ text: `Kick检测列表删除"${kd}"！`, change: "info" });
        }
        return true;
    },
    "/swrd": function(msg) {
        var swd = msg.slice(6), index = shieldWords.indexOf(swd);
        if (!swd) {
            pushMessage({ text: "目前的检测屏蔽词有：" + shieldWords.join(", "), change: "info" });
        } else if (index == -1) {
            pushMessage({ text: `屏蔽词列表添加"${swd}"！`, change: "info" });
            shieldWords.push(swd);
        } else {
            shieldWords.splice(index, 1);
            pushMessage({ text: `屏蔽词列表删除"${swd}"！`, change: "info" });
        }
        sent(msg);
        return true;
    },
    "/ig": function(msg) {
        var hash = msg.slice(4);
        var list = channels[actAnnel].shielded.hash;
        var index = list.indexOf(hash);
        if (index != -1) {
            list.splice(index, 1);
            pushMessage({ text: `已取消屏蔽hash: "${hash}"`, change: "info" });
        } else {
            pushMessage({ text: `已屏蔽hash: "${hash}"`, change: "info" });
            list.push(hash);
        }
        return true;
    },
    "/temp": function(msg) {
        var temp = msg.slice(6);
        if (temp) {
            msgTemplate = localStorage["msg-template"] = temp;
            pushMessage({ text: "已成功设置消息模板！", change: "info" });
        } else {
            msgTemplate = null;
            localStorage.removeItem("msg-template");
            pushMessage({ text: "已成功删除消息模板！", change: "info" });
        }
        return true;
    },
    "/setbg": function(msg) {
        var bg = msg.slice(6);
        if (bg) {
            document.body.setAttribute("style", "background-image: url('" + bg + "')");
        } else {
            document.body.removeAttribute("style");
        }
    }
}
const CMDKEYS = Object.keys(CMDS);
const KEYS = {
    up: function(e) {
        var input = $("#chatinput");
        // 回溯历史消息
        if ((e === false || input.selectionStart === 0) && lastSentPos < lastSent.length - 1) {
            if (e) e.preventDefault();
            if (lastSentPos == 0) {
                lastSent[0] = input.value;
            }
            lastSentPos += 1;
            input.value = lastSent[lastSentPos];
            input.selectionStart = input.selectionEnd = input.value.length;

            updateInputSize();
        }
    },
    down: function(e) {
        var input = $("#chatinput");
        if ((e === false || input.selectionStart === input.value.length) && lastSentPos > 0) {
            if (e) e.preventDefault();
            lastSentPos -= 1;
            input.value = lastSent[lastSentPos];
            input.selectionStart = input.selectionEnd = 0;

            updateInputSize();
        }
    }
}
var customMsg = [];
function addCustom(customId, userid, text, elem) {
    customMsg.push({
        customId,
        userid,
        text,
        elem,
    });
}
// 发送消息&消息预处理
function sendMsg(msg, trace = true, ws) {
    var rawMsg = msg;
    if (!shouldConnect && msg == "/join") {
        return checkNick(actAnnel, inputNick());
    }
    ws = ws || channels[actAnnel].socket;
    var func;
    for (var key of CMDKEYS) {
        if (msg.startsWith(key)) {
            func = CMDS[key];
            if (func(msg)) return;
            break;
        }
    }
    if (msgTemplate && !msg.startsWith("/")) msg = msgTemplate.replaceAll("%m", msg);

    if ($("#allCustom")) send({cmd: "chat", text: msg, customId: randomCustom()}, ws);
    else send({cmd: "chat", text: msg}, ws);
    
    if (trace) {
        sent(rawMsg);
        var dt = new Date();
        $("#chatinput").placeholder = choice(holders).replace("hour", dt.getHours());
    }
}
// 红叉
function closePage(ele) {
    ele.parentElement.classList.add("hidden");
}
$("#image").onchange = function(e) {
    localStorage.allowImages = allowImages = e.target.checked;
}
$("#imgToggle").onchange = function(e) {
    localStorage.toggle = toggle = e.target.checked;
}
$("#sound-notify").onchange = function(e) {
    localStorage["sound-notify"] = e.target.checked;
}
$("#auto-scroll").onchange = function(e) {
    localStorage["auto-scroll"] = autoScroll = e.target.checked;
}
$("#atsb").onclick = function() {
    insertAtCursor("@" + choiced.nick + " ");
}
$("#ignore").onclick = function(e) {
    var achannel = channels[actAnnel], val = $("#ig-selector").value;
    var shielded = achannel.shielded[val];
    var name = achannel.onlines[choiced.nick][val];

    var index = shielded.indexOf(name);
    if (index == -1) {
        shielded.push(name);
        pushMessage({ text: "已成功屏蔽他的信息！", change: "info" });
    } else {
        shielded.splice(index, 1);
        pushMessage({ text: "已成功==取消==屏蔽他的信息！", change: "info" });
    }
}
$("#ig-selector").onclick = function(e) {
    e.stopPropagation();
}
$("#mdpreview").onclick = function() {
    var text = $("#chatinput").value;
    $("#view > p").innerHTML = md.render(text)
    $("#mdviewer").classList.remove("hidden");
}
$("#delete-msg").onclick = function() {
    choiced.ele.remove();
}
$("#copy-hash").onclick = function() {
    var trip = choiced.ele.firstChild.firstChild;
    if (trip.title) {
        copy(trip.title);
    }
}
$("#reply-sb").onclick = function() {
    var arr = choiced.nick.split("#");
    insertAtCursor(`>${arr[1] || ""} ${arr[0]}:\n>${choiced.text.split("\n").join("\n>")}\n\n`);
    updateInputSize();
    $("#chatinput").focus();
}
$("#custom-msg").onclick = function() {
    var textEl = choiced.ele.querySelector(".text");
    var input = document.createElement("textarea");
    input.value = choiced.text;
    textEl.classList.add("hidden");
    choiced.ele.appendChild(input);
    input.onkeydown = function(e){
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            send({cmd: "updateMessage", mode: "overwrite", text: input.value, customId: textEl.getAttribute("cusId")}, channels[choiced.channel].socket);
            textEl.classList.remove("hidden");
            input.remove();
        }
    }
}
$("#key-enter").onclick = function() {
    insertAtCursor("\n");
}
$("#key-up").onclick = function() {
    KEYS.up(false);
    $("#chatinput").focus();
}
$("#key-down").onclick = function() {
    KEYS.down(false);
    $("#chatinput").focus();
}
$("#more-opt").onclick = function() {
    $("#moptions").classList.remove("hidden");
    if (localStorageGet("copy-template")) {
        $("#copy-temp").value = copyTemplate;
    }
}
$("#clink").onchange = function() {
    var val = Number($("[name='clink']:checked").value);
    localStorage["channel-link"] = cLink = val;
}
var newJoin = $("#join-channel").onclick = function() {
    $("#new-input").classList.remove("hidden");
    $("#new-nick").value = channels[actAnnel].fullnick;
    $("#new-color").value = channels[actAnnel].color;
    $("#no-color").checked = false;
}
$("#rjoin").onclick = function() {
    var channel = $("#new-channelname").value;
    var nick = $("#new-nick").value;
    var color = $("#new-color").value;
    if ($("#no-color").checked) {
        color = null;
    }
    if (!channel) {
        pushMessage({ text: "频道不正确！", change: "warn" });
    }
    else if (channels[channel]) {
        pushMessage({ text: "不能两次加入同一个频道！", change: "warn" })
    }
    else {
        join(channel, nick, color);
        $("#new-input").classList.add("hidden");
    }
}
$("#close-channel").onclick = function() {
    if (Object.keys(channels).length < 2) {
        pushMessage({ text: "至少要保留一个频道！", change: "warn" });
    }
    else {
        var ws = channels[actAnnel].socket;
        if (ws.readyState != ws.CLOSED) {
            ws.onclose = null;
            ws.close();
        }
        pushMessage({ text: "已退出 ?" + actAnnel, change: "info", channel: actAnnel });
        delete channels[actAnnel];

        var channel = Object.keys(channels)[0];
        $(`#users-change > option[value="${actAnnel}"]`).remove();
        $("#users-change").value = channel;
        usersPrint(channel);
    }

}
$("#users-change").onchange = function(e) {
    var channel = e.target.value;
    if (actAnnel == channel) return;
    usersPrint(channel);
}
$("#channel-color").onclick = function(e) {
    $("#bgcPicker").value = channels[actAnnel].color;
    $("#bgcPicker").click();
}
$("#bgcPicker").onchange = function(e) {
    channels[actAnnel].color = e.target.value;
}
$("#msg-cancel").onclick = function(e) {
    $("#mult-oper").classList.remove("cflex");
    $("#mult-oper").classList.add("hidden");
    $("#mbuttons").classList.remove("hidden");
    $("#mbuttons").classList.add("flex");
    var msgs = Object.values(mults);
    for (var [i, v] of msgs) {
        i.classList.remove("mult");
    }
    mults = {};
    multf = false;
}
$("#msg-delete").onclick = function(e) {
    var msgs = Object.values(mults);
    for (var [i, v] of msgs) {
        i.remove();
    }
    mults = {};
}
$("#msg-copy").onclick = function(e) {
    var msgs = Object.values(mults);
    var text = "";
    for (var [i, v] of msgs) {
        var txt = copyTemplate.replace("$c$", v.channel || "").replace("$n$", v.nick).replace("$m$", v.text);
        text += txt.replace("$h$", v.hash || "").replace("$t$", v.trip || "") + "\n";
    }
    copy(text);
}
$("#mult-select").onclick = function(e) {
    $("#mult-oper").classList.add("cflex");
    $("#mult-oper").classList.remove("hidden");
    $("#mbuttons").classList.add("hidden");
    $("#mbuttons").classList.remove("flex");
    multf = true;
    choiced.ele.querySelector("a").click();
}
$("#temp-set").onclick = function(e) {
    var val = $("#copy-temp").value;
    if (val) {
        copyTemplate = localStorage["copy-template"] = val;
    } else {
        copyTemplate = "?$c$: $t$ $n$\n$m$\n";
        localStorage.removeItem("copy-template");
    }

}
$("#only-now").onclick = function(e) {
    onlyRead = !onlyRead;
    var atBottom = isAtBottom();
    if (onlyRead) {
        hideOthers(actAnnel);
        e.target.textContent = "显示所有消息";
    } else {
        var hiddens = $(".messages > .hidden", true);
        hiddens.forEach(function(ele) {
            ele.classList.remove("hidden");
        });
        e.target.textContent = "只看此频道";
    }
    if (atBottom) {
        window.scrollTo(0, document.body.scrollHeight);
    }
}
$("#last-max").onchange = function(e) {
    localStorage["last-max"] = lastMax = Number(e.target.value);
}
$("#new-msg > a").onclick = function(e) {
    window.scrollTo(0, document.body.scrollHeight);
    updateTitle();
}
$("#zwichk").onclick = function(e) {
    var cnl = channels[actAnnel];
    whisper(cnl.myNick, "i:check", false);
}
$("#del-color").onclick = function(e) {
    channels[actAnnel].color = null;
    pushMessage({ text: "删除当前频道标识色成功！", change: "info" });
}

var lastSent = [""], lastSentPos = 0;
var choiced = {}, atCont = {};
var unread = 0, ated = false, onlyRead = false;
var cLink = localStorageGet("channel-link") || 2;
$(`#${anwz[cLink]}`).checked = true;
var found = { index: 0, nicks: [] };

function rejoin(channel, nick) {
    var ws = channels[channel].socket;
    var color = channels[channel].color;
    if (ws.readyState != ws.CLOSED) {
        ws.onclose = null;
        ws.close();
    }
    delete channels[channel];
    var nhannel = Object.keys(channels)[0];
    $(`#users-change > option[value="${channel}"]`).remove();
    $("#users-change").value = nhannel;
    join(channel, nick, color);
}
function initChannel(channel, ws, color = null) {
    var option = document.createElement("option");
    option.textContent = channel;
    option.value = channel;
    $("#users-change").appendChild(option);
    $("#users-change").value = channel;
    return channels[channel] = {
        socket: ws,
        onlines: {},
        shielded: {
            nick: [],
            trip: [],
            hash: []
        },
        kicked: false,
        color: color,
        nicks: []
    };
}
function join(channel, nick, color = null) {
    var wasConnected = false;
    var ws = new WebSocket("wss://hack.chat/chat-ws");

    var nowAnnel = initChannel(channel, ws, color);
    actAnnel = channel;

    ws.onopen = function() {
        if (!wasConnected) {
            if (nick) shouldConnect = true;
            else nick = inputNick();
            checkNick(channel, nick);
        }
        wasConnected = true;
    }
    ws.onclose = function() {
        if (wasConnected) {
            var timeout;
            if (!nowAnnel.kicked) {
                timeout = 2000;
                pushMessage({ text: "掉线了！正在重连……", channel: channel, change: "warn" });
            }
            else {
                timeout = 0;
                nowAnnel.kicked = false;
            }
            window.setTimeout(function() {
                rejoin(channel, nick);
            }, timeout);
        }
    }
    ws.onmessage = function(message) {
        var result = JSON.parse(message.data);
        var cmd = result.cmd, channel = result.channel;
        var command = COMMANDS[cmd];
        if (command) {
            command.call(null, result);
        }
    }
}
var COMMANDS = {
    chat: function(args) {
        var nick = args.nick, text = args.text, channel = args.channel;
        args.hash = channels[channel].onlines[nick].hash;

        pushMessage(args);

        var mnk = channels[channel].myNick;
        for (var i = 0, cd, arr; i < Kcmd.length; i++) {
            cd = Kcmd[i];
            if (text.startsWith(cd) && namePure(text.slice(cd.length)) == mnk) {
                whisper(mnk, "i:check", false, channels[channel].socket);
                kchannel = channel;
            }
        }
    },
    info: function(args) {
        var channel = channels[args.channel];
        if (args.type == "whisper") {
            if (args.from === args.to || isShielded(args.channel, args.from)) return;
            else if (args.text.split(": ")[1] == "i:check") {
                if (args.channel != (kchannel || actAnnel)) {
                    pushMessage({ change: "warn", text: `非预期的频道 ?${args.channel} , 您可能被踢出了( ⊙ o ⊙ )正在重连……` });
                    channel.kicked = true;
                    ws.close();
                } else {
                    pushMessage({ change: "info", text: `您仍然在 ?${args.channel} 中，请不用担心(‾◡◝)`, channel: kchannel });
                }
                kchannel = null;
                return;
            }
        } else if (args.type == "invite") {
            if (isShielded(args.channel, args.from)) return;
            else if (args.from == channel.myNick) return;
        }
        args.change = "info";
        pushMessage(args);
    },
    emote: function(args) {
        args.change = "info";
        pushMessage(args);
    },
    warn: function(args) {
        args.change = "warn";
        pushMessage(args);
    },
    onlineSet: function(args) {
        var nicks = args.nicks, channel = args.channel;
        var trip, hash, user;
        usersClear();
        for (var i = 0; i < nicks.length; i++) {
            user = args.users[i];
            userAdd(channel, user);
            if (user.isme) {
                trip = user.trip;
                hash = user.hash;
            }
        }
        pushMessage({ change: "info", text: "在线的人有: " + nicks.join(", "), trip: trip, hash: hash, channel: channel });
    },
    onlineAdd: function(args) {
        var nick = args.nick;
        userAdd(args.channel, args);
        if ($("#joined-left").checked) {
            args.change = "info";
            args.text = nick + " 加入";
            pushMessage(args);
        }
    },
    onlineRemove: function(args) {
        var nick = args.nick;
        var user = channels[args.channel].onlines[nick];
        if ($("#joined-left").checked) {
            var args = Object.assign(args, user);
            args.change = "info";
            args.text = nick + " 离开";
            pushMessage(args);
        }
        userRemove(args.channel, nick);
    },
    captcha: function(args) {
        if (!isMobile) {
            var messageEl = document.createElement("div");
            messageEl.id = "cpt-view";
            var arr = args.text.replace(/ /g, "&ensp;&ensp;").replace(/#/g, "@").split("\n");
            for (var i of arr) {
                var textEl = document.createElement("p");
                textEl.innerHTML = i;
                textEl.classList.add("text");
                textEl.classList.add("captcha");
                messageEl.appendChild(textEl);
            }
            $("#messages").appendChild(messageEl);
        } else {
            var messageEl = document.createElement("div");
            messageEl.classList.add("info");

            var nickSpanEl = document.createElement("span");
            nickSpanEl.classList.add("nick");
            messageEl.appendChild(nickSpanEl);

            var nickLinkEl = document.createElement("a");
            nickLinkEl.textContent = "#";
            nickSpanEl.appendChild(nickLinkEl);

            var textEl = document.createElement("pre");
            textEl.style.fontSize = "4px";
            textEl.classList.add("text");
            textEl.innerHTML = args.text;

            messageEl.appendChild(textEl);
            $("#messages").appendChild(messageEl);
        }
    },
    updateUser: function(args) {
        if (args.color) {
            colorSet(args.channel, args.nick, args.color);
        }
    },
    session: function(args) {
        var rooms = args.public, text = "";
        var keys = Object.keys(rooms);
        for (var i of keys) {
            text += `?${i} : ${rooms[i]}&emsp;`;
        };
        pushMessage({ change: "info", text: text });
    },
    updateMessage: function(args) {
        var mode = args.mode, message;
        for (let i of customMsg) {
            if (i.userid === args.userid && i.customId === args.customId) {
                message = i;
                break;
            }
        }
        if (!message) return;

        var newText = message.text;
        if (mode === "overwrite") {
            newText = args.text;
        } else if (mode === "append") {
            newText += args.text;
        } else if (mode === "prepend") {
            newText = args.text + newText;
        }

        var atBottom = isAtBottom();
        message.innerHTML = md.render(newText);
        if (atBottom)  window.scrollTo(0, document.body.scrollHeight);
    }
}
function pushMessage(args) {
    var text = lastMsg = args.text;
    // 消息节点
    var messageEl = document.createElement("div");
    messageEl.classList.add("message");

    // 频道
    if (args.channel) {
        if (args.nick && isShielded(args.channel, args.nick)) return;
        var channel = args.channel;
        var color = channels[channel].color;
        if (color) {
            messageEl.style.backgroundColor = color;
        }
        messageEl.classList.add("c-" + channel);
        if (onlyRead && channel != actAnnel) {
            messageEl.classList.add("hidden");
        }
    }
    // 类别
    if (args.change) {
        if (args.change == "info") {
            messageEl.classList.add("info");
            args.nick = INFO;
        }
        else if (args.change == "warn") {
            messageEl.classList.add("warn");
            args.nick = WARN;
        }
    }
    // 昵称
    var nickSpanEl = document.createElement("span");
    nickSpanEl.classList.add("nick");
    messageEl.appendChild(nickSpanEl);
    if (args.trip) {
        var tripEl = document.createElement("span");
        if (args.uType == "mod") {
            tripEl.textContent = String.fromCharCode(11088) + " " + args.trip + " ";
        } else {
            tripEl.textContent = args.trip + " ";
        }
        tripEl.classList.add("trip");
        nickSpanEl.appendChild(tripEl);
    }
    if (args.hash) {
        if (!args.trip) {
            var tripEl = document.createElement("span");
            tripEl.classList.add("trip");
            tripEl.innerHTML = "&emsp;&emsp; ";
            nickSpanEl.appendChild(tripEl);
        }
        tripEl.title = args.hash;
    }
    if (args.nick) {
        var nickLinkEl = document.createElement("a");
        var mtime = Date.now();
        nickLinkEl.textContent = args.nick;
        if (args.color) {
            nickLinkEl.setAttribute("style", "color: #" + args.color + " !important");
        }
        nickLinkEl.onclick = function() {
            if (multf) {
                mults[mtime] = [messageEl, args];
                messageEl.classList.add("mult");
            } else {
                insertAtCursor("@" + args.nick + " ");
            }
        }
        nickLinkEl.oncontextmenu = function(e) {
            e.preventDefault();
            if (multf) {
                messageEl.classList.remove("mult");
                delete mults[mtime];
            } else {
                moveMenu(e, $("#msg-ctm"));
                choiced.ele = messageEl;
                choiced.nick = args.nick + "#" + (args.trip || "");
                choiced.text = text;
                choiced.channel = args.channel;
            }
        }

        var date = new Date(args.time || Date.now());
        nickLinkEl.title = date.toLocaleString();
        nickSpanEl.appendChild(nickLinkEl);
    }

    // 文本
    if (wordShielded(text)) return;
    var textEl = document.createElement("p");
    textEl.classList.add("text");
    textEl.classList.add("fold");
    textEl.innerHTML = md.render(text)

    textEl.onclick = function(e) {
        if (document.getSelection().toString()) return;
        var atBottom = isAtBottom();
        textEl.classList.toggle("fold");
        if (atBottom) {
            window.scrollTo(0, document.body.scrollHeight);
        }
    }
    // 最讨厌的一集
    if (typeof (args.customId) === "string") {
        addCustom(args.customId, args.userid, text, textEl);
        textEl.setAttribute("cusId", args.customId);
    }

    messageEl.appendChild(textEl);

    // 滚动到底部
    var atBottom = isAtBottom();
    $("#messages").appendChild(messageEl);
    if (atBottom || autoScroll) {
        window.scrollTo(0, document.body.scrollHeight);
    }
    if (verifyAted(args.channel, args.text)) {
        ated = true;
        if ($("#sound-notify").checked) {
            $("#notify-sound").play();
        }
    }
    unread += 1;
    updateTitle();
}
$("#chatinput").onkeydown = function(e) {
    var pos = e.target.selectionStart || 0;
    var text = e.target.value;
    // 单走一个enter
    if (e.keyCode == 13 && !e.shiftKey) {
        if (atCont.flag) {
            var index = text.lastIndexOf("@", pos);
            $("#chatinput").value = text.slice(0, index + 1) + $(".hovered").textContent + " " + text.slice(pos);
            atCont.flag = false;
            $("#at-ctm").classList.add("hidden");
            return e.preventDefault();
        }
        e.preventDefault();
        // 提交信息
        if (e.target.value != "") {
            e.target.value = "";
            sendMsg(text);
            updateInputSize();
        }
    }
    else if (e.keyCode == 38 /* UP */) {
        if (atCont.flag) {
            var divs = $("#at-ctm > a > div", true);
            if (atCont.index <= 0 || atCont.index >= divs.length) atCont.index = divs.length - 1;
            else atCont.index -= 1;
            $(".hovered").classList.remove("hovered");
            divs[atCont.index].classList.add("hovered");
            return e.preventDefault();
        }
        KEYS.up(e);
    }
    else if (e.keyCode == 40 /* DOWN */) {
        if (atCont.flag) {
            var divs = $("#at-ctm > a > div", true);
            atCont.index += 1;
            if (atCont.index >= divs.length) atCont.index = 0;
            $(".hovered").classList.remove("hovered");
            divs[atCont.index].classList.add("hovered");
            return e.preventDefault();
        }
        KEYS.down(e);
    }
    else if (e.keyCode == 9 /* TAB */) {
        if (e.ctrlKey) {
            // Ctrl+Tab是浏览器换标签页的
            return;
        }
        e.preventDefault();

        var index = text.lastIndexOf("@", pos);
        var autocompletedNick = false;
        if (index != -1) {
            var stub = text.substring(index + 1, pos).toLowerCase();
            // 找昵称
            var nicks = channels[actAnnel].nicks.filter(function(nick) {
                return nick.toLowerCase().startsWith(stub);
            });
            if (nicks.length > 0) {
                autocompletedNick = true;
                $("#chatinput").value = text.slice(0, index + 1) + nicks[0] + " " + text.slice(pos);
                found.nicks = nicks;
                $("#at-ctm").classList.add("hidden");
            } else if (found.nicks[0]) {
                autocompletedNick = true;
                found.index = (found.index + 1) % found.nicks.length;
                var nowNick = found.nicks[found.index];
                $("#chatinput").value = text.slice(0, index + 1) + nowNick + " " + text.slice(pos);
                pos = index + nowNick.length + 2;
                e.target.setSelectionRange(pos, pos);
            }
        }
        // 没有找到昵称则插入Tab
        if (!autocompletedNick) {
            insertAtCursor("\t");
        }
    }
    else if (e.key == "@") {
        atCont.flag = true;
        atCont.index = 0;
        $("#at-ctm").style.bottom = $("#mbuttons").scrollHeight + $("#chatform").scrollHeight + 2 + "px";
    }
    else if (e.keyCode == 8 /* Backspace */) {
        if (pos && $("#chatinput").value[pos - 1] == "@") {
            atCont.flag = false;
            $("#at-ctm").classList.add("hidden");
        }
    }
    else if (found.nicks[0] && !e.shiftKey) {
        found.nicks = [];
        found.index = 0;
    }
    e.stopPropagation();
}
updateInputSize();
function mainpage() {
    if (ws && ws.readyState == ws.OPEN) {
        ws.send(JSON.stringify({ cmd: "session" }));
    }
}

if (actAnnel == "") {
    var ws = new WebSocket("wss://hack.chat/chat-ws");
    ws.onmessage = function(message) {
        var result = JSON.parse(message.data);
        var rooms = result.public;
        if (rooms) {
            var keys = Object.keys(rooms);
            var string = "";
            for (var i = 0; i < keys.length; i++) {
                string += "| ?" + keys[i] + "|" + rooms[keys[i]];
                if (i % 2) {
                    string += "|";
                    frontpage.splice(14 + i / 2, 0, string);
                    string = "";
                }
            }
            frontpage = frontpage.join("\n");
            pushMessage({ text: frontpage, hash: "Qm9jY2hpQ2hhbg", change: "info" });
            $(".text").classList.remove("fold");
        }
    }
    ws.onopen = mainpage;
} else {
    var nick = location.hash.slice(1);
    join(actAnnel, nick);
}