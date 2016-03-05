var crypto = require('crypto');
var aes = require('./controllers/aes')

// function _base64ToArrayBuffer(base64) {
//     var binary_string =  window.atob(base64);
//     var len = binary_string.length;
//     var bytes = new Uint8Array( len );
//     for (var i = 0; i < len; i++)        {
//         bytes[i] = binary_string.charCodeAt(i);
//     }
//     return bytes.buffer;
// }
// function _arrayBufferToBase64(uarr) {
//     var strings = [], chunksize = 0xffff;
//     var len = uarr.length;
//
//     for (var i = 0; i * chunksize < len; i++){
//         strings.push(String.fromCharCode.apply(null, uarr.subarray(i * chunksize, (i + 1) * chunksize)));
//     }
//
//     return strings.join("");
// }
test = 'hello -';
// iv = crypto.randomBytes(12);
// key = crypto.randomBytes(32);
// var encrypted = aes.encryptgcm(test,key,iv);
// console.log(encrypted);
// var encrypted2 = {
//   tag:new Buffer("f9a2aa6bafa83a5bd871511434a0fb95", "hex"),
//   content:encrypted.content
//   }
console.log('h0cF4YfP5QpJyvXEVkJqnaRPX1TC7Rd8yXKNUtLcaMoLo0FfstNv7VkJ');
console.log(new Buffer("JTdCJTBBZG9uZSUzQXRydWUlMkMlMEElN0Q=", "base64"));
try{
console.log(aes.encryptgcm("JTdCJTBBZG9uZSUzQXRydWUlMkMlMEElN0Q=",new Buffer("P8zrcQw5Bb6ffT3eNPuz662VoKO/3dcLe0e0KgtJfOY=", "base64"),new Buffer("zWpsMSR/0mohtj1L", "base64")));
}catch(err){
  console.log(err);
}
// //console.log(aes.decryptgcm(encrypted,key,iv));
// ar = new Buffer('336EEBCA7B580CBE4015C90940CA68BDDF9CD6D8FB9BDBB95B88BC3B9EFE206C',"hex");
//
// iv= new Buffer('b3778cb55bdfcaba4d5d99f1',"hex");
// console.log(ar);
// console.log(iv);
// console.log(aes.encryptgcm(test,ar,iv));
// console.log(ar.length);
