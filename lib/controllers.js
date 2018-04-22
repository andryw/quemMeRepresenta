'use strict';

/* Controllers */

var houseOfCunhaApp = angular.module('houseOfCunhaApp', ['ui.bootstrap']);

houseOfCunhaApp.controller('ModalInstanceCtrl', function ($scope, $modalInstance, temaToModel) {

    $scope.temaToModel = temaToModel;

    $scope.ok = function () {
        $modalInstance.close();
    };


});

houseOfCunhaApp.controller('ModalDeputadoCtrl', function ($scope, $modalInstance, deputado, eleitor,indexesTemas,titulo) {

    $scope.deputado = deputado;
    $scope.titulo = titulo;

    $scope.eleitor = eleitor;
    $scope.indexesTemas = indexesTemas;

    var nomesVotacoes = {"1":"sim","0":"não","-1":"não sei"}
    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.getIndex = function(index){
        return $scope.indexesTemas[index];
    };

    $scope.getValueEleitor = function(index){
        var value  = $scope.eleitor[$scope.getIndex(index)].value.toString();
        if (_.has(nomesVotacoes,value)){
            return nomesVotacoes[value];
        }else{
            return "";
        }
    };

    $scope.getRoWColour = function(voto,index){
        var value  = $scope.eleitor[$scope.getIndex(index)].value;
        //var votosOK = ["não","sim"];
        //var indexVotoDeputado = votosOK.indexOf(voto.value);

        if ((value >= 0) && voto.value > -1){
            if (value == voto.value){
                return "green";
            }else{
                return "red";
            }
        }

    };

});

houseOfCunhaApp.filter('startFrom', function() {
    return function(input, start,scope) {
        scope.totalItems = input.length;
        start = +start;
        return input.slice(start * scope.pageSize);
    }
});

houseOfCunhaApp.filter('startFromP', function() {
    return function(input, start,scope) {
        scope.totalItemsP = input.length;
        start = +start;
        return input.slice(start * scope.pageSize);
    }
});

houseOfCunhaApp.filter('startFromMidia', function() {
    return function(input, start,scope) {
        if (typeof input === 'undefined'){
            return []
        }
        scope.totalItemsMidia = input.length;
        start = +start;
        return input.slice(start * scope.pageSizeMidia);
    }
});

houseOfCunhaApp.filter('startFromDepSim', function() {
    return function(input, start,scope) {
        scope.totalItemsDepSim = input.length;
        start = +start;
        return input.slice(start * scope.pageSizeDepSim);
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

houseOfCunhaApp.filter('minimoVotacoesP', function() {
    return function(input,scope) {

        var votacoesDoCara = _.filter(scope.temas, function(tema){
            return tema.value > -1
        }).length;

        if (votacoesDoCara > 0 && !scope.mostrarPoucosP){
            var a = _.filter(input,function (partido,index){
                return partido.total > votacoesDoCara / 2;
            });
            return a;
        }else{
            return input;
        }
    }
});

houseOfCunhaApp.controller('VotacoesCtrl', ['$scope',  '$modal','$http', '$filter', function($scope,  $modal, $http,$filter) {


    //Temas
    $scope.collapsed = false;
    $scope.temas = [];
    $scope.idParse = null;

    //Deputados
    $scope.estadoSelecionado = "";
    $scope.estadoSelecionado2 = "";

    $scope.partidoSelecionado = null;
    $scope.estados = [];
    $scope.partidos = [];
    $scope.deputados = [];
    $scope.deputado_partido_similaridade = []

    $scope.temaToModel = "";

    $scope.totalItems = 10;
    $scope.currentPage = 1;
    $scope.pageSize =15;

    $scope.indexesTemas = [];

    $scope.mostrarPoucos = false;
    $scope.tooltip_semvalor = "Deputado não votou em nenhum dos temas selecionados. Continue votando!"
    $scope.tooltip_semvalorP = "Partido não deu orientação de voto a nenhum dos temas selecionados. Continue votando!"

    $scope.tooltip_art17 = "Eduardo Cunha, por ser presdiente da câmara, não vota (Artigo 17)   ."


    //Partidos
    $scope.partidos_votos = [];
    $scope.totalItemsP = 10;
    $scope.currentPageP = 1;
    $scope.mostrarPoucosP = false;

    //$scope.pageSizeP =15;
    //Midia
    $scope.totalItemsMidia = 10;
    $scope.currentPageMidia = 1;

    //Deputados similares
    $scope.currentPageDepSim = 1;
    $scope.pageSizeDepSim = 10;
    $scope.totalItemsDepSim = 10;
    $scope.estadoSelecionadoDepSim = "";
    $scope.partidoSelecionadoDepSim = null;




    $scope.pageSizeMidia = 5;

    if ($(window).width() < 768){
        $scope.pageSizeMidia = 3;
    }






    $http.get('dados/estados.json').success(function(data) {

        $scope.estados = data;
    });

    $http.get('dados/midia.json').success(function(data) {

        $scope.sites = data;
        $scope.totalItemsMidia = $scope.sites.length;

    });

    $http.get('dados/deputado_partido_similaridade.json').success(function(data) {

        $scope.deputado_partido_similaridade = data;
        $scope.totalItemsDepSim = $scope.deputado_partido_similaridade.length;


    });


    $http.get('dados/deputados_votos.json').success(function(data) {

        $scope.deputados = data;
        $scope.partidos =_.uniq(_.pluck($scope.deputados, 'partido'));
        $scope.partidos = _.map($scope.partidos,function(partido){
            return {"partido": partido};
        })

        _.map($scope.deputados,function (deputado){
            _.extend(deputado,{"score":-1,"sum":0,"total":0})
        })
        $scope.totalItems = $scope.deputados.length;


    });

    $http.get('dados/partidos_votos.json').success(function(data) {


        $scope.partidos_votos = _.filter(data,function(partido){
            return partido.nome != "s.part.";
        });

        _.map($scope.partidos_votos,function (partido){
            _.extend(partido,{"score":-1,"sum":0,"total":0})
        })

        $scope.totalItemsP = $scope.partidos_votos.length;


    });


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

    $scope.votos_deputados =  function(deputado,titulo) {
        $scope.deputado = deputado;
        $scope.titulo = titulo;

        var modalInstance = $modal.open({
            templateUrl: 'modal_deputados.html',
            controller: 'ModalDeputadoCtrl',
            resolve: {
                deputado: function () {
                    return $scope.deputado;
                },

                eleitor: function () {
                    return $scope.temas;
                },
                indexesTemas: function () {
                    return $scope.indexesTemas;
                },
                titulo: function () {
                    return $scope.titulo;
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


    $scope.tooltipBadgeText =  function(deputado,nome) {
        var primeiraParta = "";
        var segundaParte = "";
        if(deputado.sum == 1){
            primeiraParta = "1 opinião semelhante de ";
        }else {
            primeiraParta = deputado.sum + " opiniões semelhantes de";

        }

        if(deputado.total == 1){
            segundaParte = "1 opinião dada tanto por <br> você quanto pelo "+ nome + ".";
        }else {
            segundaParte = deputado.total + " opiniões dadas tanto por <br> você quanto pelo "+nome+".";
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
        $scope.refresh_values($scope.deputados,data,value);
        $scope.refresh_values($scope.partidos_votos,data,value);

    };

    var sendData = function () {
        function isToSendData(){
            return _.filter($scope.temas, function(tema){
                return tema.value > -1
            }).length > 4
        }

        function setGeoPosition(pos){
            $scope.posicao = {"latitude": pos.coords.latitude, "longitude": pos.coords.longitude, "altitude": pos.coords.altitude,
                  "accuracy": pos.coords.accuracy, "altitudeAccuracy": pos.coords.altitudeAccuracy}
        }

        function createObjectToSave(){
            return {
                "id": $scope.idParse,
                "posicao": $scope.posicao,
                "temas": _.map($scope.temas, function(tema){
                    delete tema.$$hashKey;
                    return _.omit(tema, "descr", "Pergunta");
                })
              }
        }

        if (isToSendData()){
            if(!$scope.posicao && navigator.geolocation){
                navigator.geolocation.getCurrentPosition(setGeoPosition)
            }

            var isConnected = connectToParse();

            if (isConnected){
                // Quando for testar localmente descomente essa linha e comente a linha abaixo, para usar uma tabela diferente no banco de dados
//                var Resposta = Parse.Object.extend("RespostaTeste");
                var Resposta = Parse.Object.extend("Resposta");
                var resposta = new Resposta();

                resposta.save(createObjectToSave(), {
                    success: function(obj) {
                        $scope.idParse = obj.id;
                    },
                    error: function(obj, error) {
                        console.log("houve um erro ao enviar dados para o parse")
                        console.log(error)
                    }
                  });

                  console.log(createObjectToSave())
            }
        }
    }

    function connectToParse() {
        try {
            if(!$scope.isConnected){
                Parse.initialize("myAppId");
                Parse.serverURL = 'http://qmrepresenta.herokuapp.com/parse'
                $scope.isConnected = true;
            }
        }catch(err) {
            $scope.isConnected = false;
            console.log("houve um erro ao conectar o parse")
            console.log(err)
        }

        return $scope.isConnected

    }

    $scope.refresh_values =  function(lista,data,value) {

        _.map(lista,function (deputado){
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

    };


}]);

