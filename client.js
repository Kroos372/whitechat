"use strict";
//自定义变量
var actAnnel = window.location.search.replace(/^\?/, "");
// 迟早要把channels写成类
var channels = {}, kchannel, Kcmd = [".m kick"], shieldWords = [];
var lastMsg, shouldConnect, mults = {}, multf = false;
var copyTemplate = localStorageGet("copy-template") || "?$c$: $t$ $n$\n$m$\n";
var msgTemplate = localStorageGet("msg-template");
const WSADD = "wss://hack.chat/chat-ws"

// 自定义命令，return true代表不继续发送消息
const CMDS = {
    "/k ": function(msg) {
        whisper(namePure(msg.slice(3)), "$\\begin{pmatrix}qaq\\\\[29471285em]\\end{pmatrix}$");
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
            pushMessage({ text: "目前的检测Kick命令有：" + Kcmd.join(", "), change: "info", channel: actAnnel });
        } else if (index == -1) {
            Kcmd.push(kd);
            pushMessage({ text: `Kick检测列表添加"${kd}"！`, change: "info", channel: actAnnel });
        } else {
            Kcmd.splice(index, 1);
            pushMessage({ text: `Kick检测列表删除"${kd}"！`, change: "info", channel: actAnnel });
        }
        return true;
    },
    "/swrd": function(msg) {
        var swd = msg.slice(6), index = shieldWords.indexOf(swd);
        if (!swd) {
            pushMessage({ text: "目前的检测屏蔽词有：" + shieldWords.join(", "), change: "info", channel: actAnnel });
        } else if (index == -1) {
            pushMessage({ text: `屏蔽词列表添加"${swd}"！`, change: "info", channel: actAnnel });
            shieldWords.push(swd);
        } else {
            shieldWords.splice(index, 1);
            pushMessage({ text: `屏蔽词列表删除"${swd}"！`, change: "info", channel: actAnnel });
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
            pushMessage({ text: `已取消屏蔽hash: "${hash}"`, change: "info", channel: actAnnel });
        } else {
            list.push(hash);
            pushMessage({ text: `已屏蔽hash: "${hash}"`, change: "info", channel: actAnnel });
        }
        sent(msg);
        return true;
    },
    "/temp": function(msg) {
        var temp = msg.slice(6);
        if (temp) {
            msgTemplate = localStorage["msg-template"] = temp;
            pushMessage({text: "已成功设置消息模板！", change: "info", channel: actAnnel});
        } else {
            msgTemplate = null;
            localStorage.removeItem("msg-template");
            pushMessage({text: "已成功删除消息模板！", change: "info", channel: actAnnel});
        }
        sent(msg);
        return true;
    },
    "/setbg": function(msg) {
        var bg = msg.slice(6);
        if (bg) {
            document.body.setAttribute("style", "background-image: url('" + bg + "')");
        } else {
            document.body.removeAttribute("style");
        }
        sent(msg);
        return true;
    },
    "/help": function(msg) {
        if (!msg.slice(6)) {
            pushMessage({trip: "coBad2", text: help, change: "info", channel: actAnnel});
        }
    },
    "/send": function(msg) {
        channels[actAnnel].socket.send(msg.slice(6));
        sent(msg);
        return true;
    },
    "/face": function(msg) {
        var url = msg.slice(6);
        if (url) {
            var index = emojis.indexOf(url);
            if (index != -1) {
                emojis.splice(index, 1);
                delEmoji(url);
                pushMessage({ text: `已删除表情: "![w](${url})"`, change: "info", channel: actAnnel });
            } else {
                emojis.push(url);
                addEmoji(url);
                pushMessage({ text: `已添加表情: "![w](${url})"`, change: "info", channel: actAnnel });
            }
            sent(msg);
        }
        localStorage["emojis"] = JSON.stringify(emojis);
        return true;
    },
    "/colo ": function(msg) {
        var nick = namePure(msg.slice(6));
        if (channels[actAnnel]) {
            var ol = channels[actAnnel].onlines[nick];
            if (!ol) {
                pushMessage({ text: "没有这个昵称！", change: "info", channel: actAnnel });
            } else if (!ol.color) {
                pushMessage({ text: "该用户还没有颜色", change: "info", channel: actAnnel });
            } else {
                pushMessage({ text: `${nick}的颜色为==${ol.color}==`, change: "info", channel: actAnnel });
            }
            sent(msg);
            return true;
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
var customMsg = [], customHistory = new Map(); // 只是想玩玩Map而已
function addCustom(customId, userid, text, ele, channel) {
    customMsg.push({
        customId,
        userid,
        text,
        ele,
        channel
    });
}
// 发送消息&消息预处理
function sendMsg(msg, trace = true, ws) {
    var rawMsg = msg;
    if (!shouldConnect && msg == "/join") {
        return checkNick(actAnnel, inputNick());
    }
    var func;
    for (var key of CMDKEYS) {
        if (msg.startsWith(key)) {
            func = CMDS[key];
            if (func(msg)) return;
            break;
        }
    }
    ws = ws || channels[actAnnel].socket;
    if (msgTemplate && !msg.startsWith("/")) msg = msgTemplate.replaceAll("%m", msg);

    if ($("#allCustom").checked){
        send({cmd: "chat", text: msg, customId: randomCustom()}, ws);
    } 
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
// lastSent分频道太麻烦了，下次一定
var lastSent = [""], lastSentPos = 0; 
var choiced = {}, atCont = {};
var onlyRead = false; // onlyNow
var cLink = localStorageGet("channel-link") || 2;
$(`#${anwz[cLink]}`).checked = true;
var found = {index: 0, nicks: []};

function rejoin(channel, nick) {
    var ws = channels[channel].socket;
    var color = channels[channel].color;
    if (ws.readyState != ws.CLOSED) {
        ws.onclose = null;
        ws.close();
    }
    delete channels[channel];
    $(`#cl-${channel}`).remove();
    var nhannel = Object.keys(channels)[0];
    if (nhannel) {
        $(`#cl-${nhannel} > button`).click();
    }
    join(channel, nick, color);
}
function initChannel(channel, ws, color=null) {
    channels[channel] = {
        socket: ws,
        onlines: {},
        shielded: {
            nick: [],
            trip: [],
            hash: []
        },
        kicked: false,
        color: color,
        nicks: [],
        unread: 0,
        ated: false
    };

    var p = document.createElement("p");
    var btn = document.createElement("button");
    btn.textContent = channel;
    p.id = "cl-" + channel;
    p.appendChild(btn);
    btn.style.backgroundColor = $("#chatinput").style.backgroundColor = color;

    btn.onclick = function(e) {
        try {
            $(".act-channel").classList.remove("act-channel");
        } catch (e) { }
        p.classList.add("act-channel");
        usersPrint(channel);
    };
    btn.oncontextmenu = function(e) {
        e.preventDefault();
        channels[channel].unread = 0;
        channels[channel].ated = false;
        updateTitle();
    };

    $("#channel-list").appendChild(p);
    btn.click();

    return channels[channel];
}
function join(channel, nick, color = null) {
    var wasConnected = false;
    var ws = new WebSocket(WSADD);
    var nowAnnel = initChannel(channel, ws, color);
    actAnnel = channel;

    ws.onopen = function() {
        if (!wasConnected) {
            if (nick) shouldConnect = true;
            else nick = inputNick();
            checkNick(channel, nick);
        }
        wasConnected = true;
    };
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
    };
    ws.onmessage = function(message) {
        var result = JSON.parse(message.data);
        var cmd = result.cmd;
        if (result.channel) {
            channel = result.channel;
        } else {
            result.channel = channel;
        }
        var command = COMMANDS[cmd];
        if (command) {
            try {
                command.call(null, result);
            } catch (err) {
                pushMessage({text: `出问题了！\n${err.message}`, change: "warn", channel: actAnnel});
            }
        }
    };
}
var COMMANDS = {
    chat: function(args) {
        var nick = args.nick, text = args.text, channel = args.channel;
        try {
            args.hash = channels[channel].onlines[nick].hash;
        } catch (err) { }

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
                kchannel = kchannel || actAnnel;
                if (args.channel != kchannel) {
                    pushMessage({change: "warn", text: `非预期的频道 ?${args.channel} , 您可能被踢出了( ⊙ o ⊙ )`, channel: kchannel});
                } else {
                    pushMessage({change: "info", text: `您仍然在 ?${args.channel} 中，请不用担心(‾◡◝)`, channel: kchannel});
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
        var channel = args.channel, me = {};
        usersClear();
        for (let user of args.users) {
            userAdd(channel, user);
            if (user.isme) {
                me = user;
            }
        }
        pushMessage(Object.assign({change: "info", text: "在线的人有: " + args.nicks.join(", ")}, me));
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
        if (args.public) {
            var rooms = args.public, text = "";
            var keys = Object.keys(rooms);
            for (var i of keys) {
                text += `?${i} : ${rooms[i]}&emsp;`;
            };
            pushMessage({change: "info", text: text});
        }
    },
    updateMessage: function(args) {
        var mode = args.mode, customId = args.customId, message;
        for (let i of customMsg) {
            if (i.userid === args.userid && i.customId === customId && i.channel == args.channel) {
                message = i;
                break;
            }
        }
        if (!message) return;

        var newText = message.text;
        if (!customHistory.get(customId)) customHistory.set(customId, [newText]);
        if (mode === "overwrite") {
            newText = args.text;
        } else if (mode === "append") {
            newText += args.text;
        } else if (mode === "prepend") {
            newText = args.text + newText;
        }
        customHistory.get(customId).push(newText);

        var atBottom = isAtBottom();
        message.text = newText;
        message.ele.innerHTML = md.render(verifyLatex(newText));
        message.ele.ondblclick = function() {
            copy(customHistory.get(customId).join("\n"));
        }
        if (atBottom) window.scrollTo(0, document.body.scrollHeight);
    }
}
// JSON转HTML元素
function pushMessage(args) {
    var text = lastMsg = args.text, customId = args.customId;
    // 消息节点
    var messageEl = document.createElement("div");
    messageEl.classList.add("message");
    // 频道
    if (args.channel) {
        var channel = args.channel;
        if (!channels[channel]) {
            pushMessage({change: "warn", text: `非预期的频道 ?${channel} , 您可能被踢出，请重连`});
            return;
        }
        if (args.nick && isShielded(args.channel, args.nick)) return;
        var color = channels[channel].color;
        if (color) {
            messageEl.style.backgroundColor = color;
        }
        messageEl.classList.add("c-" + channel);
        if (onlyRead) {
            if (channel != actAnnel) {
                messageEl.classList.add("hidden");
            }
        }
    }
    // 类别
    if (args.change) {
        if (args.change == "info") {
            messageEl.classList.add("info");
            args.nick = INFO;
        } else if (args.change == "warn") {
            messageEl.classList.add("warn");
            args.nick = WARN;
        }
    }
    var nickSpanEl = document.createElement("span");
    nickSpanEl.classList.add("nick");
    messageEl.appendChild(nickSpanEl);
    // 识别码
    if (args.trip) {
        var tripEl = document.createElement("span");
        if (args.uType == "admin") {
            tripEl.textContent = String.fromCharCode(10024) + " " + args.trip + " ";
        } else if (args.uType == "mod") {
            tripEl.textContent = String.fromCharCode(11088) + " " + args.trip + " ";
        } else {
            tripEl.textContent = args.trip + " ";
        }
        // 机器人🤖
        if (args.flair) {
            tripEl.textContent = args.flair + " " + tripEl.textContent;
        }
        tripEl.classList.add("trip");
        nickSpanEl.appendChild(tripEl);
    }

    // hash
    if (args.hash) {
        if (!args.trip) {
            var tripEl = document.createElement("span");
            tripEl.classList.add("trip");
            tripEl.innerHTML = "&emsp;&emsp; ";
            nickSpanEl.appendChild(tripEl);
        }
        tripEl.title = args.hash;
        tripEl.oncontextmenu = function(e) {
            copy(args.hash);
            e.preventDefault();
        };
        tripEl.ondblclick = function() {
            if (args.channel && channels[channel]) {
                $(`#cl-${channel} > button`).click();
            }
        }
    }
    // 昵称
    if (args.nick) {
        var nickLinkEl = document.createElement("a");
        var mtime = Date.now();
        nickLinkEl.textContent = args.nick;
        if (args.color) {
            nickLinkEl.setAttribute("style", "color: #" + args.color + " !important");
        }
        nickLinkEl.addEventListener("click", function(e) {
            if (multf) {
                mults[mtime] = [messageEl, args];
                messageEl.classList.add("mult");
            } else {
                insertAtCursor("@" + args.nick + " ");
            }
        });
        // 唐
        function nickText() {
            choiced.nick = args.nick + "#" + (args.trip || "");
            if (typeof (customId) === "string") {
                for (let i of customMsg) {
                    if (i.customId === customId && i.userid == args.userid) {
                        choiced.text = i.text;
                        break;
                    }
                }
            } else {
                choiced.text = text;
            }
        }
        nickLinkEl.addEventListener("mousedown", function(e){
            var btnNum = e.button;
            nickText();
            if (btnNum != 0) {
                if (btnNum == 1) {
                    e.preventDefault();
                    ctxReply(false);
                }
            }
        });
        nickLinkEl.addEventListener("contextmenu", function(e) {
            e.preventDefault();
            if (multf) {
                messageEl.classList.remove("mult");
                delete mults[mtime];
            } else {
                if (!choiced.nick) {
                    nickText();
                }
                choiced.ele = messageEl;
                choiced.channel = args.channel;
                moveMenu(e, $("#msg-ctm"));
            }
        });

        var date = new Date(args.time || Date.now());
        nickLinkEl.title = date.toLocaleString();
        nickSpanEl.appendChild(nickLinkEl);
    }
    // 文本
    if (wordShielded(text)) return;
    var textEl = document.createElement("p");
    textEl.classList.add("text");
    textEl.classList.add("fold");
    textEl.innerHTML = md.render(verifyLatex(text));

    textEl.onclick = function(e) {
        if (document.getSelection().toString()) return;
        var atBottom = isAtBottom();
        textEl.classList.toggle("fold");
        if (atBottom) {
            window.scrollTo(0, document.body.scrollHeight);
        }
    }
    // 最讨厌的一集
    if (typeof (customId) === "string") {
        addCustom(customId, args.userid, text, textEl, channel);
        textEl.setAttribute("cusId", customId);
    }
    messageEl.appendChild(textEl);

    // 滚动到底部
    var atBottom = isAtBottom();
    $("#messages").appendChild(messageEl);
    if (atBottom) {
        window.scrollTo(0, document.body.scrollHeight);
    }
    // 未读消息与@
    if (verifyAted(args.channel, args.text)) {
        channels[channel].ated = true;
        if ($("#sound-notify").checked) {
            $("#notify-sound").play();
        }
    }
    if (args.channel) {
        channels[channel].unread += 1;
    }
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

if (actAnnel == "") {
    var ws = new WebSocket(WSADD);
    ws.onopen = function (){
        if (ws && ws.readyState == ws.OPEN) {
            ws.send(JSON.stringify({cmd: "getchannels"}));
        }
    };
    ws.onmessage = function(message) {
        var result = JSON.parse(message.data);
        var rooms = result.list;
        if (rooms) {
            var string = "";
            for (var i = 0; i < rooms.length; i++) {
                string += "| ?" + rooms[i].name + "|" + rooms[i].count;
                if (i % 2) {
                    string += "|";
                    frontpageH.push(string);
                    string = "";
                }
            }
            var frontpage = frontpageH.concat(frontpageF).join("\n");
            pushMessage({text: frontpage, hash: "Qm9jY2hpQ2hhbg", change: "info" });
            $(".text").classList.remove("fold");
        }
    }
    pushMessage({text: frontpage, hash: "Qm9jY2hpQ2hhbg", change: "info" });
    $(".text").classList.remove("fold");
} else {
    var nick = location.hash.slice(1);
    join(actAnnel, nick);
}