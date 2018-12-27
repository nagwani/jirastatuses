function setInfo(info) {
    console.log("getting");
    console.log(info);
}

document.addEventListener('DOMContentLoaded', function() {
    jQuery('status').textContent = "Click button to get status count.";
    let button = document.getElementById('getcount');
    button.addEventListener('click', function () {
        $('#status').html('Getting statuses');
        let text = "";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {data: text}, setInfo);
        });
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    $('#status').html(message.message);
});