'use strict'

$(function () {

    // vscode-fold=1
    my.userInfo = JSON.parse(userInfo);

    // Socket.io for messages count indicator    
    let client = io.connect('http://' + window.location.host, {
        path: "/socket.io"
    });
    if (my.userInfo) {
        client.emit('messages', my.userInfo.UserID, function (data) {
            console.log(data);
        });
    }
    client.on('usernames', function (data) {
        $('.newMsgCount').text(parseInt($('.newMsgCount').eq(0).text()) + data);
        my.sendNotification(window.location.protocol + '//' + window.location.host + '/images/logo_small.png', 'W1Buy.com.br', 'Nova mensagem recebida!', 6000, !my.hasFocus);
    });

    // Load user's account information
    // vscode-fold=2
    if (my.userInfo.AccountsInfo !== undefined) {
        if (my.userInfo.AccountsInfo.length > 0) {
            $.each(my.userInfo.AccountsInfo, function (idx, account) {
                if (account.AccountType == "seller") {
                    switch (account.AccountLevel) {
                        case 1:
                            $('#iStars i').eq(0).tooltip('hide').attr({
                                'data-original-title': 'Esta conta tem um plano Bronze Vendedor. Clique aqui para configurar seu relatório.',
                                'onclick': 'window.location = "/meurelatorio"',
                                'class': 'glyphicon glyphicon-star accountStar bronze'
                            });
                            break;
                        case 2:
                            $('#iStars i').eq(0).tooltip('hide').attr({
                                'data-original-title': 'Esta conta tem um plano Prata Vendedor. Clique aqui para configurar seu relatório.',
                                'onclick': 'window.location = "/meurelatorio"',
                                'class': 'glyphicon glyphicon-star accountStar silver'
                            });
                            break;
                        case 3:
                            $('#iStars i').eq(0).tooltip('hide').attr({
                                'data-original-title': 'Esta conta tem um plano Ouro Vendedor. Clique aqui para configurar seu relatório.',
                                'onclick': 'window.location = "/meurelatorio"',
                                'class': 'glyphicon glyphicon-star accountStar gold'
                            });
                            break;
                        default:
                            $('#iStars i').eq(1).tooltip('hide').attr({
                                'data-original-title': '',
                                'class': 'fa fa-user'
                            });
                            break;
                    }
                } else {
                    switch (account.AccountLevel) {
                        case 1:
                            $('#iStars i').eq(1).tooltip('hide').attr({
                                'data-original-title': 'Esta conta tem um plano Bronze Comprador',
                                'class': 'glyphicon glyphicon-star accountStar bronze'
                            });
                            break;
                        case 2:
                            $('#iStars i').eq(1).tooltip('hide').attr({
                                'data-original-title': 'Esta conta tem um plano Prata Comprador',
                                'class': 'glyphicon glyphicon-star accountStar silver'
                            });
                            break;
                        case 3:
                            $('#iStars i').eq(1).tooltip('hide').attr({
                                'data-original-title': 'Esta conta tem um plano Ouro Comprador',
                                'class': 'glyphicon glyphicon-star accountStar gold'
                            });
                            break;
                        default:
                            $('#iStars i').eq(1).tooltip('hide').attr({
                                'data-original-title': '',
                                'class': 'fa fa-user'
                            });
                            break;
                    }

                    $('.expiryDate').removeClass('hidden');
                    $('#txtBoxExpiryDate').prop('required', true);
                    $('.localesFilter').removeClass('hidden');
                    $('.postQty').removeClass('hidden');
                    $('#txtBoxQty').prop('required', true);
                }
            });
        }
    } else {
        $('#iStars i').eq(1).tooltip('hide').attr({
            'data-original-title': '',
            'class': 'fa fa-user'
        });

        $('.postdetails').prepend('<div class="alert alert-info text-center" role="alert"><button class="close" data-dismiss="alert" type="button">×</button><strong>Caro(a) usuário, veja nossos planos e as vantagens de adquiri-los.</strong></div>')
    }

    // vscode-fold=3
    $('a[href="' + window.location.pathname + '"]').addClass('active');

    if (window.location.pathname !== '/contas/minhaconta') {
        if (my.userInfo.Roles != undefined) {
            var match = my.userInfo.Roles.find(function (item) {
                let result = false;
                if (item.rolename == 'Administrators') {
                    result = true;
                };
                return result;
            });

            if (match) {
                $('a[href="/admin"]').removeClass('hidden');
                $('a[href="/admin/anuncios"]').removeClass('hidden');
                $('a[href="/admin/usuarios"]').removeClass('hidden');
            } else {
                $('a[href="/anuncios"]').removeClass('hidden');
                $('a[href="/anuncios/novo"]').removeClass('hidden');
            }
        }
    } else {
        if (my.userInfo.Roles != undefined) {
            var match = my.userInfo.Roles.find(function (item) {
                let result = false;
                if (item.rolename == 'Administrators') {
                    result = true;
                };
                return result;
            });

            if (match) {
                $('a[href="/admin"]').removeClass('hidden');
                $('a[href="/admin/anuncios"]').removeClass('hidden');
                $('a[href="/admin/usuarios"]').removeClass('hidden');

                if (!$('a[href="/contas/meusanuncios"]').hasClass('hidden')) {
                    $('a[href="/contas/meusanuncios"]').addClass('hidden');
                }

                if (!$('a[href="/contas/mensagens"]').hasClass('hidden')) {
                    $('a[href="/contas/mensagens"]').addClass('hidden');
                }

                if (!$('#usersHome').hasClass('hidden')) {
                    $('#usersHome').addClass('hidden');
                }

            }
        }
    }

    my.sendNotification = function (image, title, message, timeout, showOnFocus) {
        // Default values for optional params
        timeout = (typeof timeout !== 'undefined') ? timeout : 0;
        showOnFocus = (typeof showOnFocus !== 'undefined') ? showOnFocus : true;

        // Check if the browser window is focused
        let isWindowFocused = document.querySelector(":focus") === null ? false : true;

        // Check if we should send the notification based on the showOnFocus parameter
        let shouldNotify = !isWindowFocused || isWindowFocused && showOnFocus;

        if (window.webkitNotifications && shouldNotify) {
            // Create the notification object
            let notification = window.webkitNotifications.createNotification(
                image, title, message
            );

            notification.ondisplay = function () {
                playAudio();
            };

            // Display the notification
            notification.show();

            if (timeout > 0) {
                // Hide the notification after the timeout
                setTimeout(function () {
                    notification.cancel()
                }, timeout);
            }
        } else if (window.Notification && shouldNotify) {
            let ffNnotification = new Notification(title, {
                body: message
            });

            ffNnotification.ondisplay = function () {
                playAudio();
            };

            if (timeout > 0) {
                // Hide the notification after the timeout
                setTimeout(function () {
                    ffNnotification.close()
                }, timeout);
            }
        } else {
            let config = {
                nitification: {
                    ntitle: title,
                    nbody: message
                }
            };
            $.wnf(config);
        }
    };

    // Notifications permission request
    // vscode-fold=4
    let notification_support = function () {
        if (window.webkitNotifications && navigator.userAgent.indexOf("Chrome") > -1) {
            if (webkitNotifications.checkPermission() === 1) {
                $("#ask_permission").show();
                $("#ask_permission").on('click', function () {
                    //webkitNotifications.requestPermission();
                    Notification.requestPermission(function (perm) {
                        if (perm === 'granted') {
                            $("#ask_permission").hide();
                        }
                    });
                });
            } else {
                $("#ask_permission").hide();
            }
        } else if (window.Notification) {
            if (window.Notification.permission === 'default' || window.Notification.permission === 'denied') {
                $("#ask_permission").on('click', function () {
                    Notification.requestPermission(function (perm) {
                        if (perm === 'granted') {
                            $("#ask_permission").hide();
                        } else if (perm === 'denied') {
                            alert('Não está sendo possível ativar a visualização de notificações. Veja nas configurações do seu como ativar esta opção.');
                        }
                    });
                });
            } else {
                $("#ask_permission").hide();
            }
        }
    };

    notification_support();

    let currentFile = "";

    function playAudio() {
        let oAudio = document.getElementById('myaudio');
        // See if we already loaded this audio file.
        if ($("#audiofile").val() !== currentFile) {
            oAudio.src = $("#audiofile").val();
            currentFile = $("#audiofile").val();
        }
        let test = $("#myaudio");
        test.src = $("#audiofile").val();
        oAudio.play();
    }
});