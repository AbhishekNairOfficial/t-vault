/*
* =========================================================================
* Copyright 2020 T-Mobile, US
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* See the readme.txt file for additional language around disclaimer of warranties.
* =========================================================================
*/

'use strict';
(function(app){
    app.controller('CertificatesCtrl', function($scope, $rootScope, Modal, fetchData, $http, $window, $state, SessionStore, AdminSafesManagement, ModifyUrl, UtilityService, Notifications, safesService, RestEndpoints, CopyToClipboard){

    	$scope.finalFilterCertResults = [];
        $scope.finalFilterExtCertResults = [];
        $scope.isLoadingData = false;       // Variable to set the loader on
        $scope.adminNavTags = safesService.getSafesNavTags();
        $scope.viewCertificate = false;
        $scope.viewExternalCertificate = false;
        $scope.searchValueCert = "";
        $scope.certificateDetails = [];
        $scope.certIdToDownload = "";
        $scope.certificateType = "";
        $scope.isInternalCertificateTab = true;
        $scope.externalCertificateDetails = [];
        $scope.downloadFormats = [
            {"type": "DER - P12", "value": "pkcs12der"},
            {"type": "PEM - PFX", "value": "pembundle"},
            {"type": "PEM - OPENSSL", "value": "pkcs12pem"}
        ]
        $scope.dropdownDownload = {
            'selectedGroupOption': $scope.downloadFormats[0],       // As initial placeholder
            'tableOptions': $scope.downloadFormats
        }
        $scope.downloadRequest = {
            "certificateCred": "",
            "issuerChain": "",
            "certificateName": "",
            "format": ""
        }
        $scope.isDownloadClicked = false;
        var init = function () {
            if(!SessionStore.getItem("myVaultKey")){ /* Check if user is in the same session */
                $state.go('/');
                return;
            }
            else{
                $scope.viewCertificate = false;
                $scope.viewExternalCertificate = false;
                $scope.errorMessage = UtilityService.getAParticularErrorMessage('ERROR_GENERAL');
                if (JSON.parse(SessionStore.getItem("isAdmin")) == true) {
                    $scope.certificateType = "internal";
                    $scope.requestDataForMyCertifiatesAdmin();
                }
                else {
                    $scope.certificateType = "internal";
                    $scope.requestDataForMyCertifiates();
                }
            }
        };

        $scope.selectDownloadFormat = function () {
            $scope.downloadRequest.format = $scope.dropdownDownload.selectedGroupOption.value;
        }

        $scope.filterCert = function (searchValueCert) {
            var filterSearch = searchValueCert;
            if (searchValueCert != '' && searchValueCert != undefined && searchValueCert.length > 2) {
                if($scope.certificateType == "internal"){
                    $scope.finalFilterCertResults = $scope.certificatesData.keys.filter(function (searchValueCert) {
                    	if(searchValueCert.certname != undefined && searchValueCert.certname != ""){
                        return searchValueCert.certname.includes(filterSearch);
                    	}
                    });
                } else {
                    $scope.finalFilterExtCertResults = $scope.certificatesDataExternal.keys.filter(function (searchValueCert) {
                    	if(searchValueCert.certname != undefined && searchValueCert.certname != ""){
                        return searchValueCert.certname.includes(filterSearch);
                    	}
                    });
                }

            } else {
                if($scope.certificateType == "internal"){
                	$scope.finalFilterCertResults = $scope.certificatesData.keys.slice(0);
                } else {
                	$scope.finalFilterExtCertResults = $scope.certificatesDataExternal.keys.slice(0);
                }
            }
            $scope.searchValueCert = searchValueCert;
        }

        $scope.requestDataForMyCertifiates = function () {
            $scope.isLoadingData = true;
            $scope.certificatesData = {"keys": []};
            var data = [];

            ///
            var url  = RestEndpoints.baseURL + "/v2/sslcert/list/" + "internal";
            $http({
                method: 'GET',
                url: url,
                headers: getHeaders()
            }).then(function (response) {
                var accessSafes = JSON.parse(JSON.stringify(response.data.cert));
                data = accessSafes.map(function (certObject) {
                    var entry = Object.entries(certObject);
                    return {
                        certname: entry[0][0],
                        permission: entry[0][1]
                    }
                });

                $scope.certificatesData.keys = data.filter(function (cert) {
                    return cert.permission != "deny";
                });
                $scope.numOfCertificates = $scope.certificatesData.keys.length;
                $scope.isLoadingData = false;
                $scope.finalFilterCertResults = $scope.certificatesData.keys.slice(0);
            }, function (error) {
                $scope.isLoadingData = false;
                console.log(error);
            })
                .catch(function (catchError) {
                    $scope.isLoadingData = false;
                });
        }

        function getHeaders() {
            return {
                'Content-Type': 'application/json',
                'vault-token': SessionStore.getItem('myVaultKey')
            }
        }

        $scope.requestDataForMyExternalCertifiates = function () {
            $scope.isLoadingData = true;
            $scope.certificatesDataExternal = {"keys": []};
            var extData = [];
          //  var accessSafes = JSON.parse(SessionStore.getItem("accessSafes"));

            //External Certificate Tab Non-admin cert list
            ///
            var url = RestEndpoints.baseURL + "/v2/sslcert/list/" + "external";

            $http({
                method: 'GET',
                url: url,
                headers: getHeaders()
            }).then(function (response) {
                var accessSafes = JSON.parse(JSON.stringify(response.data.externalcerts));
                extData = accessSafes.map(function (certObjectExt) {
                    var entry = Object.entries(certObjectExt);
                    return {
                        certname: entry[0][0],
                        permission: entry[0][1]
                    }
                });
                $scope.certificatesDataExternal.keys = extData.filter(function (externalcerts) {
                    return externalcerts.permission != "deny";
                });
                $scope.numOfCertificatesExternal = $scope.certificatesDataExternal.keys.length;
                $scope.isLoadingData = false;
                $scope.finalFilterExtCertResults = $scope.certificatesDataExternal.keys.slice(0);
            }, function (error) {
                $scope.isLoadingData = false;
                console.log(error);
            })
        }

        $scope.isInternalCertificate = function(){
            $scope.certificateType = "internal";
            $scope.searchValueCert = "";
            document.getElementById('searchValueId').value = '';
            $scope.isInternalCertificateTab = true;
            $scope.viewExternalCertificate = false;
            if (JSON.parse(SessionStore.getItem("isAdmin")) == true) {
                $scope.requestDataForMyCertifiatesAdmin();
            }else{
                $scope.requestDataForMyCertifiates();
            }
        }

        $scope.isExternalCertificate = function(){
            $scope.certificateType = "external";
            $scope.searchValueCert = "";
            document.getElementById('searchValueId').value = '';
            $scope.isInternalCertificateTab = false;
            $scope.viewCertificate = false;
            if (JSON.parse(SessionStore.getItem("isAdmin")) == true) {
                $scope.requestDataForMyExternalCertifiatesAdmin();
            }else{
                $scope.requestDataForMyExternalCertifiates();
            }
        }

        $scope.requestDataForMyExternalCertifiatesAdmin = function () {
            $scope.certificatesData = {"keys": []};
            $scope.certificatesDataExternal = {"keys": []};
            $scope.isLoadingData = true;
            var updatedUrlOfEndPoint =ModifyUrl.addUrlParameteres('getCertificates',"certType="+$scope.certificateType);
            AdminSafesManagement.getCertificates(null, updatedUrlOfEndPoint).then(function (response) {
                if (UtilityService.ifAPIRequestSuccessful(response)) {
                    if (response.data != "" && response.data != undefined) {
                        $scope.externalCertificateDetails = response.data.keys;                       
                        angular.forEach($scope.externalCertificateDetails, function(value, key) {
                            $scope.certificatesDataExternal.keys.push({"certname": value.certificateName, "permission": "read"});
                        });
                        $scope.numOfCertificatesExternal=$scope.certificatesDataExternal.keys.length;
                        $scope.finalFilterExtCertResults = $scope.certificatesDataExternal.keys.slice(0);
                    }
                }
                else {
                    $scope.certificatesLoaded =  true;
                    if(response.status !== 404) {
                        $scope.errorMessage = AdminSafesManagement.getTheRightErrorMessage(response);
                        $scope.error('md');
                    }
                }
                $scope.isLoadingData = false;
            },
            function (error) {
                // Error handling function
                $scope.isLoadingData = false;
                $scope.certificatesLoaded =  true;
                if (error.status !== 404) {
                    console.log(error);
                    $scope.errorMessage = UtilityService.getAParticularErrorMessage('ERROR_GENERAL');
                    $scope.error('md');
                }
            });
        }

        $scope.requestDataForMyCertifiatesAdmin = function () {
            $scope.certificatesData = {"keys": []};
            $scope.certificatesDataExternal = {"keys": []};
            $scope.isLoadingData = true;
        
            var updatedUrlOfEndPoint = RestEndpoints.baseURL + "/v2/sslcert/certificates/" + $scope.certificateType;
          //  var updatedUrlOfEndPoint = ModifyUrl.addUrlParameteres('listCertificatesByCertificateType', Math.random());
            AdminSafesManagement.listCertificatesByCertificateType(null, updatedUrlOfEndPoint).then(function (response) {
                if (UtilityService.ifAPIRequestSuccessful(response)) {
                    if($scope.certificateType == "internal"){
                        if (response.data != "" && response.data != undefined) {
                            angular.forEach(response.data.data.keys, function(value, key) {
                                $scope.certificatesData.keys.push({"certname": value, "permission": "read"});
                              });
                            $scope.numOfCertificates=$scope.certificatesData.keys.length;
                            $scope.finalFilterCertResults = $scope.certificatesData.keys.slice(0);
                        }
                    }
                }
                else {
                    $scope.certificatesLoaded =  true;
                    if(response.status !== 404) {
                        $scope.errorMessage = AdminSafesManagement.getTheRightErrorMessage(response);
                        $scope.error('md');
                    }
                }
                $scope.isLoadingData = false;
            },
            function (error) {
                // Error handling function
                $scope.isLoadingData = false;
                $scope.certificatesLoaded =  true;
                if (error.status !== 404) {
                    console.log(error);
                    $scope.errorMessage = UtilityService.getAParticularErrorMessage('ERROR_GENERAL');
                    $scope.error('md');
                }
            });
        }
        
        $scope.error = function (size) {
            Modal.createModal(size, 'error.html', 'CertificatesCtrl', $scope);
        };

        $rootScope.close = function () {
            Modal.close();
        };

        var pagesShown = 1;
        var pagesShownExt = 1;
        var pageSize = 20;
        $scope.paginationLimit = function() {
            $scope.currentshown = pageSize * pagesShown;
            $scope.currentshownExt = pageSize * pagesShownExt;
            if($scope.certificateType == "internal"){
                if(($scope.searchValueCert != '' && $scope.searchValueCert!= undefined && $scope.searchValueCert.length>2) || $scope.currentshown >= $scope.numOfCertificates){
                    $scope.currentshown = $scope.numOfCertificates;
                }
                return $scope.currentshown;
            }else{
                if(($scope.searchValueCert != '' && $scope.searchValueCert!= undefined && $scope.searchValueCert.length>2) || $scope.currentshownExt >= $scope.numOfCertificatesExternal){
                    $scope.currentshownExt = $scope.numOfCertificatesExternal;
                }
                return $scope.currentshownExt;
            }
           
            
        };

        $scope.hasMoreItemsToShow = function () {
            if ($scope.searchValueCert != '' && $scope.searchValueCert != undefined) {
                if ($scope.searchValueCert.length < 3) {
                    if ($scope.certificateType == "internal") {
                        return pagesShown < ($scope.numOfCertificates / pageSize);
                    } else {
                        return pagesShownExt < ($scope.numOfCertificatesExternal / pageSize);
                    }
                }
                else {
                    return false;
                }
            }
            if ($scope.certificateType == "internal") {
                return pagesShown < ($scope.numOfCertificates / pageSize);
            } else {
                return pagesShownExt < ($scope.numOfCertificatesExternal / pageSize);
            }
        };

        $scope.showMoreItems = function() {
            pagesShown = pagesShown + 1;
        };
        $scope.showMoreItemsExt = function() {
            pagesShownExt = pagesShownExt + 1;
        };

        $scope.goToCertificates = function() {
            $scope.viewCertificate = false;
            $scope.viewExternalCertificate = false;
        }

        $scope.getCertificate = function (certName) {
            $scope.isDownloadClicked = false;
            $scope.isLoadingData = true;
            $scope.downloadRequest.certificateName = "";
            var updatedUrlOfEndPoint = "";
            if($scope.isInternalCertificateTab){
                updatedUrlOfEndPoint = RestEndpoints.baseURL + "/v2/sslcert/certificate/" + "internal" + "?certificate_name="+ certName;
            }else{
                updatedUrlOfEndPoint = RestEndpoints.baseURL + "/v2/sslcert/certificate/" + "external" + "?certificate_name="+ certName;
            }

            AdminSafesManagement.getCertificateDetails(null, updatedUrlOfEndPoint).then(function (response) {

                if (UtilityService.ifAPIRequestSuccessful(response)) { 	
                    if($scope.isInternalCertificateTab){
                        $scope.viewCertificate = true;
                    }else{
                        if(response.data.requestStatus !== null && response.data.requestStatus !== "Pending Approval"){
                            $scope.viewExternalCertificate = true;
                        }
                        else{
                            $scope.viewExternalCertificate = false;
                            $scope.validateCertificateDetailsPopUp();
                        }
                    }

                    $scope.certificateDetails = response.data;
                    $scope.certificateDetails.createDate = new Date($scope.certificateDetails.createDate).toDateString();
                    $scope.certificateDetails.expiryDate = new Date($scope.certificateDetails.expiryDate).toDateString();
                    $scope.certIdToDownload = $scope.certificateDetails.certificateId;

                    $scope.downloadRequest.certificateName = $scope.certificateDetails.certificateName;
                    $scope.downloadRequest.certType = $scope.certificateDetails.certType;
                }
                else {                   
                    $scope.errorMessage = AdminSafesManagement.getTheRightErrorMessage(response);
                    $scope.error('md');
                }
                $scope.isLoadingData = false;
            },
            function (error) {
                // Error handling function
                console.log(error);
                $scope.isLoadingData = false;
                $scope.errorMessage = UtilityService.getAParticularErrorMessage('ERROR_GENERAL');
                $scope.error('md');
            });         
        }

        $scope.validateCertificateDetailsPopUp = function (svcaccname) {
            Modal.createModal('md', 'validateCertificateDetailPopUp.html', 'CertificatesCtrl', $scope);
        };
        $rootScope.cancel = function () {
            Modal.close();
        };
        $scope.error = function (size) {
            Modal.createModal(size, 'error.html', 'CertificatesCtrl', $scope);
        };
        $scope.downloadPopup = function () {
            $scope.isDownloadClicked = false;
            $scope.downloadRequest.certificateCred = "";
            $scope.downloadRequest.issuerChain = true;
            $scope.downloadRequest.format = "pkcs12der";
            $scope.dropdownDownload.selectedGroupOption = $scope.downloadFormats[0];
            Modal.createModal('md', 'downloadPopup.html', 'CertificatesCtrl', $scope);
        };

        $scope.downloadPopupWitoutKey = function () {
            $scope.isDownloadClicked = false;
            Modal.createModal('md', 'downloadPopupWitoutKey.html', 'CertificatesCtrl', $scope);
        };

        $scope.isDownloadDisabled = function () {
            if ($scope.downloadRequest.certificateCred ==undefined || $scope.downloadRequest.certificateCred.length < 8) {
                return true;
            }
            return false;
        }

        function getCertWithKey(reqObjtobeSent) {
            var url = RestEndpoints.baseURL + '/v2/sslcert/certificates/download'
            return $http({
                method: 'POST',
                url: url,
                data: reqObjtobeSent,
                headers: {
                    'Content-type': 'application/json',
                    'vault-token': SessionStore.getItem('myVaultKey')
                },
                responseType: 'blob',
            }).then(function (response) {
                return response;
            }).catch(function(error) {
            if(error.status === 400){
                $scope.errorMessage = "Your request cannot be processed now due to some technical issue. Please try again later";
                $scope.error('md');
                return error;
              }  else {
                console.log(error);
                $scope.errorMessage = UtilityService.getAParticularErrorMessage('ERROR_GENERAL');
                $scope.error('md');
                return error;
                }

            });
        }


        $scope.download = function () {
            try {
                Modal.close('');
                $scope.isLoadingData = true;
                var reqObjtobeSent = $scope.downloadRequest;
                var fileType = ".p12";
                switch (reqObjtobeSent.format) {
                    case "pkcs12der": fileType=".p12"; break;
                    case "pembundle": fileType=".pem"; break;
                    case "pkcs12pem": fileType=".pfx"; break;
                }
                getCertWithKey(reqObjtobeSent, null).then(function (response) {
                    if (UtilityService.ifAPIRequestSuccessful(response)) {

                        var file = new Blob([response.data], { type: 'application/octet-stream' });
                        var fileURL = URL.createObjectURL(file);
                        var downloadlink = document.createElement('a');
                        downloadlink.href = fileURL;
                        downloadlink.target = '_blank';
                        downloadlink.download = reqObjtobeSent.certificateName+fileType;
                        document.body.appendChild(downloadlink);
                        downloadlink.click();
                        document.body.removeChild(downloadlink);
                        $scope.isLoadingData = false;
                    }
                    else {
                        $scope.isLoadingData = false;
                        console.log(response.status);
                    }
                },
                function (error) {
                    $scope.isLoadingData = false;
                    console.log(error);
                })
            } catch (e) {
                $scope.isLoadingData = false;
                console.log(e);
            }
        }

        function getCert(certificateName, format,sslCertType) {
            var url = RestEndpoints.baseURL + '/v2/sslcert/certificates/'+certificateName+'/'+format+'/'+sslCertType
            return $http({
                method: 'GET',
                url: url,
                headers: {
                    'vault-token': SessionStore.getItem('myVaultKey')
                },
                responseType: 'blob',
            }).then(function (response) {
                return response;
            }).catch(function(error) {
                if(error.status === 400){
                    $scope.errorMessage = "Your request cannot be processed now due to some technical issue. Please try again later";
                    $scope.error('md');
                    return error;
                  } else {
                    console.log(error);
                    $scope.errorMessage = UtilityService.getAParticularErrorMessage('ERROR_GENERAL');
                    $scope.error('md');
                    return error;
                }
            });
        }

        $scope.downloadPemDer = function(format) {
            try {
                Modal.close('');
                $scope.isLoadingData = true;
                var certName = $scope.downloadRequest.certificateName;
                var certType = $scope.downloadRequest.certType;
                if (certName != "") {
                    getCert(certName, format, certType).then(function (response) {
                        if (UtilityService.ifAPIRequestSuccessful(response)) {
                            var file = new Blob([response.data], { type: 'application/octet-stream' });
                            var fileURL = URL.createObjectURL(file);
                            var downloadlink = document.createElement('a');
                            downloadlink.href = fileURL;
                            downloadlink.target = '_blank';
                            downloadlink.download = certName+'.'+format;
                            document.body.appendChild(downloadlink);
                            downloadlink.click();
                            document.body.removeChild(downloadlink);
                            $scope.isLoadingData = false;
                        }
                        else {
                            $scope.isLoadingData = false;
                            console.log(response.status);
                        }
                    },
                    function (error) {
                        $scope.isLoadingData = false;
                        console.log(error);
                    })
                }
            } catch (e) {
                $scope.isLoadingData = false;
                console.log(e);
            }
        }

        $scope.showDownload = function () {
            $scope.isDownloadClicked = !$scope.isDownloadClicked;
        }

        $scope.hideDownload = function () {
            $scope.isDownloadClicked = false;
        }

        init();
        
    });
})(angular.module('vault.features.CertificatesCtrl',[
    'vault.services.fetchData',
    'vault.services.ModifyUrl',
    'vault.services.Notifications',
    'vault.constants.RestEndpoints'
]));