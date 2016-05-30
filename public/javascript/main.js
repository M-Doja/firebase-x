(function (jQuery, Firebase, Path) {
    "use strict";

    // the main firebase reference
    var rootRef = new Firebase('https://shakedown.firebaseio.com/web/uauth');

    // Attach an asynchronous callback to read the data at our posts reference
    rootRef.on("value", function(snapshot) {
      document.getElementById('showHere').innerHTML = '';
      console.log(snapshot.val());
      var res = snapshot.val();
      var Users = [];
      var user;
      for (var prop in res){
         for(var prop2 in res[prop]) {
           user = res[prop][prop2];
           Users.push(user);
           console.log(Users);
           for (var i = 0; i < Users.length; i++) {
             console.log(Users[i]);
           }
           console.log(user.fName);
           var str = "<h1>" +user.fName + "</h1><br><h4>" + user.groupName + "<br>"
           + user.tagLine + "<br>"
           + "<img src='"+ user.photo+"'> ";
           document.getElementById('showHere').innerHTML += str;
         }
       }
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });


    // pair our routes to our form elements and controller
    var routeMap = {
        '#/': {
            form: 'frmLogin',
            controller: 'login'
        },
            '#/logout': {
            form: 'frmLogout',
            controller: 'logout'
        },
            '#/register': {
            form: 'frmRegister',
            controller: 'register'
        },
            '#/shop': {
            form: 'frmShop',
            controller: 'shop',
            authRequired: true // must be logged in to get here
        },
            '#/profile': {
            form: 'frmProfile',
            controller: 'profile',
            authRequired: true // must be logged in to get here
        },
    };

    // create the object to store our controllers
    var controllers = {};

    // store the active form shown on the page
    var activeForm = null;

    var alertBox = $('#alert');

    function routeTo(route) {
        window.location.href = '#/' + route;
    }

    // Handle third party login providers
    // returns a promise
    function thirdPartyLogin(provider) {
        var deferred = $.Deferred();

        rootRef.authWithOAuthPopup(provider, function (err, user) {
            if (err) {
                deferred.reject(err);
            }

            if (user) {
                deferred.resolve(user);
            }
        });

        return deferred.promise();
    };

    // Handle Email/Password login
    // returns a promise
    function authWithPassword(userObj) {
        var deferred = $.Deferred();
        console.log(userObj);
        rootRef.authWithPassword(userObj, function onAuth(err, user) {
            if (err) {
                deferred.reject(err);
            }

            if (user) {
                deferred.resolve(user);
            }

        });

        return deferred.promise();
    }

    // create a user but not login
    // returns a promsie
    function createUser(userObj) {
        var deferred = $.Deferred();
        rootRef.createUser(userObj, function (err) {

            if (!err) {
                deferred.resolve();
            } else {
                deferred.reject(err);
            }

        });

        return deferred.promise();
    }

    // Create a user and then login in
    // returns a promise
    function createUserAndLogin(userObj) {
        return createUser(userObj)
            .then(function () {
            return authWithPassword(userObj);
        });

    }

    // authenticate anonymously
    // returns a promise
    function authAnonymously() {
        var deferred = $.Deferred();
        rootRef.authAnonymously(function (err, authData) {

            if (authData) {
                deferred.resolve(authData);
            }

            if (err) {
                deferred.reject(err);
            }

        });

        return deferred.promise();
    }

    // route to the specified route if sucessful
    // if there is an error, show the alert
    function handleAuthResponse(promise, route) {
        $.when(promise)
            .then(function (authData) {

            // route
            routeTo(route);

        }, function (err) {
            console.log(err);
            // pop up error
            showAlert({
                title: err.code,
                detail: err.message,
                className: 'alert-danger'
            });

        });
    }

    // options for showing the alert box
    function showAlert(opts) {
        var title = opts.title;
        var detail = opts.detail;
        var className = 'alert ' + opts.className;

        alertBox.removeClass().addClass(className);
        alertBox.children('#alert-title').text(title);
        alertBox.children('#alert-detail').text(detail);
    }

    /// Controllers
    ////////////////////////////////////////

    controllers.login = function (form) {

        // Form submission for logging in
        form.on('submit', function (e) {

            var userAndPass = $(this).serializeObject();
            var loginPromise = authWithPassword(userAndPass);
            e.preventDefault();

            handleAuthResponse(loginPromise, 'profile');
            // document.getElementById('showHere').innerHTML = '';

        });

        // Social buttons
        form.children('.bt-social').on('click', function (e) {

            var $currentButton = $(this);
            var provider = $currentButton.data('provider');
            var socialLoginPromise;
            e.preventDefault();

            socialLoginPromise = thirdPartyLogin(provider);
            handleAuthResponse(socialLoginPromise, 'profile');

        });

        form.children('#btAnon').on('click', function (e) {
            e.preventDefault();
            handleAuthResponse(authAnonymously(), 'profile');
        });
    };

    // logout immediately when the controller is invoked
    controllers.logout = function (form) {
        rootRef.unauth();
        document.getElementById('showHere').innerHTML = '';
    };

    controllers.register = function (form) {

        // Form submission for registering
        form.on('submit', function (e) {
            var userAndPass = $(this).serializeObject();
            var loginPromise = createUserAndLogin(userAndPass);
            e.preventDefault();

            handleAuthResponse(loginPromise, 'profile');
            document.getElementById('showHere').innerHTML = '';

        });

    };

    controllers.shop = function (form) {
        var user = rootRef.getAuth();
        var userRef;
    };

    controllers.profile = function (form) {
        // Check the current user
        var user = rootRef.getAuth();
        var userRef;

        // If no current user send to register page
        if (!user) {
            routeTo('register');
            return;
        }

        // Load user info
        userRef = rootRef.child('users').child(user.uid);
        userRef.once('value', function (snap) {
            var user = snap.val();
// RELOADS THE PAGE TO RETRIEVE DATA FROM DB
            if( window.localStorage )
          {
            if( !localStorage.getItem('firstLoad') )
            {
              localStorage['firstLoad'] = true;
              window.location.reload();
            }
            else
              localStorage.removeItem('firstLoad');
          }
            if (!user) {
                return;
            }

            // set the fields
            form.find('#userName').val(user.userName);
            form.find('#fName').val(user.Fname);
            form.find('#lName').val(user.Lname);
            form.find('#groupName').val(user.groupName);
            form.find('#proPhoto').val(user.photo);
            form.find('#tagLine').val(user.tagline);
            form.find('#ddlDino').val(user.memberGrp);
            // ============ make adv profile settings =================
            form.find('#userBio').val(user.Bio);
            form.find('#userEmail').val(user.Email);
            form.find('#userStateLoc').val(user.StateLoc);
            form.find('#userCityLoc').val(user.CityLoc);
            form.find('#userCountryLoc').val(user.CountryLoc);
            form.find('#userEventHost').val(user.EventHost);
            form.find('#userEventName').val(user.EventName);
            form.find('#userEventLoc').val(user.EventLoc);
            form.find('#userEventTime').val(user.EventTime);
            form.find('#userEventPic').val(user.EventPic);
            form.find('#userEventSummary').val(user.EventSummary);
            form.find('#userEventTags').val(user.EventTags);
            form.find('#userGroupMembers').val(user.GroupMembers);
            form.find('#userPoints').val(user.Points);
        });

        // Save user's info to Firebase
        form.on('submit', function (e) {
            e.preventDefault();
            var userInfo = $(this).serializeObject();

            userRef.set(userInfo, function onComplete() {

                // show the message if write is successful
                showAlert({
                    title: 'Successfully saved!',
                    detail: 'You are still logged in',
                    className: 'alert-success'
                });
            });
        });
    };

    /// Routing
    ////////////////////////////////////////

    // Handle transitions between routes
    function transitionRoute(path) {
        // grab the config object to get the form element and controller
        var formRoute = routeMap[path];
        var currentUser = rootRef.getAuth();

        // if authentication is required and there is no
        // current user then go to the register page and
        // stop executing
        if (formRoute.authRequired && !currentUser) {
            routeTo('register');
            document.getElementById('showHere').innerHTML = '';
            return;
        }

        // wrap the upcoming form in jQuery
        var upcomingForm = $('#' + formRoute.form);

        // if there is no active form then make the current one active
        if (!activeForm) {
            activeForm = upcomingForm;
        }

        // hide old form and show new form
        activeForm.hide();
        upcomingForm.show().hide().fadeIn(750);

        // remove any listeners on the soon to be switched form
        activeForm.off();

        // set the new form as the active form
        activeForm = upcomingForm;

        // invoke the controller
        controllers[formRoute.controller](activeForm);
    }

    // Set up the transitioning of the route
    function prepRoute() {
        transitionRoute(this.path);
    }


    /// Routes
    ///  #/         - Login
    //   #/logout   - Logut
    //   #/register - Register
    //   #/profile  - Profile

    Path.map("#/").to(prepRoute);
    Path.map("#/logout").to(prepRoute);
    Path.map("#/register").to(prepRoute);
    Path.map("#/profile").to(prepRoute);
    Path.map("#/shop").to(prepRoute);

    Path.root("#/logout");

    /// Initialize
    ////////////////////////////////////////

    $(function () {

        // Start the router
        Path.listen();

        // whenever authentication happens send a popup
        rootRef.onAuth(function globalOnAuth(authData) {

            if (authData) {
                showAlert({
                    title: 'Logged in!',
                    detail: 'Using ' + authData.provider,
                    className: 'alert-success'
                });
            } else {
                showAlert({
                    title: 'You are not logged in',
                    detail: '',
                    className: 'alert-info'
                });
            }

        });

    });

  }(window.jQuery, window.Firebase, window.Path))
