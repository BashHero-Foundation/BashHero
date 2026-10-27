pipwerks.SCORM.version = "1.2";

function sendToScormIframe(id, message) {
    document
        .getElementById("app-iframe")
        .contentWindow.postMessage({ id: id, message: message });
}

function handleScormIframeMessage(event) {
    const type = event.data.type;
    const id = event.data.id;
    const field = event.data.payload.field;
    const value = event.data.payload.value;

    if (type == "SET") {
        pipwerks.SCORM.set(field, value);
        pipwerks.SCORM.save();
        sendToScormIframe(id, "ok");
    } else if (type == "GET") {
        const result = pipwerks.SCORM.get(field);
        sendToScormIframe(id, result);
    } else if (type == "LOG") {
        console.log("IFrame Log: ", value);
    }
}

function handleLoad() {
    if (!pipwerks.SCORM.connection.isActive) {
        let connected = pipwerks.SCORM.init();

        if (connected) {
            console.log("connected to scorm :)");
        } else {
            console.warn("failed to connect to scorm");
        }
    }
}

function handleUnLoad() {
    if (SCORM.connection.isActive) {
        SCORM.save();
        const quit = pipwerks.SCORM.quit();

        if (quit) {
            console.log("disconnected from scorm");
        } else {
            console.warn("failed to disconnect from scorm");
        }
    }
}

window.addEventListener("load", handleLoad);
window.addEventListener("unload", handleUnLoad);
window.addEventListener("message", handleScormIframeMessage);
