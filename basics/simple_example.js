
window.onload = function(){


let buttonSend = document.getElementById("send-button");
let buttonStop = document.getElementById("stop-button");
buttonSend.onclick = function(){
    console.log("button clicked");
};
let video = document.getElementById('video');
// checking if WebSockets are enabled on the browser



if(window.WebSocket) {
    /**
     These all check for the same thing
     window.WebSocket === "WebSockets" in window === window["WebSockets"]
     */
    console.log("Websockets are supported.");

    // here we will establish connection to websockets server
    let webSocket = new WebSocket("ws://echo.websocket.org");
    /**
     * Websocket has four main events
     * onopen
     * onmessage
     * onclose
     * onerror
     */

    // onopen is created after the initial handshake between client and server was established
    webSocket.onopen = function (event) {
        console.log("Connection was established.");
        document.getElementById("status-label").innerHTML = "Connection Established!";
    }

    // onmessage event is triggeredwhenever servers send some message to the client
    webSocket.onmessage = function(message){
        console.log("Data was received!");
        console.log(message);
        if("string" === typeof message.data){
            document.getElementById("status-label").innerHTML = message.data;
            addToMessageWall(message.data);
        } else if (event.data instanceof Blob){
            /**
             * If type is blob, we create
             * @type {{prototype: URL; new(url: string, base?: (string | URL)): URL; createObjectURL(object: any): string; revokeObjectURL(url: string): void} | webkitURL}
             */
            // create new url for the blob object
            window.URL = window.URL || window.webkitURL
            let source = window.URL.createObjectURL(event.data)
            // create an image tag programatically
            let image = document.createElement("img");
            image.src = source;
            image.alt = "Image created from blob.";
            // insert new image at the end of the document
            document.body.appendChild(image);

            // this will handle video streaming
            window.URL = window.URL || window.webkitURL;
            let videoSource = window.URL.createObjectURL(event.data);
            // update the image source
            video.src = videoSource;
            // release the allocated memory
            window.URL.revokeObjectURL(videoSource);

        }
    };

    // onclose event marks the end of the conversation
    // afterwards no messages can be exchanged
    // reason can be determined from parameters code, wasClean and reson
    webSocket.onclose = function(close){
        if(close.wasClean){
            updateStatusLabel("Connection was closed normally.");
        } else {
            updateStatusLabel(`Connection was closed with message ${close.reason} and code ${close.code}.`);
        }
    };

    // onerror marks a case where something goes wrong. One thing to not e is that onError will always result with
    // onclose event right after it
    webSocket.onerror = function(error){
        console.log("An error occured.");
        updateStatusLabel(`Error: ${error.data}`);
    };


    // handle array buffers with document ondrop
    document.ondrag = (drag) => {
        console.log('document.ondrag is happening');
        drag.stopPropagation();
        drag.preventDefault();
        return false;
    };

    document.ondrop = (drop) => {
        console.log('document.ondrop occured');
        drop.preventDefault();
        drop.stopPropagation();
        let file = drop.dataTransfer.files[0];
        webSocket.send(file);
        return false

    };

    // there are two actions that can be triggered by user directly (or should be)

    buttonSend.onclick = (click) => {
        if(webSocket.readyState = WebSocket.OPEN){
            webSocket.send(document.getElementById("text-view").value);
            document.getElementById("text-view").value = null;
        } else {
            updateStatusLabel('Websocket is not open.');
        }
    };

    // close event is goodbye handshake
    buttonStop.onclick = (close) => {
        console.log("Stop button was clicked");
        if(webSocket.readyState = WebSocket.OPEN){
            console.log("websocket status was open, now will be closed");
            webSocket.close();

            // it's aloso possbiel to deliberately disconnect websockets
        //    webSocket.close(1000, "Deliberate disconnect");
        }
    }
    /**
     * Few additional methods are awailable from websockets api
     * url = returns url of the websockets
     * protocol = returns protocol used by the server
     * readyState = few options are available:
     *              WebSocket.OPEN / .CLOSE / .CONNECTING / .CLOSING
     * bufferedAmount = total amount of bytes that were queued when send was called
     * binaryType = returns binary data format we received when the onmessage event was raised
     */


    // array buffer allows files / images to be dragged and droppped into the chat
    // this will get the file,
    document.ondrop = (drop) => {
        let file = drop.dataTransfer.files[0];
        let reader = new FileReader();

        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            webSocket.send(reader.result);
        }
        return false;
    }

} else {
    console.log("Websockets are not supported");
    alert("Websockets are not supported.");
}

function updateStatusLabel(message) {
    document.getElementById("status-label").innerHTML = message;
    addToMessageWall(message, "Server response");
}

function addToMessageWall(message, badge = "Server response") {
    $('#message-wall').prepend(
        `<li class="list-group-item d-flex justify-content-between align-items-center message-item">
            ${message}
            <span class="badge badge-pill badge-warning">${badge}</span>
        </li>`
    );
}

}