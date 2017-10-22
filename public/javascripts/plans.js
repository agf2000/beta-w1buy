'use sctrict'

$(() => {

    let psId = my.getQuerystring('transaction_id', my.getParameterByName('transaction_id', 0));

    $('.btn-plan').click(function (e) {
        let $btn = this;
        e.preventDefault();

        if (my.userInfo.Street === null || my.userInfo.StreetNumber === null || my.userInfo.Region === null || my.userInfo.City === null || my.userInfo.DocId === null || (my.userInfo.Telephone === null && my.userInfo.Cell === null)) {
            swal({
                title: 'Atualização de Perfil',
                html: 'Caro usuário, o PagSeguro requer algumas informções que precisam ser preenchidas antes de continuar com sua compra. <a href="/contas/cadastro"><u>Acesse sua conta e atualize seu perfil</u></a>.',
                type: 'warning',
                confirmButtonText: 'Fechar'
            });
        } else {

            $($btn).html("Um momento...").prop('disabled', true);

            swal({
                title: 'Pagamento via PagSeguro',
                text: 'Caro usuário, ao continuar, será redirecionado para o site do PagSeguro, onde poderá concluir o pagamento de seu plano com total segurança. Por favor aguarde pela página do PagSeguro.',
                type: 'info',
                showCancelButton: true,
                // confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar',
                allowOutsideClick: false,
                // showLoaderOnConfirm: true,
                preConfirm: function () {
                    return new Promise(function (resolve) {

                        let params = {
                            id: $btn.dataset.id,
                            desc: $btn.dataset.desc,
                            amount: $btn.dataset.amount,
                            buyerName: my.userInfo.FirstName + ' ' + my.userInfo.LastName,
                            buyerEmail: my.userInfo.Email,
                            buyerStreet: my.userInfo.Street,
                            buyerStreetNumber: my.userInfo.StreetNumber,
                            buyerAddressDistrict: my.userInfo.District,
                            buyerCity: my.userInfo.City,
                            buyerRegion: my.userInfo.Region,
                            buyerAddressPostalCode: my.userInfo.PostalCode
                        }

                        if (isNaN(my.userInfo.Cell.replace(/[^0-9]/g, ''))) {
                            if (!(isNaN(my.userInfo.Telephone.replace(/[^0-9]/g, '')))) {
                                params.buyerAreacode = my.userInfo.Telephone.replace(/[^0-9]/g, '').substring(0, 2);
                                params.buyerPhone = my.userInfo.Telephone.replace(/[^0-9]/g, '').substr(my.userInfo.Telephone.replace(/[^0-9]/g, '').length - 8);
                            }
                        } else {
                            params.buyerAreacode = my.userInfo.Cell.replace(/[^0-9]/g, '').substring(0, 2);
                            params.buyerPhone = my.userInfo.Cell.replace(/[^0-9]/g, '').substr(my.userInfo.Cell.replace(/[^0-9]/g, '').length - 9);
                        }

                        $.ajax({
                            type: 'GET',
                            url: '/api/buyPlan',
                            data: params
                        }).done(function (data) {
                            if (!data.error) {
                                window.location.href = data.url;
                                // resolve();
                            } else {
                                console.log(data.error);
                                $($btn).html("Eu Quero").prop('disabled', false);
                            }
                        }).fail(function (jqXHR, textStatus) {
                            console.log(jqXHR.responseText);
                            $($btn).html("Eu Quero").prop('disabled', false);
                        });

                        // $.get('https://api.ipify.org?format=json')
                        //     .done(function (data) {
                        //         swal.insertQueueStep(data.ip)
                        //         resolve()
                        //     })
                    })
                }
            }).then(
                function () {},
                function (dismiss) {
                    // dismiss can be 'cancel', 'overlay', 'close', 'timer'
                    if (dismiss === 'cancel') {
                        $($btn).html("Eu Quero").prop('disabled', false);
                    }
                });
        }
    });

    if (psId) {
        $.ajax({
            type: "POST",
            url: `/api/updatePSAccount?transaction_id=${psId}&userId=${my.userInfo.UserID}&portalId=0&payProvider=pagseguro`,
            success: function (response) {
                if (!response.error) {
                    if (response.status === '3') {

                        $.each(response.records, function (idx, account) {

                            my.userInfo.AccountsInfo.push(account);

                            if (account.AccountType == "seller") {
                                $('.iStars i').eq(0).tooltip('hide').css({
                                    'cursor': 'pointer'
                                }).removeClass('hidden');
                                $('#iStarsMobile i').eq(0).tooltip('hide').removeClass('hidden');
                                // switch (account.AccountLevel) {
                                //     case 1:
                                //         $('#iStars i').eq(0).tooltip('hide').attr({
                                //             'data-original-title': 'Esta conta tem um plano Bronze Vendedor. Clique aqui para configurar seu relatório.',
                                //             'onclick': 'window.location = "/meurelatorio"',
                                //             'class': 'glyphicon glyphicon-star accountStar bronze'
                                //         });
                                //         break;
                                //     case 2:
                                //         $('#iStars i').eq(0).tooltip('hide').attr({
                                //             'data-original-title': 'Esta conta tem um plano Prata Vendedor. Clique aqui para configurar seu relatório.',
                                //             'onclick': 'window.location = "/meurelatorio"',
                                //             'class': 'glyphicon glyphicon-star accountStar silver'
                                //         });
                                //         break;
                                //     case 3:
                                //         $('#iStars i').eq(0).tooltip('hide').attr({
                                //             'data-original-title': 'Esta conta tem um plano Ouro Vendedor. Clique aqui para configurar seu relatório.',
                                //             'onclick': 'window.location = "/meurelatorio"',
                                //             'class': 'glyphicon glyphicon-star accountStar gold'
                                //         });
                                //         break;
                                //     default:
                                //         $('#iStars i').eq(1).tooltip('hide').attr({
                                //             'data-original-title': '',
                                //             'class': 'fa fa-user'
                                //         });
                                //         break;
                                // }
                            } else {
                                $('.iStars i').eq(1).tooltip('hide').removeClass('hidden');
                                $('#iStarsMobile i').eq(1).tooltip('hide').removeClass('hidden');
                                // switch (account.AccountLevel) {
                                //     case 1:
                                //         $('#iStars i').eq(1).tooltip('hide').attr({
                                //             'data-original-title': 'Esta conta tem um plano Bronze Comprador',
                                //             'class': 'glyphicon glyphicon-star accountStar bronze'
                                //         });
                                //         break;
                                //     case 2:
                                //         $('#iStars i').eq(1).tooltip('hide').attr({
                                //             'data-original-title': 'Esta conta tem um plano Prata Comprador',
                                //             'class': 'glyphicon glyphicon-star accountStar silver'
                                //         });
                                //         break;
                                //     case 3:
                                //         $('#iStars i').eq(1).tooltip('hide').attr({
                                //             'data-original-title': 'Esta conta tem um plano Ouro Comprador',
                                //             'class': 'glyphicon glyphicon-star accountStar gold'
                                //         });
                                //         break;
                                //     default:
                                //         $('#iStars i').eq(1).tooltip('hide').attr({
                                //             'data-original-title': '',
                                //             'class': 'fa fa-user'
                                //         });
                                //         break;
                                // }
                            }
                        });

                        swal(
                            'Atualização de Conta',
                            'Sua conta foi atualizada com sucesso.',
                            'info'
                        );
                    } else {
                        swal({
                            title: "Atenção!",
                            html: 'Não foi possível validar seu pagamento no momento. Entre em contato conosco para mais informações, ou tente novamente.',
                            type: "warning",
                            confirmButtonText: "Concluir",
                            allowOutsideClick: false
                        });
                    }
                }
            }
        });
    }
});