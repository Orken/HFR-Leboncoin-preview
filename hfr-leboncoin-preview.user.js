// ==UserScript== 
// @name [HFR] Leboncoin preview 
// @version 0.1.5
// @namespace http://lbc2rss.superfetatoire.com/ 
// @description Permet de voir une preview des annonces leboncoin, inspiré de [HFR] Image quote preview 
// @updateURL https://raw.githubusercontent.com/Orken/HFR-Leboncoin-preview/master/hfr-leboncoin-preview.user.js
// @downloadURL https://raw.githubusercontent.com/Orken/HFR-Leboncoin-preview/master/hfr-leboncoin-preview.user.js
// @supportURL https://github.com/Orken/HFR-Leboncoin-preview/issues
// @include http://forum.hardware.fr/* 
// @homepage https://github.com/Orken/HFR-Leboncoin-preview
// @author Orken | Mr Marron Derriere
// @icon http://lbc2rss.superfetatoire.com/webroot/img/icon.png
// @grant GM_xmlhttpRequest 
// ==/UserScript== 
 
function testLinkToLBC(link) { 
    return link.href.match(/www.leboncoin.fr/i); 
} 
 
function loading(element) { 
    var dyn = ""; 
    return  setInterval(function() { 
        dyn+= "."; 
        if(dyn.length == 4) dyn = ""; 
        element.innerHTML ="Chargement en cours" + dyn; 
    },500); 
} 

var filter   = Array.prototype.filter;
var links = filter.call( document.querySelectorAll('#mesdiscussions a.cLink') , testLinkToLBC );

var createRow = function (titre, content) {
    var row = document.createElement('tr');
    var tdtitre = document.createElement('td');
    tdtitre.style.backgroundColor = '#f0f0f0';
    tdtitre.style.padding = '7px 5px';
    tdtitre.innerHTML = titre;
    var tdcontent = document.createElement('td');
    tdcontent.style.backgroundColor = '#f0f0f0';
    tdcontent.innerHTML = content;
    tdcontent.style.padding = '7px 5px';
    row.appendChild(tdtitre);
    row.appendChild(tdcontent);
    return row;
};

var emptyElement = function (element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
};

var generateGallery = function (thumbs) {
    if (thumbs && thumbs.length) { 
        var gallery = document.createElement('div');
        gallery.style.textAlign = 'center';
        gallery.style.backgroundColor = 'white';
        var length = thumbs.length; 
        var width = 390 - Math.min(length,3) * 6;
        for (i=0;i<length;i++) { 
            var img = new Image();
            img.src = thumbs[i];
            img.style.maxHeight = '300px';
            img.style.maxWidth = (width / Math.min(length,3) ) + 'px';
            img.style.margin = '3px';
            gallery.appendChild(img);
        } 
        return gallery; 
    } 
};

var display = function (titre, description, thumbs, price, address) {
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var content = document.createElement('div');
    var header = document.createElement('h1');
    header.style.margin = 0;
    header.style.padding = '5px';
    header.style.fontSize = '1.5em';
    header.style.backgroundColor = '#f56b2a';
    header.style.color = 'white';
    header.innerHTML = titre;
    content.appendChild(header);
    
    if (thumbs) content.appendChild(generateGallery(thumbs));
    
    var body = document.createElement('div');
    body.innerHTML = description;
    body.style.padding = '10px';
    content.appendChild(body);
    
    if ( price || address ) {
        var footer = document.createElement('table');
        footer.style.backgroundColor = 'white';
        footer.style.width = '100%';
        if (price) footer.appendChild(createRow('Prix',price + ' €'));
        if (address) footer.appendChild(createRow('Lieu',address));
        content.appendChild(footer);
    }
    return content;
};
 
links.filter(testLinkToLBC).forEach(function(link) { 
    var container; 
    var loadingText; 
    var img; 
    var bePatient; 
    
    link.addEventListener('mouseover',function() { 
        loadingText = document.createElement('p'); 
        loadingText.style.marginLeft = '50px'; 
        loadingText.style.fontFamily = 'arial,sans-serif'; 
        loadingText.style.fontWeight = 'bold'; 
        loadingText.style.textAlign = 'center'; 
        loadingText.innerHTML = "Chargement en cours..."; 
        bePatient = loading(loadingText); 

        container = document.createElement('div'); 
        container.style.position = "absolute"; 
        container.style.background = "#fff"; 
        container.style.width = "400px"; 
        container.style.padding = "0px";
        container.style.border = 'solid 2px #f56b2a'; 
        container.style.top = window.scrollY+10+"px"; 
        container.style.right = "10px"; 
        container.style.fontFamily = 'sans-serif'; 
         
        document.body.appendChild(container); 
        container.appendChild(loadingText); 
        var url = this.href; 
        GM_xmlhttpRequest({ 
                method: "GET", 
                url: url, 
                onload: function(response) 
                { 
                    emptyElement(container);
                    var texte = response.responseText; 
                    var adviewDisabled = /adviewDisabled/.test(texte); 
                    var html =''; 
                    if (adviewDisabled) {
                        var inactive = document.createElement('h1');
                        inactive.style.textAlign = 'center';
                        inactive.innerHTML = 'Cette annonce est d&eacute;sactiv&eacute;e';
                        container.appendChild(inactive);
                    } else { 
                        var text = texte.match(/itemprop="description">(.*)<\/p>/); 
                        var titre = texte.match(/<h1 class="no-border">([^]*)<\/h1>/); 
                        var thumbs = texte.match(/(\/\/img.*thumbs.*\.jpg)/g); 
                        if (!thumbs) {
                            var image = texte.match(/itemprop="image" content="(.*)"/);
                            if (image) {
                                thumbs = new Array(image[1].replace('images','thumbs'));
                            }
                        }
                        var price = texte.match(/itemprop="price" content="(.*)"/); 
                        var address = texte.match(/PostalAddress">(.*)/); 
                        container.appendChild(display(titre[1], text[1], thumbs, price[1], address[1]));
                    } 
                    clearInterval(bePatient); 
                } 
            }); 
     },false); 
     
    link.addEventListener('mouseout',function() { 
        if(container) { 
            container.parentNode.removeChild(container); 
        } 
    },false); 
});
