// ==UserScript== 
// @name [HFR] Leboncoin preview 
// @version 0.1.1 
// @namespace http://lbc2rss.superfetatoire.com/ 
// @description Permet de voir une preview des annonces leboncoin, inspiré de [HFR] Image quote preview 
// @include http://forum.hardware.fr/* 
// @grant GM_xmlhttpRequest 
// ==/UserScript== 
 
function $x(p, context) { 
  if (!context) context = document; 
  var i, arr = [], xpr = document.evaluate(p, context, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null); 
  for (i = 0; item = xpr.snapshotItem(i); i++) arr.push(item); 
  return arr; 
} 
 
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
 
var base = document.getElementById('mesdiscussions'); 
var links = $x('//a[@class="cLink"]',base); 
 
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
        container.style.background = "#f0f0f0"; 
        container.style.width = "400px"; 
        container.style.padding = "8px"; 
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
                    var texte = response.responseText; 
                    var inactive = /adviewDisabled/.test(texte); 
                    var html =''; 
                    if (inactive) { 
                        html+='<h1 style="text-align:center">Cette annonce est d&eacute;sactiv&eacute;e</h1>'; 
                    } else { 
                        var text = texte.match(/itemprop="description">(.*)<\/p>/); 
                        var titre = texte.match(/<h1 class="no-border">([^]*)<\/h1>/); 
                        var thumbs = texte.match(/(\/\/img.*thumbs.*\.jpg)/g); 
                        var price = texte.match(/itemprop="price" content="(.*)"/); 
                        var address = texte.match(/PostalAddress">(.*)/); 
                        html = '<h1 style="font-size:1.5em;background-color:#f56b2a;color:white;margin:0 0 10px 0;padding:5px;">' + titre[1] + '</h1>'; 
                        if (thumbs) { 
                            html+='<div style="text-align:center;background-color:#fff">'; 
                            var length = thumbs.length; 
                            for (i=0;i<length;i++) { 
                                html+= "<img src=\""+thumbs[i]+"\" style=\"max-height:300px;max-width:" + (390/length) + "px\"> "; 
                            } 
                            html+='</div>'; 
                        } 
                        html+="<h3>Description :</h3><p>" + text[1] + '</p>'; 
                        if (price) { 
                            html+= '<div style="background-color:white;padding:3px;border:solid 1px #f6f6f6">Prix : <span style="color:#f56b2a;font-size:1.2em;font-weight:bold">'+price[1] + ' €</span></div>'; 
                        } 
                        if (address) { 
                            html+= '<div style="background-color:white;padding:3px;border:solid 1px #f6f6f6">Lieu : '+ address[1] + '</div>'; 
                        } 
                    } 
                    container.innerHTML = html; 
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
