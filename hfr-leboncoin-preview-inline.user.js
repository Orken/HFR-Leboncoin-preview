// ==UserScript== 
// @name [HFR] Leboncoin preview inline
// @version 0.1.5
// @namespace http://lbc2rss.superfetatoire.com/ 
// @description Permet de voir une preview des annonces leboncoin dans la page
// @updateURL https://raw.githubusercontent.com/Orken/HFR-Leboncoin-preview/master/hfr-leboncoin-preview-inline.user.js
// @downloadURL https://raw.githubusercontent.com/Orken/HFR-Leboncoin-preview/master/hfr-leboncoin-preview-inline.user.js
// @supportURL https://github.com/Orken/HFR-Leboncoin-preview-inline/issues
// @include http://forum.hardware.fr/* 
// @homepage https://github.com/Orken/HFR-Leboncoin-preview-inline
// @author Orken | Mr Marron Derriere
// @icon http://lbc2rss.superfetatoire.com/webroot/img/icon.png
// @grant GM_xmlhttpRequest
// @grant GM_addStyle
// ==/UserScript== 

var css = '#loader-wrapper{position:relative;top:10px;left:0;width:100%;height:100%;z-index:1000}#loader-wrapper p{position:absolute;text-align:center;left:0;right:0;color:#666;line-height:30px;top:50%;margin-top:-15px;font-size:30px}#loader{display:block;position:relative;left:50%;top:50%;width:150px;height:150px;margin:0 0 0 -75px;border-radius:50%;border:3px solid transparent;border-top-color:#f56b2a;-webkit-animation:spin 1.5s linear infinite;animation:spin 1.5s linear infinite}#loader:before{content:"";position:absolute;top:5px;left:5px;right:5px;bottom:5px;border-radius:50%;border:3px solid transparent;border-top-color:#4183d7;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}#loader:after{content:"";position:absolute;top:15px;left:15px;right:15px;bottom:15px;border-radius:50%;border:3px solid transparent;border-top-color:#ccc;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}';
var links;

var testLinkToLBC = function (link) { 
    return link.href.match(/www.leboncoin.fr/i); 
} 
 
var createPlace = function (place) {
    var p = document.createElement('p');
    p.style.color = '#333';
    p.style.fontSize = '1em';
    p.innerHTML = place;
    p.style.margin = "1rem 0 0 0";
    return p;
};

var createTitle = function (title,url) {
    var p = document.createElement('a');
    p.href = url;
    p.target = "_blank";
    p.style.color = '#369';
    p.style.fontSize = '1.2em';
    p.innerHTML = title;
    p.style.margin = "0";
    return p;
};

var createDate = function (date) {
    var el = document.createElement('div');
    el.innerHTML = date; 
    el.classList.add('edited');
    return el;
};
var createPrice = function (price) {
    var p = document.createElement('p');
    p.style.color = '#f56b2a';
    p.style.fontSize = '1.5em';
    p.style.fontWeight = 'bold';
    p.innerHTML = price + " &euro;";
    p.style.margin = "1rem 0 0 0";
    return p;
};

var generateGallery = function (thumbs) {
    if (thumbs && thumbs.length) { 
        var gallery = document.createElement('div');
        gallery.style.display = 'block';
        gallery.style.textAlign = 'left';
        gallery.style.backgroundColor = 'white';
        gallery.style.float = 'left';
        gallery.style.marginRight = '10px';
        var length = thumbs.length; 
        var width = 390 - Math.min(length,3) * 6;
        var img = new Image();
        img.src = thumbs[0];
        img.style.maxHeight = '140px';
        img.style.maxWidth = '200px'; // (width / Math.min(length,3) ) + 'px';
        img.style.margin = '0px';
        gallery.appendChild(img);
        return gallery; 
    } 
};

var display = function (titre, url, thumbs, price, address,date) {
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var container = document.createElement('div');
    container.classList.add('container');
    var table = document.createElement('table');
    var tr = table.insertRow(0);
    tr.classList.add('none');
    var td = tr.insertCell(0);
    var b = document.createElement('b');
    b.classList.add('s1');
    var a = document.createElement('a');
    a.href = url;
    a.innerHTML = 'Leboncoin à écrit :';
    a.classList.add('Topic');
    b.appendChild(a);
    td.appendChild(b);
    td.appendChild(document.createElement('br'));
    td.appendChild(document.createElement('br'));
    table.classList.add('citation');
    table.style.borderColor = 'rgba(245, 107, 42, 0.5)';
    container.appendChild(table);
    
    var content = document.createElement('p');
    content.style.padding = 0;
    
    if (thumbs) content.appendChild(generateGallery(thumbs));
    
    var body = document.createElement('div');
    body.style.display = 'block';
    body.style.padding = '0 10px';
    body.appendChild(createTitle(titre,url));
    if ( price || address ) {
        if (address) body.appendChild(createPlace(address));
        if (price) body.appendChild(createPrice(price));
    }
    body.appendChild(createDate(date));
    
    content.appendChild(body);
    var clear = document.createElement('div');
    clear.style.clear = 'both';
    content.appendChild(clear);
    td.appendChild(content);
    return container;
};

var insertAfter = function (newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};

GM_addStyle(css);

links = Array.prototype.filter.call( document.querySelectorAll('#mesdiscussions a.cLink') , testLinkToLBC );
links.forEach(function(link) {
    var url = link.href; 
    GM_xmlhttpRequest({ 
        method: "GET", 
        url: url, 
        onload: function(response) 
        { 
            var texte = response.responseText; 
            var adviewDisabled = /adviewDisabled/.test(texte); 
            if (adviewDisabled) {
                link.style.textDecoration = "line-through";
                link.style.color = '#666';
            } else { 
                var date = texte.match(/itemprop="availabilityStarts".*>(.*)<\/p>/); 
                var titre = texte.match(/itemprop="name">([^]*)<\/h1>/); 
                var thumbs = texte.match(/(\/\/img[0-9].leboncoin.fr\/ad-thumb\/.*\.jpg)/g); 
                if (!thumbs) { 
                    var image = texte.match(/data-popin-content="(.*?)"/);
                    if (image) {
                        thumbs = new Array(image[1]); //.replace('image','thumb'));
                    }
                }
                var price = texte.match(/itemprop="price" content="(.*)"/); 
                var address = texte.match(/itemprop="address">(.*)/); 
                var gallery = display(titre[1], link, thumbs, price[1], address[1],date[1]);
                insertAfter(gallery,link);
            } 
        } 
     }); 

     
});
