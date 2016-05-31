(function (jQuery, Firebase, Path) {
    "use strict";
    $(".hideDash").css("display", "none");

    // the main firebase reference
    var rootRef = new Firebase('https://shakedown.firebaseio.com/');
    var rootUser = rootRef.child('users');

    // Attach an asynchronous callback to read the data at our posts reference
    rootRef.on("value", function(snapshot) {
      document.getElementById('showHere').innerHTML = '';
      var data = snapshot.val();
    },
      function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });

    rootUser.orderByChild("name").equalTo('hog').on("child_added", function(snapshot) {
      // console.log(snapshot.val().name);
      var currentUserName = snapshot.val().name;
      $(".name").html( currentUserName )
    });
    rootUser.orderByKey().on("child_added", function(snapshot) {
      // console.log(snapshot.key());
      // console.log(snapshot.val().name);
    });
    var isNewUser = true;
    rootRef.onAuth(function(authData) {
      // console.log(authData);
      if (authData && isNewUser) {
        rootRef.child('users').once("value", function(snapshot) {
          snapshot.forEach(function(childSnapshot) {
            var key = childSnapshot.key();
            var childData = childSnapshot.val();
            // console.log(childData.name);
            // console.log(authData.uid);
            if (authData.uid === key) {
              var currentUserName = childData.name;
              $(".name").html( currentUserName )
              console.log('Right now ' + childData.name + ', with user ID:' + authData.uid + ' is logged in');
            }
          });
        });
      }
    });
    rootRef.child('users').once("value", function(snapshot) {
      // The callback function will get called twice, once for "fred" and once for "barney"
      snapshot.forEach(function(childSnapshot) {
        var key = childSnapshot.key();
        // console.log(key);
        // childData will be the actual contents of the child
        var childData = childSnapshot.val();
        // console.log(childData.name);
      });
    });
    rootUser.once("value", function(snapshot) {
      var a = snapshot.numChildren();
      // a === 1 ("name")
      // console.log(a);
    });

    var ref = new Firebase("https://dinosaur-facts.firebaseio.com/dinosaurs");
    ref.orderByChild("height").equalTo(25).on("child_added", function(snapshot) {
      // console.log(snapshot.key());
    });
    ref.orderByKey().on("child_added", function(snapshot) {
      // console.log(snapshot.key());
    });
    ref.orderByChild("height").startAt(3).on("child_added", function(snapshot) {
    // console.log(snapshot.key())
  });
  ref.orderByKey().endAt("linhenykus").on("child_added", function(snapshot) {
    // console.log(snapshot.key());
  });
  var ref1 = new Firebase("https://dinosaur-facts.firebaseio.com/");
  ref1.orderByChild("height").limitToFirst(3).on("child_added", function(snapshot) {
    // console.log(snapshot.key());
  });
  var ref2 = new Firebase("https://samplechat.firebaseio-demo.com/users");
  var query = ref2.limitToFirst(5);
  var refToSameLocation = query.ref()
    // var scoresRef = new Firebase("https://dinosaur-facts.firebaseio.com/scores");
    // scoresRef.orderByValue().limitToLast(3).on("value", function(snapshot) {
    //   snapshot.forEach(function(data) {
    //     console.log("The " + data.key() + " dinosaur's score is " + data.val());
    //   });
    // });

    var isNewUser = true;
    rootRef.onAuth(function(authData) {
      if (authData && isNewUser) {
        $(".hideDash").css('display', 'inline')

        // var name = $("#userName").val();
        // console.log(name);
        rootUser.orderByChild("name").equalTo('Shaggy').on("child_added", function(snapshot) {
          // console.log(snapshot.val().name);
        });

        // the user's data
        rootRef.getAuth()
        if (rootRef.getAuth()) {
            console.log("Authenticated user with uid:", rootRef.getAuth().uid);
          }
        function authDataCallback(authData) {
          if (authData) {
            // console.log("User " + authData.uid + " is logged in with " + authData.provider);

            if (rootRef.getAuth().uid === authData.uid) {

                // console.log(rootRef.getAuth().uid);

                var currentUser = rootRef.getAuth().uid;

                // console.log(currentUser);

                  rootRef.orderByKey().on("child_added", function(snapshot) {
                    // console.log(snapshot.key());
                  });
                  // console.log('It\'s a match');
                }
            } else {
                // console.log("User is logged out");
            }
          }
        // Register the callback to be fired every time auth state changes
        rootRef.onAuth(authDataCallback);
        }
      });

    // find a suitable name based on the meta info given by each provider
function getName(authData) {
  switch(authData.provider) {
     case 'password':
       return authData.password.email.replace(/@.*/, '');
     case 'twitter':
       return authData.twitter.displayName;
     case 'facebook':
       return authData.facebook.displayName;
  }
}

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
            '#/pro': {
            form: 'frmPro',
            controller: 'pro',
            authRequired: true // must be logged in to get here
        },
            '#/profile': {
            form: 'frmProfile',
            controller: 'profile',
            authRequired: true // must be logged in to get here
        },
            '#/dash': {
            form: 'frmDash',
            controller: 'dash',
            authRequired: true // must be logged in to get here
        },
            '#/settings': {
            form: 'frmSettings',
            controller: 'settings',
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
          $("#hideDash").css("display", "inline");
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

    //======== LOGIN PAGE
    controllers.login = function (form) {
        // Form submission for logging in
        form.on('submit', function (e) {
            var userAndPass = $(this).serializeObject();
            var loginPromise = authWithPassword(userAndPass);
            e.preventDefault();
            handleAuthResponse(loginPromise, 'dash');
            document.getElementById('showHere').innerHTML = '';
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

    //======== LOGOUT PAGE
    controllers.logout = function (form) {
      $(".hideDash").css("display", "none");
        rootRef.unauth();
        document.getElementById('showHere').innerHTML = '';
    };

    //======== REGISTER PAGE
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

    //======== PROFILE PAGE
    controllers.pro = function (form) {
        var user = rootRef.getAuth();
        var userRef;
    };

    //======== DASHBPARD PAGE
    controllers.dash = function (form) {
        var user = rootRef.getAuth();
        var userRef;
    };

    //===== ADD / EDIT PROFILE PAGE
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

          // rootRef.onAuth(function(authData) {
          //   if (authData && isNewUser) {
          //     // save the user's profile into the database so we can list users,
          //     // use them in Security and Firebase Rules, and show profiles
          //     rootRef.child('users').set({
          //       provider: authData.provider,
          //       name: getName(authData)
          //     });
          //   }
          // });
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
                routeTo('dash');
            });
        });

    };

    //======== SETTING PAGE
    controllers.settings = function (form) {
        var user = rootRef.getAuth();
        var userRef;
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
    //   #/profile  - Add / Edit Profile
    //   #/pro      - Profile
    //   #/dash     - Dashboard
    //   #/settings - Settings

    Path.map("#/").to(prepRoute);
    Path.map("#/logout").to(prepRoute);
    Path.map("#/register").to(prepRoute);
    Path.map("#/profile").to(prepRoute);
    Path.map("#/pro").to(prepRoute);
    Path.map("#/dash").to(prepRoute);
    Path.map("#/settings").to(prepRoute);

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
