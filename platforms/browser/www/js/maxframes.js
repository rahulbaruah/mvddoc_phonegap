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

var dashboard = {
				todayPatients:0,
				todayTotalPatients:0,
				todayTotalCollection:0,
				last2daysPatients:0,
				last2daysTotalPatients:0,
				last2daysTotalCollection:0
			};

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
	//precompileTemplates: true,
    //template7Pages: true,
    debug: true,
    /*template7Data: {
        // Data for contacts page
        'page:home_page': dashboard
    }*/
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

function todaysReport(){
	var template = '<div class="content-block">'+
'         <div class="content-block-title"><h4>Today</h4></div>'+
'         <div class="content-block  center">'+
'            <span class="main-report"><strong>{{todayPatients}}</strong></span>'+
'         </div>'+
'      </div>'+
'      <div class="buttonbar row no-gutter">'+
'         <div class="col-50">'+
'            <div class="content-block">'+
'               <div class="content-block-title center">Total Patients</div>'+
'               <div class="content-block  center">'+
'                  <strong>{{todayTotalPatients}}</strong>'+
'               </div>'+
'            </div>'+
'         </div>'+
'         <div class="divider"></div>'+
'         <div class="col-50">'+
'            <div class="content-block">'+
'               <div class="content-block-title center">Total Collection</div>'+
'               <div class="content-block  center">'+
'                  <strong><i class="fa fa-inr" aria-hidden="true"></i> {{todayTotalCollection}}</strong>'+
'               </div>'+
'            </div>'+
'         </div>'+
'      </div>';
	// compile it with Template7
	var compiledTemplate = Template7.compile(template);
	
	//myApp.showPreloader();
	$.ajax({
		cache: false,
		crossDomain: true,
		url: appSettings.domain + "/api/report",
		type: 'GET',
		data: {},
		datatype: 'json',
		headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + Auth().token},
		complete: function() {
			//myApp.hidePreloader();
		},
		success: function(data) {
			dashboard.todayPatients = data.todayPatients;
			dashboard.todayTotalPatients = data.todayTotalPatients;
			dashboard.todayTotalCollection = data.todayTotalCollection;
			
			// Now we may render our compiled template by passing required context				
			
			var html = compiledTemplate(dashboard);
			//myApp.alert(html);
			
			$$('#tab1').html(html);
											
			//myApp.alert(compiledHtml);
											
			//myApp.showTab('#tab1');
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
			} else if( xhr.status === 503 ) {
			   	myApp.alert("Service unavailable.");
			   	return false;
			}  else if( xhr.status === 0 ) {
		    	myApp.alert("There is no internet connection.");
		    	return false;
			}
		}
	});
}

function last2daysReport(){
	var template = '<div class="content-block">'+
'         <div class="content-block-title"><h4>Last Two Days</h4></div>'+
'         <div class="content-block  center">'+
'            <span class="main-report"><strong>{{last2daysPatients}}</strong></span>'+
'         </div>'+
'      </div>'+
'      <div class="buttonbar row no-gutter">'+
'         <div class="col-50">'+
'            <div class="content-block">'+
'               <div class="content-block-title center">Total Patients</div>'+
'               <div class="content-block  center">'+
'                  <strong>{{last2daysTotalPatients}}</strong>'+
'               </div>'+
'            </div>'+
'         </div>'+
'         <div class="divider"></div>'+
'         <div class="col-50">'+
'            <div class="content-block">'+
'               <div class="content-block-title center">Total Collection</div>'+
'               <div class="content-block  center">'+
'                  <strong><i class="fa fa-inr" aria-hidden="true"></i> {{last2daysTotalCollection}}</strong>'+
'               </div>'+
'            </div>'+
'         </div>'+
'      </div>';
	// compile it with Template7
	var compiledTemplate = Template7.compile(template);
	
	//myApp.showPreloader();
	$.ajax({
		cache: false,
		crossDomain: true,
		url: appSettings.domain + "/api/last2report",
		type: 'GET',
		data: {},
		datatype: 'json',
		headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + Auth().token},
		complete: function() {
			//myApp.hidePreloader();
		},
		success: function(data) {
			dashboard.last2daysPatients = data.last2daysPatients;
			dashboard.last2daysTotalPatients = data.last2daysTotalPatients;
			dashboard.last2daysTotalCollection = data.last2daysTotalCollection;
			
			// Now we may render our compiled template by passing required context				
			
			var html = compiledTemplate(dashboard);
			//myApp.alert(html);
			
			$$('#tab2').html(html);
											
			//myApp.alert(compiledHtml);
											
			//myApp.showTab('#tab1');
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
			} else if( xhr.status === 503 ) {
			   	myApp.alert("Service unavailable.");
			   	return false;
			}  else if( xhr.status === 0 ) {
		    	myApp.alert("There is no internet connection.");
		    	return false;
			}
		}
	});
}

function filterReport(patientsReport, totalPatientsReport, totalCollection){
	var template = '<div class="content-block">'+
'         <div class="content-block-title"><h4>Patients</h4></div>'+
'         <div class="content-block  center">'+
'            <span class="main-report"><strong>{{patientsReport}}</strong></span>'+
'         </div>'+
'      </div>'+
'      <div class="buttonbar row no-gutter">'+
'         <div class="col-50">'+
'            <div class="content-block">'+
'               <div class="content-block-title center">Total Patients</div>'+
'               <div class="content-block  center">'+
'                  <strong>{{totalPatientsReport}}</strong>'+
'               </div>'+
'            </div>'+
'         </div>'+
'         <div class="divider"></div>'+
'         <div class="col-50">'+
'            <div class="content-block">'+
'               <div class="content-block-title center">Total Collection</div>'+
'               <div class="content-block  center">'+
'                  <strong><i class="fa fa-inr" aria-hidden="true"></i> {{totalCollection}}</strong>'+
'               </div>'+
'            </div>'+
'         </div>'+
'      </div>';
	// compile it with Template7
	var compiledTemplate = Template7.compile(template);
	
	var html = compiledTemplate({
		'patientsReport' : patientsReport,
		'totalPatientsReport' : totalPatientsReport,
		'totalCollection' : totalCollection
	});
	//myApp.alert(html);
			
	$$('#filterBlock').html(html);
}

function showProfile(name, email){
	
var template = '<div class="list-block">'+
'                  <ul>'+
'                    <li class="item-content">'+
'                        <div class="item-media"><label for="start_date"><i class="fa fa-user" aria-hidden="true"></i></label></div>'+
'                      <div class="item-inner">'+
'                        <div class="item-title">{{name}}</div>'+
'                      </div>'+
'                    </li>'+
'                    <li class="item-content">'+
'                        <div class="item-media"><label for="start_date"><i class="fa fa-envelope" aria-hidden="true"></i></label></div>'+
'                      <div class="item-inner">'+
'                        <div class="item-title">{{email}}</div>'+
'                      </div>'+
'                    </li>'+
'                  </ul>'+
'                </div>';

	var compiledTemplate = Template7.compile(template);
	
	var html = compiledTemplate({
		'name' : name,
		'email' : email
	});
	//myApp.alert(html);
			
	$$('#profile-inner').html(html);	

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
		
								$$('#loginBtn').on('click', function(e){	//-----LOGIN FORM
									$$.ajax({
										cache: false,
										crossDomain: true,
										url: $$('#loginForm').attr('action'),
										type: 'POST',
										data: $('#loginForm').serialize(),
										datatype: 'json',
										/*beforeSend: function() {
											if(!navigator.onLine){
												myApp.alert("There is no internet connection.");
												return false;
											}
										},*/
										success: function(data) {
												data = JSON.parse(data);
												var remember = 1;
												var pagenav = page.query.page;
												doLogin(data.name, data.email, data.access_token, remember, pagenav);
										},
										error: function(xhr){
											//console.log(xhr.reponseText);
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
										        return false;
										    } else if( xhr.status === 0 ) {
										    	myApp.alert("There is no internet connection.");
										    	return false;
										    } else if( xhr.status === 503 ) {
										    	myApp.alert("Service unavailable.");
										    	return false;
										    }
										    else {
										    	myApp.alert("Login credentials dont match our records. Please try again.");
										    	return false;
										    }
										}
									});
								});
			break;
		case 'home_page':	var startDateCalendar = myApp.calendar({
								    input: '#start_date'
								});
							
							var endDateCalendar = myApp.calendar({
								    input: '#end_date'
								});
								
							$$('#filterReportSubmit').on('click', function(e){
									e.preventDefault();
									myApp.showPreloader();
									$.ajax({
										cache: false,
										crossDomain: true,
										url: appSettings.domain + "/api/filterreport",
										type: 'GET',
										data: {
											'start_date':$('#start_date').val(),
											'end_date':$('#end_date').val()
										},
										datatype: 'json',
										headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + Auth().token},
										complete: function() {
											myApp.hidePreloader();
										},
										success: function(data) {
											//data = JSON.parse(data);
											filterReport(data.patientsReport, data.totalPatientsReport, data.totalCollection)	
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
										    } else if( xhr.status === 503 ) {
										    	myApp.alert("Service unavailable.");
										    	return false;
										    }  else if( xhr.status === 0 ) {
										    	myApp.alert("There is no internet connection.");
										    	return false;
										    }
										}
									});
								});
			
							$$('#referPatientSubmit').on('click', function(e){
									e.preventDefault();
									myApp.showPreloader();
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
										complete: function() {
											myApp.hidePreloader();
										},
										success: function(data) {
											//data = JSON.parse(data);
											myApp.alert("Patient referred successfully.");
											$('#referPatientForm').find("input[type=text], textarea").val("");
												
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
										    } else if( xhr.status === 503 ) {
										    	myApp.alert("Service unavailable.");
										    	return false;
										    }  else if( xhr.status === 0 ) {
										    	myApp.alert("There is no internet connection.");
										    	return false;
										    }
										}
									});
								});
							
							$$('#tab1').on('tab:show', function () {
							    todaysReport();
							});
							
							$$('#tab2').on('tab:show', function () {
							    last2daysReport();
							});
							
							todaysReport();
			break;
		case 'profile':		myApp.showPreloader();
		
							$.ajax({
										cache: false,
										crossDomain: true,
										url: appSettings.domain + "/api/doctorprofile",
										type: 'GET',
										data: {},
										datatype: 'json',
										headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + Auth().token},
										complete: function() {
											myApp.hidePreloader();
										},
										success: function(data) {
											showProfile(data.name, data.email);
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
										    } else if( xhr.status === 503 ) {
										    	myApp.alert("Service unavailable.");
										    	return false;
										    }  else if( xhr.status === 0 ) {
										    	myApp.alert("There is no internet connection.");
										    	return false;
										    }
										}
									});
				
			break;
		/*case 'view_report':	var myCalendar = myApp.calendar({
								    input: '#calendar-input'
								});
			
								$$('#getReportSubmit').on('click', function(e){
									e.preventDefault();
									myApp.showPreloader();
									$.ajax({
										cache: false,
										crossDomain: true,
										url: appSettings.domain + "/api/report",
										type: 'GET',
										data: $('#getReportForm').serialize(),
										datatype: 'json',
										headers: { 'Accept': 'application/json', 'Authorization': "Bearer " + Auth().token},
										complete: function() {
											myApp.hidePreloader();
										},
										success: function(data) {
											reportData = data;
											//data = JSON.parse(data);
											//myApp.alert(data.referredPatients);
											mainView.router.load({
											    url: 'report.html',
											    context: {
											      date: data.date,
											      referredPatients: data.referredPatients
											    }
											});
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
										    } else if( xhr.status === 503 ) {
										    	myApp.alert("Service unavailable.");
										    	return false;
										    }  else if( xhr.status === 0 ) {
										    	myApp.alert("There is no internet connection.");
										    	return false;
										    }
										}
									});
								});
			break;*/
		default: 
			break;
		}
	
});