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
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        var info = {
                            issuer: signlib._dnParse(yield cert.IssuerName),
                            subject: signlib._dnParse(yield cert.SubjectName),
                            from: new Date(yield cert.ValidFromDate),
                            to: new Date(yield cert.ValidToDate),
                            thumbprint: yield cert.Thumbprint,
                            isValid: yield (yield cert.IsValid()).Result,
                            pkAlgoOID: yield (yield (yield cert.PublicKey())
                                .Algorithm).Value,
                        };

                        args[0](info);
                    } catch (e) {
                        args[1](cadesplugin.getLastError(e));
                    }
                },
                resolve,
                reject
            );
        });
    }

    function _getSigns(oSignedData) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        var oSigners = yield oSignedData.Signers;
                        var signersCount = yield oSigners.Count;
                        var signs = [];
                        for (var i = 1; i <= signersCount; i++) {
                            var oSigner = yield oSigners.Item(i);
                            var cert = yield oSigner.Certificate;
                            signs[i - 1] = {
                                cert: cert,
                                certInfo: yield _sertInfo(cert),
                                //timestamp: yield oSigner.SignatureTimeStampTime,
                                //signingTime: new Date(yield oSigner.SigningTime)
                            };
                        }
                        args[0](signs);
                    } catch (e) {
                        args[1](cadesplugin.getLastError(e));
                    }
                },
                resolve,
                reject
            );
        });
    }

    function getCerts() {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        var oStore = yield cadesplugin.CreateObjectAsync(
                            "CAPICOM.Store"
                        );
                        yield oStore.Open(
                            cadesplugin.CAPICOM_CURRENT_USER_STORE,
                            cadesplugin.CAPICOM_MY_STORE,
                            cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
                        );
                        //var CertificatesObj = yield oStore.Certificates;
                        var storeCerts = yield oStore.Certificates;
                        var CertificatesObj = yield storeCerts.Find(
                            signlib._CAPICOM_CERTIFICATE_FIND_TIME_VALID,
                            new Date(),
                            true
                        );
                        var certsCount = yield CertificatesObj.Count;
                        var certs = [];
                        for (var i = 1; i <= certsCount; i++) {
                            var cert = yield CertificatesObj.Item(i);
                            certs[i - 1] = {
                                cert: cert,
                                info: yield _sertInfo(cert),
                            };
                        }
                        yield oStore.Close();
                        args[0](certs);
                    } catch (e) {
                        args[1](cadesplugin.getLastError(e));
                    }
                },
                resolve,
                reject
            );
        });
    }

    //------------------------------------------------------------------------------------------------------------------

    function _sign(data, encode, detached) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        var cert = yield signlib.selectCertDialog();

                        var oSigner = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.CPSigner"
                        );
                        yield oSigner.propset_Certificate(cert);
                        var oSignedData = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.CadesSignedData"
                        );
                        yield oSignedData.propset_ContentEncoding(encode);
                        yield oSignedData.propset_Content(data);

                        var sSignedMessage = yield oSignedData.SignCades(
                            oSigner,
                            cadesplugin.CADESCOM_CADES_BES,
                            detached
                        );

                        var inf = yield _getSigns(oSignedData);

                        args[0]({ sign: sSignedMessage, signsInfo: inf });
                    } catch (e) {
                        args[1](cadesplugin.getLastError(e));
                    }
                },
                resolve,
                reject
            );
        });
    }

    function signString(data, detached) {
        detached = !!detached;
        return _sign(data, cadesplugin.CADESCOM_STRING_TO_UCS2LE, detached);
    }

    function signFile(file, detached) {
        detached = !!detached;
        return new Promise(function (resolve, reject) {
            signlib._readFile(file).then(function (fileData) {
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
            });
        });
    }

    //------------------------------------------------------------------------------------------------------------------
    function _getCertAndHashedDataObject(thumbprintCert) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        var oStore = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.Store"
                        );
                        yield oStore.Open();
                        var all_certs = yield oStore.Certificates;
                        var oCerts = yield all_certs.Find(
                            cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH,
                            thumbprintCert
                        );
                        var cert = yield oCerts.Item(1);
                        var certInfo = yield yield _sertInfo(cert);
                        var algo =
                            cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
                        if (certInfo.pkAlgoOID == signlib._OID_GOST_2012_256) {
                            algo =
                                cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256;
                        } else if (
                            certInfo.pkAlgoOID == signlib._OID_GOST_2012_512
                        ) {
                            algo =
                                cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512;
                        } else if (
                            certInfo.pkAlgoOID != signlib._OID_GOST_2001
                        ) {
                            reject(
                                'Некорректный алгоритм сертификата ЭП. Поддерживаются только алгоритмы семейства "ГОСТ".'
                            );
                        }

                        var oHashedData = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.HashedData"
                        );
                        yield oHashedData.propset_Algorithm(algo);

                        args[0]({ cert: cert, hashedDataObject: oHashedData });
                    } catch (e) {
                        args[1](cadesplugin.getLastError(e));
                    }
                },
                resolve,
                reject
            );
        });
    }

    function _signHashedData(oHashedData, cert) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        //var cert = yield signlib.selectCertDialog();
                        var oSigner = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.CPSigner"
                        );
                        yield oSigner.propset_Certificate(cert);

                        var oSignedData = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.CadesSignedData"
                        );
                        var sSignedMessage = yield oSignedData.SignHash(
                            oHashedData,
                            oSigner,
                            cadesplugin.CADESCOM_CADES_BES
                        );

                        var hash = yield oHashedData.Value;
                        var inf = yield _getSigns(oSignedData);

                        args[0]({
                            sign: sSignedMessage,
                            hash: hash,
                            signsInfo: inf,
                        });
                    } catch (e) {
                        args[1](cadesplugin.getLastError(e));
                    }
                },
                resolve,
                reject
            );
        });
    }

    function signStringHash(data, thumbprintCertificate) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        var o = yield _getCertAndHashedDataObject(
                            thumbprintCertificate
                        );
                        o.hashedDataObject.propset_DataEncoding(
                            cadesplugin.CADESCOM_BASE64_TO_BINARY
                        );
                        o.hashedDataObject.Hash(signlib._b64EncUTF(data));

                        _signHashedData(o.hashedDataObject, o.cert).then(
                            function (a) {
                                resolve(a);
                            },
                            function (err) {
                                reject(err);
                            }
                        );
                    } catch (e) {
                        reject(e);
                    }
                },
                resolve,
                reject
            );
        });
    }

    function signFileHash(file) {
        return new Promise(function (resolve, reject) {
            signlib
                ._readFile(file)
                .then(function (fileData) {
                    cadesplugin.async_spawn(
                        function* (args) {
                            try {
                                var o = yield _getCertAndHashedDataObject();
                                o.hashedDataObject.propset_DataEncoding(
                                    cadesplugin.CADESCOM_BASE64_TO_BINARY
                                );
                                o.hashedDataObject.Hash(fileData);

                                _signHashedData(
                                    o.hashedDataObject,
                                    o.cert
                                ).then(
                                    function (a) {
                                        resolve(a);
                                    },
                                    function (err) {
                                        reject(err);
                                    }
                                );
                            } catch (e) {
                                args[1](cadesplugin.getLastError(e));
                            }
                        },
                        resolve,
                        reject
                    );
                })
                .catch((err) => "read err", err);
        });
    }

    function signHash(hashArr) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        var o = yield _getCertAndHashedDataObject();
                        var alg = yield o.hashedDataObject.Algorithm;
                        o.hashedDataObject.propset_DataEncoding(
                            cadesplugin.CADESCOM_BASE64_TO_BINARY
                        );
                        if (
                            alg ==
                            cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256
                        ) {
                            if (!hashArr.GOST_2012_256) {
                                reject(
                                    "Отсутвует хэш для алгоритма ГОСТ 2012-256."
                                );
                            }
                            o.hashedDataObject.SetHashValue(
                                hashArr.GOST_2012_256
                            );
                        } else if (
                            alg ==
                            cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512
                        ) {
                            if (!hashArr.GOST_2012_512) {
                                reject(
                                    "Отсутвует хэш для алгоритма ГОСТ 2012-512."
                                );
                            }
                            o.hashedDataObject.SetHashValue(
                                hashArr.GOST_2012_512
                            );
                        } else {
                            if (!hashArr.GOST_2001) {
                                reject(
                                    "Отсутвует хэш для алгоритма ГОСТ 2001."
                                );
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
                    } catch (e) {
                        reject(e);
                    }
                },
                resolve,
                reject
            );
        });
    }

    //------------------------------------------------------------------------------------------------------------------

    //signer.coSign = function(sign) {
    //    return new Promise(function(resolve, reject){
    //        cadesplugin.async_spawn(function *(args) {
    //            try {
    //                var cert = yield signlib.selectCertDialog();
    //                var oSigner = yield cadesplugin.CreateObjectAsync('CAdESCOM.CPSigner');
    //
    //                var oSignedData = yield cadesplugin.CreateObjectAsync('CAdESCOM.CadesSignedData');
    //                yield oSignedData.VerifyCades(sign, cadesplugin.CADESCOM_CADES_BES);
    //
    //                yield oSigner.propset_Certificate(cert);
    //                var sSignedMessage = yield oSignedData.CoSignCades(oSigner, cadesplugin.CADESCOM_CADES_BES);
    //                args[0](sSignedMessage);
    //            } catch (e) {
    //                args[1](cadesplugin.getLastError(e));
    //            }
    //        }, resolve, reject);
    //
    //    });
    //};

    function _cosignHashedData(oHashedData, sign) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        var cert = yield signlib.selectCertDialog();
                        var oSigner = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.CPSigner"
                        );
                        yield oSigner.propset_Certificate(cert);

                        var oSignedData = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.CadesSignedData"
                        );
                        yield oSignedData.VerifyHash(
                            oHashedData,
                            sign,
                            cadesplugin.CADESCOM_CADES_BES
                        );
                        var sSignedMessage = yield oSignedData.CoSignHash(
                            oHashedData,
                            oSigner,
                            cadesplugin.CADESCOM_CADES_BES
                        );

                        var hash = yield oHashedData.Value;
                        var inf = yield _getSigns(oSignedData);

                        args[0]({
                            sign: sSignedMessage,
                            hash: hash,
                            signsInfo: inf,
                        });
                    } catch (e) {
                        args[1](cadesplugin.getLastError(e));
                    }
                },
                resolve,
                reject
            );
        });
    }

    function cosignStringHash(data, sign) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    var oHashedData = yield cadesplugin.CreateObjectAsync(
                        "CAdESCOM.HashedData"
                    );
                    yield oHashedData.propset_DataEncoding(
                        cadesplugin.CADESCOM_STRING_TO_UCS2LE
                    );
                    yield oHashedData.Hash(data);

                    _cosignHashedData(oHashedData, sign).then(
                        function (a) {
                            resolve(a);
                        },
                        function (err) {
                            reject(err);
                        }
                    );
                },
                resolve,
                reject
            );
        });
    }

    function cosignFileHash(file, sign) {
        return new Promise(function (resolve, reject) {
            signlib._readFile(file).then(function (fileData) {
                cadesplugin.async_spawn(
                    function* (args) {
                        try {
                            var oHashedData =
                                yield cadesplugin.CreateObjectAsync(
                                    "CAdESCOM.HashedData"
                                );
                            yield oHashedData.propset_DataEncoding(
                                cadesplugin.CADESCOM_BASE64_TO_BINARY
                            );
                            yield oHashedData.Hash(fileData);

                            _cosignHashedData(oHashedData, sign).then(
                                function (a) {
                                    args[0](a);
                                },
                                function (err) {
                                    args[1](err);
                                }
                            );
                        } catch (e) {
                            args[1](cadesplugin.getLastError(e));
                        }
                    },
                    resolve,
                    reject
                );
            });
        });
    }

    function cosignHash(hash, sign) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    var oHashedData = yield cadesplugin.CreateObjectAsync(
                        "CAdESCOM.HashedData"
                    );
                    yield oHashedData.propset_DataEncoding(
                        cadesplugin.CADESCOM_STRING_TO_UCS2LE
                    );
                    yield oHashedData.SetHashValue(hash);

                    _cosignHashedData(oHashedData, sign).then(
                        function (a) {
                            resolve(a);
                        },
                        function (err) {
                            reject(err);
                        }
                    );
                },
                resolve,
                reject
            );
        });
    }

    //------------------------------------------------------------------------------------------------------------------

    function _verifySign(sign, data, encode) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        var oSignedData = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.CadesSignedData"
                        );
                        var detached = false;
                        if (data != undefined) {
                            yield oSignedData.propset_ContentEncoding(encode);
                            yield oSignedData.propset_Content(data);
                            detached = true;
                        }
                        yield oSignedData.VerifyCades(
                            sign,
                            cadesplugin.CADESCOM_CADES_BES,
                            detached
                        );
                        var inf = yield _getSigns(oSignedData);

                        args[0]({ signsInfo: inf });
                    } catch (e) {
                        args[1](cadesplugin.getLastError(e));
                    }
                },
                resolve,
                reject
            );
        });
    }

    function verifySignString(sign, data) {
        return _verifySign(sign, data, cadesplugin.CADESCOM_STRING_TO_UCS2LE);
    }

    function verifySignFile(sign, file) {
        return new Promise(function (resolve, reject) {
            signlib._readFile(file).then(function (fileData) {
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
            });
        });
    }

    function verifySignHash(sign, hash) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        //FIXME
                        var algo =
                            cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256;
                        if (hash.length > 100) {
                            algo =
                                cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_512;
                        }

                        var oHashedData = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.HashedData"
                        );
                        var oSignedData = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.CadesSignedData"
                        );

                        try {
                            yield oHashedData.propset_Algorithm(algo);
                            yield oHashedData.SetHashValue(hash);
                            yield oSignedData.VerifyHash(
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

                            algo =
                                cadesplugin.CADESCOM_HASH_ALGORITHM_CP_GOST_3411;
                            yield oHashedData.propset_Algorithm(algo);
                            yield oHashedData.SetHashValue(hash);
                            yield oSignedData.VerifyHash(
                                oHashedData,
                                sign,
                                cadesplugin.CADESCOM_CADES_BES
                            );
                        }

                        var inf = yield _getSigns(oSignedData);

                        args[0]({ signsInfo: inf });
                    } catch (e) {
                        console.log(e);
                        args[1](cadesplugin.getLastError(e));
                    }
                },
                resolve,
                reject
            );
        });
    }

    //------------------------------------------------------------------------------------------------------------------

    function _getHash(data, encode) {
        return new Promise(function (resolve, reject) {
            cadesplugin.async_spawn(
                function* (args) {
                    try {
                        var oHashedData = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.HashedData"
                        );
                        yield oHashedData.propset_DataEncoding(encode);
                        yield oHashedData.Hash(data);

                        var hash = yield oHashedData.Value;

                        args[0](hash);
                    } catch (e) {
                        args[1](cadesplugin.getLastError(e));
                    }
                },
                resolve,
                reject
            );
        });
    }

    function hashString(data) {
        return _getHash(data, cadesplugin.CADESCOM_STRING_TO_UCS2LE);
    }

    function hashFile(file) {
        return new Promise(function (resolve, reject) {
            signlib._readFile(file).then(function (fileData) {
                _getHash(fileData, cadesplugin.CADESCOM_BASE64_TO_BINARY).then(
                    function (a) {
                        resolve(a);
                    },
                    function (err) {
                        reject(err);
                    }
                );
            });
        });
    }

    //------------------------------------------------------------------------------------------------------------------

    var checkResult;
    function checkPlugin() {
        return new Promise(function (resolve, reject) {
            if (checkResult) {
                resolve(checkResult);
            }

            cadesplugin.async_spawn(
                function* (args) {
                    var ret = { loaded: false, enabled: false, worked: false };
                    try {
                        var oAbout = yield cadesplugin.CreateObjectAsync(
                            "CAdESCOM.About"
                        );
                        ret = { loaded: true, enabled: true, worked: true };

                        var pluginVer = yield oAbout.PluginVersion;
                        if (typeof pluginVer == "undefined") {
                            pluginVer = yield oAbout.Version;
                        }

                        ret.pluginVersion = pluginVer;

                        if (typeof pluginVer != "string") {
                            ret.pluginVersion = {
                                major: yield pluginVer.MajorVersion,
                                minor: yield pluginVer.MinorVersion,
                                build: yield pluginVer.BuildVersion,
                            };

                            var CSPVer = yield oAbout.CSPVersion("", 75); //Версия криптопровайдера
                            ret.CSPVersion = {
                                major: yield CSPVer.MajorVersion,
                                minor: yield CSPVer.MinorVersion,
                                build: yield CSPVer.BuildVersion,
                            };
                        }

                        ret.name = yield oAbout.CSPName(75); //Криптопровайдер

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
                        var mimetype =
                            navigator.mimeTypes["application/x-cades"];
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
                },
                resolve,
                reject
            );
        });
    }
    //------------------------------------------------------------------------------------------------------------------

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
