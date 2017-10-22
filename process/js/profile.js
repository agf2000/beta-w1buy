'use sctrict'

$(function () {

    PNotify.prototype.options.styling = "bootstrap3";
    my.userInfo = JSON.parse(userInfo);

    if (my.userInfo) {
        if (my.userInfo.CountryId) {
            $('#select2Countries').append($('<option value="' + my.userInfo.CountryId + '" selected>' + my.userInfo.Country + '</option>'));
            $('#select2Countries').trigger("change");
            $('#select2Countries').attr('disabled', true);
        }
        if (my.userInfo.DocId) {
            $('#txtSSN').attr({
                'readonly': true
            });
        }
        $('#txtFirstName, #txtLastName').attr({
            'readonly': true
        });
    }

    function toggleChevron(e) {
        $(e.target)
            .prev('.panel-heading')
            .find("i.indicator")
            .toggleClass('glyphicon-chevron-down glyphicon-chevron-up');
    };

    $('#editAccount').on('hidden.bs.collapse', toggleChevron);
    $('#editAccount').on('shown.bs.collapse', toggleChevron);

    $('#txtTelephone').mask('(00) 0000-0000');
    $('#txtCell').mask('(00) 00000-0000');
    $('#txtBoxPostalCode').mask('00000-000');
    $('#txtSSN').mask('000.000.000-00');

    $('#select2Countries').select2({
        placeholder: 'Selecione seu país de origem',
        language: "pt-BR",
        theme: "bootstrap",
        ajax: {
            url: '/api/lists',
            dataType: 'json',
            data: function (params) {
                return {
                    term: params.term,
                    listname: 'country',
                    pageIndex: params.page,
                    pageSize: 10,
                    sortCol: 'Text',
                    sortOrder: 'ASC'
                };
            },
            processResults: function (data, page) {

                let results = [];

                $.each(data.list, function (i, v) {
                    let o = {};
                    o.id = v.EntryID;
                    o.name = v.Text;
                    o.value = v.Value;
                    results.push(o);
                });

                return {
                    results: results
                };
            },
            cache: true
        },
        minimumInputLength: 1,
        escapeMarkup: function (markup) {
            return markup;
        },
        templateResult: function format(repo) {
            if (repo.loading) return repo.text;
            let markup = '<option value="' + repo.value + '">' + repo.name + '</option>'
            return markup;
        },
        templateSelection: function (people) {
            return people.name || people.text;
        }
    });

    $('#select2Regions').select2({
        placeholder: 'Selecione o estado',
        language: "pt-BR",
        theme: "bootstrap",
        ajax: {
            url: '/api/lists',
            dataType: 'json',
            data: function (params) {
                return {
                    term: params.term,
                    listname: 'region',
                    parentId: $('#select2Countries').select2('data')[0].id || (my.CountryId || 29),
                    pageIndex: params.page,
                    pageSize: 10,
                    sortCol: 'Text',
                    sortOrder: 'ASC'
                };
            },
            processResults: function (data, page) {

                let results = [];

                $.each(data.list, function (i, v) {
                    let o = {};
                    o.id = v.EntryID;
                    o.name = v.Text;
                    o.value = v.Value;
                    results.push(o);
                });

                return {
                    results: results
                };
            },
            cache: true
        },
        minimumInputLength: 1,
        escapeMarkup: function (markup) {
            return markup;
        },
        templateResult: function format(repo) {
            if (repo.loading) return repo.text;
            let markup = '<option value="' + repo.value + '">' + repo.name + '</option>'
            return markup;
        },
        templateSelection: function (people) {
            return people.name || people.text;
        }
    });

    $('#select2Regions').on("select2:select", function (e) {
        if ($('#select2Regions').val() !== null) {
            $.getJSON('/api/lists?listname=city&parentId=' + $('#select2Regions').select2('data')[0].id, function (data) {
                if (data) {
                    if (data.list.length > 0) {
                        $('#txtCity').prop("disabled", true).hide();
                        $("#select2Cities").prop("disabled", false);
                        $('#select2Cities').show();
                    } else {
                        $('#select2Cities').prop("disabled", true);
                        $('#txtCity').prop("disabled", false).show();
                        $('#select2Cities').hide();
                    }
                }
            });
            $('#select2Cities').select2('open');
        }
    });

    $('#select2Cities').select2({
        placeholder: 'Selecione a cidade',
        language: "pt-BR",
        theme: "bootstrap",
        ajax: {
            url: '/api/lists',
            dataType: 'json',
            data: function (params) {
                return {
                    term: params.term,
                    listname: 'city',
                    parentId: $('#select2Regions').select2('data')[0].id || my.userInfo.RegionId,
                    pageIndex: params.page,
                    pageSize: 10,
                    sortCol: 'Text',
                    sortOrder: 'ASC'
                };
            },
            processResults: function (data, page) {

                let results = [];

                $.each(data.list, function (i, v) {
                    let o = {};
                    o.id = v.EntryID;
                    o.name = v.Text;
                    o.value = v.Value;
                    results.push(o);
                });

                return {
                    results: results
                };
            },
            cache: true
        },
        minimumInputLength: 1,
        escapeMarkup: function (markup) {
            return markup;
        },
        templateResult: function format(repo) {
            if (repo.loading) return repo.text;
            let markup = '<option value="' + repo.value + '">' + repo.name + '</option>'
            return markup;
        },
        templateSelection: function (people) {
            return people.name || people.text;
        }
    });

    $('#select2Cities').on("select2:select", function (e) {
        $('#txtBoxStreet').focus();
    });

    $('#btnPostalCode').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        let $this = $(this);

        if ($('#txtBoxPostalCode').val().length > 0) {
            $this.attr('disabled', true);

            $.ajax({
                url: '/api/address?postalCode=' + $('#txtBoxPostalCode').val().replace(/[^\/\d]/g, '')
            }).done(function (data) {
                if (!data.error) {
                    let address = data.address[0];
                    $('#select2Countries').append($('<option value="' + address.countryid + '" selected>' + address.country + '</option>'));
                    $('#select2Countries').trigger("change");

                    $('#select2Regions').append($('<option value="' + address.regionid + '" selected>' + address.region + '</option>'));
                    $('#select2Regions').trigger("change");

                    $('#select2Cities').append($('<option value="' + address.cityid + '" selected>' + address.city + '</option>'));
                    $('#select2Cities').trigger("change");

                    $('#txtBoxStreet').val(address.street);
                    $('#txtBoxDistrict').val(address.district);

                    $('#txtAddressNumber').focus();
                } else {

                    $.ajax({
                        url: 'https://viacep.com.br/ws/' + $('#txtBoxPostalCode').val().replace(/[^\/\d]/g, '') + '/json/'
                    }).done(function (data1) {
                        if (!data1.erro) {
                            $('#select2Countries').append($('<option value="29" selected>Brazil</option>'));
                            $('#select2Countries').trigger("change");

                            $('#select2Regions').append($('<option value="' + my.getStateName(data1.uf) + '" selected>' + my.getStateName(data1.uf) + '</option>'));
                            $('#select2Regions').trigger("change");

                            $('#select2Cities').append($('<option value="' + data1.localidade + '" selected>' + data1.localidade + '</option>'));
                            $('#select2Cities').trigger("change");

                            $('#txtBoxStreet').val(data1.logradouro);
                            $('#txtBoxDistrict').val(data1.bairro);

                            $('#txtAddressNumber').focus();
                        } else {
                            let notice2 = new PNotify({
                                title: 'Atenção!',
                                text: 'Erro ao tentar buscar o CEP. O CEP não existe ou o serivço opcional ViaCEP talvez não esteja disponível no momento.',
                                type: 'error',
                                addclass: 'stack-bottomright',
                                stack: my.stack_bottomright
                            });
                            notice2.get().click(function () {
                                notice2.remove();
                            });
                        }
                    }).fail(function (jqXHR, textStatus) {
                        console.log(jqXHR.responseText);
                        let notice3 = new PNotify({
                            title: 'Atenção!',
                            text: 'Erro ao tentar completar a ação.',
                            type: 'error',
                            animation: 'none',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright
                        });
                        notice3.get().click(function () {
                            notice3.remove();
                        });
                    }).always(function () {
                        $this.attr('disabled', false);
                    });
                }
            }).fail(function (jqXHR, textStatus) {
                console.log(jqXHR.responseText);
                let notice4 = new PNotify({
                    title: 'Atenção!',
                    text: 'Erro ao tentar completar a ação.',
                    type: 'error',
                    animation: 'none',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright
                });
                notice4.get().click(function () {
                    notice4.remove();
                });
            }).always(function () {
                $this.attr('disabled', false);
            });
        }
    });

    $('#btnUpdateUser').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        let $this = $(this);

        // if (($('#txtTelephone').val().length > 0) || ($('#txtCell').val().length > 0)) {

        $this.html("Um momento...").prop('disabled', true);

        let params = {
            portalId: 0,
            userId: my.userInfo.UserID,
            firstName: $('#txtFirstName').val().trim(),
            lastName: $('#txtLastName').val().trim(),
            displayName: $('#txtDisplayName').val().trim(),
            country: $('#select2Countries').select2('data')[0].id,
            region: $('#select2Regions').select2('data')[0].id,
            city: $('#select2Cities').select2('data')[0].id,
            street: $('#txtBoxStreet').val().trim(),
            streetNumber: $('#txtAddressNumber').val().trim(),
            district: $('#txtBoxDistrict').val().trim(),
            postalCode: $('#txtBoxPostalCode').val().replace(/[^\/\d]/g, ''),
            telephone: $('#txtTelephone').val(),
            cell: $('#txtCell').val(),
            docId: $('#txtSSN').val().trim(),
            lastModifiedByUserId: my.userInfo.UserID,
            lastModifiedOnDate: moment().format('YYYY-MM-DD HH:mm')
        };

        $.ajax({
            type: 'PUT',
            url: '/api/updatePerson',
            data: params
        }).done(function (data) {
            if (!data.error) {
                swal({
                    title: "Sucesso!",
                    text: "Cadastro atualizado.",
                    type: "success",
                    showCancelButton: false,
                    confirmButtonText: "Ok",
                    timer: 2000
                }).then(
                    function () {},
                    // handling the promise rejection
                    function (dismiss) {
                        if (dismiss === 'timer') {
                            console.log('I was closed by the timer')
                        }
                    }
                );
                let progress = -1;
                $.each($('#profileForm input'), function (i, item) {
                    if (item.value.length > 1) {
                        progress++;
                    }
                });
                if ($('#select2Cities').val() !== null) {
                    progress++;
                }
                if ($('#select2Regions').val() !== null) {
                    progress++;
                }
                progress = ((progress * 100) / 12).toFixed(0);
                $('#profile-progress-bar').html(`<span>${progress}% Completo</span>`).attr({
                    "aria-valuenow": progress,
                    "aria-valuemin": progress
                }).css({
                    "width": progress
                });
                // style= "width: {{user.Progress}}%;"
            }
        }).fail(function (jqXHR, textStatus) {
            console.log(jqXHR.responseText);
        }).always(function () {
            $this.html('Atualizar').prop('disabled', false);
        });
        // } else {
        //     swal({
        //         title: "Telefones!",
        //         text: "Precisamos que um número de telefone seja preenchido.",
        //         type: "warning",
        //         showCancelButton: false,
        //         confirmButtonText: "Ok",
        //         allowOutsideClick: true
        //     });
        // }
    });

});

let validateCpf = function (ele) {
    let cpfEle = $(ele);
    if (!my.validaCPF(cpfEle.val())) {
        swal({
            title: "Atenção!",
            text: "O CPF inserido não parece ser válido. Por favor corrija antes de prosseguir.",
            type: "warning",
            showCancelButton: false,
            confirmButtonText: "Ok",
            allowOutsideClick: true
        });

        $('#btnUpdateUser').attr('disabled', true);
    } else {
        $('#btnUpdateUser').attr('disabled', false);
    }
};