chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {

    let data = request.data || {};

    let results = "";
    function generateHtml(values, key)  
    { 
        results+= '<p>' + key + ' - ' + values +' </p>';
    }



    let urlParams = new URLSearchParams(window.location.search);
    let jiraURL = window.location.origin;
    let jql = urlParams.get('jql');
    let requestURL = jiraURL + '/rest/api/2/search?jql=' + jql + '&maxResults=100&expand=changelog';

    if (data == "countjql") {
        let jsonData = "";

        jQuery.when($.ajax( requestURL )).done (function(data) {
            jsonObject = data;
            let statusGroup = new Map();
            
            results = '<div id="accordion">';
    
            jQuery(jsonObject.issues).each(function(){
                results+='<h3>' + this.key + '</h3>';
                issueKey = this.key;
                let searchTickets = new Map();
                jQuery(this.changelog.histories).each(function(){
                    if (this.items[0].field == "status") {
                        if (searchTickets.has(this.items[0].fromString)) {
                            searchTickets.set(this.items[0].fromString,parseInt(searchTickets.get(this.items[0].fromString))+1);
                        }
                        else {
                            searchTickets.set(this.items[0].fromString,1);
                        }

                        if (statusGroup.has(this.items[0].fromString)) {
                            if (jQuery.inArray(issueKey, statusGroup)) {
                                statusGroup.set(this.items[0].fromString,statusGroup.get(this.items[0].fromString) + ',' + issueKey);
                            }
                        }
                        else {
                            statusGroup.set(this.items[0].fromString,issueKey);
                        }
                    }
                });
                results+= '<div id="' + this.key + '">';
                searchTickets.forEach(generateHtml);
                results+='</div>';
    
            });
            console.log(statusGroup);
            results+='</div>';
            chrome.runtime.sendMessage({from:"script1",message:results});
        });

        
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
        
        function generateSprintHTML(values, key)  
        { 
            results+= '<p>Story points in ' + key + ' - ' + values +' </p>';
        }

        jQuery.when($.ajax( requestURL )).done (function(data) {

            let jsonObject = data;
            let statuses = new Map();
            jQuery(jsonObject.issues).each(function(){
                if (statuses.has(this.fields.status.name)) {
                    statuses.set(this.fields.status.name,parseInt(statuses.get(this.fields.status.name)+this.fields.customfield_10004));
                }
                else {
                    statuses.set(this.fields.status.name,this.fields.customfield_10004);
                }
            })

            statuses.forEach(generateSprintHTML);
            chrome.runtime.sendMessage({from:"script1",message:results});
        });
    }

});