// ==UserScript== 
// @name [HFR] Leboncoin preview 
// @version 0.1.85
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
// @grant GM_addStyle
// ==/UserScript== 

var css = '#loader-wrapper{position:relative;top:10px;left:0;width:100%;height:100%;z-index:1000}#loader-wrapper p{position:absolute;text-align:center;left:0;right:0;color:#666;line-height:30px;top:50%;margin-top:-15px;font-size:30px}#loader{display:block;position:relative;left:50%;top:50%;width:150px;height:150px;margin:0 0 0 -75px;border-radius:50%;border:3px solid transparent;border-top-color:#f56b2a;-webkit-animation:spin 1.5s linear infinite;animation:spin 1.5s linear infinite}#loader:before{content:"";position:absolute;top:5px;left:5px;right:5px;bottom:5px;border-radius:50%;border:3px solid transparent;border-top-color:#4183d7;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}#loader:after{content:"";position:absolute;top:15px;left:15px;right:15px;bottom:15px;border-radius:50%;border:3px solid transparent;border-top-color:#ccc;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}';
var links;

var testLinkToLBC = function (link) { 
    return link.href.match(/www.leboncoin.fr/i); 
} 
 
var loading = function (element) { 
    var dyn = ""; 
    return  setInterval(function() { 
        dyn+= "."; 
        if(dyn.length == 4) dyn = ""; 
        element.innerHTML ="Chargement en cours" + dyn; 
    },500); 
} 

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
            //img.style.maxHeight = '120px';
            img.style.maxWidth = '400px'; // (width / Math.min(length,3) ) + 'px';
            img.style.margin = '0px';
            gallery.appendChild(img);
        } 
        return gallery; 
    } 
};

var display = function (titre, description, thumbs, price, address) {
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    var content = document.createElement('div');
    var header = document.createElement('div');
    header.style.margin = 0;
    header.style.padding = '15px 10px';
    header.style.fontSize = '1.5em';
    header.style.backgroundColor = '#f56b2a';
    header.style.color = 'white';
    header.innerHTML = titre;
    content.appendChild(header);
    
    if (thumbs) content.appendChild(generateGallery(thumbs));
    
    var body = document.createElement('div');
    body.innerHTML = description;
    body.style.padding = '10px';
    /* 
      Calcul arbitraire pour que les annonces avec beaucoup de texte
      s'affiche sur la page correctement.
      A faire : calculer le décalage suivant les élements présents dans la page.
    */
    body.style.maxHeight = (height - 400) + 'px';
    body.style.overflow = 'hidden';
    content.appendChild(body);
    
    if ( price || address ) {
        var footer = document.createElement('table');
        footer.style.backgroundColor = '#f0f0f0';
        footer.style.width = '100%';
        if (price) footer.appendChild(createRow('Prix',price + ' €'));
        if (address) footer.appendChild(createRow('Lieu',address));
        content.appendChild(footer);
    }
    return content;
};

GM_addStyle(css);

links = Array.prototype.filter.call( document.querySelectorAll('#mesdiscussions a.cLink') , testLinkToLBC );
links.forEach(function(link) {
    var container; 
    var loadingText; 
    var img; 
    var bePatient; 
    
    link.addEventListener('mouseover',function() { 
        
        loadingText = document.createElement('div');
        loadingText.id = 'loader-wrapper';
        var loader = document.createElement('div');
        loader.id = 'loader';
        var loadinginprogress = document.createElement('p');
        loadinginprogress.innerHTML = 'Chargement en cours';
        loadingText.appendChild(loadinginprogress);
        loadingText.appendChild(loader);
        bePatient = loading(loadinginprogress); 

        container = document.createElement('div'); 
        container.style.position = "absolute"; 
        container.style.background = "#fff"; 
        container.style.width = "400px";
        container.style.minHeight = '175px';
        container.style.padding = "0px";
        container.style.border = 'solid 1px #f0f0f0'; 
        container.style.top = window.scrollY+10+"px"; 
        container.style.right = "10px"; 
        container.style.fontFamily = 'Roboto, sans-serif'; 
         
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
                    if (adviewDisabled) {
                        var inactive = document.createElement('h1');
                        inactive.style.textAlign = 'center';
                        inactive.innerHTML = 'Cette annonce est d&eacute;sactiv&eacute;e';
                        container.appendChild(inactive);
                    } else { 
                        var text = texte.match(/itemprop="description">(.*)<\/p>/); 
                        var titre = texte.match(/itemprop="name">([^]*)<\/h1>/); 
                        var thumbs = [];
                        /* var thumbs = texte.match(/(\/\/img[0-9].leboncoin.fr\/ad-thumb\/.*\.jpg)/g); 
                        if (!thumbs) { */
                            var image = texte.match(/data-popin-content="(.*?)"/);
                            if (image) {
                                thumbs = new Array(image[1]); //.replace('image','thumb'));
                            }
                        /* } */
                        var price = texte.match(/itemprop="price" content="(.*)"/); 
                        var address = texte.match(/itemprop="address">(.*)/); 
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
