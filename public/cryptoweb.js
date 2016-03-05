var cryptogcm = {
  strtoab :function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return new Uint8Array(buf);
  },
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
    data = this.base64ToBuffer(data);
    bufferToBase64 = this.bufferToBase64;
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
    if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
        window.crypto.subtle = window.crypto.webkitSubtle;
    }
    var rkey , rerr;
    return Promise.resolve(window.crypto.subtle.importKey(
      'raw'
    , cryptogcm.base64ToBuffer(keyim)
    , { name: 'AES-GCM' }
    , true
    , ['encrypt', 'decrypt']
    ));
  },
  encrypt: function(data,key,iv){
    if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
        window.crypto.subtle = window.crypto.webkitSubtle;
    }
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

    if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
        window.crypto.subtle = window.crypto.webkitSubtle;
    }
    data = this.base64ToBuffer(data);
    bufferToBase64 = this.bufferToBase64;
    var keyimport = this.import;
    iv = this.base64ToBuffer(iv);
    var retdata = null;
    //console.log(data);
    return keyimport(key).then(function(keyg){
      //console.log(keyg);
      //console.log(data);
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
          //retdata = bufferToBase64(new Uint8Array(decrypted));
          return {iv: bufferToBase64(iv) ,data : bufferToBase64(new Uint8Array(decrypted))};
      })
    });
  }
}
