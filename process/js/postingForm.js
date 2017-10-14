'use sctrict'

$(function () {

    // vscode-fold=1
    PNotify.prototype.options.styling = "bootstrap3";

    my.postingId = 0;
    let uri = window.location.pathname.split('/');
    my.postingId = (isNaN(uri[uri.length - 2]) ? 0 : uri[uri.length - 2]);

    my.selectedLocales = [];

    $('#txtBoxKeywords').tagsinput({
        allowDuplicates: false,
        freeInput: false
    });

    my.picker = new Pikaday({
        field: $('#txtBoxExpiryDate')[0],
        format: 'D MMM YYYY',
        minDate: moment().toDate(),
        theme: 'dark-theme',
        onSelect: function () {
            console.log(this.getMoment().format('D/M/YYYY'));
        },
        i18n: {
            previousMonth: 'Previous Month',
            nextMonth: 'Next Month',
            months: ['Janairo', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            weekdays: ['Somingo', 'Segunda', 'Quinta', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
            weekdaysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
        }
    });

    // with plugin options
    $('#inputImages').fileinput({
        language: 'pt-BR',
        showUpload: false,
        previewFileType: 'any',
        uploadAsync: true,
        maxFileCount: 5,
        allowedFileExtensions: ["jpg", "png"]
    });

    $('input:radio[name=prodServ]').change(function () {
        if (this.value == 2) {
            $('.radioCondition, .checkPriority').hide();
        } else {
            $('.radioCondition, .checkPriority').show();
        }
    });

    $("#txtBoxTitle").on('keyup', function () {
        if (this.value.length) {
            let words = this.value.match(/\S+/g).length;

            if (words > 10) {
                // Split the string on first 200 words and rejoin on spaces
                let trimmed = $(this).val().split(/\s+/, 10).join(" ");
                // Add a space at the end to make sure more typing creates new words
                $(this).val(trimmed + " ");
            }
        }
    });

    $("#postTextArea").on('keyup', function () {
        if (this.value.length) {
            let words = this.value.match(/\S+/g).length;

            if (words > 60) {
                // Split the string on first 200 words and rejoin on spaces
                let trimmed = $(this).val().split(/\s+/, 50).join(" ");
                // Add a space at the end to make sure more typing creates new words
                $(this).val(trimmed + " ");
            } else {
                $('#display_count').text(words);
                $('#word_left').text(50 - words);
            }
        }
    });

    $('#txtBoxTitle').focusout(function (e) {
        if (this.value.length) {

            let titleWords = $('#txtBoxTitle').val().toLowerCase().strip().replace(/[0-9]/g, '').split(" ");

            $('#txtBoxKeywords').tagsinput('removeAll');

            for (let i = 0; i < titleWords.length; i++) {
                if (my.prepData.split(',').indexOf(titleWords[i].replace(/\W/g, '')) == -1) {
                    $('#txtBoxKeywords').tagsinput('add', titleWords[i]);
                }
            };

            // if ($('#txtBoxKeywords').val().length > 0) {
            //     $('#txtBoxKeywords').tagsinput('add', $('#txtBoxTitle').val().toLowerCase().strip());
            //     $('#divKeywords').removeClass('hidden');
            // } else {
            //     $('#divKeywords').addClass('hidden');
            // }
        }
    });

    $('#btnSavePost').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        if ($('#txtBoxTitle').val().length && $('#postTextArea').val().length && $('#txtBoxQty').val().length) {

            // let $btn = $(this);
            $('#btnSavePost').text('Um momento...').prop('disabled', true);

            if (my.selectedLocales.length === 0) {
                my.selectedLocales.push({
                    localeId: my.userInfo.CityId,
                    city: my.userInfo.City,
                    region: my.userInfo.Region,
                    quantity: 1
                });
            }

            var postingData = new FormData($('#postingForm')[0]);

            postingData.append('postingId', my.postingId);
            postingData.append('portalId', 0);
            postingData.append('postingType', $('input[name=prodServ]:checked').val());
            postingData.append('postingCondition', $('input[name=condition]:checked').val());
            postingData.append('priorityValue', $('input:checkbox:eq(0)').is(':checked'));
            postingData.append('priorityDelivery', $('input:checkbox:eq(1)').is(':checked'));
            postingData.append('postingLocales', JSON.stringify(my.selectedLocales));
            postingData.append('keywords', $('#txtBoxKeywords').val());

            if (my.picker.getDate()) {
                postingData.append('expiryDate', my.picker.getMoment().format('YYYY-MM-DD'));
            }

            postingData.append('createdOnDate', moment().format('YYYY-MM-DD HH:mm'));
            postingData.append('modifiedOnDate', moment().format('YYYY-MM-DD HH:mm'));

            $.ajax({
                type: (my.postingId > 0 ? 'PUT' : 'POST'),
                contentType: false,
                processData: false,
                dataType: 'json',
                url: (my.postingId > 0 ? '/api/updatePosting' : '/api/addPosting'),
                data: postingData
            }).done(function (data) {
                if (!data.error) {

                    let msgTitle = 'Anúncio inserido com sucesso!';

                    if (my.postingId > 0) {
                        msgTitle = 'Anúncio atualizado com sucesso!';
                    }

                    if ($('#btnGetPlans').hasClass('hidden')) {
                        BootstrapDialog.show({
                            title: msgTitle,
                            type: BootstrapDialog.TYPE_SUCCESS,
                            message: '',
                            buttons: [{
                                label: 'Ver Anúncio inserido',
                                cssClass: 'btn-primary',
                                action: function () {
                                    window.location.href = '/anuncios/' + (my.postingId || data.PostingId) + '/' + my.userInfo.UserID;
                                }
                            }]
                        });
                    } else {
                        BootstrapDialog.show({
                            title: msgTitle,
                            type: BootstrapDialog.TYPE_SUCCESS,
                            message: '',
                            buttons: [{
                                label: 'Anúncie de maneira especial',
                                cssClass: 'btn btn-orange pull-left',
                                action: function () {
                                    window.location.href = '/planos-comprador'
                                }
                                // }, {
                                //     label: 'Ver Meus Anúncios',
                                //     cssClass: 'btn',
                                //     action: function () {
                                //         window.location.href = '/meusAnuncios'
                                //     }
                            }, {
                                label: 'Ver Anúncio inserido',
                                cssClass: 'btn-primary',
                                action: function () {
                                    window.location.href = '/anuncios/' + (my.postingId || data.PostingId) + '/' + my.userInfo.UserID;
                                }
                            }]
                        });
                    }

                    $('input[name=prodServ]:eq(0)').prop('checked', true);
                    $('#txtBoxTitle').val('');
                    $('input[name=condition]:eq(2)').prop('checked', true);
                    $('#txtBoxKeywords').tagsinput('removeAll');
                    $('#selectLocales').tagsinput('removeAll');
                    $('input:checkbox').prop('checked', false);
                    $('#postTextArea').val('');
                    $('#word_left').html(50);
                    $('#display_count').html(0);
                    $('#divKeywords').addClass('hidden');
                    $('#btnLocales span').html(0);
                    my.localeCounter = 0;
                    $('#inputImages').fileinput('clear');

                    // if ($('.date').val()) {
                    //     $('.date').data('datepicker').update(null);
                    // }

                    my.picker.setDate(null);

                    $('#txtBoxQty').val('');
                    // window.history.pushState("", document.title, window.location.pathname);
                    // $btn.text('Publicar');
                    $('#btnSavePost').text('Publicar').prop('disabled', false);
                }
            }).fail(function (jqXHR, textStatus) {
                console.log(jqXHR.responseText);
                // }).always(function () {
                //$this.button('reset');
                // $btn.text('Publicar');
                $('#btnSavePost').text('Publicar').prop('disabled', false);
            });
        } else {
            $('.required').removeClass('hidden');
        }
    });

    $('#btnCancel').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        window.location.href = '/contas/meusanuncios';
    });

    if (!my.userInfo.Region || !my.userInfo.City) {
        $('#alertNoCity').removeClass('hidden');
        $('#btnSavePost').attr({
            disabled: true,
            title: 'Desativado'
        });
    }

    if (my.userInfo.AccountsInfo !== undefined) {
        if (my.userInfo.AccountsInfo.length > 0) {
            $.each(my.userInfo.AccountsInfo, function (idx, account) {
                if (account.AccountType == "buyer") {

                    my.localesLimit = -1;

                    if (account.AccountLevel === 1) {
                        my.localesLimit = 5;
                    }

                    $('#selectLocales').tagsinput({
                        // maxTags: my.localesLimit,
                        itemValue: 'localeId',
                        itemText: 'localeName',
                        freeInput: false
                    });

                    my.localesRemains = 0;
                    my.localeCounter = 0;
                    my.localesQtyCount = 0;

                    $.each(my.selectedLocales, function (idx, locale) {
                        $('#selectLocales').tagsinput('add', {
                            localeId: locale.LocaleId,
                            localeName: locale.City + ' (' + locale.Region + ') Qde: ' + locale.Quantity,
                            city: locale.City,
                            region: locale.Region
                        });

                        my.localesRemains++;
                    });

                    if (account.AccountLevel === 1) {
                        $('#localesCount').text(my.localesRemains + '/' + my.localesLimit);
                    }

                    $('#txtBoxQty').attr({
                        'readonly': true,
                        'title': 'Quantidades por local'
                    });

                    $('#localesFilter').removeClass('hidden');
                    $('#expiryDateDiv').removeClass('hidden');

                    my.isPremium = true;
                } else {
                    if (!my.isPremium) {
                        if (!$('#localesFilter').hasClass('hidden')) {
                            $('#localesFilter').addClass('hidden');
                        }
                        // if (!$('#expiryDateDiv').hasClass('hidden')) {
                        //     $('#expiryDateDiv').addClass('hidden');
                        // }
                        $('#txtBoxQty').attr({
                            'readonly': true,
                            'title': 'Quantidade por Local'
                        });
                    }
                    if (!$('#btnGetPlans').hasClass('hidden')) {
                        $('#btnGetPlans').addClass('hidden');
                    }
                }
            });
        } else {
            if (!$('#localesFilter').hasClass('hidden')) {
                $('#localesFilter').addClass('hidden');
            }
            // if (!$('#expiryDateDiv').hasClass('hidden')) {
            //     $('#expiryDateDiv').addClass('hidden');
            // }
            $('#txtBoxQty').attr({
                'readonly': false,
                'title': 'Quantidade'
            });
        }
    } else {
        if (!$('#localesFilter').hasClass('hidden')) {
            $('#localesFilter').addClass('hidden');
        }
        // if (!$('#expiryDateDiv').hasClass('hidden')) {
        //     $('#expiryDateDiv').addClass('hidden');
        // }
        $('#txtBoxQty').attr({
            'readonly': false,
            'title': 'Quantidade'
        });
    }

    $('#btnGetPlans').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        window.location.href = '/planos-comprador';
    });

    let postInfo;
    if (postingData) {
        postInfo = JSON.parse(postingData);
        getPosting(postInfo);
    }

});

let blink = function (item) {
    $(item).css({
        opacity: 0
    });
    $(item).animate({
        opacity: 1
    }, 200);
    $(item).animate({
        opacity: 0
    }, 200);
    $(item).animate({
        opacity: 1
    }, 200);
    $(item).animate({
        opacity: 0
    }, 200);
    $(item).animate({
        opacity: 1
    }, 200);
};

let openPostingLocales = function () {

    // vscode-fold=2

    $('#localesModal').modal('show');

    $('#localesModal').on('shown.bs.modal', function () {
        $("#select2States").select2('open');

        $('#txtBoxLocaleQty').on('focusin', function () {
            let saveThis = $(this);
            window.setTimeout(function () {
                saveThis.select();
            }, 100);
        });
    });

    let selectedStates = $('#select2States').select2({
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

    selectedStates.on("select2:select", function (e) {
        if ($('#select2States').val() !== null) {
            $('#select2Cities').prop('disabled', false);
            $('#select2Cities').select2('open');
        }
    });

    let selectedCities = $('#select2Cities').select2({
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
        templateResult: function format(item) {
            return item.name || 'Selecione a(s) localidade(s)';
        },
        templateSelection: function format(item) {
            return item.name || 'Selecione a(s) localidade(s)';
        }
    });

    selectedCities.on("select2:select", function (e) {
        if (selectedCities.val() !== null) {
            // $('#localesCount').next('span').html('<i class="glyphicon glyphicon-chevron-left"></i> Acerte a quantidade e clique em Adicionar Localidade');
            // blink('#btnAddLocale');
            $('#txtBoxLocaleQty').focus();
        }
    });

    $('#btnAddLocale').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();
        if (parseInt($('#txtBoxLocaleQty').val()) > 0) {
            let txtValue = parseInt($('#txtBoxLocaleQty').val());
            if (my.localesRemains == my.localesLimit && my.localesLimit !== -1) {
                swal({
                    title: "Atenção!",
                    text: "O limite de localidades foi alcançado.",
                    type: "error",
                    showCancelButton: false,
                    confirmButtonText: "Ok"
                });
            } else {
                if (selectedCities.val() == '') {
                    swal({
                        title: "Atenção!",
                        text: "É necessário que escolha um estado então uma cidade.",
                        type: "error",
                        showCancelButton: false,
                        confirmButtonText: "Ok"
                    });
                } else {

                    $('#selectLocales').tagsinput('add', {
                        localeId: selectedCities.select2('data')[0].id,
                        localeName: selectedCities.select2('data')[0].name + ' (' + selectedStates.select2('data')[0].value + ') Qde: ' + txtValue,
                        city: selectedCities.select2('data')[0].name,
                        region: selectedStates.select2('data')[0].value,
                        quantity: txtValue,
                    });
                }
            }
        } else swal({
            title: "Atenção!",
            text: "É necessário que insira a quantidade.",
            type: "error",
            showCancelButton: false,
            confirmButtonText: "Ok"
        });
    });

    // let yesterday = new Date((new Date()).valueOf() - 1000 * 60 * 60 * 24);

    // $('.date').datepicker({
    //     language: 'pt-BR',
    //     format: 'DD, d MM yyyy'
    // });

    $('#selectLocales').on('itemAdded', function (event) {
        // if (my.selectedLocales.filter(e => e.localeId == event.item.localeId).length > 0) {
        //     alert('Local já inserido!');
        // } else {
        my.selectedLocales.push({
            localeId: event.item.localeId,
            city: event.item.city,
            region: event.item.region,
            quantity: event.item.quantity
        });

        my.localesRemains++;
        my.localesQtyCount = (my.localesQtyCount + parseInt($('#txtBoxLocaleQty').val()));
        $('#txtBoxQty').val(my.localesQtyCount);
        my.localeCounter = (my.localeCounter + 1);
        $('#btnLocales .badge').text(my.selectedLocales.length);

        selectedStates.select2('val', 0);
        selectedCities.select2('val', 0);
        // selectedCities.trigger('change');
        // selectedCities.prop('disabled', true);

        // selectedStates.trigger('change');

        $('#txtBoxLocaleQty').val(1);
        if (my.localesLimit !== -1) {
            $('#localesCount').text(my.localesRemains + '/' + my.localesLimit);
        }

        $('#btnAddLocale').next('span').html('<i class="glyphicon glyphicon-chevron-left"></i> Adicione ' + (my.localesLimit !== -1 ? 'mais' : 'até 5') + ' localidades');
        // $('#btnAddLocale').html('Adicionar mais');

        $('#localesCount').next('span').html('');
        $('#btnCloseLocales').removeClass('hidden');
        // }
    });

    $('#selectLocales').on('beforeItemRemove', function (event) {
        my.localesQtyCount = (my.localesQtyCount > parseInt(event.item.Quantity) ? my.localesQtyCount - parseInt(event.item.Quantity) : 0);
        $('#txtBoxQty').val(parseInt(my.localesQtyCount));
        my.localesRemains = my.localesRemains - 1;
        my.localeCounter = (parseInt(my.localeCounter) - 1);

        if (my.localesLimit !== -1) {
            $('#btnAddLocale').children('span').text(my.localesRemains + '/' + my.localesLimit);
        }

        for (let i = my.selectedLocales.length - 1; i >= 0; i--) {
            if (my.selectedLocales[i].LocaleId === event.item.LocaleId) {
                my.selectedLocales.splice(i, 1);
            }
        }
    });
};

let getPosting = function (data) {

    // $('.date').data('datepicker').update(data.ExpiryDate);

    my.picker.setDate(data.ExpiryDate);

    let $options = $('input:radio[name=prodServ]');
    $options.filter('[value="' + data.PostingType + '"]').prop('checked', true);

    let $conditions = $('input:radio[name=condition]');
    $conditions.filter('[value="' + data.Condition + '"]').prop('checked', true);

    $('#priority-0').prop('checked', data.PriorityValue);
    $('#priority-1').prop('checked', data.PriorityDelivery);

    $.each(data.Keywords, function (i, item) {
        $('#txtBoxKeywords').tagsinput('add', item.KeywordName);
    });

    if (my.isPremium) {
        $.each(data.Locales, function (idx, locale) {
            my.localeCounter = (my.localeCounter + 1);
            my.selectedLocales.push({
                localeId: locale.LocaleId,
                city: locale.City,
                region: locale.Region,
                quantity: locale.Quantity
            });

            my.localesQtyCount = (my.localesQtyCount + locale.Quantity);
            $('#txtBoxQty').val(my.localesQtyCount);
            $('#btnLocales .badge').text(my.localesQtyCount);

            $('#selectLocales').tagsinput('add', {
                localeId: locale.LocaleId,
                localeName: locale.City + ' (' + locale.Region + ') Qde: ' + locale.Quantity,
                city: locale.City,
                region: locale.Region,
                quantity: locale.Quantity,
            });
        });
    }

    $('textarea#postTextArea').val(data.PostingDescription);

    $('label[for="inputImages"]').text('Novas Imagens:');

    $('#btnSavePost').html('Salvar').prop('disabled', false);

    if (data.Locked) {
        swal(
            'Atenção',
            'Este anúncio tem negociações pendentes e não pode ser editado.',
            'warning'
        );
        $('#btnAddPost').prop('disabled', true);
    }
}

let deletePost = function (e) {
    swal({
        title: 'Tem certeza?',
        text: "Todos os dados relacionados a este anuncio serão excluido.",
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Sim, quero excluir!",
        cancelButtonText: "Não, cancele!"
    }).then(function () {
        $.ajax({
            type: 'DELETE',
            url: '/api/removePosting?postingId=' + my.postingId
        }).done(function (data) {
            if (!data.error) {
                my.vm.postings.remove(function (remove) {
                    return remove.postingId == self.postingId;
                });
                swal("Excluido!", "Anúncio excluido com sucesso!.", "success");
            } else {
                swal("Erro ao tentar excluir o anúncio!", "Favor entrar em contato com o administrador do sistema.", "error");
            }
        }).fail(function (jqXHR, textStatus) {
            console.log(jqXHR.responseText);
        });
    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
            swal("Cancelado", "O Anúncio não foi excluido.", "info");
        }
    });
};

// Remove image event
let deleteImage = function (e) {
    swal({
        title: 'Tem certeza?',
        text: "Deseja excluir a imagem?",
        type: 'question',
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Sim, quero excluir!",
        cancelButtonText: "Não, cancele!"
    }).then(function () {
        $.ajax({
            type: 'DELETE',
            url: '/api/removePostingImage?postingFileId=' + data.postingfileid + '&fileName=' + data.filename
        }).done(function (data) {
            if (!data.error) {
                $('img[alt="' + data.filename + '"]')
                swal("Excluido!", "Imagem excluida com sucesso!.", "success");
            } else {
                swal("Erro ao tentar excluir o anúncio!", "Favor entrar em contato com o administrador do sistema.", "error");
            }
        }).fail(function (jqXHR, textStatus) {
            console.log(jqXHR.responseText);
        });
    }, function (dismiss) {
        // dismiss can be 'cancel', 'overlay',
        // 'close', and 'timer'
        if (dismiss === 'cancel') {
            swal("Cancelado", "A imagem não foi excluida.", "info");
        }
    });
};