chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

    let data = request.data || {};

    let results = "";
    function generateHtml(values, key)  
    { 
        results+= '<p>' + key + ' - ' + values +' </p>';
    }

    if (data == "countjql") {
        let jsonObject = JSON.parse(document.body.innerText);
        let statuses = new Map();

        results = '<div id="accordion">';

        jQuery(jsonObject.issues).each(function(){
            results+='<h3>' + this.key + '</h3>';
            jQuery(this.changelog.histories).each(function(){
                if (this.items[0].field == "status") {
                    if (statuses.has(this.items[0].fromString)) {
                        statuses.set(this.items[0].fromString,parseInt(statuses.get(this.items[0].fromString))+1);
                    }
                    else {
                        statuses.set(this.items[0].fromString,1);
                    }
                }
            });

            results+= '<div id="' + this.key + '">';
            statuses.forEach(generateHtml);
            results+='</div>';

        });
        results+='</div>';
        chrome.runtime.sendMessage({from:"script1",message:results});
    }
    else if (data == "count") {
    
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

        function generateCountHtml(values, key)  
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

            statuses.forEach(generateCountHtml); 
            chrome.runtime.sendMessage({from:"script1",message:results});
        });
    }
    else if(data == "sprint") {
        
        let jsonObject = JSON.parse(document.body.innerText);
        let statuses = new Map();
        jQuery(jsonObject.issues).each(function(){
            if (statuses.has(this.fields.status.name)) {
                statuses.set(this.fields.status.name,parseInt(statuses.get(this.fields.status.name)+this.fields.customfield_10004));
            }
            else {
                statuses.set(this.fields.status.name,this.fields.customfield_10004);
            }
        })
        function generateSprintHTML(values, key)  
        { 
            results+= '<p>Story points in ' + key + ' - ' + values +' </p>';
        }
        statuses.forEach(generateSprintHTML);
        chrome.runtime.sendMessage({from:"script1",message:results});
    }

});