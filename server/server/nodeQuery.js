'use strict';
const { PerformanceObserver, performance } = require('perf_hooks');
var util = require('util');
var hana = require('@sap/hana-client');

var connOptions = {
  //Option 1, retrieve the connection parameters from the hdbuserstore
  serverNode: '@USER1UserKey',  //host, port, uid, and pwd retrieved from hdbuserstore

  //Option 2, specify the connection parameters
  //serverNode: 'host:port',
  //UID: 'USER1',
  //PWD: 'Password1',

  //Additional parameters
  //As of 2.7 trace info can be directed to stdout or stderr
  //traceFile: 'stdout',
  //traceOptions: 'sql=warning',

  //As of SAP HANA client 2.6, connections on port 443 enable encryption by default (HANA Cloud).
  //encrypt: 'true',  //Must be set to true when connecting to HANA as a Service
  sslValidateCertificate: 'false',  //Must be set to false when connecting to an SAP HANA, express edition instance that uses a self-signed certificate.

  //For encrypted connections, the default crypto provider is mscrypto on Windows or openSSL on Linux or macos
  //To use the SAP crypto provider, uncomment the below line.
  //sslCryptoProvider: 'commoncrypto',

  //As of SAP HANA client 2.6 for OpenSSL connections, the following settings can be ignored as root certificates are read from the default OS location.
  //ssltruststore: '/home/dan/.ssl/trust.pem', //Used to specify where the trust store is located
  //Alternatively provide the contents of the certificate directly (DigiCertGlobalRootCA.pem)
  //DigiCert Global Root CA: https://cacerts.digicert.com/DigiCertGlobalRootCA.crt.pem used for SAP HANA cloud
  //on-premise cert can be retrieved using openssl s_client -connect localhost:39015
  //This option is not supported with the mscrypto provider (the default provider on Windows)
  //ssltruststore: '-----BEGIN CERTIFICATE-----MIIDrzCCApegAwIBAgIQCDvgVpBCRrGhdWrJWZHHSjANBgkqhkiG9w0BAQUFADBhMQswCQYDVQQGEwJVUzEVMBMGA1UEChMMRGlnaUNlcnQgSW5jMRkwFwYDVQQLExB3d3cuZGlnaWNlcnQuY29tMSAwHgYDVQQDExdEaWdpQ2VydCBHbG9iYWwgUm9vdCBDQTAeFw0wNjExMTAwMDAwMDBaFw0zMTExMTAwMDAwMDBaMGExCzAJBgNVBAYTAlVTMRUwEwYDVQQKEwxEaWdpQ2VydCBJbmMxGTAXBgNVBAsTEHd3dy5kaWdpY2VydC5jb20xIDAeBgNVBAMTF0RpZ2lDZXJ0IEdsb2JhbCBSb290IENBMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4jvhEXLeqKTTo1eqUKKPC3eQyaKl7hLOllsBCSDMAZOnTjC3U/dDxGkAV53ijSLdhwZAAIEJzs4bg7/fzTtxRuLWZscFs3YnFo97nh6Vfe63SKMI2tavegw5BmV/Sl0fvBf4q77uKNd0f3p4mVmFaG5cIzJLv07A6Fpt43C/dxC//AH2hdmoRBBYMql1GNXRor5H4idq9Joz+EkIYIvUX7Q6hL+hqkpMfT7PT19sdl6gSzeRntwi5m3OFBqOasv+zbMUZBfHWymeMr/y7vrTC0LUq7dBMtoM1O/4gdW7jVg/tRvoSSiicNoxBN33shbyTApOB6jtSj1etX+jkMOvJwIDAQABo2MwYTAOBgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUA95QNVbRTLtm8KPiGxvDl7I90VUwHwYDVR0jBBgwFoAUA95QNVbRTLtm8KPiGxvDl7I90VUwDQYJKoZIhvcNAQEFBQADggEBAMucN6pIExIK+t1EnE9SsPTfrgT1eXkIoyQY/EsrhMAtudXH/vTBH1jLuG2cenTnmCmrEbXjcKChzUyImZOMkXDiqw8cvpOp/2PV5Adg06O/nVsJ8dWO41P0jmP6P6fbtGbfYmbW0W5BjfIttep3Sp+dWOIrWcBAI+0tKIJFPnlUkiaY4IBIqDfv8NZ5YBberOgOzW6sRBc4L0na4UU+Krk2U886UAb3LujEV0lsYSEY1QSteDwsOoBrp+uvFRTp2InBuThs4pFsiv9kuXclVzDAGySj4dzp30d8tbQkCAUw7C29C79Fv1C5qfPrmAESrciIxpg0X40KPMbp1ZWVbd4=-----END CERTIFICATE-----'
};

//Synchronous  example querying a table
var connection = hana.createConnection();

//As of 2.9, tracing can be directed to a callback
/*
var traceCB = function (buf) {
    console.log(buf);
};
connection.onTrace("sql=error,api=debug,OutBufferSize=64k", traceCB);  
*/

connection.connect(connOptions);

//connection.onTrace("", null);  //disables callback tracing for the rest of the program

var sql = 'SELECT TITLE, FIRSTNAME, NAME FROM HOTELS.CUSTOMER;';
var t0 = performance.now();
var result = connection.exec(sql);
console.log(util.inspect(result, { colors: false }));
var t1 = performance.now();
console.log("time in ms " + (t1 - t0));
connection.disconnect();
