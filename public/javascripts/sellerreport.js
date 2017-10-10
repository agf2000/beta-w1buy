'use strict';

$(function () {

    $('[data-toggle="tooltip"]').tooltip();
    my.userInfo = JSON.parse(userInfo);

    kendo.culture("pt-BR");
    kendo.culture().calendar.firstDay = 1;

    $.each(my.userInfo.AccountsInfo, function (idx, account) {
        if (account.AccountType == "seller") {

            $('a[href="meurelatorio"]').parent().removeClass('hidden');

            my.localesLimit = 0;
            my.tagsLimit = 0;

            switch (account.AccountLevel) {
                case 1:
                    my.plansLimit = 3;
                    my.localesLimit = 3;
                    my.tagsLimit = 3;
                    break;
                case 2:
                    my.plansLimit = 7;
                    my.localesLimit = 7;
                    my.tagsLimit = 7;
                    break;
                default:
                    my.plansLimit = 20;
                    my.localesLimit = 20;
                    my.tagsLimit = 20;
            }

            $('#selectLocales').tagsinput({
                maxTags: my.localesLimit,
                itemValue: 'LocaleId',
                itemText: 'City',
                freeInput: false
            });

            $('#txtBoxKeywords').tagsinput({
                maxTags: my.tagsLimit,
                freeInput: false,
                trimValue: true
            });

            my.localesRemains = 0;
            my.tagsRemains = 0;
            my.plansRemains = 0;

            $('#btnAddLocale span').text(my.localesRemains + '/' + my.localesLimit);
            $('#btnAddTags span').text(my.tagsRemains + '/' + my.tagsLimit);
            $('#btnAddReportPlan span').text(my.plansRemains + '/' + my.plansLimit);
        }
    });

    $('#select2States').select2({
        placeholder: 'Selecione o estado',
        language: "pt-BR",
        ajax: {
            url: '/api/lists',
            dataType: 'json',
            data: function (params) {
                return {
                    term: params.term,
                    listname: 'region',
                    parentId: my.userInfo.CountryId,
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

    $('#select2States').on("select2:select", function (e) {
        if ($('#select2States').val() !== null) {
            $('#select2Cities').prop('disabled', false);
            $('#select2Cities').select2('open');
        }
    });

    $('#select2Cities').select2({
        placeholder: 'Selecione a Cidade',
        language: "pt-BR",
        ajax: {
            url: '/api/lists',
            dataType: 'json',
            data: function (params) {
                return {
                    term: params.term,
                    listname: 'city',
                    parentId: $('#select2States').select2('data')[0].id,
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
        if ($('#select2Cities').val() !== null) {
            $('#btnAddLocale').next('span').html('<i class="glyphicon glyphicon-chevron-left"></i> Agora clique em adicionar');
        }
    });

    $('#btnAddLocale').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        if (my.localesRemains == my.localesLimit) {
            swal({
                title: "Atenção!",
                text: "O limite de localidades foi alcançado.",
                type: "error",
                showCancelButton: false,
                confirmButtonText: "Ok"
            });
        } else {
            if ($('#select2Cities').val() == '') {
                swal({
                    title: "Atenção!",
                    text: "É necessário que escolha um estado então uma cidade.",
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "Ok"
                });
            } else {
                $('#selectLocales').tagsinput('add', {
                    LocaleId: $('#select2Cities').select2('data')[0].id,
                    City: $('#select2Cities').select2('data')[0].name,
                    Region: $('#select2States').select2('data')[0].value
                });
                my.localesRemains++;
                $('#select2States').select2('val', '');
                $('#select2Cities').select2('val', '');
                $('#btnAddLocale span').text(my.localesRemains + '/' + my.localesLimit);
                $('#btnAddLocale').next('span').html('');
            }
        }
    });

    $('#selectLocales').on('beforeItemRemove', function (event) {
        my.localesRemains = my.localesRemains - 1;
        $('#btnAddLocale span').text(my.localesRemains + '/' + my.localesLimit);
    });

    $('#btnAddTags').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        if (my.tagsRemains == my.tagsLimit) {
            swal({
                title: "Atenção!",
                text: "O limite de produtos foi alcançado.",
                type: "error",
                showCancelButton: false,
                confirmButtonText: "Ok"
            });
        } else {
            if ($('#txtBoxKeyword').val().length > 1) {
                $('#txtBoxKeywords').tagsinput('add', $('#txtBoxKeyword').val());
                $('#txtBoxKeyword').val('');
                $('#txtBoxKeyword').focus();
                my.tagsRemains++;
                $('#btnAddTags span').text(my.tagsRemains + '/' + my.tagsLimit);
            }
        }
    });

    $('#txtBoxKeywords').on('beforeItemRemove', function (event) {
        my.tagsRemains = my.tagsRemains - 1;
        $('#btnAddTags span').text(my.tagsRemains + '/' + my.tagsLimit);
    });

    $('#btnSaveReportPlan').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        if (my.plansRemains == my.plansLimit) {
            swal({
                title: "Atenção!",
                text: "O limite de planos foi alcançado.",
                type: "error",
                showCancelButton: false,
                confirmButtonText: "Ok"
            });
        } else {
            if (my.accountLevel != 3) {
                if (($('#selectLocales').tagsinput('items').length == 0) || ($('#txtBoxKeywords').tagsinput('items').length == 0)) {
                    swal({
                        title: "Atenção!",
                        text: "É necessário que insira no mínimo uma palavra chave e uma localidade.",
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Ok"
                    });
                    return false;
                } else {
                    if ($('#txtBoxKeywords').tagsinput('items').length == 0) {
                        swal({
                            title: "Atenção!",
                            text: "É necessário que insira no mínimo uma palavra chave.",
                            type: "error",
                            showCancelButton: false,
                            confirmButtonText: "Ok"
                        });
                        return false;
                    }
                }
            }

            var locales = []
            $.each($('#selectLocales').tagsinput('items'), function (idx, locale) {
                locales.push({
                    LocaleId: locale.LocaleId,
                    City: locale.City,
                    Region: locale.Region
                });
            });

            var words = []
            $.each($('#txtBoxKeywords').val().split(','), function (idx, word) {
                words.push({
                    KeywordName: word
                });
            });

            $.ajax({
                type: my.sellerReportPlanId > 0 ? "PUT" : "POST",
                contentType: 'application/json; charset=utf-8',
                url: my.sellerReportPlanId > 0 ? "/api/updateSellerReportPlan" : "/api/addSellerReportPlan",
                data: JSON.stringify({
                    SellerReportPlanId: my.sellerReportPlanId,
                    UserId: my.userInfo.UserID,
                    SellerKeywords: words,
                    SellerLocales: locales
                })
            }).done(function (response) {
                if (response != null) {
                    if (!response.error) {

                        if (my.sellerReportPlanId) {
                            swal({
                                title: "Sucesso!",
                                text: "Plano Atualizado.",
                                type: "success",
                                showCancelButton: false,
                                confirmButtonText: "Ok",
                                timer: 8000
                            });

                            $('#reportPlansGrid').data('kendoGrid').dataSource.pushUpdate({
                                SellerReportPlanId: my.sellerReportPlanId,
                                SellerKeywordsCount: words.length,
                                // SellerKeywords: words,
                                SellerLocalesCount: locales.length
                                // SellerLocales: locales,
                            });
                        } else {
                            swal({
                                title: "Sucesso!",
                                text: "Plano Inserido.",
                                type: "success",
                                showCancelButton: false,
                                confirmButtonText: "Ok",
                                timer: 8000
                            });

                            $('#reportPlansGrid').data('kendoGrid').dataSource.add({
                                SellerReportPlanId: response.SellerReportPlanId,
                                SellerKeywordsCount: words.length,
                                // SellerKeywords: words,
                                SellerLocalesCount: locales.length,
                                // SellerLocales: locales,
                                CreatedOnDate: moment(new Date()).format('DD/MM/YYYY')
                            });
                        }

                        my.sellerReportPlanId = 0;
                        my.localesRemains = 0;
                        $('#btnAddLocale span').text(my.localesRemains + '/' + my.localesLimit);
                        my.tagsRemains = 0;
                        $('#btnAddTags span').text(my.tagsRemains + '/' + my.tagsLimit);
                        $('#selectLocales').tagsinput('removeAll');
                        $('#txtBoxKeywords').tagsinput('removeAll');
                        $('#reportPlansGrid').data('kendoGrid').refresh();
                        $('#reportPlanForm').removeClass('in');
                        $('#btnCancelEditReportPlan').addClass('hidden');
                    }
                }
            }).fail(function (jqXHR, textStatus) {
                console.log(jqXHR.responseText);
            }).always(function () {
                // optional...            
            });
        }
    });

    var reportPlansTransport = {
        read: {
            url: '/api/getSellerReportPlans?userId=' + my.userInfo.UserID
        }
    };

    var reportPlansDataSource = {
        transport: reportPlansTransport,
        serverSorting: true,
        sort: {
            field: "SellerReportPlanId",
            dir: "DESC"
        },
        schema: {
            model: {
                id: 'SellerReportPlanId',
                fields: {
                    SellerReportPlanId: {
                        editable: false,
                        nullable: false
                    },
                    SellerKeywordsCount: {
                        type: 'number'
                    },
                    SellerLocalesCount: {
                        type: 'number'
                    },
                    CreatedOnDate: {
                        type: "date",
                        format: "{0:g}"
                    }
                }
            }
        }
    };

    $('#reportPlansGrid').kendoGrid({
        dataSource: reportPlansDataSource,
        columns: [{
                field: "SellerReportPlanId",
                title: "Código.",
                width: 75,
                hidden: true
            },
            {
                field: "SellerKeywordsCount",
                title: "Produtos",
                template: 'Contém #= SellerKeywordsCount # Produto(s)'
            },
            {
                field: "SellerLocalesCount",
                title: "Localidades",
                template: 'Contém #= SellerLocalesCount # Localidade(s)'
            },
            {
                field: "CreatedOnDate",
                title: "Cadastrado Em",
                width: 150,
                format: '{0:d}'
            },
            {
                command: [{
                        name: 'edit',
                        text: {
                            edit: " ",
                            cancel: " ",
                            update: " "
                        },
                        title: " ",
                        click: function (e) {
                            e.preventDefault();

                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));

                            if (dataItem) {

                                my.sellerReportPlanId = dataItem.SellerReportPlanId;

                                $.getJSON('/api/getSellerReportPlan?planId=' + my.sellerReportPlanId, function (data) {
                                    $.each(data[0].Keywords, function (idx, word) {
                                        $('#txtBoxKeywords').tagsinput('add', word.KeywordName);
                                        my.tagsRemains++;
                                        $('#btnAddTags span').text(my.tagsRemains + '/' + my.tagsLimit);
                                    });

                                    $.each(data[0].Locales, function (idx, locale) {
                                        $('#selectLocales').tagsinput('add', {
                                            LocaleId: locale.LocaleId,
                                            City: locale.City,
                                            Region: locale.Region
                                        });
                                        my.localesRemains++;
                                        $('#btnAddLocale span').text(my.localesRemains + '/' + my.localesLimit);
                                    });
                                });

                                $('.k-grid-edit').addClass('hidden');
                                $('#btnCancelEditReportPlan').removeClass('hidden');

                                if (!$('#reportPlanForm').hasClass('in')) {
                                    $('#reportPlanForm').addClass('in');
                                }
                            }
                        }
                    },
                    {
                        name: 'remove',
                        text: {
                            edit: "",
                            cancel: "",
                            update: ""
                        },
                        title: "",
                        class: '',
                        iconClass: 'fa fa-remove',
                        click: function (e) {
                            e.preventDefault();

                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            if (dataItem) {

                                swal({
                                    title: 'Tem certeza?',
                                    text: "Esta ação não poderá ser revertida!",
                                    type: 'question',
                                    showCancelButton: true,
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: "Sim, quero excluir!",
                                    cancelButtonText: "Não, cancele!",
                                    closeOnConfirm: true,
                                    closeOnCancel: true
                                }).then(function (isConfirm) {
                                    if (isConfirm) {

                                        $.ajax({
                                            type: 'DELETE',
                                            url: '/api/removeSellerReportPlan?planId=' + dataItem.SellerReportPlanId
                                        }).done(function (data) {
                                            if (data.Result.indexOf("success") !== -1) {
                                                swal({
                                                    title: "Sucesso!",
                                                    text: "Plano excluido.",
                                                    type: "success",
                                                    showCancelButton: false,
                                                    confirmButtonText: "Ok",
                                                    timer: 8000
                                                });
                                                my.sellerReportPlanId = 0;
                                                $('#reportPlansGrid').data('kendoGrid').dataSource.remove(dataItem);
                                            } else {
                                                swal({
                                                    title: "Erro!",
                                                    text: "Erro ao tentar completar a ação. <br />" + response.Result,
                                                    type: "error",
                                                    showCancelButton: false,
                                                    confirmButtonText: "Ok",
                                                    timer: 8000
                                                });
                                            }
                                        }).fail(function (jqXHR, textStatus) {
                                            console.log(jqXHR.responseText);
                                        });
                                    } else {
                                        swal({
                                            title: "Atenção!",
                                            text: "Nada foi excluido.",
                                            type: "warning",
                                            showCancelButton: false,
                                            confirmButtonText: "Ok",
                                            timer: 8000
                                        });
                                    }
                                });
                            }
                        }
                    },
                ],
                title: "&nbsp;",
                width: 100
            }
        ],
        pageable: false,
        dataBound: function () {
            var grid = this;

            if (grid.dataSource.view().length) {
                my.plansRemains = grid.dataSource.view().length;
                $('#btnAddReportPlan span').text(grid.dataSource.view().length + '/' + my.plansLimit);
            }
        }
    });

    $('#btnCancelEditReportPlan').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        my.sellerReportPlanId = 0;
        my.localesRemains = 0;
        $('#btnAddLocale span').text(my.localesRemains + '/' + my.localesLimit);
        my.tagsRemains = 0;
        $('#btnAddTags span').text(my.tagsRemains + '/' + my.tagsLimit);
        $('#selectLocales').tagsinput('removeAll');
        $('#txtBoxKeywords').tagsinput('removeAll');
        $('#reportPlansGrid').data('kendoGrid').refresh();
        $('.k-grid-edit').removeClass('hidden');
        $('#reportPlanForm').removeClass('in');
        $('#btnCancelEditReportPlan').addClass('hidden');
    });

    // $('.glyphicon-question-sign').webuiPopover({
    //     placement: 'right',
    //     trigger: 'hover'
    // });
});

var dataSourceExtensions = {
    updateField: function (e) {
        var ds = this;
        $.each(ds._data, function (idx, record) {
            if (record[e.keyField] == e.keyValue) {
                ds._data[idx][e.updateField] = e.updateValue;
                ds.read(ds._data);
                return false;
            }
        });
    }
};

$.extend(true, kendo.data.DataSource.prototype, dataSourceExtensions);