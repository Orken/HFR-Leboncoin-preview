// ==UserScript==
// @name Leboncoin preview
// @version 0.3.0
// @description Permet de voir une preview des annonces leboncoin, inspiré de [HFR] Image quote preview
// @updateURL https://raw.githubusercontent.com/Orken/HFR-Leboncoin-preview/master/hfr-leboncoin-preview.user.js
// @downloadURL https://raw.githubusercontent.com/Orken/HFR-Leboncoin-preview/master/hfr-leboncoin-preview.user.js
// @supportURL https://github.com/Orken/HFR-Leboncoin-preview/issues
// @include http*://www.leboncoin.fr/*
// @homepage https://github.com/Orken/HFR-Leboncoin-preview
// @author Orken | Mr Marron Derriere | MisterDuval
// @grant GM_addStyle
// @grant unsafeWindow
// ==/UserScript==

var css = '#loader-wrapper{position:relative;top:10px;left:0;width:100%;height:100%;z-index:1000}#loader-wrapper p{position:absolute;text-align:center;left:0;right:0;color:#666;line-height:30px;top:50%;margin-top:-15px;font-size:30px}#loader{display:block;position:relative;left:50%;top:50%;width:150px;height:150px;margin:0 0 0 -75px;border-radius:50%;border:3px solid transparent;border-top-color:#f56b2a;-webkit-animation:spin 1.5s linear infinite;animation:spin 1.5s linear infinite}#loader:before{content:"";position:absolute;top:5px;left:5px;right:5px;bottom:5px;border-radius:50%;border:3px solid transparent;border-top-color:#4183d7;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite}#loader:after{content:"";position:absolute;top:15px;left:15px;right:15px;bottom:15px;border-radius:50%;border:3px solid transparent;border-top-color:#ccc;-webkit-animation:spin 1s linear infinite;animation:spin 1s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes spin{0%{-webkit-transform:rotate(0deg);-ms-transform:rotate(0deg);transform:rotate(0deg)}100%{-webkit-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}';
var links;

var testLinkToLBC = function (link) {
    return link.href.match(/www.leboncoin.fr/i);
};

/*
// J'ai désactivé la miniature en attendant d'avoir une solution pour les images en portrait qui prennent trop de hauteur
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
};*/

var display = function (description, thumbs, tableElements) {
    var $content = $('<div></div>');
    var $body = $('<div style="padding:10px;overflow:hidden;"></div>');

    // if (thumbs) content.append(generateGallery(thumbs));

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
    links = Array.prototype.filter.call( document.querySelectorAll('.tabsContent li a') , testLinkToLBC );
    links.forEach(function(link) {
        var $container;
        var $link = $(link);

        // feature: on passe les liens en nouvel onglet
        $link.attr('target', '_blank');

        $link
            .find('.item_image')
            .append('<span class="item_imageNumber item_preview" style="margin-left:25px;"><i class="icon-info icon-2x nomargin"></i></span>');

        $link.on('mouseout',function() {
            if ($container) {
                $container.remove();
            }
        });

        $link
            .find('.item_image .item_preview')
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
                            var text = html.match(/itemprop="description">(.*)<\/p>/);
                            var thumbs = [];
                            var image = html.match(/data-popin-content="(.*?)"/);
                            if (image) {
                                thumbs = new Array(image[1]);
                            }
                            var tableElements = {};
                            var price = html.match(/itemprop="price" content="(.*)"/);
                            if (price) tableElements.Prix = price[1]+'€';

                            $.each($(html).find('.properties .line h2 .value'), function(k,el){
                                var title = $(el).parent().find('.property').text();
                                tableElements[title] = $(el).text();
                            });

                            $container.html(display(text[1], thumbs, tableElements));
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
