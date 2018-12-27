chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

    //get current active jira tab
    let activeJiraTab = jQuery("ul#issue-tabs > li.active");

    let isTabChanged = 0;
    //history tab
    let historyLink = jQuery('a#changehistory-tabpanel');
    if (historyLink.length) {
        isTabChanged = 1;
        historyLink[0].click();
    } 

    var waitForEl = function(selector, callback) {
        if (jQuery(selector).length) {
          callback();
          if(isTabChanged) {
            jQuery('a#'+activeJiraTab[0].attributes[1].nodeValue)[0].click();
          }
        } else {
          setTimeout(function() {
            waitForEl(selector, callback);
            return;
          }, 1000);
        }
    };

    let results = "";
    function generateHtml(values, key)  
    { 
        results+= '<span id="status">' + key + ' - </span><span id="statusCount"> - <b>' + values +' </b></span><br/>';
    }

    let statuses = new Map();
    waitForEl('td.activity-name:contains("Status")', function() {
        // work the magic
        let jiraStatus = jQuery('td.activity-name:contains("Status")').each(function(){
            let status = jQuery.trim(jQuery(this).siblings(".activity-new-val").clone().children().remove().end().text());
            if (statuses.has(status)) {
                statuses.set(status,parseInt(statuses.get(status))+1);
            }
            else {
                statuses.set(status,1);
            }
        });

        statuses.forEach(generateHtml); 
        chrome.runtime.sendMessage({from:"script1",message:results});
    });

});