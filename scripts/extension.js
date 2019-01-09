function setInfo(info) {
    console.log("getting");
    console.log(info);
}

document.addEventListener('DOMContentLoaded', function() {
    jQuery('status').textContent = "Click button to get status count.";
    let button = document.getElementById('getcount');
    button.addEventListener('click', function () {
        $('#status').html('Getting statuses');
        let text = "count";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {data: text}, setInfo);
        });
    });

    let buttonjql = document.getElementById('getcountjql');
    buttonjql.addEventListener('click', function () {
        $('#status').html('Getting statuses');
        let text = "countjql";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {data: text}, setInfo);
        });
    });

    let buttonSprint = document.getElementById('getsprinthealth');
    buttonSprint.addEventListener('click', function () {
        $('#status').html('Getting statuses');
        let text = "sprint";
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {data: text}, setInfo);
        });
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    $('#status').html(message.message);
    jQuery("#accordion").accordion();
    if (jQuery("#accordionTickets").length) {
        jQuery("#accordionTickets").accordion();
    }
});