# heroku-demo-endpoint #
Super simple node.js app for demoing simple Lightning Web Component on Salesforce.

```
>> create project
sfdx force:project:create -n demo
cd demo
code .

>> auth org

>> create apex class
public with sharing class HttpCallout {

    @AuraEnabled(cacheable=true)
    public static String doCallout() {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://heroku-demo-endpoint.herokuapp.com');
        req.setMethod('GET');
        Http http = new Http();
        HTTPResponse res = http.send(req);
        String body = res.getBody();
        System.debug(body);
        return body;
    }
}


>> deploy to org via right click

>> create file for anonymous apex in root
String result = HttpCallout.doCallout();
System.debug(result);

>> it fails - create remote site in org
>> rerun

>> what if I wanted authentication - could do it in org
>> named credentials
public with sharing class HttpCallout {

    @AuraEnabled(cacheable=true)
    public static String doCallout() {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Demo_Named_Credentials/auth');
        req.setMethod('GET');
        Http http = new Http();
        HTTPResponse res = http.send(req);
        String body = res.getBody();
        System.debug(body);
        return body;
    }
}



>> create lightning component
<template>
    <lightning-card title="HTTP Callout Component" icon-name="custom:custom63">
        <div class="slds-m-around_medium">
            <p>Result: {result}</p>
        </div>
    </lightning-card>
</template>

import { LightningElement, wire } from 'lwc';
import doCallout from '@salesforce/apex/HttpCallout.doCallout';

export default class HttpCalloutComponent extends LightningElement {
    result;

    @wire(doCallout)
    wiredResult({error,data}) {
        console.log(error);
        console.log(data);
        if (error) {
            this.result = error.message;
        } else {
            this.result = data;
        }
    }
}

<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>48.0</apiVersion>
    <isExposed>true</isExposed>
    <targets>
        <target>lightning__AppPage</target>
        <target>lightning__RecordPage</target>
        <target>lightning__HomePage</target>
    </targets>
</LightningComponentBundle>



@RestResource(urlMapping='/account/*')
global with sharing class MyApexAPI {

    @HttpGet
    global static Account doGet() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        String accountId = req.requestURI.substring(req.requestURI.lastIndexOf('/')+1);
        Account result = [SELECT Id, Name FROM Account WHERE Id = :accountId];
        return result;
    }
}

@RestResource(urlMapping='/json/*')
global with sharing class MyApexAPIJson {

    @HttpGet
    global static void doGet() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;

        String accountId = req.requestURI.substring(req.requestURI.lastIndexOf('/')+1);
        Account result = [SELECT Id, Name FROM Account WHERE Id = :accountId];

        RestContext.response.addHeader('Content-Type', 'application/json');
        RestContext.response.responseBody = Blob.valueOf('{"result": "' + result.Name + ' (' + result.Id + ')"}');
    }
}

```
