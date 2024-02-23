"use strict";
// 侧边栏checkbox
$("#pin-sidebar").onchange = function (e) {
    localStorageSet("pin-sidebar", e.target.checked);
}
$("#joined-left").onchange = function (e) {
    localStorageSet("joined-left", e.target.checked);
}
$("#sound-notify").onchange = function(e) {
    localStorage["sound-notify"] = e.target.checked;
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
$("#image").onchange = function(e) {
    localStorage.allowImages = allowImages = e.target.checked;
}
$("#imgToggle").onchange = function(e) {
    localStorage.toggle = toggle = e.target.checked;
}
$("#strictMd").onchange = function(e) {
    localStorage.strictMd = strictMd = e.target.checked;
}
// 一些不优雅的按键
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
$("#button").onclick = function (e) {
    butt_funcs[$("#bar-ttons").value]();
}
$("#colorPicker").oninput = function (e) {
    $("#picker").style.backgroundColor = e.target.value;
}
// 更多设置
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
$("#temp-set").onclick = function(e) {
    var val = $("#copy-temp").value;
    if (val) {
        copyTemplate = localStorage["copy-template"] = val;
    } else {
        copyTemplate = "?$c$: $t$ $n$\n$m$\n";
        localStorage.removeItem("copy-template");
    }
}
$("#last-max").onchange = function(e) {
    localStorage["last-max"] = lastMax = Number(e.target.value);
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
        $(`#cl-${actAnnel}`).remove();

        var channel = Object.keys(channels)[0];
        $(`#cl-${channel} > button`).click();
        $("#chatinput").style.backgroundColor = channels[channel].color;
    }
}
$("#channel-color").onclick = function(e) {
    $("#bgcPicker").value = channels[actAnnel].color;
    $("#bgcPicker").click();
}
$("#bgcPicker").onchange = function(e) {
    channels[actAnnel].color = e.target.value;
    $(`#cl-${actAnnel} > button`).style.backgroundColor = $("#chatinput").style.backgroundColor = e.target.value;
}
$("#del-color").onclick = function(e) {
    channels[actAnnel].color = null;
    $(`#cl-${actAnnel} > button`).style.backgroundColor = $("#chatinput").style.backgroundColor = null;
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
    if (!onlyRead) {
        Object.keys(channels).forEach(function(channel) {
            $(`#cl-${channel} > button`).textContent = channel;
        })
    }
}
// 在线列表菜单
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
// 手机按键
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
$("#mdpreview").onclick = function() {
    var text = $("#chatinput").value;
    $("#view > p").innerHTML = md.render(verifyLatex(text));
    $("#mdviewer").classList.remove("hidden");
}
$("#zwichk").onclick = function(e) {
    var cnl = channels[actAnnel];
    whisper(cnl.myNick, "i:check", false);
}
$("#funfun").onclick = function(e) {
    let cnl = channels[actAnnel];
    let args = {text: $("#chatinput").value, channel: actAnnel};
    if (cnl) {
        args = Object.assign(args, cnl.onlines[cnl.myNick]);
    } else {
        args.trip = "rrrRRR";
        args.uType = "mod";
        args.nick = "R";
        args.hash = "S2ltaU5pQXNhR2FGdXJ1";
        args.color = "#0cf";
    }
    pushMessage(args);
    $("#chatinput").value = "";
    updateInputSize();
    $("#chatinput").focus();
}
$("#emoji-on").onclick = function(e) {
    e.stopPropagation();
    $("#emojis").classList.remove("hidden");
    $("#chatinput").placeholder = "使用/face <链接>添加或删除表情~";
}
// 传统右键菜单
$("#mult-select").onclick = function(e) {
    $("#mult-oper").classList.add("cflex");
    $("#mult-oper").classList.remove("hidden");
    $("#mbuttons").classList.add("hidden");
    $("#mbuttons").classList.remove("flex");
    multf = true;
    choiced.ele.querySelector("a").click();
}
function ctxReply(at){
    var arr = choiced.nick.split("#");
    var text = choiced.text, shorted;
    if (text.length > 512){
        text = text.slice(0, 512);
        shorted = true;
    }
    var rtext = text.split("\n");
    if (rtext.length > 8){
        rtext.splice(8);
        shorted = true;
    }
    if (shorted) {
        rtext.push("...");
    }
    text = `>${arr[1] || ""} ${arr[0]}：\n>${rtext.join("\n>")}\n\n`;
    if (at) {
        text += `@${arr[0]} `;
    }
    insertAtCursor(text);
    updateInputSize();
}
$("#reply-sb").onclick = function() {
    ctxReply(true);
}
$("#reply-sb").oncontextmenu = function(e) {
    e.preventDefault();
    ctxReply(false);
}
$("#delete-msg").onclick = function() {
    choiced.ele.remove();
}
$("#custom-msg").onclick = function() {
    var textEl = choiced.ele.querySelector(".text");
    var input = document.createElement("textarea");
    input.value = choiced.text;
    textEl.classList.add("hidden");
    var atBottom = isAtBottom();
    choiced.ele.appendChild(input);
    input.focus();
    if (atBottom) {
        window.scrollTo(0, document.body.scrollHeight);
    }

    input.onkeydown = function(e){
        if (e.keyCode == 13 && !e.shiftKey) {
            e.preventDefault();
            try {
                send({cmd: "updateMessage", mode: "overwrite", text: input.value, customId: textEl.getAttribute("cusId")}, channels[choiced.channel].socket);
            } catch(err) { }
            textEl.classList.remove("hidden");
            input.remove();
        } else if (e.keyCode == 27) {
            textEl.classList.remove("hidden");
            input.remove();
        } else if (e.keyCode == 191) {
            e.stopPropagation();
        }
    }
}
// 多选按键
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
// 您有521条新消息
$("#new-msg > a").onclick = function(e) {
    window.scrollTo(0, document.body.scrollHeight);
    updateTitle();
}