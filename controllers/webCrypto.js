function _base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
function _arrayBufferToBase64(uarr) {
    var strings = [], chunksize = 0xffff;
    var len = uarr.length;

    for (var i = 0; i * chunksize < len; i++){
        strings.push(String.fromCharCode.apply(null, uarr.subarray(i * chunksize, (i + 1) * chunksize)));
    }

    return strings.join("");
}

function base64ToBuffer(base64) {
    var binstr = atob(base64);
    var buf = new Uint8Array(binstr.length);
    Array.prototype.forEach.call(binstr, function (ch, i) {
      buf[i] = ch.charCodeAt(0);
    });
    return buf;
}
function generateKey(rawKey) {
  var usages = ['encrypt', 'decrypt'];
  var extractable = true;

  return window.crypto.subtle.importKey(
    'raw'
  , rawKey
  , { name: 'AES-CTR' }
  , extractable
  , usages
  );
}
cryptoctr = {
  base64ToBuffer: function (base64) {
      var binstr = atob(base64);
      var buf = new Uint8Array(binstr.length);
      Array.prototype.forEach.call(binstr, function (ch, i) {
        buf[i] = ch.charCodeAt(0);
      });
      return buf;
  },
  bufferToBase64: function (buf) {
      var binstr = Array.prototype.map.call(buf, function (ch) {
          return String.fromCharCode(ch);
      }).join('');
      return btoa(binstr);
  },
  import: function (keyim) {
    var rkey , rerr;
    Promise.resolve(window.crypto.subtle.importKey(
      'raw'
    , this.base64ToBuffer(keyim)
    , { name: 'AES-CTR' }
    , true
    , ['encrypt', 'decrypt']
    ))
    .then(function(key){
        //returns the symmetric key
        //console.log(key);
        rkey = key;
    })
    .catch(function(err){
        console.error(err);
        rerr = err;
    });
    console.log(rkey);
    if (rerr) return rerr;
    else return rkey
  },
  encrypt: function(data,key){
    this.import(key).then(function(key){
      window.crypto.subtle.encrypt(
          {
              name: "AES-CTR"
          },
          this.import(key), //from generateKey or importKey above
          this.base64ToBuffer(data) //ArrayBuffer of data you want to encrypt
      )
      .then(function(encrypted){
          //returns an ArrayBuffer containing the encrypted data
          console.log(new Uint8Array(encrypted));
          return bufferToBase64(encrypted);
      })
      .catch(function(err){
          console.error(err);
          return err;
      });
    });
  }
}

cryptogcm = {
  base64ToBuffer: function (base64) {
      var binstr = atob(base64);
      var buf = new Uint8Array(binstr.length);
      Array.prototype.forEach.call(binstr, function (ch, i) {
        buf[i] = ch.charCodeAt(0);
      });
      return buf;
  },
  bufferToBase64: function (buf) {
      var binstr = Array.prototype.map.call(buf, function (ch) {
          return String.fromCharCode(ch);
      }).join('');
      return btoa(binstr);
  },
  sha256: function (data) {
    data = base64ToBuffer(data);
    return Promise.resolve(window.crypto.subtle.digest(
        {
            name: "SHA-256",
        },
        data //The data you want to hash as an ArrayBuffer
    )
    .then(function(hash){
        //returns the hash as an ArrayBuffer
        return bufferToBase64(new Uint8Array(hash));
    }));
  },
  import: function (keyim) {
    var rkey , rerr;
    return Promise.resolve(window.crypto.subtle.importKey(
      'raw'
    , this.base64ToBuffer(keyim)
    , { name: 'AES-GCM' }
    , true
    , ['encrypt', 'decrypt']
    ));
  },
  encrypt: function(data,key,iv){
    data = this.base64ToBuffer(data);
    bufferToBase64 = this.bufferToBase64;
    var keyimport = this.import;
    if(iv == null){
      iv = window.crypto.getRandomValues(new Uint8Array(12));
      console.log(bufferToBase64(iv));
    }else {
      iv = this.base64ToBuffer(iv);
    }
    var retdata = null;
    console.log(data);
    return keyimport(key).then(function(keyg){
      //console.log(keyg);
      console.log(data);
      return window.crypto.subtle.encrypt(
          {
              name: "AES-GCM",
              iv: iv
          },
          keyg, //from generateKey or importKey above
          data //ArrayBuffer of data you want to encrypt
      )
      .then(function(encrypted){
          //returns an ArrayBuffer containing the encrypted data
          //console.log(new Uint8Array(encrypted));
          //console.log(bufferToBase64(new Uint8Array(encrypted)));
          retdata = bufferToBase64(new Uint8Array(encrypted));
          return {iv: bufferToBase64(iv) ,data : bufferToBase64(new Uint8Array(encrypted))};
      })
    });
  },
  decrypt: function(data,key,iv){
    data = this.base64ToBuffer(data);
    bufferToBase64 = this.bufferToBase64;
    var keyimport = this.import;
    iv = this.base64ToBuffer(iv);
    var retdata = null;
    console.log(data);
    return keyimport(key).then(function(keyg){
      //console.log(keyg);
      console.log(data);
      return window.crypto.subtle.decrypt(
          {
              name: "AES-GCM",
              iv: iv
          },
          keyg, //from generateKey or importKey above
          data //ArrayBuffer of data you want to encrypt
      )
      .then(function(decrypted){
          //returns an ArrayBuffer containing the encrypted data
          //console.log(new Uint8Array(encrypted));
          //console.log(bufferToBase64(new Uint8Array(encrypted)));
          retdata = bufferToBase64(new Uint8Array(decrypted));
          return {iv: bufferToBase64(iv) ,data : bufferToBase64(new Uint8Array(decrypted))};
      })
    });
  }
}

cryptoctr = {
  base64ToBuffer: function (base64) {
      var binstr = atob(base64);
      var buf = new Uint8Array(binstr.length);
      Array.prototype.forEach.call(binstr, function (ch, i) {
        buf[i] = ch.charCodeAt(0);
      });
      return buf;
  },
  bufferToBase64: function (buf) {
      var binstr = Array.prototype.map.call(buf, function (ch) {
          return String.fromCharCode(ch);
      }).join('');
      return btoa(binstr);
  },
  sha256: function (keyim) {
    data = base64ToBuffer(data);
    return Promise.resolve(window.crypto.subtle.digest(
        {
            name: "SHA-256",
        },
        data //The data you want to hash as an ArrayBuffer
    )
    .then(function(hash){
        //returns the hash as an ArrayBuffer
        return bufferToBase64(new Uint8Array(hash));
    }));
  },
  import: function (keyim) {
    var rkey , rerr;
    return Promise.resolve(window.crypto.subtle.importKey(
      'raw'
    , this.base64ToBuffer(keyim)
    , { name: 'AES-CTR' }
    , true
    , ['encrypt', 'decrypt']
    ));
    // .then(function(key){
    //     //returns the symmetric key
    //     //console.log(key);
    //     rkey = key;
    // })
    // .catch(function(err){
    //     console.error(err);
    //     rerr = err;
    // });
    //console.log(rkey);
    //if (rerr) return rerr;
    //else return rkey
  },
  encrypt: function(data,key){
    data = this.base64ToBuffer(data);
    bufferToBase64 = this.bufferToBase64;
    this.import(key).then(function(keyg){
      console.log(keyg);
      console.log(data);
      window.crypto.subtle.encrypt(
          {
              name: "AES-CTR",
              counter: new Uint8Array(16),
              length: 1, //can be 1-128
          },
          keyg, //from generateKey or importKey above
          data //ArrayBuffer of data you want to encrypt
      )
      .then(function(encrypted){
          //returns an ArrayBuffer containing the encrypted data
          console.log(new Uint8Array(encrypted));
          console.log(bufferToBase64(new Uint8Array(encrypted)));
          return bufferToBase64(new Uint8Array(encrypted));
      })
      .catch(function(err){
          console.error(err);
          //return err;
      });
    });
  }
}
