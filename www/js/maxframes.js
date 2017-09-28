"use strict";
var appSettings = {
		domain: 'https://doctor-app-2-anupamfear.c9users.io',
		app_name: 'Mvddoc',
		auth: 0
	};

Template7.global = appSettings;

var tempCompiledTemplate;
var serverUrl;
var lastpage;

/*----------------Template7 helpers--------------------*/
/*Template7.registerHelper('if_compare', function (a, operator, b, options) {
	var match = false;
	
	if ( (operator === '==' && a == b) || (operator === '===' && a === b) || (operator === '!=' && a != b) || (operator === '>' && a > b) || (operator === '<' && a < b) || (operator === '>=' && a >= b) || (operator === '<=' && a <= b) ) { 
		match = true; 
	} 
	
	if (match) return options.fn(this);
	else return options.inverse(this); 
});*/
/*----------------------------//-------------------------*/
// Init App
var myApp = new Framework7({
    modalTitle: appSettings.app_name,
    // Enable Material theme
    material: true,
	reloadPages: true,
    preloadPreviousPage: false,
	precompileTemplates: true,
    template7Pages: true,
    debug: true,
	/* If the page need dynamic data, for example, from a php server using ajax */ 
	/*preprocess: function (content, url, next) {
		var main_url = url.split('?')[0];
		
		switch(main_url){
			default: var template = Template7.compile(content); 
					var resultContent = template(); 
					return resultContent;
				break;
		}
	},
	preroute: function (view, options) {
	}*/
});

// Expose Internal DOM library
var $$ = Dom7;
		
$$.get('panel_left.html', function (data) {       
	$$('#panel_left').html(data);
});
	
$$.get('panel_right.html', function (data) {       
	$$('#panel_right').html(data);
});


// Add main view
var mainView = myApp.addView('.view-main', {
});

// Show/hide preloader for remote ajax loaded pages
// Probably should be removed on a production/local app
$$(document).on('ajaxStart', function (e) {
    myApp.showIndicator();
});
$$(document).on('ajaxComplete', function () {
    myApp.hideIndicator();
});

//Now we add our callback for initial page
myApp.onPageInit('index', function (page) {
	if(Auth()) {
		mainView.router.loadPage('dashboard.html');
	} else {
		mainView.router.loadPage('login_screen.html');
	}
}).trigger();


/* ===== Change statusbar bg when panel opened/closed ===== */
$$('.panel-left').on('open', function () {
    $$('.statusbar-overlay').addClass('with-panel-left');
});



$$('.panel-left, .panel-right').on('close', function () {
    $$('.statusbar-overlay').removeClass('with-panel-left with-panel-right');
});

/*-----------------------custom functions---------------------------------*/
function toggleShowPassword(field, control, label){
	var control = $(control);
    var field = $(field);
    var label = $(label);
    
    label.bind('click', function () {
        if (control.is(':checked')) {
            //field.attr('type', 'text');
            field.attr('type', 'password'); //Inverted for cordova
        } else {
            //field.attr('type', 'password');
            field.attr('type', 'text'); //Inverted for cordova
        }
    });
}

function currencySymbol(SYM){
		var currency_rule;
		if(SYM == 'INR'){
			currency_rule = 'content: "`";font-family:"RupeeForadian";';
		} else {
			currency_rule = 'content: "' + SYM + '";';
		}		
		document.styleSheets[0].addRule('.currency:before', currency_rule);		
	}
	
function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function doLogin(name, email, token, remember, page){
	name = name || null;
	email = email || null;
	token = token || null;
	remember = remember || 1;
	page = page || 'dashboard.html';
	
	if (typeof(Storage) !== "undefined") {
		// Code for localStorage/sessionStorage.		
		if(remember){
			localStorage.name = name;
			localStorage.email = email;
			localStorage.token = token;
		} else{
			sessionStorage.name = name;
			sessionStorage.email = email;
			sessionStorage.token = token;
		}
		
		//console.log("Welcome " + name);
	} else {
		//console.log('Sorry! No Web Storage support..');
	}
	mainView.router.loadPage(page)
}

function doLogout(){
	if (typeof(Storage) !== "undefined") {
		if(localStorage.token){
			localStorage.removeItem("name");
			localStorage.removeItem("email");
			localStorage.removeItem("token");
		}
		else if(sessionStorage.token){
			sessionStorage.removeItem("name");
			sessionStorage.removeItem("email");
			sessionStorage.removeItem("token");
		}
	}
	appSettings.auth = 0;
	myApp.closePanel();
	mainView.router.loadPage('login_screen.html');
}

function init(){
	if(Auth()) {
		mainView.router.loadPage('dashboard.html');
	}
}

function Auth(){
	if (typeof(Storage) !== "undefined") {
		if(localStorage.token || sessionStorage.token){
			
			if(localStorage.token){
				var auth = {
					name: localStorage.name,
					email: localStorage.email,
					token: localStorage.token
				}
			}
			else if(sessionStorage.token){
				var auth = {
					name: sessionStorage.name,
					email: sessionStorage.email,
					token: sessionStorage.token
				}
			}
			
			appSettings.auth = 1;
			return auth;
		} else{
			return false;
		}
	}
}

/*-----------------------//custom functions---------------------------------*/

$$(document).on('click', '#logout_btn', function(event){
	event.preventDefault();
	doLogout();
});


$$(document).on('page:init', function (e) {
  // Do something here when page loaded and initialized
	//currencySymbol('INR');
	
	var page = e.detail.page;
	
	switch(page.name){
		case 'login_screen':	init();
			
								toggleShowPassword('#logpass', '#showpass', '.label-checkbox');
		
								$$('#loginForm').on('submit', function(){	//-----LOGIN FORM
									$$.ajax({
										cache: false,
										crossDomain: true,
										url: $$(this).attr('action'),
										type: 'POST',
										data: $(this).serialize(),
										datatype: 'json',
										success: function(data) {
												data = JSON.parse(data);
												var remember = 1;
												var pagenav = page.query.page;
												doLogin(data.name, data.email, data.access_token, remember, pagenav);
										},
										error: function(xhr){
											//console.log(xhr.reponseText);
											myApp.alert("Login credentials do not match our records. Please try again.");
										}
									});
								});
			break;
		case 'home_page':	$$('#referPatientSubmit').on('click', function(e){
									e.preventDefault();
									$.ajax({
										cache: false,
										crossDomain: true,
										url: appSettings.domain + "/api/referpatient",
										type: 'POST',
										data: $('#referPatientForm').serialize(),
										datatype: 'json',
										headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + Auth().token},
										/*beforeSend: function(request) {
											return request.setRequestHeader("Authorization", "Bearer " + Auth().token);
										},*/
										success: function(data) {
											//data = JSON.parse(data);
											myApp.alert("Patient referred successfully.");
												
										},
										error: function(xhr){
											if( xhr.status === 422 ) {
										        //process validation errors here.
										        var errors = xhr.responseJSON; //this will get the errors response data.
										        //show them somewhere in the markup
										        //e.g
										        var errorsHtml = '<div class="alert alert-danger"><ul>';
										
										        $.each( errors, function( key, value ) {
										            errorsHtml += '<li>' + value[0] + '</li>'; //showing only the first error.
										        });
										        errorsHtml += '</ul></di>';
										            
										        myApp.alert( errorsHtml ); //appending to a <div id="form-errors"></div> inside form
										    }
										}
									});
								});
			break;
		default: 
			break;
		}
	
});