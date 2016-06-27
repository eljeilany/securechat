# securechat
Securechat is an AES-256 Encrypted Instant messaging platform.
Securechat tries to be imune to man in the middle attacks by not any user password over the internet at all(encrypted or un encrypted).
Instead it implement an authentication system that does not require password transfer.
## Prerequisite 
*This is not a beginner project you need a minimum understanding of JS and Node to tackle this project*
* **Node JS**
* **NPM**
* And an **SSL** certificate if you want to run it publicly.

## Demo
A working Demo of the platform can be found at:
https://dtccl.com/securechat/#

## Instalation

run :
```
npm install
```
In server.js modify line 19 and 20 :
``` javascript 
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/dtccl.com/privkey.pem');
var certificate = fs.readFileSync('/etc/letsencrypt/live/dtccl.com/cert.pem');
```
to :
``` javascript 
var privateKey  = fs.readFileSync('your Key');
var certificate = fs.readFileSync('your certificate');
```

In public/script.js modify line 355:
``` javascript 
				$scope.socket = io.connect('https://dtccl.com/', {
```
to :
``` javascript 
				$scope.socket = io.connect('your domain or server ip adress', {
```

run :
```
sudo npm start
```
