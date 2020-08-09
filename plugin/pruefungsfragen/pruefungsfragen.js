


function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'plugin/pruefungsfragen/Fragenkatalog.json', true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
}


function init() {
 fillPruefungsfrageDummy();
 loadJSON(function(response) {
     // Parsing JSON string into object
     var json_data = JSON.parse(response);
     generateDynamicPruefungsfrage(json_data);
 });
}

function fillPruefungsfrageDummy(){
    var elems = document.getElementsByClassName("pruefungsfrage");
    for (var i = 0; i < elems.length; i++) {
        elems.item(i).innerHTML = "Pruefungsfrage " + elems.item(i).id + " ist noch nicht geladen. Für Firefox bitte in <a href=\"about:config\">about:config</a> den Wert <code>security.fileuri.strict_origin_policy</code> auf <code>false</code> setzen.";
    }
}

function get_frage_json(json_data, id){
    if("children" in json_data && json_data["children"].length > 0){
        for(var i = 0, size = json_data["children"].length; i < size ; i++){
            var retval = get_frage_json(json_data["children"][i], id);
            if(retval != null)
                return retval;
        }
    } else if("questions" in json_data && json_data["questions"].length > 0){
        for(var i = 0, size = json_data["questions"].length; i < size ; i++){
            var retval = get_frage_json(json_data["questions"][i], id);
            if(retval != null)
                return retval;
        }

    } else if("question" in json_data){
        if(json_data["id"] == id){
            return json_data;
        }
    }
    return null;
}

function generateDynamicPruefungsfrage(json_data){
    var elems = document.getElementsByClassName("pruefungsfrage");
    for (var i = 0; i < elems.length; i++) {
        elems[i].innerHTML = "";

        var table = document.createElement("table");

        var tHead = document.createElement("thead");

        var hRow = document.createElement("tr");
        var th = document.createElement("th");
        th.innerHTML = elems.item(i).id;
        hRow.appendChild(th);
        tHead.appendChild(hRow);
        table.appendChild(tHead);

        var tBody = document.createElement("tbody");
        var bRow = document.createElement("tr");
        var td = document.createElement("td");

        frage_json = get_frage_json(json_data, elems.item(i).id);

        if(frage_json == null){
            td.innerHTML = "Die Frage " + elems.item(i).id + " konnte nicht gefunden werden.";
        }else{
            td.innerHTML = frage_json["question"];
            var ol = document.createElement("ol");
            ol.setAttribute('style', 'list-style-type: upper-latin;');


            for(var j = 0, size = frage_json["answers"].length; j < size ; j++){
                var li = document.createElement("li");
                li.setAttribute('tabindex', '1');
                if(j == 0)
                    li.setAttribute('class', 'right');
                else
                    li.setAttribute('class', 'wrong');
                li.innerHTML = frage_json["answers"][j]
                ol.appendChild(li);
            }

            // shuffle the answers
            for (var k = ol.children.length; k >= 0; k--){
                ol.appendChild(ol.children[Math.random() * k | 0]);
            }
            td.appendChild(ol);
        }

        bRow.appendChild(td);
        tBody.appendChild(bRow)
        table.appendChild(tBody);

        // finally add the newly created table with json data to a container.
        elems[i].appendChild(table);
    }
}
init();
