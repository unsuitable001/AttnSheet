import $$ from 'dom7';
import Framework7 from 'framework7/framework7.esm.bundle.js';

// Import F7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import '../css/icons.css';
import '../css/app.css';

// Import Routes
import routes from './routes.js';


// Import other JS libs

var app = new Framework7({
  root: '#app', // App root element

  name: 'AttnSheet', // App name
  theme: 'auto', // Automatic theme detection
  // App root data
  data: function() {
    return {
      departments: ["CSE", "CSE (TCS)", "ECE", "DepartmentX", "DepartmentY"],
      degrees: ["B.Tech", "B. Sc", "B. Com", "B.A", "M. Sc", "M. Com"],
    };
  },
  // App root methods
  methods: {
    helloWorld: function () {
      app.dialog.alert('Hello World!');
    },
    pushDataToSheet: function(id,array, direction, range, op = 'UPDATE', inputOption = 'USER_ENTERED') {
      if(!app.online)
      {
        app.dialog.alert('Device Offline!');
        return;
      }
      if(!gapi.auth2.getAuthInstance().isSignedIn.get())
      {
        app.dialog.alert('Please Sign In!');
        return;
      }
      app.preloader.show();
      var params = {
        // The ID of the spreadsheet to update.
        spreadsheetId: id,  // TODO: Update placeholder value.

        // The A1 notation of a range to search for a logical table of data.
        // Values will be appended after the last row of the table.
        range: range,  // TODO: Update placeholder value.
        includeValuesInResponse: false,
        // // How the input data should be interpreted.
        valueInputOption: inputOption,  // TODO: Update placeholder value.

        // // How the input data should be inserted.
        // insertDataOption: 'OVERWRITE',  // TODO: Update placeholder value.
      };

      var valueRangeBody = {
        "range": range,
        "majorDimension": direction,
        "values": array,
        // TODO: Add desired properties to the request body.
      };
      var request;
      console.log(op);
      if(op == 'UPDATE')
      {
        request = gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody);
      }
      else 
      {
        // params["insertDataOption"] = 'INSERT_ROW';
        console.log(params);
        request = gapi.client.sheets.spreadsheets.values.append(params, valueRangeBody);
      }
      request.then(function(response) {
        app.preloader.hide();
        //app.dialog.alert("Syncing Successful!");
        app.toast.create({text: 'Syncronization Successful', closeTimeout: 2000,}).open();
        // TODO: Change code below to process the `response` object:
        console.log(response.result);
        
      }, function(reason) {
        app.preloader.hide();
        app.dialog.alert("Failed to sync!");
        console.error('error: ' + reason.result.error.message);
      });
    },
    createSpreadsheet: function(spreadsheetBody, classAlias, data1, data2)
    {
      // var spreadsheetBody = {
      //   // TODO: Add desired properties to the request body.
      // };
      if(!app.online)
      {
        app.dialog.alert('Device Offline!');
        return;
      }
      if(!gapi.auth2.getAuthInstance().isSignedIn.get())
      {
        app.dialog.alert('Please Sign In!');
        return;
      }
      var request;
      try{
        request = gapi.client.sheets.spreadsheets.create({}, spreadsheetBody);
      }
      catch(ReferenceError){
        app.dialog.alert("Check your internet connection!");
        return;
      }
      request.then(function(response) {
        // TODO: Change code below to process the `response` object:
        console.log(response.result);
        var rooms = [];
        rooms = JSON.parse(localStorage.getItem("rooms"));
        if(rooms==null)
        {
          rooms = [];
        }
        let content = {alias: classAlias ,id: response.result.spreadsheetId, url: response.result.spreadsheetUrl};
        rooms.push(content);
        localStorage.setItem("rooms",JSON.stringify(rooms));
        localStorage.setItem("lastUpdate",JSON.stringify(new Date()));
        app.methods.syncAppData();
        app.preloader.hide();
        app.dialog.alert("Class Creation Successful! Syncing with cloud!");
        app.methods.pushDataToSheet(response.result.spreadsheetId,data1,"ROWS","Attendance!A1:G6");
        app.methods.pushDataToSheet(response.result.spreadsheetId,data2,"ROWS","Report!A1:G4");
        //window.app.f7.views.current.router.navigate('/settings/');
        // app.views.current.router.navigate('/settings/');
      }, function(reason) {
        app.preloader.hide();
        console.error('error: ' + reason.result.error.message);
        app.dialog.alert("Error Creating Class!" + reason.result.error.message);
      });
    },
    syncAppData: function(pull=false) {
      if(!app.online)
      {
        app.dialog.alert('Device Offline!');
        return;
      }
      if(!gapi.auth2.getAuthInstance().isSignedIn.get())
      {
        app.dialog.alert('Please Sign In!');
        return;
      }
      app.preloader.show();
      var metaID = localStorage.getItem("AppDataID");
      if(metaID == null)  // Can't find app data ID. Let's search drive
      {
        app.methods.findMetaID(pull);
        return;
      }
      if(pull)
      {
        var params = {
        // The ID of the spreadsheet to retrieve data from.
        spreadsheetId: metaID,  // TODO: Update placeholder value.
        range: "Sheet1!A:B",
        majorDimension: "COLUMNS",
        };
        var request = gapi.client.sheets.spreadsheets.values.get(params);
        request.then(function(response) {
        let newRoom = [];
        var ALIASList = response.result.values[0];
        var IDList = response.result.values[1];
        let len = IDList.length;
        let i = 0;
        for(i=0;i<len;i++)
        {
          let content = {alias: ALIASList[i], id: IDList[i], url: "https://docs.google.com/spreadsheets/d/"+IDList[i]+"/edit"};
          newRoom.push(content);
        }
        localStorage.setItem("rooms",JSON.stringify(newRoom));
        // app.views.current.router.navigate('/#view-home',{
        //   reloadCurrent: true,
        //   ignoreCache: true,
        // });
        app.dialog.alert('App Data is now up to date :)');
        // console.log(response.result.values[0]);
        }, function(reason) {
        console.error('error: ' + reason.result.error.message);
        app.dialog.alert('Error!' + reason.result.error.message);
        });
        localStorage.setItem("lastUpdate",JSON.stringify(new Date()))
      }
      if(!pull)
      {
        let rooms = JSON.parse(localStorage.getItem("rooms"));
        var arrayALIAS = [];
        var arrayID = [];
        let len = rooms.length;
        let i = 0;
        for(i=0;i<len;i++)
        {
          arrayID.push(rooms[i]["id"]);
          arrayALIAS.push(rooms[i]["alias"]);
        }
        let prevLen = JSON.parse(localStorage.getItem("prevElems"));
        for(len;prevLen>len;len++)
        {
          arrayID.push("");
          arrayALIAS.push("");
        }
        console.log(arrayALIAS);
        // rooms.foreach(function(item){
        //   arrayID.push(item["id"]);
        //   arrayALIAS.push(item["alias"]);
        // });
        app.methods.pushDataToSheet(metaID, [arrayALIAS,arrayID], 'COLUMNS', 'Sheet1!A:B', 'UPDATE', 'RAW');
      }
      app.preloader.hide();
      // if(pull) {

      // }
      // if(push){
      //   const boundary = '-------314159265358979323846264';
      //   const delimiter = "\r\n--" + boundary + "\r\n";
      //   const close_delim = "\r\n--" + boundary + "--";
      //   var appState = {
      //     rooms: localStorage.getItem("rooms"),
      //     lastUpdate: localStorage.getItem("lastUpdate")
      //   };
      //   var fileName = 'AttnSheetmeta.json';
      //   var contentType = 'application/json';
      //   var metadata = {
      //     'title': fileName,
      //     'mimeType': contentType,
      //     'parents': [{id:'appDataFolder'}],
      //   };
      //   var base64Data = btoa(JSON.stringify(appState));
      //   var multipartRequestBody =
      //       delimiter +
      //       'Content-Type: application/json\r\n\r\n' +
      //       JSON.stringify(metadata) +
      //       delimiter +
      //       'Content-Type: ' + contentType + '\r\n' +
      //       'Content-Transfer-Encoding: base64\r\n' +
      //       '\r\n' +
      //       base64Data +
      //       close_delim;
      //   var request = gapi.client.request({
      //       'path': '/upload/drive/v2/files',
      //       'method': 'POST',
      //       'params': {'uploadType': 'multipart'},
      //       'headers': {
      //         'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
      //       },
      //       'body': multipartRequestBody});
      //   request.execute(function(arg) {
      //     console.log(arg);
      //   });
      // }
    
    },
    findMetaID: function(pull=false) {
      let params = {
        q: "(mimeType = 'application/vnd.google-apps.spreadsheet') and (name = 'AttnSheet_CLASSLIST')",
      }
      let request = gapi.client.drive.files.list(params);
      request.execute(function(resp){
        if(resp.files.length == 0)
        {
          app.methods.createMetaID();
        }
        else
        {
          localStorage.setItem("AppDataID",resp.files[0].id);
          app.methods.syncAppData(pull);
        }
        
      });
    },
    createMetaID: function() {
      var parentId = 'root';//some parentId of a folder under which to create the new folder
      var fileMetadata = {
        'name' : 'AttnSheet_CLASSLIST',
        'mimeType' : 'application/vnd.google-apps.spreadsheet',
        'parents': [parentId]
      };
      gapi.client.drive.files.create({
        resource: fileMetadata,
      }).then(function(response) {
        switch(response.status){
          case 200:
            var file = response.result;
            console.log('Created File Id: ', file.id);
            localStorage.setItem("AppDataID",file.id);
            break;
          default:
            console.log('Error creating the folder, '+response);
            break;
          }
          app.methods.syncAppData();
        });
    }

  },
  // App routes
  routes: routes,
  // App view params
  // view: {
  //   pushState: true,
  //   pushStateSeparator: '#',
  //   pushStateOnLoad: false
  // },
  // Register service worker
  serviceWorker: {
    path: '/service-worker.js',
  },
});

// Login Screen Demo
// $$('#my-login-screen .login-button').on('click', function () {
//   var username = $$('#my-login-screen [name="username"]').val();
//   var password = $$('#my-login-screen [name="password"]').val();

//   // Close login screen
//   app.loginScreen.close('#my-login-screen');

//   // Alert username and password
//   app.dialog.alert('Username: ' + username + '<br>Password: ' + password);
// });
app.on('connection',function(isOnline){
  if(!isOnline){
    app.dialog.alert("Device Offline!");
  }
});

// document.addEventListener("backbutton", onBackKeyDown, false); 

// function onBackKeyDown(e) {
//   e.preventDefault();
//   window.app.f7.views.current.router.back();
//  return true; 
// }
// document.getElementById('createclassbttn').onclick = function(){
//     console.log("class created");
//   var formData = app.form.convertToData('#create-class-form');
//   alert(JSON.stringify(formData));
// }
// $$('#createclassbttn').on('click', function(){
//   console.log("class created");
//   var formData = app.form.convertToData('#create-class-form');
//   alert(JSON.stringify(formData));
// });
// console.log($$('#createclassbttn'));
