function run_this(button, lang, b64_encoded){

  var button_wrapper, spinner_elt, details_elt, input_elt, input_data, code, data, showResults, makeShowResults, flproxy, flLoadingHandler, flErrorHandler;

  // generate the callback function to display the results
  makeShowResults = function(spinner_elt, details_elt){
    var class_prefix="run-this";

    return function(res){
      var table, implementation;

      // hide button + spinner
      spinner_elt.hide();

      // display details of execution
      // do we have an error ?
      if(res.stderr){
  table = '<table><tr class="' + class_prefix  + '-stderr\"><th>stderr</th><td>' +
      res.stderr + "</td></tr></table>" ;
  implementation = "&nbsp;";
      }
      else{

  implementation =  res.langName + " (" + res.langVersion  +") ";
  table = "<table>" +
    // output
    '<tr class="' + class_prefix  + '-output"><th>output        </th><td>' + res.output+ "</td></tr>" +
    // execution time
    '<tr class="' + class_prefix  + '-time">  <th>time         </th><td>' + res.time + "s</td></tr>" +
    // memory usage
    '<tr class="' + class_prefix  + '-memory"><th>memory        </th><td>' + res.memory + "KB</td></tr>" +
    "</table>";
      }

      details_elt.html( table +
  // language + implementation details
  "<div>" + implementation +
  // Ideone link
  '<span class="' + class_prefix  + '-link"><a href="' + res.link + '">Ideone.com</a></span>' +
  "</div>"
      ).show();
    };
  };

  // HTML elements
  button_wrapper = $(button).parent();
  spinner_elt = $(button).next();
  details_elt = button_wrapper.next();
  input_elt = details_elt.next().find(".run-this-input");

  // create a specific callback for each "run-this" snippet
  showResults = makeShowResults(spinner_elt, details_elt);

  // POST data
  code = atob(b64_encoded);
  input_data = input_elt ? encodeURIComponent(input_elt.val()) : "";
  data = "code=" + encodeURIComponent(code) + "&lang=" + encodeURIComponent(lang) + "&input=" + input_data;
  //console.log(data);

  // show spinner
  spinner_elt.show();

  // query the code execution
  var request = createCORSRequest("POST", "http://run-this.appspot.com/runthis");
  if (request){
      request.onload = function(){
          //do something with request.responseText
          showResults(eval( "(" + request.responseText + ")" ));
      };
      request.send(data);
  }
/*
  $.ajax({
     type: 'POST',
     url: "http://run-this.appspot.com/runthis",
     data: data + "&input=" + input_data,
     success: function(xhr){
        showResults(eval( "(" + json + ")" ))
     },
     dataType: 'json'
  });
*/
}


function createCORSRequest(method, url){
    var xhr = new XMLHttpRequest();
    
    if ("withCredentials" in xhr){
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  
    } else if (typeof XDomainRequest != "undefined"){
        xhr = new XDomainRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  
    } else {
        xhr = null;
    }
    return xhr;
}




// if native atob,  use base64Decode from http://www.nczonline.net/blog/
if(!atob) atob = base64Decode;

function base64Decode(text){

    text = text.replace(/\s/g,"");

    if(!(/^[a-z0-9\+\/\s]+\={0,2}$/i.test(text)) || text.length % 4 > 0){
        throw new Error("Not a base64-encoded string.");
    }

    //local variables
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        cur, prev, digitNum,
        i=0,
        result = [];

    text = text.replace(/=/g, "");

    while(i < text.length){

        cur = digits.indexOf(text.charAt(i));
        digitNum = i % 4;

        switch(digitNum){

            //case 0: first digit - do nothing, not enough info to work with

            case 1: //second digit
                result.push(String.fromCharCode(prev << 2 | cur >> 4));
                break;

            case 2: //third digit
                result.push(String.fromCharCode((prev & 0x0f) << 4 | cur >> 2));
                break;

            case 3: //fourth digit
                result.push(String.fromCharCode((prev & 3) << 6 | cur));
                break;
        }

        prev = cur;
        i++;
    }

    return result.join("");
}

/*
function run_this(button, lang, b64_encoded){

  var button_wrapper, spinner_elt, details_elt, code, data, showResults, makeShowResults, flproxy, flLoadingHandler, flErrorHandler;

  // generate the callback function to display the results
  makeShowResults = function(button_elt, details_elt){
    var class_prefix="run-this";

    return function(res){
      var table, implementation;

      // hide button + spinner
      button_elt.hide();

      // display details of execution
      // do we have an error ?
      if(res.stderr){
	table = "<table><tr class=\"" + class_prefix  + "-stderr\"><th>stderr</th><td>" +
		  res.stderr + "</td></tr></table>" ;
	implementation = "&nbsp;";
      }
      else{

	implementation =  res.langName + " (" + res.langVersion  +") ";
	table = "<table>" +
	// output
	"<tr class=\"" + class_prefix  + "-output\"><th>output        </th><td>" + res.output+ "</td></tr>" +
	// execution time
	"<tr class=\"" + class_prefix  + "-time\">  <th>time         </th><td>" + res.time + "s</td></tr>" +
	// memory usage
	"<tr class=\"" + class_prefix  + "-memory\"><th>memory        </th><td>" + res.memory + "KB</td></tr>" +
	"</table>";
      }

      details_elt.html( table +
	// language + implementation details
	"<div>" + implementation +
	// Ideone link
	"<span class=\"" + class_prefix  + "-link\"><a href=\"" + res.link + "\">Ideone.com</a></span>" +
	"</div>"
      ).show();
    };
  };

  // HTML elements
  button_wrapper = $(button).parent();
  spinner_elt = $(button).next();
  details_elt = button_wrapper.next();

  // create a specific callback for each "run-this" snippet
  showResults = makeShowResults(button_wrapper, details_elt);

  // flensed object + handlers
  flLoadingHandler = function (XHRobj) {
    if (XHRobj.readyState == 4) {

      showResults(eval( "(" + XHRobj.responseText + ")" ));
      flproxy.Reset();
    }
  };

  flErrorHandler = function (errObj) {
    alert("Error: "+errObj.number
	  +"\nType: "+errObj.name
	  +"\nDescription: "+errObj.description
	  +"\nSource Object Id: "+errObj.srcElement.instanceId
	 );
  };

  flproxy = new flensed.flXHR({ autoUpdatePlayer:true,
				instanceId:"runthis",
				xmlResponseText:false, // JSON
				onerror:flErrorHandler,
				onreadystatechange: flLoadingHandler
				//,
				//timeout: 10000, // 10s timeout
				//ontimeout: function(x) { alert("Execution took over 10 seconds!");}
                              });

  // POST data
  code = atob(b64_encoded);
  data = "code=" + encodeURIComponent(code) + "&lang=" + lang;

  // show spinner
  spinner_elt.show();

  // query the code execution
  flproxy.open("POST","http://run-this.appspot.com/runthis");
  flproxy.send(data);

}

// if native atob,  use base64Decode from http://www.nczonline.net/blog/
if(!atob) atob = base64Decode;

function base64Decode(text){

    text = text.replace(/\s/g,"");

    if(!(/^[a-z0-9\+\/\s]+\={0,2}$/i.test(text)) || text.length % 4 > 0){
        throw new Error("Not a base64-encoded string.");
    }

    //local variables
    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        cur, prev, digitNum,
        i=0,
        result = [];

    text = text.replace(/=/g, "");

    while(i < text.length){

        cur = digits.indexOf(text.charAt(i));
        digitNum = i % 4;

        switch(digitNum){

            //case 0: first digit - do nothing, not enough info to work with

            case 1: //second digit
                result.push(String.fromCharCode(prev << 2 | cur >> 4));
                break;

            case 2: //third digit
                result.push(String.fromCharCode((prev & 0x0f) << 4 | cur >> 2));
                break;

            case 3: //fourth digit
                result.push(String.fromCharCode((prev & 3) << 6 | cur));
                break;
        }

        prev = cur;
        i++;
    }

    return result.join("");
}
*/