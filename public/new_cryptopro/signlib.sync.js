(function () {
    "use strict";

    if (!window.signlib) {
        console.log(
            "signlib.async: the library must be loaded using the loader!"
        );
        return;
    }

    //------------------------------------------------------------------------------------------------------------------

    function _sertInfo(cert) {
        return {
            issuer: signlib._dnParse(cert.IssuerName),
            subject: signlib._dnParse(cert.SubjectName),
            from: new Date(cert.ValidFromDate),
            to: new Date(cert.ValidToDate),
            thumbprint: cert.Thumbprint,
            isValid: cert.IsValid().Result,
            pkAlgoOID: cert.PublicKey().Algorithm.Value,
        };
    }

    function _getSigns(oSignedData) {
        var oSigners = oSignedData.Signers;
        var signersCount = oSigners.Count;
        var signs = [];
        for (var i = 1; i <= signersCount; i++) {
            var oSigner = oSigners.Item(i);
            var cert = oSigner.Certificate;
            signs.push({
                cert: cert,
                certInfo: _sertInfo(cert),
                //timestamp: oSigner.SignatureTimeStampTime,
                //signingTime: new Date(oSigner.SigningTime)
            });
        }

        return signs;
    }

    function getCerts() {
        return new Promise(function (resolve, reject) {
            try {
                var oStore = cadesplugin.CreateObject("CAPICOM.Store");
                oStore.Open(
                    cadesplugin.CAPICOM_CURRENT_USER_STORE,
                    cadesplugin.CAPICOM_MY_STORE,
                    cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
                );
                var storeCerts = oStore.Certificates;
                var CertificatesObj = storeCerts.Find(
                    signlib._CAPICOM_CERTIFICATE_FIND_TIME_VALID,
                    0,
                    true
                );
                var certsCount = CertificatesObj.Count;
                var certs = [];
                for (var i = 1; i <= certsCount; i++) {
                    var cert = CertificatesObj.Item(i);
                    certs[i - 1] = {
                        cert: cert,
                        info: _sertInfo(cert),
                    };
                }
                oStore.Close();
                resolve(certs);
            } catch (e) {
                reject(cadesplugin.getLastError(e));
            }
        });
    }

    //------------------------------------------------------------------------------------------------------------------

    function _sign(data, encode, detached) {
        return new Promise(function (resolve, reject) {
            try {
                signlib.selectCertDialog().then(
                    function (cert) {
                        var oSigner =
                            cadesplugin.CreateObject("CAdESCOM.CPSigner");
                        oSigner.Certificate = cert;
                        var oSignedData = cadesplugin.CreateObject(
                            "CAdESCOM.CadesSignedData"
                        );
                        oSignedData.ContentEncoding = encode;
                        oSignedData.Content = data;

                        var sSignedMessage = oSignedData.SignCades(
                            oSigner,
                            cadesplugin.CADESCOM_CADES_BES,
                            detached
                        );

                        var inf = _getSigns(oSignedData);

                        resolve({ sign: sSignedMessage, signsInfo: inf });
                    },
                    function (e) {
                        reject(e);
                    }
                );
            } catch (e) {
                reject(cadesplugin.getLastError(e));
            }
        });
    }

    function signString(data, detached) {
        detached = !!detached;
        return _sign(data, cadesplugin.CADESCOM_STRING_TO_UCS2LE, detached);
    }

    function signFile(file, detached) {
        detached = !!detached;
        return new Promise(function (resolve, reject) {
            signlib._readFile(file).then(
                function (fileData) {
                    _sign(
                        fileData,
                        cadesplugin.CADESCOM_BASE64_TO_BINARY,
                        detached
                    ).then(
                        function (a) {
                            resolve(a);
                        },
                        function (err) {
                            reject(err);
                        }
                    );
                },
                function (e) {
                    reject(e);
                }
            );
        });
    }

    //------------------------------------------------------------------------------------------------------------------

    function _getCertAndHashedDataObject(thumbprintCert) {
        return new Promise(function (resolve, reject) {
            try {
                var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
                oStore.Open();

                var oCertificates = oStore.Certificates.Find(
                    cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH,
                    thumbprintCert
                );
                if (oCertificates.Count === 0) {
                    reject("Certificate not found");
                }
                var cert = oCertificates.Item(1);
                var certInfo = _sertInfo(cert);

                var algo = cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
                if (certInfo.pkAlgoOID == signlib._OID_GOST_2012_256) {
                    algo =
                        cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256;
                } else if (certInfo.pkAlgoOID == signlib._OID_GOST_2012_512) {
                    algo =
                        cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512;
                } else if (certInfo.pkAlgoOID != signlib._OID_GOST_2001) {
                    reject(
                        'Некорректный алгоритм сертификата ЭП. Поддерживаются только алгоритмы семейства "ГОСТ".'
                    );
                }

                var oHashedData = cadesplugin.CreateObject(
                    "CAdESCOM.HashedData"
                );
                oHashedData.Algorithm = algo;

                resolve({ cert: cert, hashedDataObject: oHashedData });
            } catch (e) {
                reject(cadesplugin.getLastError(e));
            }
        });
    }

    function _signHashedData(oHashedData, cert) {
        return new Promise(function (resolve, reject) {
            try {
                //var cert = signlib.selectCertDialog();
                var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
                oSigner.Certificate = cert;

                var oSignedData = cadesplugin.CreateObject(
                    "CAdESCOM.CadesSignedData"
                );
                var sSignedMessage = oSignedData.SignHash(
                    oHashedData,
                    oSigner,
                    cadesplugin.CADESCOM_CADES_BES
                );

                var hash = oHashedData.Value;
                var inf = _getSigns(oSignedData);

                resolve({ sign: sSignedMessage, hash: hash, signsInfo: inf });
            } catch (e) {
                reject(cadesplugin.getLastError(e));
            }
        });
    }

    function signStringHash(data, thumbprintCertificate) {
        console.log("hhhhhhhhhhhh", data);
        return new Promise(function (resolve, reject) {
            _getCertAndHashedDataObject(thumbprintCertificate).then(
                function (o) {
                    o.hashedDataObject.DataEncoding =
                        cadesplugin.CADESCOM_BASE64_TO_BINARY;
                    o.hashedDataObject.Hash(signlib._b64EncUTF(data));

                    _signHashedData(o.hashedDataObject, o.cert).then(
                        function (a) {
                            resolve(a);
                        },
                        function (err) {
                            reject(err);
                        }
                    );
                },
                function (e) {
                    reject(e);
                }
            );
        });
    }

    function signFileHash(file) {
        console.log("ffffff ddd", file);
        return new Promise(function (resolve, reject) {
            signlib._readFile(file).then(function (fileData) {
                _getCertAndHashedDataObject().then(
                    function (o) {
                        try {
                            o.hashedDataObject.DataEncoding =
                                cadesplugin.CADESCOM_BASE64_TO_BINARY;
                            o.hashedDataObject.Hash(fileData);

                            _signHashedData(o.hashedDataObject, o.cert).then(
                                function (a) {
                                    resolve(a);
                                },
                                function (err) {
                                    reject(err);
                                }
                            );
                        } catch (e) {
                            reject(cadesplugin.getLastError(e));
                        }
                    },
                    function (e) {
                        reject(e);
                    }
                );
            });
        });
    }

    function signHash(hashArr) {
        return new Promise(function (resolve, reject) {
            _getCertAndHashedDataObject().then(
                function (o) {
                    var alg = o.hashedDataObject.Algorithm;
                    o.hashedDataObject.DataEncoding =
                        cadesplugin.CADESCOM_BASE64_TO_BINARY;
                    if (
                        alg ==
                        cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256
                    ) {
                        if (!hashArr.GOST_2012_256) {
                            reject(
                                "Отсутвует хэш для алгоритма ГОСТ 2012-256."
                            );
                        }
                        o.hashedDataObject.SetHashValue(hashArr.GOST_2012_256);
                    } else if (
                        alg ==
                        cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512
                    ) {
                        if (!hashArr.GOST_2012_512) {
                            reject(
                                "Отсутвует хэш для алгоритма ГОСТ 2012-512."
                            );
                        }
                        o.hashedDataObject.SetHashValue(hashArr.GOST_2012_512);
                    } else {
                        if (!hashArr.GOST_2001) {
                            reject("Отсутвует хэш для алгоритма ГОСТ 2001.");
                        }
                        o.hashedDataObject.SetHashValue(hashArr.GOST_2001);
                    }

                    _signHashedData(o.hashedDataObject, o.cert).then(
                        function (a) {
                            resolve(a);
                        },
                        function (err) {
                            reject(err);
                        }
                    );
                },
                function (e) {
                    reject(e);
                }
            );
        });
    }

    //------------------------------------------------------------------------------------------------------------------

    function _verifySign(sign, data, encode) {
        return new Promise(function (resolve, reject) {
            try {
                var oSignedData = cadesplugin.CreateObject(
                    "CAdESCOM.CadesSignedData"
                );
                var detached = false;
                if (data != undefined) {
                    oSignedData.ContentEncoding = encode;
                    oSignedData.Content = data;
                    detached = true;
                }
                oSignedData.VerifyCades(
                    sign,
                    cadesplugin.CADESCOM_CADES_BES,
                    detached
                );
                var inf = _getSigns(oSignedData);

                resolve({ signsInfo: inf });
            } catch (e) {
                reject(cadesplugin.getLastError(e));
            }
        });
    }

    function verifySignString(sign, data) {
        return _verifySign(sign, data, cadesplugin.CADESCOM_STRING_TO_UCS2LE);
    }

    function verifySignFile(sign, file) {
        return new Promise(function (resolve, reject) {
            signlib._readFile(file).then(
                function (fileData) {
                    _verifySign(
                        sign,
                        fileData,
                        cadesplugin.CADESCOM_BASE64_TO_BINARY
                    ).then(
                        function (a) {
                            resolve(a);
                        },
                        function (err) {
                            reject(err);
                        }
                    );
                },
                function (e) {
                    reject(e);
                }
            );
        });
    }

    function verifySignHash(sign, hash) {
        return new Promise(function (resolve, reject) {
            try {
                //FIXME
                var algo =
                    cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256;
                if (hash.length > 100) {
                    algo =
                        cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512;
                }

                var oHashedData = cadesplugin.CreateObject(
                    "CAdESCOM.HashedData"
                );
                var oSignedData = cadesplugin.CreateObject(
                    "CAdESCOM.CadesSignedData"
                );

                try {
                    oHashedData.Algorithm = algo;
                    oHashedData.SetHashValue(hash);
                    oSignedData.VerifyHash(
                        oHashedData,
                        sign,
                        cadesplugin.CADESCOM_CADES_BES
                    );
                } catch (e) {
                    if (
                        algo ==
                        cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512
                    ) {
                        throw e;
                    }

                    algo = cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
                    oHashedData.Algorithm = algo;
                    oHashedData.SetHashValue(hash);
                    oSignedData.VerifyHash(
                        oHashedData,
                        sign,
                        cadesplugin.CADESCOM_CADES_BES
                    );
                }

                var inf = _getSigns(oSignedData);

                resolve({ signsInfo: inf });
            } catch (e) {
                reject(cadesplugin.getLastError(e));
            }
        });
    }

    //------------------------------------------------------------------------------------------------------------------

    function _getHash(data, encode) {
        return new Promise(function (resolve, reject) {
            try {
                var oHashedData = cadesplugin.CreateObject(
                    "CAdESCOM.HashedData"
                );
                oHashedData.DataEncoding = encode;
                oHashedData.Hash(data);

                var hash = oHashedData.Value;

                resolve(hash);
            } catch (e) {
                reject(cadesplugin.getLastError(e));
            }
        });
    }

    function hashString(data) {
        return _getHash(data, cadesplugin.CADESCOM_STRING_TO_UCS2LE);
    }

    function hashFile(file) {
        return new Promise(function (resolve, reject) {
            signlib._readFile(file).then(
                function (fileData) {
                    _getHash(
                        fileData,
                        cadesplugin.CADESCOM_BASE64_TO_BINARY
                    ).then(
                        function (a) {
                            resolve(a);
                        },
                        function (err) {
                            reject(err);
                        }
                    );
                },
                function (e) {
                    reject(e);
                }
            );
        });
    }

    //------------------------------------------------------------------------------------------------------------------

    var checkResult;
    function checkPlugin() {
        return new Promise(function (resolve, reject) {
            if (checkResult) {
                resolve(checkResult);
            }

            var ret = { loaded: false, enabled: false, worked: false };
            try {
                var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
                ret = { loaded: true, enabled: true, worked: true };
                var pluginVer = oAbout.PluginVersion;

                if (typeof pluginVer == "undefined") {
                    pluginVer = oAbout.Version;
                }

                ret.pluginVersion = pluginVer;

                if (typeof pluginVer != "string") {
                    ret.pluginVersion = {
                        major: pluginVer.MajorVersion,
                        minor: pluginVer.MinorVersion,
                        build: pluginVer.BuildVersion,
                    };

                    var CSPVer = oAbout.CSPVersion("", 75); //Версия криптопровайдера
                    ret.CSPVersion = {
                        major: CSPVer.MajorVersion,
                        minor: CSPVer.MinorVersion,
                        build: CSPVer.BuildVersion,
                    };
                }

                try {
                    ret.name = oAbout.CSPName(75); //Криптопровайдер ProviderVersion
                } catch (e) {}

                $.get("/cryptopro_plugin_current_version.php")
                    .done(function (data) {
                        ret.verLast = data;
                        ret.actual =
                            signlib._verCompare(
                                ret.verLast,
                                ret.pluginVersion
                            ) >= 0;
                        checkResult = ret;
                        resolve(ret);
                    })
                    .fail(function (jqXHR, textStatus, errorThrown) {
                        checkResult = ret;
                        resolve(ret);
                    });
            } catch (err) {
                // Объект создать не удалось, проверим, установлен ли
                // вообще плагин. Такая возможность есть не во всех браузерах
                var mimetype = navigator.mimeTypes["application/x-cades"];
                if (mimetype) {
                    ret.loaded = true;
                    var plugin = mimetype.enabledPlugin;
                    if (plugin) {
                        ret.enabled = true;
                    }
                }
                checkResult = ret;
                resolve(ret);
            }
        });
    }

    signlib._core.getCerts = getCerts;
    signlib._core.signString = signString;
    signlib._core.signFile = signFile;
    signlib._core.signStringHash = signStringHash;
    signlib._core.signFileHash = signFileHash;
    signlib._core.signHash = signHash;
    //signlib._core.cosignString = ;
    //signlib._core.cosignFile = ;
    //signlib._core.cosignStringHash = cosignStringHash;
    //signlib._core.cosignFileHash = cosignFileHash;
    //signlib._core.cosignHash = cosignHash;
    signlib._core.verifySignString = verifySignString;
    signlib._core.verifySignFile = verifySignFile;
    //signlib._core.verifySignStringHash = ;
    //signlib._core.verifySignFileHash = ;
    signlib._core.verifySignHash = verifySignHash;
    signlib._core.hashString = hashString;
    signlib._core.hashFile = hashFile;
    signlib._core.checkPlugin = checkPlugin;

    window.signlib._coreResolve();
})();
