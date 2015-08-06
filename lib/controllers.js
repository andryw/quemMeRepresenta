'use strict';

/* Controllers */

var houseOfCunhaApp = angular.module('houseOfCunhaApp', ['ui.bootstrap']);

houseOfCunhaApp.controller('ModalInstanceCtrl', function ($scope, $modalInstance, temaToModel) {

    $scope.temaToModel = temaToModel;

    $scope.ok = function () {
        $modalInstance.close();
    };


});

houseOfCunhaApp.controller('ModalDeputadoCtrl', function ($scope, $modalInstance, deputado) {

    $scope.deputado = deputado;

    $scope.ok = function () {
        $modalInstance.close();
    };


});


//We already have a limitTo filter built-in to angular,
//let's make a startFrom filter
houseOfCunhaApp.filter('startFrom', function() {
    return function(input, start,scope) {
        scope.totalItems = input.length;
        start = +start;
        return input.slice(start * scope.pageSize);
    }
});


houseOfCunhaApp.filter('minimoVotacoes', function() {
    return function(input,scope) {

        var votacoesDoCara = _.filter(scope.temas, function(tema){
            return tema.value > -1
        }).length;

        if (votacoesDoCara > 0 && !scope.mostrarPoucos){
            var a = _.filter(input,function (deputado,index){
                return deputado.total > votacoesDoCara / 2;
            });
            return a;
        }else{
            return input;
        }
    }
});

houseOfCunhaApp.controller('VotacoesCtrl', ['$scope',  '$modal','$http', '$filter', function($scope,  $modal, $http,$filter) {


    $scope.collapsed = false;

    $scope.estadoSelecionado = "";

    $scope.estados = [];
    //$scope.deputadosDaParada = [];
    $scope.temas = [];
    $scope.idParse = null;

    $scope.deputados = [];

    $scope.temaToModel = "";

    $scope.totalItems = 10;
    $scope.currentPage = 1;
    $scope.pageSize =15;

    $scope.indexesTemas = [];

    $scope.mostrarPoucos = false;



    $scope.tooltip_semvalor = "Deputado não votou em nenhum dos temas selecionados. Continue votando!"
    $scope.tooltip_art17 = "Eduardo Cunha, por ser presdiente da câmara, não vota (Artigo 17)   ."

    //$scope.$watch("currentPage + numPerPage", function() {
    //    var begin = (($scope.currentPage - 1) * $scope.numPerPage)
    //        , end = begin + $scope.numPerPage;
    //
    //    $scope.deputadosDaParada = $scope.deputados.slice(begin, end);
    //});


    $http.get('dados/estados.json').success(function(data) {

        $scope.estados = data;
    });

    $http.get('dados/deputados_votos2.json').success(function(data) {

        $scope.deputados = data;
        _.map($scope.deputados,function (deputado){
            _.extend(deputado,{"score":-1,"sum":0,"total":0})
        })
        //$scope.deputadosDaParada = $scope.deputados;
        $scope.totalItems = $scope.deputados.length;

    });

    $scope.novossTemas = "";
    $http.get('dados/temas.json').success(function(data) {

        $scope.temas = data;
        var paradas =_.clone(data);

        _.map(paradas,function (tema,index){
            _.extend(tema,{"index":index})
        });

        var parada2 = _.sortBy(paradas,"Tema");

        $scope.indexesTemas = _.pluck(parada2,"index");

        _.map($scope.temas,function (tema){
            _.extend(tema,{"value":-1})
        })

    });


    $scope.tema_descricao =  function(tema) {
        $scope.temaToModel = tema;

        var modalInstance = $modal.open({
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            resolve: {
                temaToModel: function () {
                    return $scope.temaToModel;
                }
            }
        });

    };

    $scope.votos_deputados =  function(deputado) {
        $scope.deputado = deputado;

        var modalInstance = $modal.open({
            templateUrl: 'modal_deputados.html',
            controller: 'ModalDeputadoCtrl',
            resolve: {
                deputado: function () {
                    return $scope.deputado;
                }
            }
        });

    };




    $scope.typeProgessBar =  function(value) {
        if(value >= 75){
            return "success";
        }else if (value >= 25){
            return "warning";
        }else{
            return "danger";
        }
    };

    $scope.getTooltipProgressBar =  function(deputado) {
        return "Similaridade: " + $filter('number')(deputado.score,2) + '% <br />' +
            $scope.iguais(deputado) + '<br /><br />' + $scope.diferentes(deputado) + '<br /><br />' +
            "Total de temas votados por você e pelo deputado: " + deputado.total +"";
    };


    $scope.tooltipBadgeText =  function(deputado) {
        var primeiraParta = "";
        var segundaParte = "";
        if(deputado.sum == 1){
            primeiraParta = "1 opinião semelhante de ";
        }else {
            primeiraParta = deputado.sum + " opiniões semelhantes de";

        }

        if(deputado.total == 1){
            segundaParte = "1 opinião dada tanto por <br> você quanto pelo deputado";
        }else {
            segundaParte = deputado.total + " opiniões dadas tanto por <br> você quanto pelo deputado";
        }

        return primeiraParta + "<br>" + segundaParte;

    };

    $scope.getTooltipPlacement = function () {
        return ($(window).width() < 768) ? 'left' : 'top';
    };

    $scope.getTooltipPlacementRight = function () {
        return ($(window).width() < 768) ? 'right' : 'top';
    };


    $scope.getIndex = function(index){
        return $scope.indexesTemas[index];
    };
    $scope.iguais =  function(deputado) {

           var temas_deputado = deputado.temas;
        var iguais =
            _.filter(temas_deputado,function(tema,index){


                return (tema.value >= 0 && ($scope.temas[$scope.getIndex(index)].value >= 0) && (tema.value == $scope.temas[$scope.getIndex(index)].value));

            })
        return "Temas iguais (" + deputado.sum + '/' + deputado.total +"): " + _.pluck(iguais,'tema').join(", ");
    };


    $scope.diferentes =  function(deputado) {
        var temas_deputado = deputado.temas;
        var diferentes =
            _.filter(temas_deputado,function(tema,index){

                return (tema.value >= 0 && ($scope.temas[$scope.getIndex(index)].value >= 0) && (tema.value != $scope.temas[$scope.getIndex(index)].value));

            })

        return "Temas diferentes: "  + _.pluck(diferentes,'tema').join(", ");
    };


    $scope.click =  function(data,value) {
        if(value == "s"){
            data.value = 1;
        }else if (value == "n"){
            data.value = 0;
        }else{
            data.value = -1;
        }
        sendData();
        $scope.refresh_values(data,value);
    };

    //$scope.filter =  function() {
    //    if ($scope.estadoSelecionado != ""){
    //        //TODOS
    //        if ($scope.estadoSelecionado == null){
    //            $scope.deputadosDaParada = $scope.deputados;
    //        }else{
    //            $scope.deputadosDaParada = _.filter($scope.deputados, function(deputados){
    //                return deputados.uf == $scope.estadoSelecionado.uf;
    //            });
    //
    //        }
    //
    //
    //        $scope.deputadosDaParada = _.sortBy($scope.deputadosDaParada, function(deputado) {
    //            return -deputado.score;
    //        });
    //
    //    }
    //
    //
    //};

    var sendData = function () {

        if (_.filter($scope.temas, function(tema){
                return tema.value > -1
            }).length > 4){
            console.log(1)
            connectToParse();
  
//            Quando for testar localmente descomente essa linha e comente a linha abaixo, para usar uma tabela diferente no banco de dados
//            var Resposta = Parse.Object.extend("RespostaTeste");
            var Resposta = Parse.Object.extend("Resposta");

            var resposta = new Resposta();

            if(!$scope.posicao && navigator.geolocation){
                navigator.geolocation.getCurrentPosition(function (pos){
                $scope.posicao = {"latitude": pos.coords.latitude, "longitude": pos.coords.longitude, "altitude": pos.coords.altitude, 
                                  "accuracy": pos.coords.accuracy, "altitudeAccuracy": pos.coords.altitudeAccuracy}
            })}

            resposta.save({
                "id": $scope.idParse,
                "posicao": $scope.posicao,
                "temas": _.map($scope.temas, function(tema){
                    delete tema.$$hashKey;
                    return tema;
                })
              }, {
                success: function(obj) {
                    $scope.idParse = obj.id;
                },
                error: function(obj, error) {
                    console.log("houve um erro ao enviar dados para o parse")
                    console.log(error)
                }
              });
        }
    }

    var connectToParse = function() {
        if(!$scope.isConnected){
            Parse.initialize("OU8n5rFt09C0jNvFVLxe7vZK8dcxeq9pmrcVXMK9", "PobCwq2u50lrLcx4wDu2CRNhFd92YNN4sviqgkVG");
            $scope.isConnected = true;        
        }
    }

    $scope.refresh_values =  function(data,value) {

        _.map($scope.deputados,function (deputado){
            var temas_deputado = deputado.temas;

        var sumEquals =
            _.reduce(temas_deputado,function (memo,tema_deputado,index) {
                if (tema_deputado.value >= 0 && ($scope.temas[$scope.getIndex(index)].value >= 0)){
                    if (tema_deputado.value == $scope.temas[$scope.getIndex(index)].value){
                        memo['sum'] = memo['sum'] + 1;
                        memo['total'] = memo['total'] + 1;

                        return memo;
                    }else{
                        memo['total'] = memo['total'] + 1;
                        return memo;
                    }
                }
                else{
                    return memo;
                }
            },{sum:0,total:0})
            if (! sumEquals["total"] == 0){
                var score = sumEquals["sum"] / sumEquals["total"];
                deputado.score = score * 100;
            }else{
                deputado.score = -1;
            }

            deputado.sum = sumEquals["sum"];
            deputado.total = sumEquals["total"];

        })


        //if ($scope.estadoSelecionado != "" && $scope.estadoSelecionado != null){
        //    $scope.deputadosDaParada = _.filter($scope.deputados, function(deputados){
        //        return deputados.uf == $scope.estadoSelecionado.uf;
        //    });
        //}

        //$scope.deputadosDaParada = _.sortBy($scope.deputadosDaParada, function(deputado) {
        //    return -deputado.score;
        //}); // [3, 2, 1, 0, -1, -2, -3]
    };


}]);

