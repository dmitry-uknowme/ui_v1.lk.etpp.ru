import $ from "jquery";
import "./cadesplugin_api";

(function () {
  "use strict";

  if (window.signlib) {
    return;
  }

  if (!window.cadesplugin) {
    console.log("signlib: Not loaded cadesplugin api!");
    return;
  }

  if (!window.Promise) {
    console.log("signlib: Need promise support!");
    return;
  }

  //------------------------------------------------------------------------------------------------------------------

  var tidyUp = false,
    dlgCloseBtn = $('<div class="modal-close">x</div>'),
    dlgHeader = $("<h1>Выбор ключа ЭП для подписи</h1>"),
    dlgList = $('<div class="object_list"></div>'),
    dlgCancelBtn = $('<button class="btn btn-danger">Отмена</button>'),
    dlgCancelGroup = $('<div class="form-group">').append(dlgCancelBtn),
    dlg = $('<div class="modal" style="z-index: 210"></div>')
      .append(
        $('<div class="modal-wrap"></div>').append(
          $('<div class="modal-content"></div>')
            .append(dlgCloseBtn)
            .append(dlgHeader)
            .append(dlgList)
            .append(dlgCancelGroup)
        )
      )
      .hide()
      .appendTo($("body"));
  function _leadingZero(val) {
    if (val < 10) {
      return "0" + val;
    }
    return val;
  }

  function _formatDate(dt) {
    return (
      _leadingZero(dt.getDate()) +
      "." +
      _leadingZero(dt.getMonth() + 1) +
      "." +
      dt.getFullYear() +
      " " +
      _leadingZero(dt.getHours()) +
      ":" +
      _leadingZero(dt.getMinutes())
    );
  }

  function _dlgClose() {
    if (tidyUp) {
      $("body").removeClass("modal-open");
    }
    dlg.hide();
  }

  function selectCertDialog() {
    return new Promise(function (resolve, reject) {
      var oStore = cadesplugin.CreateObjectAsync("CAdESCOM.Store");
      oStore.Open();
      var all_certs = oStore.Certificates;
      var oCerts = all_certs.Find(
        cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH,
        "D354F5E7FA475328D0D12568BF55EFFCBD435CE2"
      );
      var certificate = oCerts.Item(1);
      console.log(certificate);
      alert("asasas");
    });
  }

  //------------------------------------------------------------------------------------------------------------------

  function _b64EncUTF(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(
      encodeURIComponent(str).replace(
        /%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
          return String.fromCharCode("0x" + p1);
        }
      )
    );
  }

  function _readFile(file) {
    return new Promise(function (resolve, reject) {
      var oFReader = new FileReader();
      oFReader.readAsDataURL(file);
      oFReader.onload = function (oFREvent) {
        var header = ";base64,";
        var sFileData = oFREvent.target.result;
        var sBase64Data = sFileData.substr(
          sFileData.indexOf(header) + header.length
        );
        resolve(sBase64Data);
      };
    });
  }

  function _dnParse(seq) {
    var res = {};
    var key = "";
    var quoted = false;
    var token = [];

    for (let i = 0; i <= seq.length; i++) {
      if (i == seq.length) {
        if (key != null) {
          res[key] = token.join("");
        }
        break;
      }

      let ch = seq[i];
      if (ch == '"') {
        if (!quoted) {
          quoted = true;
        } else if (seq[i + 1] == '"') {
          token.push(ch);
          i++;
        } else {
          quoted = false;
        }
      } else if (ch == "=") {
        key = token.join("").trim();
        token = [];
      } else if (ch == "," && !quoted) {
        res[key] = token.join("");
        key = "";
        token = [];
      } else if (ch === " " && !quoted && !token.length) {
        //continue;
      } else {
        token.push(ch);
      }
    }

    return res;
  }

  function _verCompare(StringVersion, ObjectVersion) {
    if (typeof ObjectVersion == "string") return -1;
    var arr = StringVersion.split(".");

    if (ObjectVersion.major == parseInt(arr[0])) {
      if (ObjectVersion.minor == parseInt(arr[1])) {
        if (ObjectVersion.build == parseInt(arr[2])) {
          return 0;
        } else if (ObjectVersion.build < parseInt(arr[2])) {
          return -1;
        }
      } else if (ObjectVersion.minor < parseInt(arr[1])) {
        return -1;
      }
    } else if (ObjectVersion.major < parseInt(arr[0])) {
      return -1;
    }

    return 1;
  }

  //------------------------------------------------------------------------------------------------------------------

  function _loader(funcName) {
    return function () {
      var funcArgs = arguments;
      return new Promise(function (funcResolve, funcReject) {
        cadesplugin.then(
          function (data) {
            if (!window.signlib._core) {
              signlib._core = new Promise(function (resolve, reject) {
                signlib._coreResolve = resolve;
                var url = "/new_cryptopro/signlib.sync.js";
                if (cadesplugin.CreateObjectAsync) {
                  url = "/new_cryptopro/signlib.async.js";
                }
                var script = document.createElement("script");
                script.onerror = function (e) {
                  reject("Ошибка при загрузке библиотеки формирования ЭП");
                };
                script.src = url;
                document.documentElement.appendChild(script);
              });
            }
            signlib._core.then(
              function () {
                signlib._core[funcName].apply(this, funcArgs).then(
                  function (data) {
                    funcResolve(data);
                  },
                  function (e) {
                    funcReject(e);
                  }
                );
              },
              function (e) {
                funcReject(e);
              }
            );
          },
          function (e) {
            funcReject(e);
          }
        );
      });
    };
  }

  window.signlib = {
    _OID_GOST_2001: "1.2.643.2.2.19",
    _OID_GOST_2012_256: "1.2.643.7.1.1.1.1",
    _OID_GOST_2012_512: "1.2.643.7.1.1.1.2",
    _CAPICOM_CERTIFICATE_FIND_TIME_VALID: 9,
    _b64EncUTF: _b64EncUTF,
    _readFile: _readFile,
    _dnParse: _dnParse,
    _verCompare: _verCompare,
    selectCertDialog: selectCertDialog,
    getCerts: _loader("getCerts"),
    signString: _loader("signString"),
    signFile: _loader("signFile"),
    signStringHash: _loader("signStringHash"),
    signFileHash: _loader("signFileHash"),
    signHash: _loader("signHash"),
    cosignString: _loader("cosignString"),
    cosignFile: _loader("cosignFile"),
    cosignStringHash: _loader("cosignStringHash"),
    cosignFileHash: _loader("cosignFileHash"),
    cosignHash: _loader("cosignHash"),
    verifySignString: _loader("verifySignString"),
    verifySignFile: _loader("verifySignFile"),
    verifySignStringHash: _loader("verifySignStringHash"),
    verifySignFileHash: _loader("verifySignFileHash"),
    verifySignHash: _loader("verifySignHash"),
    hashString: _loader("hashString"),
    hashFile: _loader("hashFile"),
    checkPlugin: _loader("checkPlugin"),
  };
})();
