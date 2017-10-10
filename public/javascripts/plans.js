'use sctrict'

$(() => {

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
                confirmButtonText: 'Continuar',
                cancelButtonText: 'Cancelar',
                allowOutsideClick: false
            }).then(function (isConfirm) {
                if (isConfirm) {

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
                        } else {
                            console.log(data.error);
                            $($btn).html("Eu Quero").prop('disabled', false);
                        }
                    }).fail(function (jqXHR, textStatus) {
                        console.log(jqXHR.responseText);
                        $($btn).html("Eu Quero").prop('disabled', false);
                    });
                } else {
                    $($btn).html("Eu Quero").prop('disabled', false);
                }
            }, function (dismiss) {
                // dismiss can be 'cancel', 'overlay', 'close', 'timer'
                if (dismiss === 'cancel') {
                    $($btn).html("Eu Quero").prop('disabled', false);
                }
            });
        }
    });

});