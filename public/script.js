	// create the module and name it scotchApp
	var scotchApp = angular.module('scotchApp', ['ngRoute']);
  var as;
function arconcat(buffer1, buffer2) {
	// var catArray = new Uint8Array(x.byteLength+y.byteLength);
	// catArray.set(x,0);
	// catArray.set(y, x.byteLength);
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(buffer1, 0);
  tmp.set(buffer2, buffer1.byteLength);
  return tmp;
}

  scotchApp.run(function ($rootScope) {
        $rootScope.ar = "I am root!";
    });
  var ar = "I am root!";
	// configure our routes
	scotchApp.config(function($routeProvider) {
		$routeProvider

			// route for the home page
			.when('/', {
				templateUrl : 'pages/home.html',
				controller  : 'mainController'
			})
			.when('/register', {
				templateUrl : 'pages/regis.html',
				controller  : 'mainController'
			})
			// route for the about page
			.when('/auth', {
				templateUrl : 'pages/auth.html',
				controller  : 'aboutController'
			})

			// route for the contact page
			.when('/inbox', {
				templateUrl : 'pages/inbox.html',
				controller  : 'contactController',
				css					: 'pages/inbox.css'
			});
	});

	// create the controller and inject Angular's $scope
	scotchApp.controller('mainController', function($scope,$http,$rootScope,$window) {
		if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
		    window.crypto.subtle = window.crypto.webkitSubtle;
		}
	  var aesgcm = cryptogcm;
		var email;
		var pass;
		var key;
		if(	localStorage.getItem('key')!="undefined" && 	localStorage.getItem('token')!="undefined" && localStorage.getItem('key')!=null && 	localStorage.getItem('token')!=null){
			$window.location.href = '#auth';
		}
	  aesgcm.sha256("d+8NElvUwfFibT37").then(function(value){console.log(value)});

	  $scope.connect = function (email,pass){
			$scope.email = email;

			aesgcm.sha256(aesgcm.bufferToBase64(aesgcm.strtoab(pass))).then(function(value){
			$scope.pass = value;
			});
	    //console.log($rootScope.email);
      console.log(email);
	    $scope.iv = window.crypto.getRandomValues(new Uint8Array(12));
	    $http.get('/auth?email='+email+'&iv='+aesgcm.bufferToBase64($scope.iv), {headers: {'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==', 'iv': ''+aesgcm.bufferToBase64($scope.iv)}})
			.then(
				function(data){
					console.log($scope.pass);
					console.log(data.data.t_salt);
					console.log('kbefore hash');
					console.log(aesgcm.bufferToBase64(arconcat(aesgcm.base64ToBuffer($scope.pass),aesgcm.base64ToBuffer(data.data.t_salt))));
					aesgcm.sha256(aesgcm.bufferToBase64(arconcat(aesgcm.base64ToBuffer($scope.pass),aesgcm.base64ToBuffer(data.data.t_salt))) ).then(function(value){
						$scope.pass = null;
						$scope.key = value;
						console.log("key:");
						console.log(value);
						aesgcm.decrypt(data.data.data,$scope.key,aesgcm.bufferToBase64($scope.iv)).then(function (decrypted){

							console.log(window.atob(decrypted.data));
							decrypted.data = JSON.parse(window.atob(decrypted.data));
							console.log(decrypted.data);
							console.log(decrypted.data.token);
							$scope.iv = decrypted.data.iv;
							localStorage.setItem('token', decrypted.data.token);
							data = {
								pad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12))),
								token_recieved : decrypted.data.token,
								recieved : true,
								endpad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12)))
							};
							data = JSON.stringify(data);
							aesgcm.encrypt(window.btoa(data),$scope.key,$scope.iv).then(function(encrypted){
								$scope.postT(encrypted);
							})
						})
					});
					console.log(data.data)
					}
			, function(data){
				 	console.log(data)
				}
			);

	    //console.log($rootScope.ar);
	    //console.log(value);
	    //$rootScope.ar = 'changed';
	  }

		$scope.postT = function (data){
			var aesgcm = cryptogcm;
			console.log($scope.email);
			req = {'email': $scope.email, 'iv': data.iv, 'data': data.data};
			$http.post('/auth',  {},{ headers : {'data' : JSON.stringify(req)}})
			.then(
				function(data){
					console.log(data.data.data);
					console.log($scope.key);
					console.log($scope.iv);
					aesgcm.decrypt(data.data.data,$scope.key,$scope.iv).then(function(decrypted){
						decrypted.data = JSON.parse(window.atob(decrypted.data));
						console.log(decrypted.data);
						$scope.key = decrypted.data.key;
						localStorage.setItem('key', decrypted.data.key);
						localStorage.setItem('email', $scope.email);
						$window.location.href = '#auth';
					});
				}
			, function(data){
					console.log(data);


				}
			);
		}
		// create a message to display in our view
		$scope.message = 'Everyone come and see how good I look!';
			  $(function() {

    $('#login-form-link').click(function(e) {
		$("#login-form").delay(100).fadeIn(100);
 		$("#register-form").fadeOut(100);
		$('#register-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});
	$('#register-form-link').click(function(e) {
		$("#register-form").delay(100).fadeIn(100);
 		$("#login-form").fadeOut(100);
		$('#login-form-link').removeClass('active');
		$(this).addClass('active');
		e.preventDefault();
	});

  });
	});

	scotchApp.controller('aboutController', function($scope,$http,$rootScope,$window) {

		if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
		    window.crypto.subtle = window.crypto.webkitSubtle;
		}
		if(	!(localStorage.getItem('key')!="undefined" && 	localStorage.getItem('token')!="undefined" && localStorage.getItem('key')!=null && 	localStorage.getItem('token')!=null)){
			$window.location.href = '#/';
		}
		$scope.message = 'Look! I am an about page.';
		var aesgcm = cryptogcm;
		$scope.auth = function (data){
			var aesgcm = cryptogcm;
			req = {'email': localStorage.getItem('email'), 'iv': data.iv, 'data': data.data};
			console.log(req);
			console.log(data);
			$http.post('/Token',  {},{ headers : {'data' : JSON.stringify(req)}})
			.then(
				function(data){
					console.log(data.data.data);
					console.log($scope.key);
					console.log($scope.iv);
					aesgcm.decrypt(data.data.data,$scope.key,$scope.iv).then(function(decrypted){
						decrypted.data = JSON.parse(window.atob(decrypted.data));
						console.log(decrypted.data);
						//$scope.key = decrypted.data.key;
						//localStorage.setItem('key', decrypted.data.key);
						if(decrypted.data.status)
							$window.location.href = '#inbox';
					});
				}
			, function(data){
				localStorage.setItem('key', "undefined");
				localStorage.setItem('token', "undefined");
				$window.location.href = '#/';
					console.log(data);
				}
			);
		}

		$scope.authpost=function(){
			$scope.key =  localStorage.getItem('key');
			$scope.iv = aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12)));
			data = {
				pad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12))),
				token: localStorage.getItem('token'),
				endpad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12)))
			};
			data = JSON.stringify(data);
			aesgcm.encrypt(window.btoa(data),$scope.key,$scope.iv).then(function(encrypted){
				$scope.auth(encrypted);
			})
		}

		$scope.log=function(){
		  console.log("auth");
		}
	});

	scotchApp.controller('contactController', function($scope,$rootScope,$window) {
		if(	!(localStorage.getItem('key')!="undefined" && 	localStorage.getItem('token')!="undefined" && localStorage.getItem('key')!=null && 	localStorage.getItem('token')!=null)){
		   $window.location.href = '#/';
		}
		if (window.crypto && !window.crypto.subtle && window.crypto.webkitSubtle) {
		    window.crypto.subtle = window.crypto.webkitSubtle;
		}
		var aesgcm = cryptogcm;
		// socket = io.connect('http://localhost', {
		//   query: "data=" + myAuthToken
		// });

		// $scope.setsoket = function (data){
		// 	var aesgcm = cryptogcm;
		// 	req = {'email': localStorage.getItem('email'), 'iv': data.iv, 'data': data.data};
		// 	console.log(req);
		// 	console.log(data);
		// 	$http.post('/Token',  {},{ headers : {'data' : JSON.stringify(req)}})
		// 	.then(
		// 		function(data){
		// 			console.log(data.data.data);
		// 			console.log($scope.key);
		// 			console.log($scope.iv);
		// 			aesgcm.decrypt(data.data.data,$scope.key,$scope.iv).then(function(decrypted){
		// 				decrypted.data = JSON.parse(window.atob(decrypted.data));
		// 				console.log(decrypted.data);
		// 				//$scope.key = decrypted.data.key;
		// 				//localStorage.setItem('key', decrypted.data.key);
		// 				if(decrypted.data.status)
		// 					$window.location.href = '#inbox';
		// 			});
		// 		}
		// 	, function(data){
		// 			console.log(data);
		// 		}
		// 	);
		// }
		$scope.set = false;
		$scope.setsoket = function (data){
			console.log('set socket');
			$scope.set = true;
			$scope.socket.on('registred',function(arg){
				$scope.iv =	arg.iv;
				aesgcm.decrypt(arg.data,$scope.key,$scope.iv).then(function(decrypted){
					decrypted.data = JSON.parse(window.atob(decrypted.data));
					var data = decrypted.data;
					$scope.socket.key = data.key;
					console.log(data.key);
					console.log(data.contacts);
					var lookup ={};
					for (var i = 0, len = data.contacts.length; i < len; i++) {
							if(typeof(lookup[data.contacts[i].id]) == 'undefined' ){
								$scope.contacts.push(data.contacts[i]);
							}
              lookup[data.contacts[i].id] = data.contacts[i];
          }
					$scope.contactsl = lookup;
					$scope.$digest();
					console.log($scope.contacts);
					data = {
						pad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12))),
						message: "done",
						endpad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12)))
					};
					data = JSON.stringify(data);
					aesgcm.encrypt(window.btoa(data),$scope.socket.key,$scope.iv).then(function(encrypted){
						$scope.socket.emit('registred',encrypted);
					});
				});
			});

			$scope.socket.on('newmessage',function(arg){
				$scope.iv =	arg.iv;
				aesgcm.decrypt(arg.data,$scope.socket.key,$scope.iv).then(function(decrypted){
					decrypted.data = JSON.parse(window.atob(decrypted.data));
					var data = decrypted.data;
					if(typeof($scope.contactsl[data.sourse.id]) == 'undefined' ){
						$scope.contactsl[data.sourse.id] = data.sourse;
						data.sourse.new = true;
						$scope.contacts.push( data.sourse );
					}else{
						for (var i = 0, len = $scope.contacts.length; i < len; i++) {
	              if($scope.contacts[i].id == data.sourse.id) $scope.contacts[i].new = true;
	          }

					}
					if(typeof($scope.msgcol[data.sourse.id]) == 'undefined' ){
						$scope.msgcol[data.sourse.id] = [];
						$scope.msgcol[data.sourse.id].push(
							{text : data.message,class : "bubble2 pull-left"}
						);
					}else{
						$scope.msgcol[data.sourse.id].push(
							{text : data.message,class : "bubble2 pull-left"}
						);
					}
					$scope.$digest();
				});
			});

			$scope.socket.on('finduser',function(arg){
				$scope.iv =	arg.iv;
				console.log('finuser responce');
				console.log(arg);
				console.log(arg.data);
				console.log($scope.socket.key);
				console.log($scope.iv);
				aesgcm.decrypt(arg.data,$scope.socket.key,$scope.iv).then(function(decrypted){
					console.log(decrypted.data);
					decrypted.data = JSON.parse(window.atob(decrypted.data));
					var data = decrypted.data;
					console.log(data);
					if(data.found){
						$scope.contacts.push(data.contact);
						$scope.contactsl[data.contact.id] = data.contact;
						$scope.findusermsg = true;
					}else{
						$scope.findusermsg = false;
					}
					$scope.$digest();
				});
			});

		}
		var socket;
		$scope.authio=function(){
			console.log('authio');
			$scope.key =  localStorage.getItem('key');
			$scope.iv = aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12)));
			data = {
				pad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12))),
				token: localStorage.getItem('token'),
				endpad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12)))
			};
			data = JSON.stringify(data);
			aesgcm.encrypt(window.btoa(data),$scope.key,$scope.iv).then(function(encrypted){
				console.log(encrypted);
				$scope.socket = io.connect('https://dtccl.com/', {
				  query: "data=" + JSON.stringify({
						email: localStorage.getItem('email'),
						iv: $scope.iv,
						data : encrypted
					})
				});
				$scope.setsoket();
				// $scope.auth(encrypted);
			})
		}
		$scope.contacts = [];
		$scope.contactsl = {};
		$scope.authio();

		//$scope.contacts = [
		// { first_name : "dah",
		// 	last_name : "abdallahi",
		// 	email : "dah@example.com",
		// 	id : 111
		// 	},
		// 	{ first_name : "dah",
		// 	last_name : "dah",
		// 	email : "dah@example.com",
		// 	id : 112
		// 	},
		// 	{ first_name : "dah",
		// 	last_name : "abdallahi",
		// 	email : "dah@example.com",
		// 	id : 111
		// 	},
		// ];
		$scope.msgcol = {};
		// $scope.msgcol[111] = [
		// 	{text : "hey",class : "bubble2 col-md-10 pull-left"},
		// 	{text : "Yo",class : "bubble col-md-10 pull-right"}
		// 	]
		$scope.messages = {};
		$scope.active = [];
	  as = $scope;
		$scope.switch = function (value){
	    $scope.active = value;
			value.new = false;
			$scope.messages = $scope.msgcol[value.id];
	    console.log(value);
	  }
	  $scope.disconnect = function (value){
	    localStorage.setItem('key', "undefined");
			localStorage.setItem('token', "undefined");
			$window.location.href = '#/';
	  }



		$scope.find = function (value){

			$scope.iv = aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12)));
			data = {
				pad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12))),
				email: value,
				id : $scope.active.id,
				endpad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12)))
			};
			data = JSON.stringify(data);
			aesgcm.encrypt(window.btoa(data),$scope.socket.key,$scope.iv).then(function(encrypted){
				$scope.socket.emit('finduser',encrypted);
			});
	  }

		$scope.newmsg = function (value){
			$scope.iv = aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12)));
			if(typeof($scope.msgcol[$scope.active.id]) == 'undefined' ) $scope.msgcol[$scope.active.id] = [];
	    $scope.msgcol[$scope.active.id].push(
				{text : value,class : "bubble pull-right"}
			);
			$scope.messages = $scope.msgcol[$scope.active.id];
			data = {
				pad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12))),
				message: value,
				id : $scope.active.id,
				endpad : aesgcm.bufferToBase64(window.crypto.getRandomValues(new Uint8Array(12)))
			};
			data = JSON.stringify(data);
			aesgcm.encrypt(window.btoa(data),$scope.socket.key,$scope.iv).then(function(encrypted){
				$scope.socket.emit('send',encrypted);
			});
			$scope.text = "";
	  }
	  console.log($scope);
		$scope.message = 'Contact us! JK. This is just a demo.';
	});
