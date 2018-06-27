// ==UserScript==
// @name Leboncoin preview
// @version 0.5
// @description Permet de voir une preview des annonces leboncoin, inspiré de [HFR] Image quote preview
// @updateURL https://raw.githubusercontent.com/Orken/HFR-Leboncoin-preview/master/hfr-leboncoin-preview.user.js
// @downloadURL https://raw.githubusercontent.com/Orken/HFR-Leboncoin-preview/master/hfr-leboncoin-preview.user.js
// @supportURL https://github.com/Orken/HFR-Leboncoin-preview/issues
// @include http*://www.leboncoin.fr/*
// @homepage https://github.com/Orken/HFR-Leboncoin-preview
// @author Orken | Mr Marron Derriere | MisterDuval
// @require https://code.jquery.com/jquery-2.1.4.min.js
// @grant GM_addStyle
// @grant unsafeWindow
// ==/UserScript==
var $ = window.jQuery;
var css = '#loader-wrapper{position:relative;top:10px;left:0;width:100%;height:100%;z-index:1000}#loader-wrapper p{position:absolute;text-align:center;left:0;right:0;color:#666;line-height:30px;top:50%;margin-top:-15px;font-size:30px}#loader{display:block;position:relative;left:50%;top:50%;width:150px;height:150px;margin:0 0 0 -75px;border-radius:50%;border:3px solid transparent;border-top-color:#f56b2a;-webkit-animation:spin 1.5s linear infinite;animation:spin 1.5s linear infinite}#loader:before{content:"";position:absolute;top:5px;left:5px;right:5px;bottom:5px;border-radius:50%;border:3px solid transparent;border-top-color:#4183d7;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}#loader:after{content:"";position:absolute;top:15px;left:15px;right:15px;bottom:15px;border-radius:50%;border:3px solid transparent;border-top-color:#ccc;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}';
var links;

var testLinkToLBC = function (link) {
    return link.href.match(/www.leboncoin.fr/i);
};

// J'ai désactivé la miniature en attendant d'avoir une solution pour les images en portrait qui prennent trop de hauteur
var generateGallery = function (thumbs) {
    if (thumbs && thumbs.length) {
        var gallery = document.createElement('div');
        gallery.style.textAlign = 'center';
        gallery.style.backgroundColor = 'white';
        var length = thumbs.length;
        var width = 390 - Math.min(length,1) * 6;
        for (var i=1;i<Math.min(2,length);i++) {
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

var display = function (description, thumbs, tableElements) {
    var $content = $('<div></div>');
    var $body = $('<div style="padding:10px;overflow:hidden;"></div>');

    if (thumbs) $content.append(generateGallery(thumbs));

    $body.html(description);
    $content.append($body);

    var $footer = $('<table style="background-color:#f0f0f0;width=100%;margin:0;"></table>');
    $.each(tableElements, function(title,text){
        $footer.append(
            '<tr>'+
            '  <td style="background-color:#f2f2f2;padding:5px 5px;">'+title+'</td>'+
            '  <td style="background-color:#fff;padding:5px 5px;">'+text+'</td>'+
            '</tr>'
        );
    });
    $body.css('maxHeight', ($(window).height() - $footer.find('tr').length*29 - 20) + 'px'); // 29: hauteur du tr + 40 de padding
    $content.append($footer);
    return $content;
};

GM_addStyle(css);

var previewLBC = function() {
    links = Array.prototype.filter.call( document.querySelectorAll('[role="tabpanel"] a.trackable') , testLinkToLBC );

    links.forEach(function(link) {
        console.log(link);
        var $container;
        var $link = $(link);

        // feature: on passe les liens en nouvel onglet
        $link.attr('target', '_blank');

        $link
            //.find('.item_image')
            .append('<span class="item_imageNumber item_preview" style="padding:1.5em;z-index:10000;position:absolute;top:16px;left:93%;"><svg height="32" width="32" viewBox="0 0 32 32"><path d="M16 25.718L25.888 32l-2.624-11.84L32 12.194l-11.504-1.045L16 0l-4.496 11.15L0 12.193l8.72 7.966L6.112 32 16 25.718z" fill="#000"></path></svg></span>');

        $link.on('mouseout',function() {
            if ($container) {
                $container.remove();
            }
        });

        $link
            //.find('[itemprop="image"]')
            .on('mouseover', function() {

                $container = $('<div style="z-index:10000;position:absolute;background:#fff;width:400px;min-height:175px;padding:0;border:1px solid #f0f0f0;right:10px;font-family:Roboto,sans-serif;">');
                $container.css('top', window.scrollY+10+"px");

                $('body').append($container);
                $container.append('<div id="loader-wrapper"><div id="loader"></div><p>Chargement en cours...</p></div>');

                $.ajax({
                    url: link.href,
                    success: function(html) {
                        $container.empty();
                        var adviewDisabled = /adviewDisabled/.test(html);
                        if (adviewDisabled) {
                            $link.css('textDecoration','line-through');
                            $link.css('color', '#666');
                            $container.append('<h1 style="text-align:center;">Cette annonce est désactivée"</div>');
                        } else {
                            var vars = html.match(/window.FLUX_STATE = (.*?)<\/script>/);
                            var decoded = JSON.parse(vars[1]);
                            var text = decoded.adview.body.replace(/\n/g, '<br />');
                            thumbs = decoded.adview.images.urls_thumb;
                            var tableElements = {};
                            if (decoded.adview.subject) tableElements.Title = decoded.adview.subject;
                            if (decoded.adview.price) tableElements.Prix = decoded.adview.price[0]+'€';
                            $container.html(display(text, thumbs, tableElements));
                        }
                    },
                    error: function (error) {
                        alert('Erreur de chargement de l\'annonce');
                        if ($container) { $container.remove(); }
                        console.log(error);
                    },
                });
            });
    });
};

// On donne la possibilité à d'autres scripts d'appeller la preview (par ex: InfiniteScroll4LBC)
unsafeWindow.previewLBC = previewLBC;

$(document).ready(function(){
    previewLBC();
});
