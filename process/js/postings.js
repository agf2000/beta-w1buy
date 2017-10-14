'use sctrict'

$(function () {

    // Socket.io for messages count indicator    
    // let client = io.connect('/postingMsg');
    // let address = window.location.protocol + '//' + window.location.host + ':8080';
    // let details = {
    //     resource: (window.location.pathname.split('/').slice(0, -1).join('/') + '/socket.io').substring(1)
    // };

    // let client = io.connect(address, details);
    // let client = io(window.location.protocol + '//' + window.location.host + ':8080');
    // if (my.userInfo) {
    //     client.emit('messages', my.userInfo.UserID, function (data) {
    //         console.log(data);
    //     });
    // }
    // client.on('usernames', function (data) {
    //     $('.newMsgCount').text(parseInt($('.newMsgCount').eq(0).text()) + data);
    //     my.sendNotification(window.location.protocol + '//' + window.location.host + '/images/logo_small.png', 'W1Buy.com.br', 'Nova mensagem recebida!', 6000, !my.hasFocus);
    // });

    my.postingId = my.getQuerystring('id', my.getParameterByName('id'));
    my.keyword = my.getQuerystring('keyword', my.getHashValue('keyword'));
    my.localeId = my.getQuerystring('localeid', my.getHashValue('localeid'));

    my.viewModel();

    var keywords = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace('city'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // prefetch: '/api/getKeywords?term=pn',
        remote: {
            url: '/api/getPostingsLocalesCount?term=%QUERY',
            wildcard: '%QUERY'
        }
    });

    keywords.initialize();

    $('#inputSearch').bind('typeahead:render', function (ev, data) {
        my.postingsLocales = []
        if (data.length) {
            $.each(data, function (i, item) {
                if (item.locales > 1) {
                    for (var i = 0; i < item.locales; i++) {
                        my.postingsLocales.push({
                            city: item.city,
                            localeId: item.localeid,
                            locales: item.locales
                        });
                    }
                } else {
                    my.postingsLocales.push({
                        city: item.city,
                        localeId: item.localeid,
                        locales: item.locales
                    })
                }
            });
        }
    });

    let timeout;

    $('#inputSearch').typeahead({
        hint: true,
        highlight: true,
        minLength: 2
    }, {
        name: 'keywords',
        source: keywords,
        limit: 11,
        display: 'city',
        displayKey: 'localeid',
        templates: {
            pending: '<div class="header-message">Carregando...</div>',
            header: function (value) {
                my.query = value.query;
                return '<div class="header-message" style="color: #f26522;">Cidades onde estão comprando <strong>"' + my.query + '"</strong>...</div>'
            },
            notFound: [
                '<div class="empty-message">',
                'Refaça sua busca... Nada encontrado!',
                '</div>'
            ].join('\n'),
            suggestion: function (data) {
                return '<p>' + data.city + ' (' + data.locales + ')</p>';
            },
            footer: '<div class="text-center">Clique em uma das opções</div>'
        }
    });

    $('#inputSearch').bind('typeahead:select', function (ev, suggestion) {
        history.pushState("", document.title, window.location.pathname);

        my.localeId = suggestion.localeid;
        my.city = suggestion.city;

        my.keyword = "'" + my.query + "'";

        my.vm.query('<strong>"' + my.query + '"</strong>');
        my.vm.chosen('<strong>' + suggestion.city + '</strong>');

        my.vm.items([]);
        my.vm.currentPage(0);
        my.getItems(my.vm.currentPage() + 1, my.query, my.localeId);

        $('#postingsList').show();
        $('#postingRegions').empty();

        var countState = 0,
            nameState = '',
            countCity = 0,
            nameCity = '';
        $.each(my.postingsLocales, function (i, item) {
            if (nameState !== item.city.split('-')[1].replaceAll(' ', '', true)) {
                nameState = item.city.split('-')[1].replaceAll(' ', '', true);
                countState = 0;
                if ($('#postingRegions').find('#' + nameState).length > 0) {
                    countState++;
                    $('#' + nameState + ' span:eq(0)').html('<span class="badge">' + countState + '</span>');
                } else {
                    $('#postingRegions').append('<ul><li id="' + item.city.split('-')[1].replaceAll(' ', '', true) + '"><a onclick="javascript: my.getItems(' + 1 + ',' + my.keyword + ',' + item.localeId + ')" href="#">' + item.city.split('-')[1].trim() + '</a> <span></span><ul></ul></li>');
                }
            }

            if (nameState === item.city.split('-')[1].replaceAll(' ', '', true)) {
                countState++;
                $('#' + nameState + ' span:eq(0)').html('<span class="badge">' + countState + '</span>');
                if (nameCity !== item.city.split('-')[0].replaceAll(' ', '', true)) {
                    nameCity = item.city.split('-')[0].replaceAll(' ', '', true);
                    countCity = 0;
                    if ($('#' + nameState + ' ul').find('#' + nameState + '_' + item.city.split('-')[0].replaceAll(' ', '', true)).length > 0) {
                        countCity++;
                        $('#' + nameState + '_' + item.city.split('-')[0].replaceAll(' ', '', true) + ' span:eq(0)').html('<span class="badge">' + countCity + '</span>');
                    } else {
                        $('#' + nameState + ' ul').append('<li id="' + nameState + '_' + item.city.split('-')[0].replaceAll(' ', '', true) + '"><a onclick="javascript: my.getItems(' + 1 + ',' + my.keyword + ',' + item.localeId + ')" href="#">' + item.city.split('-')[0].trim() + '</a> <span></span></li>');
                    }
                }

                if (nameCity === item.city.split('-')[0].replaceAll(' ', '', true)) {
                    countCity++;
                    $('#' + nameState + '_' + nameCity + ' span:eq(0)').html('<span class="badge">' + countCity + '</span>');
                }
            }

            $('#postingRegions').append('</ul>');

        });

        $('#inputSearch').typeahead('val', '');
        $('#inputSearch').typeahead('close');

        $('.carousel').carousel();

        $(".carousel").swipe({

            swipe: function (event, direction, distance, duration, fingerCount, fingerData) {

                if (direction == 'right') $(this).carousel('prev');

                if (direction == 'left') $(this).carousel('next');

            },
            threshold: 0,
            allowPageScroll: "vertical"
        });
    });

    if (my.keyword.length > 1) {

        my.getItems(my.vm.currentPage() + 1, my.keyword, my.localeId);

        $.getJSON('/api/GetPostings?portalId=0&term=' + my.keyword + '&localeId=' + my.localeId, function (data) {
            if (data) {

                var countState = 0,
                    nameState = '',
                    countCity = 0,
                    nameCity = '';
                $.each(data, function (i, item) {
                    if (nameState !== item.PosterRegion) {
                        nameState = item.PosterRegion;
                        countState = 0;
                        if ($('#postingRegions').find('#' + nameState).length > 0) {
                            countState++;
                            $('#' + nameState + ' span:eq(0)').text('(' + countState + ')');
                        } else {
                            //var args = "".concat(my.keyword.trim() + ', ' + nameState);
                            //$('#postingRegions').append('<li id="' + item.PosterRegion + '">' +
                            //                            '<a href="#" onclick="javascript: getPostingsFromLocales(\'' + args + '\'); return false;">' + item.PosterRegion + '</a> <span></span><ul></ul></li>');
                            $('#postingRegions').append('<li id="' + item.PosterRegion + '"><a href="anuncios#keyword=' + my.keyword + '&region=' + nameState + '">' + item.PosterRegion + '</a> <span></span><ul></ul></li>');
                        }
                    }

                    if (nameState === item.PosterRegion) {
                        countState++;
                        $('#' + nameState + ' span:eq(0)').text('(' + countState + ')');
                        if (nameCity !== item.PosterCity) {
                            nameCity = item.PosterCity;
                            countCity = 0;
                            if ($('#' + nameState + ' ul').find('#' + nameState + '_' + item.PosterCity.replaceAll(' ', '', true)).length > 0) {
                                countCity++;
                                $('#' + nameState + '_' + item.PosterCity.replaceAll(' ', '', true) + ' span:eq(0)').text('(' + countCity + ')');
                            } else {
                                //var args = "".concat(my.keyword.trim() + ', ' + nameCity);
                                //$('#' + nameState + ' ul').append('<li id="' + nameState + '_' + item.PosterCity.replaceAll(' ', '', true) + '">' + 
                                //                                  '<a href="#" onclick="javascript: getPostingsFromLocales(\'' + args + '\'); return false;">' + item.PosterCity + '</a> <span></span></li>');
                                $('#' + nameState + ' ul').append('<li id="' + nameState + '_' + item.PosterCity.replaceAll(' ', '', true) + '"><a href="anuncios#keyword=' + my.keyword + '&region=' + nameState + '&city=' + nameCity + '">' + item.PosterCity + '</a> <span></span></li>');
                            }
                        }

                        if (nameCity === item.PosterCity) {
                            countCity++;
                            $('#' + nameState + '_' + item.PosterCity.replaceAll(' ', '', true) + ' span:eq(0)').text('(' + countCity + ')');
                        }
                    }

                    $('#postingRegions').append('</ul>');

                });
            }
        });
    }

    $('#txtPriorityValue').focusout(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        if (my.vm.priorityValueAmount() > 0) {
            if ((parseInt($(e.target).val()) > 0) && (parseInt($(e.target).val()) >= my.vm.priorityValueAmount())) {
                swal({
                    title: "Atenção!",
                    html: '<p>Seu menor preço está em desvantagem ao<br />já ofertado por outro vendedor.</p><p>Diminua um pouco para conseguir vender.</p>',
                    type: "warning",
                    confirmButtonText: "Ok"
                });
            }
        }
    });

    $('#txtPriorityDelivery').focusout(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        if (my.vm.priorityDeliveryAmount() > 0) {
            if ((parseInt($(e.target).val()) > 0) && (parseInt($(e.target).val()) >= my.vm.priorityDeliveryAmount().toString())) {
                swal({
                    title: "Atenção!",
                    html: '<p>Seu prazo de entrega está em desvantagem ao<br />já ofertado por outro vendedor.</p><p>Diminua um pouco para conseguir vender.</p>',
                    type: "warning",
                    confirmButtonText: "Ok"
                });
            }
        }
    });

    $('#btnAddMsg').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        if (validator.validate('#msgForm')) {

            var $this = $(this);

            var badWCount = 0;
            var reBadWords = /anus|baba-ovo|babaovo|babaca|bacura|bagos|baitola|bebum|besta|bicha|bisca|bixa|boazuda|boceta|boco|boiola|bolagato|boquete|bolcat|bosseta|bosta|bostana|brecha|brexa|brioco|bronha|buca|buceta|bunda|bunduda|burra|burro|busseta|cachorra|cachorro|cadela|caga|cagado|cagao|cagona|canalha|caralho|casseta|cassete|checheca|chereca|chibumba|chibumbo|chifruda|chifrudo|chota|chochota|chupada|chupado|clitoris|clit+ris|cocaina|coca-na|coco|corna|corno|cornuda|cornudo|corrupta|corrupto|cretina|cretino|cruz-credo|cu|culhao|curalho|cuzao|cuz+o|cuzuda|cuzudo|debil|debiloide|defunto|demonio|dem+nio|difunto|doida|doido|escrota|escroto|esporrada|esporrado|esporro|estupida|estupidez|estupido|est+pido|fedida|fedido|fedor|fedorenta|feia|feio|feiosa|feioso|feioza|feiozo|felacao|fenda|foda|fodao|fode|fodida|fodido|fornica|fudendo|fudecao|fudida|fudido|furada|furado|furao|furnica|furnicar|furo|furona|gaiata|gaiato|gay|gonorrea|gonorreia|gosma|gosmenta|gosmento|grelinho|grelo|homo-sexual|homosexual|homossexual|idiota|idiotice|imbecil|iscrota|iscroto|japa|ladra|ladrao|ladr+o|ladroeira|ladrona|lalau|leprosa|leproso|lesbica|macaca|macaco|machona|machorra|manguaca|masturba|meleca|merda|mija|mijada|mijado|mijo|mocrea|mocr+a|mocreia|moleca|moleque|mondronga|mondrongo|naba|nadega|nojeira|nojenta|nojento|nojo|olhota|otaria|otario|paca|paspalha|paspalhao|paspalho|pau|peia|peido|pemba|penis|p-nis|pentelha|pentelho|perereca|peru|pica|picao|pilantra|piranha|piroca|piroco|piru|porra|prega|prostibulo|prostituta|prostituto|punheta|punhetao|pus|pustula|puta|puto|puxa-saco|puxasaco|rabao|rabo|rabuda|rabudao|rabud+o|rabudo|rabudona|racha|rachada|rachadao|rachad+o|rachadinha|rachadinho|rachado|ramela|remela|retardada|retardado|ridicula|rola|rolinha|rosca|sacana|safada|safado|sapatao|sifilis|siririca|tarada|tarado|testuda|tezao|tez+o|tezuda|tezudo|trocha|trolha|troucha|trouxa|troxa|vaca|vagabunda|vagabundo|vagina|veada|veadao|vead+o|veado|viada|viado|viadao|xavasca|xerereca|xexeca|xibiu|xibumba|xota|xochota|xoxota|xana|xaninha/gi;
            $('#msgTextarea').val($('#msgTextarea').val().replace(reBadWords, "****"));

            if ($('#msgTextarea').val().indexOf("***") !== -1) {
                badWCount++;
                swal({
                    title: "Atenção!",
                    text: "Uma ou mais palavras ou símbolos usado em seu texto vai contra os termos de uso do portal. Favor remover.",
                    type: "warning",
                    confirmButtonText: "Ok"
                });
            }

            if (badWCount == 0) {

                var numbers = $('#msgTextarea').val().toLowerCase().split(" "),
                    numberCount = 0;
                for (var i = 0; i < numbers.length; i++) {
                    if (numbers[i].replace(/[^0-9]/g, '').length >= 8) {
                        numberCount++;
                    }
                }

                var emailCount = 0,
                    emailChars = '@,hotmail.com,yahoo.com,gmail.com,bol.com,uol.com,terra.com,zip.com,ig.com,globo.com,r7.com'.split(','),
                    emailLength = emailChars.length;
                while (emailLength--) {
                    if ($('#msgTextarea').val().toLowerCase().indexOf(emailChars[emailLength]) != -1) {
                        emailCount++;
                    }
                }

                if (numberCount > 0 || emailCount > 0) {
                    swal({
                        title: "Atenção!",
                        text: "Uma suspeita de irregularidade contra os termos de uso site foi detectado.",
                        type: "warning",
                        confirmButtonText: "Ok"
                    });
                    numberCount = 0;
                    emailCount = 0;
                } else {
                    advance($this);
                }
            }
        }
    });

    // $(window).scroll(function (evt) {
    //     evt.preventDefault();
    //     if ($(window).scrollTop() >= $(document).height() - $(window).height()) {
    //         console.log("Scroll Postion" + $(window).scrollTop());
    //         my.getItems(my.vm.currentPage() + 1, my.keyword, decodeURI(my.region), decodeURI(my.city));
    //     }
    // });

    $("#msgTextarea").on('keyup', function () {
        var words = this.value.match(/\S+/g).length;

        if (words > 30) {
            // Split the string on first 200 words and rejoin on spaces
            var trimmed = $(this).val().split(/\s+/, 30).join(" ");
            // Add a space at the end to make sure more typing creates new words
            $(this).val(trimmed + " ");
        } else {
            $('#display_count').text(words);
            $('#word_left').text(30 - words);
        }
    });

});

my.getItems = function (cnt, term, localeId) {
    // my.waitingDialog.show('Carregando anúncios...', {
    //     dialogSize: 'sm',
    //     progressType: 'warning'
    // });

    $.ajax({
        url: '/api/getPostings',
        data: {
            portalId: 0,
            term: term,
            localeId: localeId,
            pageIndex: cnt,
            pageSize: 100,
            delay: .1,
        }
    }).done(function (entries) {
        my.vm.items([]);
        my.vm.currentPage(my.vm.currentPage() + 1);
        ko.utils.arrayForEach(entries, function (entry) {
            entry.DisplayDate = moment(entry.CreatedOnDate).format('LLL');
            entry.Title = 'Compro ' + entry.Title.replace('Compro', ' ') + '&nbsp; <small><i class="glyphicon glyphicon-tags" title="Condições"></i> &nbsp; ' + entry.PostingCondition + ((entry.Quantity !== null && entry.Quantity > 0) && entry.ExpiryDate ? ' - Quantidade: ' + Math.max(0, entry.Quantity) : '') + '</small>';
            // entry.PostingDescription = entry.PostingDescription + '<p>Por: <a href="#">' + entry.PosterDisplayName + '</a></p>';
            if (entry.Files !== null) {
                entry.Files = JSON.parse(entry.Files.replace(/\,(?!\s*[\{\[\"\'\w])/g, ''));
                ko.utils.arrayForEach(entry.Files, function (item) {
                    item.FileName = item.FileName.replace(/(\.[\w\d_-]+)$/i, '_thumb$1');;
                });
            }
            entry.Locales = JSON.parse(entry.Locales.replace(/\,(?!\s*[\{\[\"\'\w])/g, ''));
            my.vm.items.push(entry);
            $('#li_' + entry.PostingId).css('color', 'red');
        });

        // my.waitingDialog.hide();
    }).fail(function (jqXHR, textStatus) {
        // my.waitingDialog.hide();
    });
};

function advance(btn) {

    btn.html('Um momento...').prop('disabled', true);

    my.userInfo = JSON.parse(amplify.store.sessionStorage(document.location.host + "_user"));

    var params = {
        ConversationId: my.postingId,
        FromUserId: my.userInfo.UserId,
        Msg: $('#msgTextarea').val().trim(), // messageHtmlContent,
        PortalId: 0,
        PriorityValueAmount: $('#txtPriorityValue').val().length > 0 ? $('#txtPriorityValue').val() : 0,
        PriorityDeliveryAmount: $('#txtPriorityDelivery').val().length > 0 ? $('#txtPriorityDelivery').val() : 0,
        ToUserId: my.vm.userId(),
        ConnId: my.hub.connection.id
    }

    $.ajax({
        type: 'POST',
        url: '/dnn/desktopmodules/w1b/api/postings/SendPostingMsg',
        data: params
    }).done(function (data) {
        if (data.Result.indexOf("success") !== -1) {
            $('#msgTextarea').val('');
            $('#hiddenMsgInput').addClass('hidden');
            if (!$('.fa-envelope-square').closest('span').hasClass('hidden')) {
                $('.fa-envelope-square').closest('span').addClass('hidden');
            }
            $('#divMsgSent').removeClass('hidden');
        } else {
            console.log(data.Result);
        }
    }).fail(function (jqXHR, textStatus) {
        console.log(jqXHR.responseText);
    }).always(function () {
        btn.html('Enviar').prop('disabled', false);
    });
}

function expandMsg() {
    if (this.value !== '1') {
        if (amplify.store.sessionStorage(document.location.host + "_user_loggedin") > 0) {
            $('#hiddenMsgInput').removeClass('hidden');
            $.scrollTo($('#hiddenMsgInput'), 1000, {
                offset: -200,
                easing: 'swing'
            });
            this.value = '1';
        } else {
            BootstrapDialog.show({
                title: 'É necessário estar logado!',
                message: $('<div></div>').load('templates/loginForm.html'),
                onshow: function (dialogRef) {
                    window.setTimeout(function () {
                        $('#btnLogin').click(function (e) {
                            if (e.clientX === 0) {
                                return false;
                            }
                            e.preventDefault();

                            var $button = e.target;
                            $button.disabled = true;
                            $button.innerHTML = 'Um momento...'

                            dialogRef.enableButtons(false);
                            dialogRef.setClosable(false);

                            //if (!validator.validate('#loginForm')) {
                            if ($('#loginTextBox').val() == '' && $('#passwordTextBox').val() == '') {
                                $(".loginStatus").html('Favor preencher todos campos obrigatórios.');
                            } else {

                                var params = {
                                    portalId: 0,
                                    userName: $('#loginTextBox').val(),
                                    password: $('#passwordTextBox').val()
                                };

                                $.ajax({
                                    type: 'POST',
                                    url: '/dnn/desktopmodules/w1b/api/services/Login',
                                    data: params
                                }).done(function (data) {
                                    if (data.UserId) {
                                        amplify.store.sessionStorage(document.location.host + "_user", JSON.stringify(data));
                                        amplify.store.sessionStorage(document.location.host + "_user_loggedin", data.UserId);

                                        my.userInfo = JSON.parse(amplify.store.sessionStorage(document.location.host + "_user"));

                                        $('#aLogin').text(my.userInfo.DisplayName);
                                        $('#aLogin').prop('onclick', 'location="minhaConta"');

                                        $('#aRegister').text('Sair');
                                        $('#aRegister').prop('href', 'sair');

                                        $('#aContact').removeClass('hidden');
                                        $('#aUserPostings').removeClass('hidden');

                                        if (my.userInfo.Verified != null || my.userInfo.Verified == true) {
                                            $('.notisCount').removeClass('hidden');
                                        }

                                        my.hub.client.connectedUser = function () {
                                            my.hub.server.join({
                                                UserId: my.userInfo.UserId,
                                                PortalId: 0,
                                                GroupName: my.userInfo.UserId.toString()
                                            });
                                        };

                                        $.connection.hub.start()
                                            .done(function () {
                                                my.hub.server.clientsJoin(my.userInfo.UserId.toString());
                                                console.log('Now connected, connection ID=' + $.connection.hub.id);
                                            })
                                            .fail(function () {
                                                console.log('Could not Connect!');
                                            });

                                        if (my.userInfo.Verified == false) {
                                            $('.container').eq(0).prepend('<div class="alert alert-warning" role="alert"><button class="close" data-dismiss="alert" type="button">×</button>Você está usando uma conta que ainda não foi validada. Por favor, valide sua conta utilizando o link contido no e-mail de validação que lhe foi enviado.</div>')
                                            if (!$('.show-number').hasClass('hidden')) {
                                                $('.show-number').addClass('hidden');
                                            }
                                        }

                                        if (my.userInfo.AccountInfo != null) {
                                            // switch (my.userInfo.AccountInfo.AccountLevel) {
                                            //     case 1:
                                            //         $('.sign-in').find('i').attr({
                                            //             'class': 'glyphicon glyphicon-star accountStar bronze',
                                            //             'title': 'Esta conta tem um plano Bronze'
                                            //         });
                                            //         break;
                                            //     case 2:
                                            //         $('.sign-in').find('i').attr({
                                            //             'class': 'glyphicon glyphicon-star accountStar silver',
                                            //             'title': 'Esta conta tem um plano Prata'
                                            //         });
                                            //         break;
                                            //     default:
                                            //         $('.sign-in').find('i').attr({
                                            //             'class': 'glyphicon glyphicon-star accountStar gold',
                                            //             'title': 'Esta conta tem um plano Ouro'
                                            //         });
                                            // }
                                        } else {
                                            $('#premiumAccount').removeClass('hidden');
                                        }

                                        if ((my.userInfo.UserId !== my.vm.userId())) {
                                            $.getJSON('/dnn/desktopmodules/w1b/api/postings/GetWaitingMsgs?userId=' + my.userInfo.UserId + '&postingId=' + my.postingId, function (msgs) {
                                                if (msgs) {
                                                    $('#btnAddMsg').prop('disabled', true);
                                                    $('#divMsgResponded').removeClass('hidden');
                                                    if (!$('.fa-envelope-square').closest('span').hasClass('hidden')) {
                                                        $('.fa-envelope-square').closest('span').addClass('hidden');
                                                    }
                                                } else {
                                                    if (!$('#divMsgResponded').hasClass('hidden')) {
                                                        $('#divMsgResponded').addClass('hidden');
                                                    }

                                                    $('#hiddenMsgInput').removeClass('hidden');
                                                    $.scrollTo($('#hiddenMsgInput'), 1000, {
                                                        offset: -300,
                                                        easing: 'swing'
                                                    });
                                                    this.value = '1';
                                                }
                                            });
                                        } else {
                                            if (!$('.fa-envelope-square').closest('span').hasClass('hidden')) {
                                                $('.fa-envelope-square').closest('span').addClass('hidden');
                                            }
                                        }

                                        dialogRef.close();

                                        $.get('/dnn/desktopmodules/w1b/api/postings/GetNotificationsCount', function (msgs) {
                                            //$('#aLogin').find('.notisCount').html(msgs);
                                            $('.sign-in').find('li.notisCount').find('.badge').text(msgs);
                                        });

                                        window.setInterval("keepSessionAlive()", 900000);
                                    } else {
                                        $(".loginStatus").html(data.Result);
                                    }
                                }).fail(function (jqXHR, textStatus) {
                                    console.log(jqXHR.responseText);
                                }).always(function () {
                                    dialogRef.enableButtons(true);
                                    dialogRef.setClosable(true);
                                    $button.disabled = false;
                                    $button.innerHTML = 'Login';
                                });
                            }
                        });
                    }, 1000);
                },
                buttons: [{
                    label: 'Fechar',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }, {
                    label: 'Cadastre-se',
                    cssClass: 'btn-info',
                    action: function () {
                        window.location.href = 'login?cadastro=1'
                    }
                }]
            });
        }
    } else {
        $('#hiddenMsgInput').addClass('hidden');
        this.value = '0';
    }
}

function getPosting() {
    $.getJSON('/dnn/desktopmodules/w1b/api/postings/GetPosting?id=' + my.postingId, function (data) {
        if (data) {

            $('.slider').parent().parent().removeClass('hidden');

            if (!$('.category-info').parent().parent().hasClass('hidden')) {
                $('.category-info').parent().parent().addClass('hidden');
            }

            $('.banner-social').css('visibility', 'hidden');

            $('.msgHolder').parent().parent().removeClass('hidden');

            if (!$('.cta').hasClass('hidden')) {
                $('.cta').addClass('hidden');
            }

            if (data.UserId === my.userInfo.UserId) {
                if (!$('.fa-envelope-square').closest('span').hasClass('hidden')) {
                    $('.fa-envelope-square').closest('span').addClass('hidden');
                }
            }

            my.vm.userId(data.UserId);
            my.vm.title(data.Title);
            my.vm.postingDescription(data.PostingDescription);
            my.vm.posterDisplayName(data.PosterDisplayName);
            my.vm.priorityValue(data.PriorityValue);
            my.vm.priorityDelivery(data.PriorityDelivery);
            my.vm.qty(data.Quantity);
            my.vm.createdOnDate(data.CreatedOnDate);
            my.vm.condition(data.Condition);
            my.vm.postingCondition(data.PostingCondition);
            my.vm.priorityValueAmount(data.PriorityValueAmount > 0 ? data.PriorityValueAmount : '');
            my.vm.priorityDeliveryAmount(data.PriorityDeliveryAmount > 0 ? data.PriorityDeliveryAmount : '');
            my.vm.fileId(data.FileId);
            my.vm.imageUrl(data.ImageUrl);
            my.vm.folderName(data.FolderName);
            my.vm.fileName(data.FileName);
            my.vm.filePath(data.FilePath);
            my.vm.premium(data.Premium);
            my.vm.expiryDate(data.ExpiryDate);
            my.vm.accountLevel(data.AccountLevel);
            my.vm.fromWho(data.PosterDisplayName);
            my.vm.sellerPaid(data.SellerPaid);
            my.vm.soldBy(data.SoldBy);
            my.vm.displayDate(moment(data.CreatedOnDate).format('LLL'));
            my.vm.modifiedOnDate(data.ModifiedOnDate);
            my.vm.postingLocales(data.PostingLocales);

            $('#ratingContainer').rateYo('option', 'rating', data.Rating);

            if (data.PriorityValueAmount > 0) {
                $('#divLessValue').html('Menor preço já ofertado: ' + data.PriorityValueAmount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }));
                $('#divOfferedValue').html('<strong>Valor Inicial ofertado:</strong> ' + data.PriorityValueAmount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }));
            }

            if (data.PriorityDeliveryAmount > 0) {
                $('#divLessDelivery').html('Menor prazo já ofertado: ' + data.PriorityDeliveryAmount);
            }

            $(document).prop('title', document.title + ' :: ' + data.Title);

            if (data.PostingMsgs) {
                var mappedPosts = $.map(data.PostingMsgs, function (item) {
                    return new my.PostingMessage(item);
                });
                my.vm.messages(mappedPosts);
            }

            if (amplify.store.sessionStorage(document.location.host + "_user_loggedin") > 0) {
                if (my.userInfo.UserId !== my.vm.userId()) {
                    $.getJSON('/dnn/desktopmodules/w1b/api/postings/GetWaitingMsgs?userId=' + my.userInfo.UserId + '&postingId=' + my.postingId, function (msgs) {
                        if (msgs) {
                            $('#btnAddMsg').prop('disabled', true);
                            $('#divMsgResponded').removeClass('hidden');
                            if (!$('.fa-envelope-square').closest('span').hasClass('hidden')) {
                                $('.fa-envelope-square').closest('span').addClass('hidden');
                            }
                        } else {
                            if (!$('#divMsgResponded').hasClass('hidden')) {
                                $('#divMsgResponded').addClass('hidden');
                            }
                        }
                    });

                    $.getJSON('/dnn/desktopmodules/w1b/api/postings/GetBlockedEntries?userId=' + my.userInfo.UserId + '&postingId=' + my.postingId, function (blocked) {
                        if (blocked) {
                            $('#btnAddMsg').prop('disabled', true);
                            $('#divMsgBlocked').removeClass('hidden');
                        } else {
                            if (!$('#divMsgBlocked').hasClass('hidden')) {
                                $('#divMsgBlocked').addClass('hidden');
                            }
                        }
                    });
                }
            }

            // $.scrollTo($('.cta'), 1000, {
            //     easing: 'swing'
            // });
        }
    });
}