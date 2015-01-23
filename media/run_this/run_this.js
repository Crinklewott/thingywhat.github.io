$(document).ready(
(function($) {
   $.fn.runThis = function (options) {

     var config = {
       run_this_class: "run-this",     // css class on code to run
       attr: 'title',                  // attribute to use to group related snippets of code
       spinner: true,                  // show a spinning wheel until completion ?
       spinner_path: './spinner.gif'   // location of the spinner image
     };

     if (options) $.extend(config, options);

     // CSS class for the code sample wrapper
     var run_this_class = config.run_this_class;
     // add a button to the code samples on the page (marked with run_this_class)
     var button_class = run_this_class + "-button";
     var spinner_class = run_this_class + "-spinner";
     var details_class = run_this_class + "-details";
     var wrap_class = run_this_class + "-wrapper";







     // for each code block to enhance
     function enhanceCodeBlocks(){

       $("." + run_this_class).each(
           function(idx, elt){
               
               // HTML enhancements
               var $elt = $(elt);
               
               // input data
               var input_elt = $elt.next("." + run_this_class + "-input");

               $elt.wrap("<div class=\"" + wrap_class + "\"></div>");
               var wrap = $elt.parent();
               
               input_elt.appendTo(wrap);

               // run button
               var button_elt = $("<div class=\"" + button_class + "\">" +
			                            "<input type=\"button\" value=\"Run\" /> <img class=" + spinner_class +
			                            " src=\"" + config.spinner_path  + "\"></div>").appendTo(wrap);

               // spinning wheel
               var spinner_elt = config.spinner ?
			             button_elt.find("." + spinner_class) : $([]);

               // code execution output
               var details_elt = $("<div class=\"" + details_class + "\"></div>")
			             .appendTo(wrap);

               // data for POST request
               var code = $elt.text();
               var lang = elt.lang;
               var data = "code=" + encodeURIComponent(code) + "&lang=" +  encodeURIComponent(lang);

               // create a specific callback for each "run-this" snippet
               var showResults = makeShowResults(run_this_class, spinner_elt, details_elt);
               
               // onclick handler
               button_elt.click(
                   function(evt){
	                     // show spinner
	                     spinner_elt.show();
                       
	                     // input is read just before request
	                     var input = input_elt.val();
	                     var input_data = input ? encodeURIComponent(input) : "";
                       data = data + "&input=" + input_data;
	                     // query the code execution
	                     // flproxy.send(data + "&input=" + input_data);
                       var request = createCORSRequest("POST", "http://run-this.appspot.com/runthis");
                       if (request){
                           request.onload = function(){
                               //do something with request.responseText
                               showResults(eval( "(" + request.responseText + ")" ));
                           };
                           request.send(data);
                       }
                   });
           });
    } // end enhanceCodeBlocks


       function createCORSRequest(method, url){
           var xhr = new XMLHttpRequest();
           if ("withCredentials" in xhr){
               xhr.open(method, url, true);
               xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  
           } else if (XDomainRequest){ // IE8
               xhr = new XDomainRequest();
               xhr.open(method, url);
               xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  
           } else {
               xhr = null;
           }
           return xhr;
       }

    // ------------------------------------------------------------------------------------------

       // generate the callback function to display the results
       // res is the object resulting from the Ajax call
       //    res.output = output of codepad
       //    res.link   = link to codepad page
       // Customize the inner function if you want to display results differently
       var makeShowResults = function(class_prefix, spinner_elt, details_elt){

           return function(res){
	             var table, implementation;
               
	             // hide spinner
	             spinner_elt.hide();

	             // display details of execution
	             // do we have an error ?
	             if(res.stderr){
	                 table = "<table><tr class=\"" + class_prefix  + "-stderr\"><th>stderr</th><td>" +
		                   res.stderr + "</td></tr></table>" ;
	                 implementation = "&nbsp;";
	             }

	             else {
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
	                               " -- <span class=\"" + class_prefix  + "-link\"><a href=\"" + res.link + "\">Ideone.com</a></span>" +
	                               // Ideone ad
	                               "<span class=\"ad\">" + res.ad + "</span>" +
	                               "</div>"
	                             ).show();
           };
       };


       // enhance code blocks on the page
       enhanceCodeBlocks();

       // for chaining
       return this;
   };
 })(jQuery);
});
// on DOM ready
$(document).ready(
    function(){
        if(XMLHttpRequest)
		        $().runThis({ spinner_path: '/images/spinner.gif' });
        else
            alert("Your browser does not support AJAX!");
});

