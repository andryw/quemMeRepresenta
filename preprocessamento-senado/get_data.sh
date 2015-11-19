#!/bin/bash

mkdir votacoes
filename="$1"
while read -r line
do
    name=$line
    curl "http://legis.senado.gov.br/dadosabertos/plenario/lista/votacao/"$name > votacoes/$name.xml
done < "$filename"
