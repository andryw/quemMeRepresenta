#!/bin/bash

mkdir votacoes
filename="$1"
while read -r line
do
    dia=$line
    curl "http://legis.senado.gov.br/dadosabertos/plenario/lista/votacao/"$dia > votacoes/$dia.xml
done < "$filename"
